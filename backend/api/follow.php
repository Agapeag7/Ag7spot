<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../session.php';
session_start();
require_once '../spot.class.php';

try {
    $spot = new Spot();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

$userId = $_SESSION['user_id'] ?? null;
$data = json_decode(file_get_contents('php://input'), true);
$shopId = intval($data['shop_id'] ?? 0);

if (!$userId || $shopId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id or shop_id']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $success = $spot->follows->followShop($userId, $shopId);
        echo json_encode(['success' => $success]);
        break;

    case 'DELETE':
        $success = $spot->follows->unfollowShop($userId, $shopId);
        echo json_encode(['success' => $success]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>