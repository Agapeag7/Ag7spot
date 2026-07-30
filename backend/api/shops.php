<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Récupérer les boutiques à proximité
        $lat = $_GET['lat'] ?? 0;
        $lng = $_GET['lng'] ?? 0;
        $radius = $_GET['radius'] ?? 5;
        $categories = isset($_GET['categories']) ? explode(',', $_GET['categories']) : [];

        // Requête SQL avec calcul de distance (Haversine)
        // ... (à implémenter)

        echo json_encode([
            'success' => true,
            'shops' => [] // Remplacer par les données
        ]);
        break;

    case 'PUT':
        // Mise à jour du statut
        $data = json_decode(file_get_contents('php://input'), true);
        $shopId = $data['shop_id'] ?? null;
        $status = $data['status'] ?? null;

        // UPDATE shops SET status = ? WHERE id = ?
        echo json_encode(['success' => true]);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>