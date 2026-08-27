<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require_once '../spot.class.php';

$userId = intval($_SESSION['user_id'] ?? 0);
if ($userId <= 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

try {
    $spot = new Spot();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $limit = intval($_GET['limit'] ?? 30);
        $offset = intval($_GET['offset'] ?? 0);
        echo json_encode([
            'success' => true,
            'notifications' => $spot->notifications->getForUser($userId, $limit, $offset),
            'unread_count' => $spot->notifications->getUnreadCount($userId)
        ]);
        exit;
    }

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $notificationId = intval($data['notification_id'] ?? 0);
        $success = $spot->notifications->markRead($userId, $notificationId ?: null);
        echo json_encode(['success' => $success]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
