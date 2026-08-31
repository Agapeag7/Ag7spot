<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../session.php';
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
        $shopId = intval($_GET['shop_id'] ?? 0);
        if ($shopId > 0) {
            $shop = $spot->shops->getShopById($shopId);
            echo json_encode(['success' => true, 'shop' => $shop]);
            break;
        }
        $lat = floatval($_GET['lat'] ?? 0);
        $lng = floatval($_GET['lng'] ?? 0);
        $radius = floatval($_GET['radius'] ?? 5);
        $categories = [];
        if (!empty($_GET['categories'])) {
            $categories = array_filter(array_map('trim', explode(',', $_GET['categories'])));
        }

        $userId = intval($_SESSION['user_id'] ?? 0);
        $shops = $spot->shops->getNearbyShops($lat, $lng, $radius, $categories, $userId);
        echo json_encode(['success' => true, 'shops' => $shops]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $ownerId = $_SESSION['user_id'] ?? intval($data['owner_id'] ?? 0);
        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $lat = floatval($data['lat'] ?? 0);
        $lng = floatval($data['lng'] ?? 0);
        $address = trim($data['address'] ?? '');

        if ($ownerId <= 0 || $name === '' || $category === '' || $lat === 0 || $lng === 0 || $address === '') {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing shop data']);
            break;
        }

        $shopId = $spot->shops->createShop($ownerId, $name, $category, $lat, $lng, $address);
        if ($shopId && $ownerId > 0) {
            $spot->users->setShopId($ownerId, $shopId);
        }

        echo json_encode(['success' => true, 'shop_id' => intval($shopId)]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $shopId = intval($data['shop_id'] ?? 0);
        $ownerId = intval($_SESSION['user_id'] ?? 0);

        if (!$shopId || !$ownerId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid shop_id or session']);
            break;
        }

        if (array_key_exists('status', $data)) {
            $status = trim($data['status'] ?? '');
            if (!in_array($status, ['open', 'closed', 'break'], true)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Invalid status']);
                break;
            }
            $success = $spot->shops->updateStatusForOwner($shopId, $ownerId, $status);
            echo json_encode(['success' => $success]);
            break;
        }

        $name = trim($data['name'] ?? '');
        $category = trim($data['category'] ?? '');
        $lat = filter_var($data['lat'] ?? null, FILTER_VALIDATE_FLOAT);
        $lng = filter_var($data['lng'] ?? null, FILTER_VALIDATE_FLOAT);
        $address = trim($data['address'] ?? '');

        if ($name === '' || strlen($name) > 150 || $category === '' || strlen($category) > 50
            || $lat === false || $lng === false || $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid shop data']);
            break;
        }

        if ($address === '') {
            $address = sprintf('Coordonnées %.4f, %.4f', $lat, $lng);
        }

        $success = $spot->shops->updateShop($shopId, $ownerId, $name, $category, $lat, $lng, $address);
        if ($success) {
            echo json_encode(['success' => true, 'shop' => $spot->shops->getShopById($shopId)]);
            break;
        }

        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Shop not found or not owned by user']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>