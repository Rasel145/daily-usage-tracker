<?php
// api/income.php — monthly income CRUD
require_once '../config/db.php';
setHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$uid    = getUserId();
$pdo    = getDB();

// ── GET — all income records ───────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->prepare(
        "SELECT * FROM income WHERE user_id = ? ORDER BY month_key DESC"
    );
    $stmt->execute([$uid]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) $r['amount'] = (float)$r['amount'];
    ok($rows);
}

// ── POST — save/update monthly income ─────────────────────
if ($method === 'POST') {
    $b         = getBody();
    $month_key = trim($b['month_key'] ?? '');
    $amount    = (float)($b['amount'] ?? 0);
    $notes     = trim($b['notes']    ?? '');

    if (!$month_key || $amount <= 0)
        fail('Month and a valid amount are required.');
    if (!preg_match('/^\d{4}-\d{2}$/', $month_key))
        fail('Invalid month format. Use YYYY-MM.');

    // INSERT or UPDATE (one income record per month per user)
    $pdo->prepare(
        "INSERT INTO income (user_id, month_key, amount, notes, recorded_date)
         VALUES (?, ?, ?, ?, CURDATE())
         ON DUPLICATE KEY UPDATE amount = VALUES(amount),
                                 notes  = VALUES(notes),
                                 recorded_date = CURDATE()"
    )->execute([$uid, $month_key, $amount, $notes]);

    ok(['month_key' => $month_key, 'amount' => $amount, 'notes' => $notes],
       'Income saved.');
}

// ── DELETE — remove income record ─────────────────────────
if ($method === 'DELETE') {
    $month = $_GET['month'] ?? '';
    if (!$month) fail('Month key required.');
    $stmt = $pdo->prepare("DELETE FROM income WHERE user_id = ? AND month_key = ?");
    $stmt->execute([$uid, $month]);
    if ($stmt->rowCount() === 0) fail('Record not found.', 404);
    ok([], 'Income record deleted.');
}

fail('Method not allowed.', 405);
