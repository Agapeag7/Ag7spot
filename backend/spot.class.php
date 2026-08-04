<?php

class Database {
    private $pdo;

    public function __construct() {
        $config = $this->loadConfig();

        $dsn = sprintf(
            '%s:host=%s;dbname=%s;charset=%s',
            $config['driver'],
            $config['host'],
            $config['name'],
            $config['charset']
        );

        try {
            $this->pdo = new PDO($dsn, $config['user'], $config['pass'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            throw new Exception('Database connection failed: ' . $e->getMessage());
        }
    }

    private function loadConfig() {
        $configFile = __DIR__ . '/config/database.php';
        if (!file_exists($configFile)) {
            throw new Exception('Database configuration file not found.');
        }

        $config = require $configFile;
        if (!is_array($config)) {
            throw new Exception('Invalid database configuration.');
        }

        return array_merge([
            'driver' => 'mysql',
            'host' => '127.0.0.1',
            'name' => 'ag7spot',
            'user' => 'root',
            'pass' => '',
            'charset' => 'utf8mb4',
        ], $config);
    }

    public function getConnection() {
        return $this->pdo;
    }

    public function prepare($sql) {
        return $this->pdo->prepare($sql);
    }

    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }
}

class Spot {
    public $db;
    public $users;
    public $shops;
    public $products;
    public $flashDeals;
    public $collections;
    public $messages;
    public $checkins;
    public $feed;
    public $follows;

    public function __construct() {
        $this->db = new Database();
        $this->users = new SpotUsers($this->db);
        $this->shops = new SpotShops($this->db);
        $this->products = new SpotProducts($this->db);
        $this->flashDeals = new SpotFlashDeals($this->db);
        $this->collections = new SpotCollections($this->db);
        $this->messages = new SpotMessages($this->db);
        $this->checkins = new SpotCheckins($this->db);
        $this->feed = new SpotFeed($this->db);
        $this->follows = new SpotFollows($this->db);
    }
}

class SpotUsers {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getUserById($userId) {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }

    public function getUserByEmail($email) {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        return $stmt->fetch();
    }

    public function getUserByUsername($username) {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([trim($username)]);
        return $stmt->fetch();
    }

    public function verifyCredentials($username, $password) {
        $user = $this->getUserByUsername($username);
        if (!$user) {
            return null;
        }

        if (password_verify($password, $user['password'])) {
            if (password_needs_rehash($user['password'], PASSWORD_DEFAULT)) {
                $this->updatePasswordHash($user['id'], password_hash($password, PASSWORD_DEFAULT));
            }
            return $user;
        }

        if (hash_equals($user['password'], $password)) {
            $this->updatePasswordHash($user['id'], password_hash($password, PASSWORD_DEFAULT));
            return $user;
        }

        return null;
    }

    public function createUser($username, $email, $password, $role = 'buyer', $avatar = '') {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        if ($avatar === '') {
            $avatar = $this->generateAvatar($username);
        }

        $stmt = $this->db->prepare('INSERT INTO users (username, email, password, role, avatar) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([
            trim($username),
            trim($email),
            $passwordHash,
            in_array($role, ['seller', 'buyer'], true) ? $role : 'buyer',
            trim($avatar)
        ]);

        return $this->db->lastInsertId();
    }

    public function updatePasswordHash($userId, $passwordHash) {
        $stmt = $this->db->prepare('UPDATE users SET password = ? WHERE id = ?');
        return $stmt->execute([trim($passwordHash), intval($userId)]);
    }

    private function generateAvatar($username) {
        $initials = '';
        $parts = array_filter(array_map('trim', explode(' ', $username)));
        foreach ($parts as $part) {
            $initials .= mb_strtoupper(mb_substr($part, 0, 1));
            if (mb_strlen($initials) >= 2) {
                break;
            }
        }
        return $initials ?: 'AG';
    }

    public function updatePoints($userId, $points) {
        $stmt = $this->db->prepare('UPDATE users SET points = points + ? WHERE id = ?');
        return $stmt->execute([intval($points), intval($userId)]);
    }

    public function setShopId($userId, $shopId) {
        $stmt = $this->db->prepare('UPDATE users SET shop_id = ? WHERE id = ?');
        return $stmt->execute([intval($shopId), intval($userId)]);
    }
}

class SpotShops {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getNearbyShops($lat, $lng, $radius, $categories = []) {
        $radius = floatval($radius);
        $lat = floatval($lat);
        $lng = floatval($lng);

