<?php
// api/expenses.php — CRUD for expenses
require_once '../config/db.php';
setHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$uid    = getUserId();
$pdo    = getDB();

// ── GET — list expenses (optional ?month=YYYY-MM) ──────────
if ($method === 'GET') {
    $month = $_GET['month'] ?? null;
    if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
        $stmt = $pdo->prepare(
            "SELECT * FROM expenses WHERE user_id = ? AND DATE_FORMAT(date,'%Y-%m') = ?
             ORDER BY date DESC, created_at DESC"
        );
        $stmt->execute([$uid, $month]);
    } else {
        $stmt = $pdo->prepare(
            "SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC"
        );
        $stmt->execute([$uid]);
    }
    $rows = $stmt->fetchAll();
    // Format amounts as float
    foreach ($rows as &$r) $r['amount'] = (float)$r['amount'];
    ok($rows);
}

// ── POST — add new expense ─────────────────────────────────
if ($method === 'POST') {
    $b        = getBody();
    $date     = $b['date']     ?? '';
    $category = $b['category'] ?? '';
    $amount   = (float)($b['amount'] ?? 0);
    $notes    = trim($b['notes']   ?? '');

    if (!$date || !$category || $amount <= 0)
        fail('Date, category and a valid amount are required.');
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date))
        fail('Invalid date format. Use YYYY-MM-DD.');

    $id = uniqid('exp_', true);
    $pdo->prepare(
        "INSERT INTO expenses (id, user_id, date, category, amount, notes) VALUES (?,?,?,?,?,?)"
    )->execute([$id, $uid, $date, $category, $amount, $notes]);

    ok(['id' => $id, 'date' => $date, 'category' => $category,
        'amount' => $amount, 'notes' => $notes], 'Expense added.');
}

// ── DELETE — remove expense ────────────────────────────────
if ($method === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if (!$id) fail('Expense ID required.');
    $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ? AND user_id = ?");
    $stmt->execute([$id, $uid]);
    if ($stmt->rowCount() === 0) fail('Expense not found.', 404);
    ok([], 'Expense deleted.');
}

fail('Method not allowed.', 405);
