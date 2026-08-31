<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$rememberMe = !empty($data['remember_me']);

require_once '../session.php';
configureSessionLifetime($rememberMe);
if ($rememberMe) {
    setcookie('ag7_remember_me', '1', time() + (30 * 24 * 60 * 60), '/', '', false, true);
} else {
    setcookie('ag7_remember_me', '', time() - 3600, '/', '', false, true);
}
session_start();
require_once '../spot.class.php';

try {
    $spot = new Spot();
} catch (Exception $e) {
    error_log('Ag7Spot auth initialization failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Le service d\'authentification est temporairement indisponible.']);
    exit;
}

function shouldRejectConcurrentLogin(int $currentUserId, int $targetUserId, ?string $activeSessionToken, ?string $dbSessionToken): bool {
    if ($currentUserId <= 0) {
        return false;
    }

    if ($currentUserId === $targetUserId) {
        return false;
    }

    return !empty($dbSessionToken) && $activeSessionToken !== $dbSessionToken;
}

$action = trim(strtolower($data['action'] ?? 'login'));

if ($action === 'login') {
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if ($username === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nom d\'utilisateur et mot de passe requis']);
        exit;
    }

    try {
        $user = $spot->users->verifyCredentials($username, $password);
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Nom d\'utilisateur ou mot de passe invalide']);
            exit;
        }

        $currentUserId = intval($_SESSION['user_id'] ?? 0);
        $activeSessionToken = $_SESSION['session_token'] ?? null;
        $dbSessionToken = $user['session_token'] ?? null;
        $targetUserId = intval($user['id']);

        if (!shouldRejectConcurrentLogin($currentUserId, $targetUserId, $activeSessionToken, $dbSessionToken)) {
            $sessionToken = $spot->users->generateSessionToken();
            $_SESSION['user_id'] = $targetUserId;
            $_SESSION['session_token'] = $sessionToken;
            $spot->users->setSessionToken($targetUserId, $sessionToken);
        } else {
            http_response_code(409);
            echo json_encode(['success' => false, 'error' => 'Ce compte est déjà connecté sur un autre appareil.']);
            exit;
        }
        unset($user['password']);

        echo json_encode(['success' => true, 'user' => $user]);
        exit;
    } catch (InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    } catch (Exception $e) {
        error_log('Ag7Spot login failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'La connexion est temporairement indisponible.']);
        exit;
    }
}

if ($action === 'register') {
    $username = trim($data['username'] ?? $data['name'] ?? '');
    $password = $data['password'] ?? '';
    $role = trim(strtolower($data['role'] ?? 'buyer'));

    try {
        if ($username === '' || $password === '') {
            throw new InvalidArgumentException('Nom d\'utilisateur et mot de passe requis');
        }

        $spot->users->validateRegistrationInput($username, $password, $spot->users->getUserByUsername($username));

        $userId = $spot->users->createUser($username, $password, in_array($role, ['seller', 'buyer'], true) ? $role : 'buyer');
        $user = $spot->users->getUserById($userId);
        if (!$user) {
            throw new Exception('Impossible de récupérer l\'utilisateur après inscription');
        }

        $sessionToken = $spot->users->generateSessionToken();
        $_SESSION['user_id'] = intval($user['id']);
        $_SESSION['session_token'] = $sessionToken;
        $spot->users->setSessionToken(intval($user['id']), $sessionToken);
        unset($user['password']);

        echo json_encode(['success' => true, 'user' => $user]);
        exit;
    } catch (InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    } catch (Exception $e) {
        error_log('Ag7Spot registration failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'La création du compte est temporairement indisponible.']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Action invalide']);
