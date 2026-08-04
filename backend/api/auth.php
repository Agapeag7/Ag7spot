<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require_once '../spot.class.php';

try {
    $spot = new Spot();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$action = trim(strtolower($data['action'] ?? 'login'));

if ($action === 'login') {
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if ($email === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email et mot de passe requis']);
        exit;
    }

    $user = $spot->users->verifyCredentials($email, $password);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Email ou mot de passe invalide']);
        exit;
    }

    $_SESSION['user_id'] = intval($user['id']);
    unset($user['password']);

    echo json_encode(['success' => true, 'user' => $user]);
    exit;
}

if ($action === 'register') {
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = trim(strtolower($data['role'] ?? 'buyer'));

    if ($name === '' || $email === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nom, email et mot de passe requis']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Adresse e-mail invalide']);
        exit;
    }

    if ($spot->users->getUserByEmail($email)) {
        http_response_code(409);
        echo json_encode(['success' => false, 'error' => 'Cette adresse e-mail est déjà utilisée']);
        exit;
    }

    try {
        $userId = $spot->users->createUser($name, $email, $password, in_array($role, ['seller', 'buyer'], true) ? $role : 'buyer');
        $user = $spot->users->getUserById($userId);
        if (!$user) {
            throw new Exception('Impossible de récupérer l\'utilisateur après inscription');
        }

        $_SESSION['user_id'] = intval($user['id']);
        unset($user['password']);

        echo json_encode(['success' => true, 'user' => $user]);
        exit;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action invalide']);
