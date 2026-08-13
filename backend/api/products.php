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
        // Support multipart/form-data uploads as well as JSON body or regular POST
        $shopId = 0;
        $name = '';
        $price = 0;
        $stock = 0;
        $description = '';
        $image = '';

        if (!empty($_FILES) && isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            // Read other values from POST when using FormData
            $shopId = intval($_POST['shop_id'] ?? 0);
            $name = trim($_POST['name'] ?? '');
            $price = floatval($_POST['price'] ?? 0);
            $stock = intval($_POST['stock'] ?? 0);
            $description = trim($_POST['description'] ?? '');

            $uploadDir = __DIR__ . '/../articles';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $tmpPath = $_FILES['image']['tmp_name'];
            $origName = basename($_FILES['image']['name']);
            $ext = pathinfo($origName, PATHINFO_EXTENSION);
            $filename = uniqid('art_', true) . ($ext ? '.' . $ext : '');
            $dest = $uploadDir . '/' . $filename;

            if (move_uploaded_file($tmpPath, $dest)) {
                // Store only filename in DB, but return web-accessible path
                $image = $filename; // filename only for DB
                $image_url = '/backend/articles/' . $filename;
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to move uploaded file']);
                break;
            }
        } elseif (!empty($_POST)) {
            // Form-encoded POST without file
            $shopId = intval($_POST['shop_id'] ?? 0);
            $name = trim($_POST['name'] ?? '');
            $price = floatval($_POST['price'] ?? 0);
            $stock = intval($_POST['stock'] ?? 0);
            $description = trim($_POST['description'] ?? '');
            $image = trim($_POST['image'] ?? '');
            $image_url = $image;
        } else {
            // JSON body
            $data = json_decode(file_get_contents('php://input'), true);
            $shopId = intval($data['shop_id'] ?? 0);
            $name = trim($data['name'] ?? '');
            $price = floatval($data['price'] ?? 0);
            $stock = intval($data['stock'] ?? 0);
            $description = trim($data['description'] ?? '');
            $image = trim($data['image'] ?? '');
            $image_url = $image;
        }

        if ($shopId <= 0 || $name === '' || $price <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing product data']);
            break;
        }

        // If $image contains a full URL (no uploaded file), we keep it as-is in DB
        // If $image is a filename produced above, store only filename in DB
        $imageToStore = $image;
        if (!empty($image) && isset($filename) && $image === $filename) {
            $imageToStore = $filename; // filename only
        }

        $productId = $spot->products->createProduct($shopId, $name, $price, $stock, $description, $imageToStore);
        $response = ['success' => true, 'product_id' => intval($productId)];
        if (!empty($image_url)) {
            $response['image_url'] = $image_url;
            $response['image_filename'] = basename($image_url);
        } else {
            $response['image_url'] = $image;
            $response['image_filename'] = basename($image);
        }

        echo json_encode($response);
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