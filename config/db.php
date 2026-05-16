<?php
// ══════════════════════════════════════════════════════════════
//  DATABASE CONFIGURATION — Daily Usage Tracker
//  আপনার MySQL তথ্য এখানে পরিবর্তন করুন
// ══════════════════════════════════════════════════════════════

define('DB_HOST', 'localhost');       // সাধারণত localhost
define('DB_PORT', '3306');            // MySQL পোর্ট (default: 3306)
define('DB_NAME', 'daily_tracker');   // আপনার database নাম
define('DB_USER', 'root');            // আপনার MySQL username
define('DB_PASS', '');                // আপনার MySQL password

// ── Connection ─────────────────────────────────────────────
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            die(json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]));
        }
    }
    return $pdo;
}

// ── CORS & JSON Headers ────────────────────────────────────
function setHeaders() {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

// ── JSON Response helpers ──────────────────────────────────
function ok($data = [], $message = 'Success') {
    echo json_encode(['success' => true, 'message' => $message, 'data' => $data]);
    exit();
}
function fail($message = 'Error', $code = 400) {
    http_response_code($code);
    echo json_encode(['success' => false, 'message' => $message]);
    exit();
}

// ── Get request body ───────────────────────────────────────
function getBody() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

// ── Get current user_id from simple token ─────────────────
function getUserId() {
    $headers = getallheaders();
    $token   = $headers['Authorization'] ?? '';
    $token   = str_replace('Bearer ', '', $token);
    if (empty($token)) fail('Unauthorized', 401);

    $pdo  = getDB();
    $stmt = $pdo->prepare("SELECT id FROM users WHERE session_token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    if (!$user) fail('Unauthorized', 401);
    return $user['id'];
}
