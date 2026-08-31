<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../session.php';
session_start();
require_once '../spot.class.php';

try {
    $spot = new Spot();
    if (!empty($_SESSION['user_id'])) {
        $spot->users->clearSessionToken(intval($_SESSION['user_id']));
    }
} catch (Exception $e) {
    // ignore and continue with session cleanup
}

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'], $params['secure'], $params['httponly']
    );
}
session_destroy();

echo json_encode(['success' => true]);
