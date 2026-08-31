<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
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
        $collections = $spot->collections->getAllCollections();
        echo json_encode(['success' => true, 'collections' => $collections]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $name = trim($data['name'] ?? '');
        $description = trim($data['description'] ?? '');
        $shopIds = isset($data['shops']) && is_array($data['shops']) ? $data['shops'] : [];
        $creator = $_SESSION['user_id'] ?? intval($data['creator'] ?? 0);

        if ($name === '' || $description === '' || empty($shopIds) || $creator <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing collection fields']);
            break;
        }

        $collectionId = $spot->collections->createCollection($name, $description, $creator, $shopIds);
        echo json_encode(['success' => true, 'collection_id' => $collectionId]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
}
?>