<?php
ob_start();
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('html_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

session_start();

function jsonResponse(array $data, int $status = 200) {
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    http_response_code($status);
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    $json = json_encode($data);
    if ($json === false) {
        $json = json_encode(['success' => false, 'error' => 'JSON encode failed']);
    }
    echo $json;
    exit;
}

try {
    require_once '../spot.class.php';
    $spot = new Spot();
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}

try {
    $lat = floatval($_GET['lat'] ?? 0);
    $lng = floatval($_GET['lng'] ?? 0);
    $maxDistance = floatval($_GET['max_distance'] ?? 5);

    $userId = intval($_SESSION['user_id'] ?? 0);
    $feed = $spot->feed->getFeed($lat, $lng, $maxDistance, $userId);
    jsonResponse(['success' => true, 'feed' => $feed]);
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
?>