<?php
ob_start();
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
ini_set('html_errors', '0');
error_reporting(E_ALL);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT');
header('Access-Control-Allow-Headers: Content-Type');

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

session_start();
try {
    require_once '../spot.class.php';
    $spot = new Spot();

    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        jsonResponse(['success' => false, 'error' => 'Unauthorized'], 401);
    }

    $user = $spot->users->getUserById($userId);
    if (!$user) {
        jsonResponse(['success' => false, 'error' => 'User not found'], 404);
    }

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        $username = trim($data['username'] ?? $user['username']);
        $email = trim($data['email'] ?? $user['email']);
        $role = in_array(trim($data['role'] ?? $user['role']), ['seller', 'buyer'], true) ? trim($data['role'] ?? $user['role']) : $user['role'];

        if ($username === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['success' => false, 'error' => 'Invalid profile data'], 400);
        }

        $stmt = $spot->db->prepare('UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?');
        $success = $stmt->execute([$username, $email, $role, intval($userId)]);
        if ($success) {
            $user = $spot->users->getUserById($userId);
            unset($user['password']);
            jsonResponse(['success' => true, 'user' => $user]);
        }

        jsonResponse(['success' => false, 'error' => 'Unable to update profile'], 500);
    }

    $shop = null;
    $products = [];
    if (method_exists($spot->shops, 'getShopByOwner')) {
        $myShop = $spot->shops->getShopByOwner($userId);
    } else {
        $ownerShops = $spot->shops->getShopsByOwner($userId);
        $myShop = !empty($ownerShops) ? $ownerShops[0] : null;
    }

    if ($myShop) {
        $shop = $myShop;
        $products = $spot->products->getProductsByShop(intval($myShop['id']));
    }

    $followedShops = $spot->follows->getFollowedShopIds($userId);
    $followedShopDetails = $spot->follows->getFollowedShops($userId);

    unset($user['password']);

    jsonResponse([
        'success' => true,
        'user' => $user,
        'shop' => $shop,
        'products' => $products,
        'followCount' => count($followedShops),
        'followedShops' => $followedShopDetails
    ]);
} catch (Exception $e) {
    jsonResponse(['success' => false, 'error' => $e->getMessage()], 500);
}
