<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT');
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