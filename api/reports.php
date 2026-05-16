<?php
// api/reports.php — monthly summary and trend data
require_once '../config/db.php';
setHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$uid    = getUserId();
$pdo    = getDB();

if ($method !== 'GET') fail('GET only.', 405);

$month = $_GET['month'] ?? date('Y-m');
if (!preg_match('/^\d{4}-\d{2}$/', $month)) fail('Invalid month format.');

// ── Income for month ───────────────────────────────────────
$incStmt = $pdo->prepare("SELECT amount, notes FROM income WHERE user_id=? AND month_key=?");
$incStmt->execute([$uid, $month]);
$incRow = $incStmt->fetch();
$income = $incRow ? (float)$incRow['amount'] : 0.0;

// ── Expenses total for month ───────────────────────────────
$expStmt = $pdo->prepare(
    "SELECT COALESCE(SUM(amount),0) FROM expenses WHERE user_id=? AND DATE_FORMAT(date,'%Y-%m')=?"
);
$expStmt->execute([$uid, $month]);
$totalExp = (float)$expStmt->fetchColumn();

// ── Category breakdown ─────────────────────────────────────
$catStmt = $pdo->prepare(
    "SELECT category, SUM(amount) AS total FROM expenses
     WHERE user_id=? AND DATE_FORMAT(date,'%Y-%m')=?
     GROUP BY category ORDER BY total DESC"
);
$catStmt->execute([$uid, $month]);
$categories = $catStmt->fetchAll();
foreach ($categories as &$c) $c['total'] = (float)$c['total'];

// ── Savings & Credit totals ────────────────────────────────
$savTotal  = (float)$pdo->prepare("SELECT COALESCE(SUM(amount),0) FROM savings WHERE user_id=?")
                         ->execute([$uid]) ? 0 : 0;
$savQ = $pdo->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM savings WHERE user_id=?");
$savQ->execute([$uid]);
$totalSav = (float)$savQ->fetchColumn();

$credQ = $pdo->prepare("SELECT COALESCE(SUM(amount),0) AS s FROM credit WHERE user_id=?");
$credQ->execute([$uid]);
$totalCred = (float)$credQ->fetchColumn();

// ── 6-month trend ──────────────────────────────────────────
$trend = [];
list($y, $m) = explode('-', $month);
for ($i = 5; $i >= 0; $i--) {
    $dt  = new DateTime("$y-$m-01");
    $dt->modify("-{$i} months");
    $mk  = $dt->format('Y-m');
    $lbl = $dt->format('M');

    $iQ = $pdo->prepare("SELECT COALESCE(SUM(amount),0) FROM income WHERE user_id=? AND month_key=?");
    $iQ->execute([$uid, $mk]);
    $mi = (float)$iQ->fetchColumn();

    $eQ = $pdo->prepare(
        "SELECT COALESCE(SUM(amount),0) FROM expenses WHERE user_id=? AND DATE_FORMAT(date,'%Y-%m')=?"
    );
    $eQ->execute([$uid, $mk]);
    $me = (float)$eQ->fetchColumn();

    $trend[] = ['month' => $mk, 'label' => $lbl, 'income' => $mi, 'expenses' => $me, 'net' => $mi - $me];
}

ok([
    'month'       => $month,
    'income'      => $income,
    'total_exp'   => $totalExp,
    'net'         => $income - $totalExp,
    'total_sav'   => $totalSav,
    'total_cred'  => $totalCred,
    'categories'  => $categories,
    'trend'       => $trend,
]);