        $sql = 'SELECT s.*, (6371 * ACOS(
            COS(RADIANS(:lat)) * COS(RADIANS(s.lat)) * COS(RADIANS(s.lng) - RADIANS(:lng)) +
            SIN(RADIANS(:lat)) * SIN(RADIANS(s.lat))
        )) AS distance
        FROM shops s';

        $params = [':lat' => $lat, ':lng' => $lng];
        $filters = [];

        if (!empty($categories)) {
            $categoryPlaceholders = [];
            foreach ($categories as $index => $category) {
                $key = ':cat' . $index;
                $categoryPlaceholders[] = $key;
                $params[$key] = $category;
            }
            $filters[] = 's.category IN (' . implode(', ', $categoryPlaceholders) . ')';
        }

        if ($filters) {
            $sql .= ' WHERE ' . implode(' AND ', $filters);
        }

        $sql .= ' HAVING distance <= :radius ORDER BY distance ASC';
        $params[':radius'] = $radius;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getShopById($shopId) {
        $stmt = $this->db->prepare('SELECT * FROM shops WHERE id = ?');
        $stmt->execute([intval($shopId)]);
        return $stmt->fetch();
    }

    public function getShopsByOwner($ownerId) {
        $stmt = $this->db->prepare('SELECT * FROM shops WHERE owner_id = ? ORDER BY created_at DESC');
        $stmt->execute([intval($ownerId)]);
        return $stmt->fetchAll();
    }

    public function updateStatus($shopId, $status) {
        $stmt = $this->db->prepare('UPDATE shops SET status = ? WHERE id = ?');
        return $stmt->execute([trim($status), intval($shopId)]);
    }

    public function createShop($ownerId, $name, $category, $lat, $lng, $avatar, $cover, $address) {
        $stmt = $this->db->prepare('INSERT INTO shops (owner_id, name, category, lat, lng, avatar, cover, followed, status, address) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)');
        $stmt->execute([
            intval($ownerId),
            trim($name),
            trim($category),
            floatval($lat),
            floatval($lng),
            trim($avatar),
            trim($cover),
            'open',
            trim($address)
        ]);
        return $this->db->lastInsertId();
    }
}

class SpotProducts {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getProductsByShop($shopId) {
        $stmt = $this->db->prepare('SELECT * FROM products WHERE shop_id = ? ORDER BY created_at DESC');
        $stmt->execute([intval($shopId)]);
        return $stmt->fetchAll();
    }

    public function getProductById($productId) {
        $stmt = $this->db->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([intval($productId)]);
        return $stmt->fetch();
    }

    public function updateStock($productId, $stock) {
        $stmt = $this->db->prepare('UPDATE products SET stock = ? WHERE id = ?');
        return $stmt->execute([intval($stock), intval($productId)]);
    }

    public function createProduct($shopId, $name, $price, $stock, $description, $image) {
        $stmt = $this->db->prepare('INSERT INTO products (shop_id, name, price, image, stock, distance, description) VALUES (?, ?, ?, ?, ?, 0, ?)');
        $stmt->execute([
            intval($shopId),
            trim($name),
            floatval($price),
            trim($image),
            intval($stock),
            trim($description)
        ]);
        return $this->db->lastInsertId();
    }
}

class SpotFlashDeals {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getActiveDealsNearby($lat, $lng, $radius) {
        $sql = 'SELECT fd.*, p.name AS product_name, p.price AS product_price, s.name AS shop_name, s.lat, s.lng, (6371 * ACOS(
            COS(RADIANS(:lat)) * COS(RADIANS(s.lat)) * COS(RADIANS(s.lng) - RADIANS(:lng)) +
            SIN(RADIANS(:lat)) * SIN(RADIANS(s.lat))
        )) AS distance
        FROM flash_deals fd
        JOIN shops s ON fd.shop_id = s.id
        JOIN products p ON fd.product_id = p.id
        WHERE fd.end_time > NOW()
        HAVING distance <= :radius
        ORDER BY distance ASC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([':lat' => floatval($lat), ':lng' => floatval($lng), ':radius' => floatval($radius)]);
        return $stmt->fetchAll();
    }
}

class SpotCollections {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getAllCollections() {
        $stmt = $this->db->prepare(
            'SELECT c.id, c.name, c.description, c.creator, c.created_at, GROUP_CONCAT(cs.shop_id) AS shop_ids
            FROM collections c
            LEFT JOIN collection_shops cs ON cs.collection_id = c.id
            GROUP BY c.id
            ORDER BY c.created_at DESC'
        );
        $stmt->execute();
        $collections = $stmt->fetchAll();

        foreach ($collections as &$collection) {
            $collection['shops'] = $collection['shop_ids'] !== null
                ? array_map('intval', explode(',', $collection['shop_ids']))
                : [];
            unset($collection['shop_ids']);
        }

        return $collections;
    }

