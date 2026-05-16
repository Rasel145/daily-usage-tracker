<?php
// api/auth.php — Register & Login
require_once '../config/db.php';
setHeaders();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ── REGISTER ──────────────────────────────────────────────
if ($method === 'POST' && $action === 'register') {
    $body = getBody();
    $name  = trim($body['name']  ?? '');
    $email = trim($body['email'] ?? '');
    $pass  = $body['password']   ?? '';

    if (!$name || !$email || !$pass)
        fail('Name, email and password are required.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL))
        fail('Invalid email address.');
    if (strlen($pass) < 6)
        fail('Password must be at least 6 characters.');

    $pdo = getDB();

    // Check email exists
    $chk = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $chk->execute([$email]);
    if ($chk->fetch()) fail('An account with this email already exists.');

    $id    = uniqid('u_', true);
    $hash  = password_hash($pass, PASSWORD_BCRYPT);
    $token = bin2hex(random_bytes(32));
    $today = date('Y-m-d');

    $stmt = $pdo->prepare(
        "INSERT INTO users (id, name, email, password_hash, role, session_token, joined)
         VALUES (?, ?, ?, ?, 'Personal', ?, ?)"
    );
    $stmt->execute([$id, $name, $email, $hash, $token, $today]);

    ok([
        'token' => $token,
        'user'  => ['id' => $id, 'name' => $name, 'email' => $email, 'role' => 'Personal']
    ], 'Account created successfully!');
}

// ── LOGIN ──────────────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {
    $body  = getBody();
    $email = trim($body['email'] ?? '');
    $pass  = $body['password']   ?? '';

    if (!$email || !$pass) fail('Email and password are required.');

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($pass, $user['password_hash']))
        fail('Invalid email or password.');

    // Refresh session token
    $token = bin2hex(random_bytes(32));
    $pdo->prepare("UPDATE users SET session_token = ? WHERE id = ?")
        ->execute([$token, $user['id']]);

    ok([
        'token' => $token,
        'user'  => [
            'id'    => $user['id'],
            'name'  => $user['name'],
            'email' => $user['email'],
            'role'  => $user['role']
        ]
    ], 'Login successful!');
}

// ── GET PROFILE ────────────────────────────────────────────
if ($method === 'GET' && $action === 'profile') {
    $uid  = getUserId();
    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT id, name, email, role, joined FROM users WHERE id = ?");
    $stmt->execute([$uid]);
    $user = $stmt->fetch();
    if (!$user) fail('User not found.', 404);
    ok($user);
}

// ── UPDATE PROFILE ─────────────────────────────────────────
if ($method === 'PUT' && $action === 'profile') {
    $uid  = getUserId();
    $body = getBody();
    $name = trim($body['name']  ?? '');
    $role = trim($body['role']  ?? 'Personal');
    if (!$name) fail('Name is required.');
    $pdo  = getDB();
    $pdo->prepare("UPDATE users SET name = ?, role = ? WHERE id = ?")
        ->execute([$name, $role, $uid]);
    ok(['name' => $name, 'role' => $role]);
}

// ── LOGOUT ─────────────────────────────────────────────────
if ($method === 'POST' && $action === 'logout') {
    $uid = getUserId();
    getDB()->prepare("UPDATE users SET session_token = NULL WHERE id = ?")
           ->execute([$uid]);
    ok([], 'Logged out.');
}

fail('Unknown action or method.', 404);
