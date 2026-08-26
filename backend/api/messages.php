<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
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

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'] ?? null;

switch ($method) {
    case 'GET':
        $shopId = intval($_GET['shop_id'] ?? 0);
        if ($shopId <= 0 || !$userId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid shop_id']);
            break;
        }

        $messages = $spot->messages->getMessagesByShop($shopId, $userId);
        echo json_encode(['success' => true, 'messages' => $messages]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $shopId = intval($data['shop_id'] ?? 0);
        $productId = intval($data['product_id'] ?? 0);
        $content = trim($data['content'] ?? '');

        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            break;
        }

        if ($shopId <= 0 || $productId <= 0 || $content === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing message parameters']);
            break;
        }

        $senderId = intval($userId);
        if ($senderId <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing sender_id']);
            break;
        }

        $messageId = $spot->messages->createMessage($senderId, $shopId, $productId, $content);
        echo json_encode(['success' => true, 'message_id' => $messageId]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>
