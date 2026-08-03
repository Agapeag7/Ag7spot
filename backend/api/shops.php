<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST');
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
        $lat = floatval($_GET['lat'] ?? 0);
        $lng = floatval($_GET['lng'] ?? 0);
        $radius = floatval($_GET['radius'] ?? 5);
        $categories = [];
        if (!empty($_GET['categories'])) {
            $categories = array_filter(array_map('trim', explode(',', $_GET['categories'])));
        }

        $shops = $spot->shops->getNearbyShops($lat, $lng, $radius, $categories);
        echo json_encode(['success' => true, 'shops' => $shops]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $ownerId = $_SESSION['user_id'] ?? intval($data['owner_id'] ?? 0);
        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $lat = floatval($data['lat'] ?? 0);
        $lng = floatval($data['lng'] ?? 0);
        $avatar = trim($data['avatar'] ?? '');
        $cover = trim($data['cover'] ?? '');
        $address = trim($data['address'] ?? '');

        if ($ownerId <= 0 || $name === '' || $category === '' || $lat === 0 || $lng === 0 || $address === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing shop data']);
            break;
        }

        $shopId = $spot->shops->createShop($ownerId, $name, $category, $lat, $lng, $avatar, $cover, $address);
        if ($shopId && $ownerId > 0) {
            $spot->users->setShopId($ownerId, $shopId);
        }

        echo json_encode(['success' => true, 'shop_id' => intval($shopId)]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $shopId = intval($data['shop_id'] ?? 0);
        $status = trim($data['status'] ?? '');

        if (!$shopId || !in_array($status, ['open', 'closed', 'break'], true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid shop_id or status']);
            break;
        }

        $success = $spot->shops->updateStatus($shopId, $status);
        echo json_encode(['success' => $success]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>