    public function getCollectionById($collectionId) {
        $stmt = $this->db->prepare('SELECT * FROM collections WHERE id = ?');
        $stmt->execute([intval($collectionId)]);
        $collection = $stmt->fetch();
        if (!$collection) {
            return null;
        }

        $stmt = $this->db->prepare('SELECT shop_id FROM collection_shops WHERE collection_id = ?');
        $stmt->execute([intval($collectionId)]);
        $collection['shops'] = array_map('intval', array_column($stmt->fetchAll(), 'shop_id'));
        return $collection;
    }

    public function createCollection($name, $description, $creator, array $shopIds) {
        $this->db->getConnection()->beginTransaction();
        try {
            $stmt = $this->db->prepare('INSERT INTO collections (name, description, creator) VALUES (?, ?, ?)');
            $stmt->execute([trim($name), trim($description), intval($creator)]);
            $collectionId = $this->db->lastInsertId();

            $stmt = $this->db->prepare('INSERT INTO collection_shops (collection_id, shop_id) VALUES (?, ?)');
            foreach ($shopIds as $shopId) {
                $stmt->execute([intval($collectionId), intval($shopId)]);
            }

            $this->db->getConnection()->commit();
            return $collectionId;
        } catch (Exception $e) {
            $this->db->getConnection()->rollBack();
            throw $e;
        }
    }
}

class SpotMessages {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getMessagesByShop($shopId) {
        $stmt = $this->db->prepare('SELECT * FROM messages WHERE shop_id = ? ORDER BY created_at ASC');
        $stmt->execute([intval($shopId)]);
        return $stmt->fetchAll();
    }

    public function createMessage($senderId, $shopId, $productId, $content) {
        $stmt = $this->db->prepare('INSERT INTO messages (sender_id, shop_id, product_id, content) VALUES (?, ?, ?, ?)');
        $stmt->execute([intval($senderId), intval($shopId), intval($productId), trim($content)]);
        return $this->db->lastInsertId();
    }
}

class SpotCheckins {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function registerCheckin($userId, $shopId) {
        $shopStmt = $this->db->prepare('SELECT status FROM shops WHERE id = ?');
        $shopStmt->execute([intval($shopId)]);
        $shop = $shopStmt->fetch();
        if (!$shop) {
            return ['success' => false, 'error' => 'Shop not found'];
        }

        if ($shop['status'] !== 'open') {
            return ['success' => false, 'error' => 'Shop is not open'];
        }

        $stmt = $this->db->prepare('INSERT INTO checkins (user_id, shop_id) VALUES (?, ?)');
        $stmt->execute([intval($userId), intval($shopId)]);

        $this->db->prepare('UPDATE users SET points = points + 10 WHERE id = ?')->execute([intval($userId)]);

        $countStmt = $this->db->prepare('SELECT COUNT(*) AS total FROM checkins WHERE user_id = ?');
        $countStmt->execute([intval($userId)]);
        $row = $countStmt->fetch();

        $pointsStmt = $this->db->prepare('SELECT points FROM users WHERE id = ?');
        $pointsStmt->execute([intval($userId)]);
        $points = $pointsStmt->fetchColumn();

        return [
            'success' => true,
            'points' => intval($points),
            'totalCheckins' => intval($row['total'])
        ];
    }
}

class SpotFeed {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getFeed($lat, $lng, $maxDistance) {
        $sql = 'SELECT p.*, s.name AS shop_name, s.lat, s.lng, s.category, (6371 * ACOS(
            COS(RADIANS(:lat)) * COS(RADIANS(s.lat)) * COS(RADIANS(s.lng) - RADIANS(:lng)) +
            SIN(RADIANS(:lat)) * SIN(RADIANS(s.lat))
        )) AS distance
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        HAVING distance <= :maxDistance
        ORDER BY distance ASC, p.created_at DESC';

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            ':lat' => floatval($lat),
            ':lng' => floatval($lng),
            ':maxDistance' => floatval($maxDistance)
        ]);
        return $stmt->fetchAll();
    }
}

class SpotFollows {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function followShop($userId, $shopId) {
        $stmt = $this->db->prepare('INSERT IGNORE INTO shop_follows (user_id, shop_id) VALUES (?, ?)');
        return $stmt->execute([intval($userId), intval($shopId)]);
    }

    public function unfollowShop($userId, $shopId) {
        $stmt = $this->db->prepare('DELETE FROM shop_follows WHERE user_id = ? AND shop_id = ?');
        return $stmt->execute([intval($userId), intval($shopId)]);
    }

    public function getFollowedShopIds($userId) {
        $stmt = $this->db->prepare('SELECT shop_id FROM shop_follows WHERE user_id = ?');
        $stmt->execute([intval($userId)]);
        return array_map('intval', array_column($stmt->fetchAll(), 'shop_id'));
    }
}
