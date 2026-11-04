<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once '../session.php';
session_start();
require_once '../spot.class.php';

$userId = intval($_SESSION['user_id'] ?? 0);
if ($userId <= 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

function isAllowedPushEndpoint($endpoint) {
    if (!is_string($endpoint) || strlen($endpoint) > 2048) {
        return false;
    }

    $parts = parse_url($endpoint);
    if (!$parts
        || strtolower($parts['scheme'] ?? '') !== 'https'
        || empty($parts['host'])
        || isset($parts['port']) && intval($parts['port']) !== 443
        || isset($parts['user'])
        || isset($parts['pass'])) {
        return false;
    }

    $host = strtolower($parts['host']);
    return $host === 'fcm.googleapis.com'
        || $host === 'web.push.apple.com'
        || $host === 'updates.push.services.mozilla.com'
        || substr($host, -strlen('.push.services.mozilla.com')) === '.push.services.mozilla.com';
}

function decodePushRequest() {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        throw new InvalidArgumentException('Données d’abonnement invalides.');
    }
    return $data;
}

try {
    $spot = new Spot();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $publicKey = getenv('VAPID_PUBLIC_KEY') ?: '';
        $available = $publicKey !== ''
            && (getenv('VAPID_PRIVATE_KEY') ?: '') !== ''
            && (getenv('VAPID_SUBJECT') ?: '') !== ''
            && is_file(dirname(__DIR__, 2) . '/vendor/autoload.php');

        echo json_encode([
            'success' => true,
            'available' => $available,
            'public_key' => $available ? $publicKey : null,
            'subscribed' => isAllowedPushEndpoint($_GET['endpoint'] ?? '')
                && $spot->notifications->hasPushSubscription($userId, $_GET['endpoint']),
        ]);
        exit;
    }

    if ($method === 'POST') {
        $data = decodePushRequest();
        $subscription = $data['subscription'] ?? null;
        if (!is_array($subscription)) {
            throw new InvalidArgumentException('Données d’abonnement invalides.');
        }
        $endpoint = $subscription['endpoint'] ?? '';
        $keys = $subscription['keys'] ?? [];
        if (!is_array($keys)) {
            throw new InvalidArgumentException('Clés d’abonnement invalides.');
        }
        $publicKey = $keys['p256dh'] ?? '';
        $authToken = $keys['auth'] ?? '';

        if (!isAllowedPushEndpoint($endpoint)
            || !is_string($publicKey)
            || !preg_match('/^[A-Za-z0-9_-]{16,200}={0,2}$/', $publicKey)
            || !is_string($authToken)
            || !preg_match('/^[A-Za-z0-9_-]{16,200}={0,2}$/', $authToken)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Abonnement push invalide.']);
            exit;
        }

        $spot->notifications->savePushSubscription($userId, $endpoint, $publicKey, $authToken);
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $data = decodePushRequest();
        $endpoint = $data['endpoint'] ?? '';
        if (!isAllowedPushEndpoint($endpoint)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Abonnement push invalide.']);
            exit;
        }
        $spot->notifications->removePushSubscription($userId, $endpoint);
        echo json_encode(['success' => true]);
        exit;
    }

    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch (Throwable $e) {
    error_log('Push subscription API error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Impossible de gérer cet abonnement push.']);
}
