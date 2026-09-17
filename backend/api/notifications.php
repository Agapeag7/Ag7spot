<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once '../session.php';
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
        if (isset($_GET['action']) && $_GET['action'] === 'push_state') {
            $subscriptions = $spot->notifications->getPushSubscriptions($userId);
            echo json_encode([
                'success' => true,
                'enabled' => !empty($subscriptions),
                'subscription_count' => count($subscriptions)
            ]);
            exit;
        }

        $limit = intval($_GET['limit'] ?? 30);
        $offset = intval($_GET['offset'] ?? 0);
        echo json_encode([
            'success' => true,
            'notifications' => $spot->notifications->getForUser($userId, $limit, $offset),
            'unread_count' => $spot->notifications->getUnreadCount($userId)
        ]);
        exit;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $action = $data['action'] ?? '';

        if ($action === 'subscribe_push') {
            $subscription = $data['subscription'] ?? [];
            $endpoint = (string) ($subscription['endpoint'] ?? '');
            $keys = $subscription['keys'] ?? [];
            $p256dh = (string) ($keys['p256dh'] ?? '');
            $authToken = (string) ($keys['auth'] ?? '');
            $success = $spot->notifications->savePushSubscription($userId, $endpoint, $p256dh, $authToken);
            echo json_encode(['success' => $success]);
            exit;
        }

        if ($action === 'unsubscribe_push') {
            $stmt = $spot->db->prepare('DELETE FROM push_subscriptions WHERE user_id = ?');
            echo json_encode(['success' => $stmt->execute([intval($userId)])]);
            exit;
        }

        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        exit;
    }

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true) ?: [];
        $notificationId = intval($data['notification_id'] ?? 0);
        $success = $spot->notifications->markRead($userId, $notificationId ?: null);
        echo json_encode(['success' => $success]);
        exit;
    }

    if ($method === 'DELETE') {
        $stmt = $spot->db->prepare('DELETE FROM push_subscriptions WHERE user_id = ?');
        echo json_encode(['success' => $stmt->execute([intval($userId)])]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
