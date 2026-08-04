<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
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

switch ($method) {
    case 'GET':
        $productId = intval($_GET['product_id'] ?? 0);
        $shopId = intval($_GET['shop_id'] ?? 0);

        if ($productId) {
            $product = $spot->products->getProductById($productId);
            echo json_encode(['success' => true, 'product' => $product]);
            break;
        }

        $products = $shopId ? $spot->products->getProductsByShop($shopId) : [];
        echo json_encode(['success' => true, 'products' => $products]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $shopId = intval($data['shop_id'] ?? 0);
        $name = trim($data['name'] ?? '');
        $price = floatval($data['price'] ?? 0);
        $stock = intval($data['stock'] ?? 0);
        $description = trim($data['description'] ?? '');
        $image = trim($data['image'] ?? '');

        if ($shopId <= 0 || $name === '' || $price <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing product data']);
            break;
        }

        $productId = $spot->products->createProduct($shopId, $name, $price, $stock, $description, $image);
        echo json_encode(['success' => true, 'product_id' => intval($productId)]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = intval($data['product_id'] ?? 0);
        $name = trim($data['name'] ?? '');
        $price = floatval($data['price'] ?? 0);
        $stock = intval($data['stock'] ?? 0);
        $description = trim($data['description'] ?? '');
        $image = trim($data['image'] ?? '');
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId || !$productId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid request']);
            break;
        }

        $ownerId = $spot->products->getProductOwnerId($productId);
        if (!$ownerId || intval($ownerId) !== intval($userId)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            break;
        }

        $success = $spot->products->updateProduct($productId, $name, $price, $stock, $description, $image);
        echo json_encode(['success' => $success]);
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents('php://input'), true);
        $productId = intval($data['product_id'] ?? 0);
        $userId = $_SESSION['user_id'] ?? null;

        if (!$userId || !$productId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid request']);
            break;
        }

        $ownerId = $spot->products->getProductOwnerId($productId);
        if (!$ownerId || intval($ownerId) !== intval($userId)) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Unauthorized']);
            break;
        }

        $success = $spot->products->deleteProduct($productId);
        echo json_encode(['success' => $success]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>