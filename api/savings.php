<?php
// api/savings.php — savings, credit, and month-close logic
require_once '../config/db.php';
setHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$uid    = getUserId();
$pdo    = getDB();
$action = $_GET['action'] ?? 'list';

// ── GET — list savings and credit ─────────────────────────
if ($method === 'GET') {
    $sav = $pdo->prepare("SELECT * FROM savings WHERE user_id = ? ORDER BY month_key DESC");
    $sav->execute([$uid]);
    $savings = $sav->fetchAll();
    foreach ($savings as &$r) $r['amount'] = (float)$r['amount'];

    $crd = $pdo->prepare("SELECT * FROM credit WHERE user_id = ? ORDER BY month_key DESC");
    $crd->execute([$uid]);
    $credit = $crd->fetchAll();
    foreach ($credit as &$r) $r['amount'] = (float)$r['amount'];

    ok(['savings' => $savings, 'credit' => $credit]);
}

// ── POST — close a month (calculate net, add to savings/credit)
if ($method === 'POST' && $action === 'close') {
    $b         = getBody();
    $month_key = trim($b['month_key'] ?? '');
    if (!$month_key || !preg_match('/^\d{4}-\d{2}$/', $month_key))
        fail('Valid month_key (YYYY-MM) required.');

    // Already processed?
    $chkS = $pdo->prepare("SELECT id FROM savings WHERE user_id=? AND month_key=?");
    $chkS->execute([$uid, $month_key]);
    $chkC = $pdo->prepare("SELECT id FROM credit  WHERE user_id=? AND month_key=?");
    $chkC->execute([$uid, $month_key]);
    if ($chkS->fetch() || $chkC->fetch())
        fail("Month $month_key is already processed.");

    // Get income for month
    $incStmt = $pdo->prepare("SELECT amount FROM income WHERE user_id=? AND month_key=?");
    $incStmt->execute([$uid, $month_key]);
    $incRow  = $incStmt->fetch();
    $income  = $incRow ? (float)$incRow['amount'] : 0.0;

    // Get total expenses for month
    $expStmt = $pdo->prepare(
        "SELECT COALESCE(SUM(amount),0) AS total FROM expenses
         WHERE user_id=? AND DATE_FORMAT(date,'%Y-%m')=?"
    );
    $expStmt->execute([$uid, $month_key]);
    $expenses = (float)$expStmt->fetchColumn();

    $net = $income - $expenses;

    if ($net > 0) {
        $id = uniqid('sav_', true);
        $pdo->prepare(
            "INSERT INTO savings (id, user_id, month_key, amount, date) VALUES (?,?,?,?,CURDATE())"
        )->execute([$id, $uid, $month_key, $net]);
        ok([
            'type'      => 'savings',
            'month_key' => $month_key,
            'income'    => $income,
            'expenses'  => $expenses,
            'net'       => $net
        ], "Surplus of ৳" . number_format($net, 2) . " added to Savings!");

    } elseif ($net < 0) {
        $id = uniqid('crd_', true);
        $pdo->prepare(
            "INSERT INTO credit (id, user_id, month_key, amount, date) VALUES (?,?,?,?,CURDATE())"
        )->execute([$id, $uid, $month_key, abs($net)]);
        ok([
            'type'      => 'credit',
            'month_key' => $month_key,
            'income'    => $income,
            'expenses'  => $expenses,
            'net'       => $net
        ], "CREDIT: Deficit of ৳" . number_format(abs($net), 2) . " added to Credit!");

    } else {
        ok([
            'type'     => 'balanced',
            'income'   => $income,
            'expenses' => $expenses,
            'net'      => 0
        ], "Balanced month. Income equals expenses.");
    }
}

fail('Method not allowed.', 405);
