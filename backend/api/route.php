<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);
$waypoints = $data['waypoints'] ?? [];
$mode = $data['mode'] ?? 'walking';

// Ici tu peux appeler l'API OSRM ou Google Maps pour calculer le chemin
// Exemple avec OSRM : http://router.project-osrm.org/route/v1/walking/...

// Simulation
echo json_encode([
    'success' => true,
    'distance' => 3.5,
    'duration' => 42,
    'coordinates' => [[45.76, 4.84], [45.77, 4.85], [45.75, 4.86]]
]);
?>