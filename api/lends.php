<?php
// api/lends.php — lending records CRUD
require_once '../config/db.php';
setHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$uid    = getUserId();
$pdo    = getDB();

// ── GET — all lend records ─────────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->prepare(
        "SELECT * FROM lends WHERE user_id = ? ORDER BY date DESC, created_at DESC"
    );
    $stmt->execute([$uid]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) $r['amount'] = (float)$r['amount'];
    ok($rows);
}

// ── POST — add lend record ─────────────────────────────────
if ($method === 'POST') {
    $b      = getBody();
    $person = trim($b['person'] ?? '');
    $amount = (float)($b['amount'] ?? 0);
    $date   = $b['date']   ?? '';
    $notes  = trim($b['notes']  ?? '');

    if (!$person || $amount <= 0 || !$date)
        fail('Person, amount and date are required.');

    $id = uniqid('lnd_', true);
    $pdo->prepare(
        "INSERT INTO lends (id, user_id, person, amount, date, notes, status) VALUES (?,?,?,?,?,?,'pending')"
    )->execute([$id, $uid, $person, $amount, $date, $notes]);

    ok(['id' => $id, 'person' => $person, 'amount' => $amount,
        'date' => $date, 'notes' => $notes, 'status' => 'pending'],
       'Lend record added.');
}

// ── PUT — toggle status (pending <-> returned) ─────────────
if ($method === 'PUT') {
    $b      = getBody();
    $id     = $b['id']     ?? '';
    $status = $b['status'] ?? '';
    if (!$id || !in_array($status, ['pending', 'returned']))
        fail('ID and valid status required.');

    $stmt = $pdo->prepare(
        "UPDATE lends SET status = ? WHERE id = ? AND user_id = ?"
    );
    $stmt->execute([$status, $id, $uid]);
    if ($stmt->rowCount() === 0) fail('Record not found.', 404);
    ok(['id' => $id, 'status' => $status], 'Status updated.');
}

// ── DELETE ─────────────────────────────────────────────────
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) fail('Lend ID required.');
    $stmt = $pdo->prepare("DELETE FROM lends WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $uid]);
    if ($stmt->rowCount() === 0) fail('Record not found.', 404);
    ok([], 'Record deleted.');
}

fail('Method not allowed.', 405);
