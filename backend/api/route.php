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
    'coordinates' => [[-4.325321, 15.313543], [-4.327650, 15.305930], [-4.395400, 15.267800]]
]);
?>