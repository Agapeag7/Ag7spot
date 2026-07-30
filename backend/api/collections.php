<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // SELECT * FROM collections
        echo json_encode(['success' => true, 'collections' => []]);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        // INSERT INTO collections...
        // INSERT INTO collection_shops...
        echo json_encode(['success' => true, 'collection_id' => 123]);
        break;
}
?>