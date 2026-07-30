<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user_id'] ?? 1;

switch ($method) {
    case 'GET':
        $shopId = $_GET['shop_id'] ?? null;
        // SELECT * FROM messages WHERE shop_id = ? ORDER BY created_at ASC
        echo json_encode(['success' => true, 'messages' => []]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // INSERT INTO messages (sender_id, shop_id, product_id, content) VALUES (...)
        echo json_encode(['success' => true]);
        break;
}
?>