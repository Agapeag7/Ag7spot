<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
$data = json_decode(file_get_contents('php://input'), true);
$userId = $_SESSION['user_id'] ?? 1; // À récupérer de la session
$shopId = $data['shop_id'] ?? null;

// INSERT INTO checkins (user_id, shop_id) VALUES (?, ?)
// UPDATE users SET points = points + 10 WHERE id = ?

echo json_encode([
    'success' => true,
    'points' => 10,
    'totalCheckins' => 5
]);
?>