<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require_once '../spot.class.php';

try {
    $spot = new Spot();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'] ?? intval($data['user_id'] ?? 0);
$shopId = intval($data['shop_id'] ?? 0);

if ($userId <= 0 || $shopId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing user_id or shop_id']);
    exit;
}

$result = $spot->checkins->registerCheckin($userId, $shopId);
if (!$result['success']) {
    http_response_code(400);
    echo json_encode($result);
    exit;
}

echo json_encode(['success' => true, 'points' => $result['points'], 'totalCheckins' => $result['totalCheckins']]);
?>
