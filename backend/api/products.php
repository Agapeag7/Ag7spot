<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $shopId = $_GET['shop_id'] ?? null;
        // SELECT * FROM products WHERE shop_id = ?
        echo json_encode(['success' => true, 'products' => []]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // INSERT INTO products (name, price, shop_id, stock, description, image_url) VALUES (...)
        echo json_encode(['success' => true, 'product_id' => 123]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        // UPDATE products SET stock = ? WHERE id = ?
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>