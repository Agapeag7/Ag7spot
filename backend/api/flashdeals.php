<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

$lat = $_GET['lat'] ?? 0;
$lng = $_GET['lng'] ?? 0;
$radius = $_GET['radius'] ?? 2;

// SELECT fd.*, s.lat, s.lng, s.name FROM flash_deals fd
// JOIN shops s ON fd.shop_id = s.id
// WHERE fd.end_time > NOW()
// AND (6371 * acos(...)) < $radius

echo json_encode([
    'success' => true,
    'deals' => []
]);
?>