<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

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
        $shopId = intval($_GET['shop_id'] ?? 0);
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
        $stock = intval($data['stock'] ?? 0);

        if (!$productId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid product_id']);
            break;
        }

        $success = $spot->products->updateStock($productId, $stock);
        echo json_encode(['success' => $success]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>