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
    public $notifications;

    public function __construct() {
        $this->db = new Database();
        $this->ensureFollowAndNotificationTables();
        $this->ensureUserSchema();
        $this->notifications = new SpotNotifications($this->db);
        $this->users = new SpotUsers($this->db);
        $this->shops = new SpotShops($this->db, $this->notifications);
        $this->products = new SpotProducts($this->db, $this->notifications);
        $this->flashDeals = new SpotFlashDeals($this->db);
        $this->collections = new SpotCollections($this->db);
        $this->messages = new SpotMessages($this->db, $this->notifications);
        $this->checkins = new SpotCheckins($this->db);
        $this->feed = new SpotFeed($this->db);
        $this->follows = new SpotFollows($this->db);
    }

    private function ensureUserSchema() {
        $connection = $this->db->getConnection();

        $column = $connection->query("SHOW COLUMNS FROM users LIKE 'session_token'");
        if ($column && $column->fetch() === false) {
            $connection->exec("ALTER TABLE users ADD COLUMN session_token VARCHAR(255) NULL AFTER updated_at");
        }

        $usernameIndex = $connection->query("SHOW INDEX FROM users WHERE Key_name = 'uk_users_username'");
        if ($usernameIndex && $usernameIndex->fetch() === false) {
            $connection->exec('ALTER TABLE users ADD UNIQUE KEY uk_users_username (username)');
        }

        $emailColumn = $connection->query("SHOW COLUMNS FROM users LIKE 'email'");
        if ($emailColumn && $emailColumn->fetch() !== false) {
            try {
                $connection->exec('ALTER TABLE users DROP INDEX uk_users_email');
            } catch (Exception $e) {}
            $connection->exec('ALTER TABLE users DROP COLUMN email');
        }
    }

    private function ensureFollowAndNotificationTables() {
        $connection = $this->db->getConnection();
        $connection->exec('CREATE TABLE IF NOT EXISTS shop_follows (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id INT UNSIGNED NOT NULL,
            shop_id INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uk_shop_follows_user_shop (user_id, shop_id),
            KEY idx_shop_follows_user_id (user_id),
            KEY idx_shop_follows_shop_id (shop_id),
            CONSTRAINT fk_runtime_shop_follows_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            CONSTRAINT fk_runtime_shop_follows_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $connection->exec('CREATE TABLE IF NOT EXISTS notifications (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            user_id INT UNSIGNED NOT NULL,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(150) NOT NULL,
            body VARCHAR(500) NOT NULL,
            data_json JSON NULL,
            read_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_notifications_user_read (user_id, read_at),
            CONSTRAINT fk_runtime_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
        $connection->exec('CREATE TABLE IF NOT EXISTS messages (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT,
            sender_id INT UNSIGNED NOT NULL,
            shop_id INT UNSIGNED NOT NULL,
            product_id INT UNSIGNED NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_messages_shop_id (shop_id),
            KEY idx_messages_sender_id (sender_id),
            KEY idx_messages_product_id (product_id),
            CONSTRAINT fk_runtime_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
            CONSTRAINT fk_runtime_messages_shop FOREIGN KEY (shop_id) REFERENCES shops (id) ON DELETE CASCADE,
            CONSTRAINT fk_runtime_messages_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4');
    }
}

class SpotNotifications {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    public function getForUser($userId, $limit = 30, $offset = 0) {
        $this->purgeOldReadNotifications(intval($userId));
        $limit = max(1, min(30, intval($limit)));
        $offset = max(0, intval($offset));
        $stmt = $this->db->prepare("SELECT id, type, title, body, data_json, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}");
        $stmt->execute([intval($userId)]);
        $notifications = $stmt->fetchAll();
        foreach ($notifications as &$notification) {
            $notification['data'] = $notification['data_json'] ? json_decode($notification['data_json'], true) : [];
            unset($notification['data_json']);
        }
        return $notifications;
    }

    private function purgeOldReadNotifications($userId) {
        $stmt = $this->db->prepare('DELETE FROM notifications WHERE user_id = ? AND read_at IS NOT NULL AND created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)');
        $stmt->execute([intval($userId)]);
    }

    public function getUnreadCount($userId) {
        $stmt = $this->db->prepare('SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read_at IS NULL');
        $stmt->execute([intval($userId)]);
        return intval($stmt->fetchColumn());
    }

    public function markRead($userId, $notificationId = null) {
        $sql = 'UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL';
        $params = [intval($userId)];
        if ($notificationId) {
            $sql .= ' AND id = ?';
            $params[] = intval($notificationId);
        }
        return $this->db->prepare($sql)->execute($params);
    }

    public function notifyShopFollowers($shopId, $type, $title, $body, array $data = []) {
        try {
            $stmt = $this->db->prepare('SELECT sf.user_id FROM shop_follows sf JOIN shops s ON s.id = sf.shop_id WHERE sf.shop_id = ? AND sf.user_id <> s.owner_id');
            $stmt->execute([intval($shopId)]);
            $insert = $this->db->prepare('INSERT INTO notifications (user_id, type, title, body, data_json) VALUES (?, ?, ?, ?, ?)');
            foreach ($stmt->fetchAll() as $follower) {
                $insert->execute([intval($follower['user_id']), trim($type), trim($title), trim($body), json_encode($data)]);
            }
        } catch (PDOException $e) {
            if ($e->getCode() !== '42S02') throw $e;
        }
    }

    public function notifyUser($userId, $type, $title, $body, array $data = []) {
        $stmt = $this->db->prepare('INSERT INTO notifications (user_id, type, title, body, data_json) VALUES (?, ?, ?, ?, ?)');
        return $stmt->execute([intval($userId), trim($type), trim($title), trim($body), json_encode($data)]);
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
        return null;
    }

    public function getUserByUsername($username) {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE username = ?');
        $stmt->execute([trim($username)]);
        return $stmt->fetch();
    }

    public function validatePassword($password) {
        $password = is_string($password) ? trim($password) : '';

        if (strlen($password) < 12) {
            throw new InvalidArgumentException('Le mot de passe doit contenir au moins 12 caractères.');
        }

        if (!preg_match('/[a-z]/', $password) || !preg_match('/[A-Z]/', $password) || !preg_match('/\d/', $password) || !preg_match('/[^A-Za-z0-9]/', $password)) {
            throw new InvalidArgumentException('Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial.');
        }

        return true;
    }

    public function validateRegistrationInput($username, $password, $existingUsernameUser = null) {
        $username = trim((string) $username);
        $password = is_string($password) ? trim($password) : '';

        if ($username === '') {
            throw new InvalidArgumentException('Le pseudo est requis.');
        }

        if (strlen($username) < 5 || strlen($username) > 20) {
            throw new InvalidArgumentException('Le pseudo doit contenir entre 5 et 20 caractères, avec un suffixe numérique unique à la fin (ex. pseudo123).');
        }

        if (!preg_match('/^[A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*[0-9]{2,}$/u', $username)) {
            throw new InvalidArgumentException('Le pseudo doit finir par des chiffres uniques et contenir entre 5 et 20 caractères (ex. pseudo123).');
        }

        if (strcasecmp($username, $password) === 0) {
            throw new InvalidArgumentException('Le mot de passe ne doit pas être identique au pseudo.');
        }

        $this->validatePassword($password);

        if ($existingUsernameUser) {
            throw new InvalidArgumentException('Ce pseudo est déjà utilisé.');
        }

        return true;
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

        if (hash_equals((string) $user['password'], (string) $password)) {
            $this->updatePasswordHash($user['id'], password_hash($password, PASSWORD_DEFAULT));
            return $user;
        }

        return null;
    }

    public function generateSessionToken() {
        return bin2hex(random_bytes(32));
    }

    public function setSessionToken($userId, $sessionToken = null) {
        $stmt = $this->db->prepare('UPDATE users SET session_token = ? WHERE id = ?');
        return $stmt->execute([$sessionToken ? trim($sessionToken) : null, intval($userId)]);
    }

    public function clearSessionToken($userId) {
        return $this->setSessionToken($userId, null);
    }

    public function createUser($username, $password, $role = 'buyer', $avatar = '') {
        $existingUsernameUser = $this->getUserByUsername(trim($username));
        $this->validateRegistrationInput($username, $password, $existingUsernameUser);

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        if ($avatar === '') {
            $avatar = $this->generateAvatar($username);
        }

        $stmt = $this->db->prepare('INSERT INTO users (username, password, role, avatar) VALUES (?, ?, ?, ?)');
        $stmt->execute([
            trim($username),
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
    private $notifications;

    public function __construct($database, $notifications = null) {
        $this->db = $database;
        $this->notifications = $notifications;
    }

    public function getNearbyShops($lat, $lng, $radius, $categories = [], $userId = null) {
        $radius = floatval($radius);
        $lat = floatval($lat);
        $lng = floatval($lng);

        // Use distinct parameter names for repeated placeholders (PDO native prepares
        // may not support reusing the same named parameter multiple times)
        $sql = 'SELECT s.*, (6371 * ACOS(
            COS(RADIANS(:lat1)) * COS(RADIANS(s.lat)) * COS(RADIANS(s.lng) - RADIANS(:lng)) +
            SIN(RADIANS(:lat2)) * SIN(RADIANS(s.lat))
        )) AS distance
        FROM shops s
        LEFT JOIN shop_follows sf ON sf.shop_id = s.id AND sf.user_id = :userId';

        // Use parameter names without leading ':' for PDO execute array keys
        $params = ['lat1' => $lat, 'lat2' => $lat, 'lng' => $lng, 'userId' => intval($userId)];
        $filters = [];

        if (!empty($categories)) {
            $categoryPlaceholders = [];
            foreach ($categories as $index => $category) {
                $key = 'cat' . $index;
                $categoryPlaceholders[] = ':' . $key;
                $params[$key] = $category;
            }
            $filters[] = 's.category IN (' . implode(', ', $categoryPlaceholders) . ')';
        }

        if ($filters) {
            $sql .= ' WHERE ' . implode(' AND ', $filters);
        }

        $sql .= ' HAVING distance <= :radius ORDER BY distance ASC';
        $sql = str_replace('SELECT s.*,', 'SELECT s.*, (sf.id IS NOT NULL) AS followed,', $sql);
        $params['radius'] = $radius;

        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        } catch (PDOException $e) {
            if ($e->getCode() !== '42S02') {
                throw $e;
            }
            $sql = str_replace('SELECT s.*, (sf.id IS NOT NULL) AS followed,', 'SELECT s.*, 0 AS followed,', $sql);
            $sql = str_replace('LEFT JOIN shop_follows sf ON sf.shop_id = s.id AND sf.user_id = :userId', '', $sql);
            unset($params['userId']);
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }
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

    public function getShopByOwner($ownerId) {
        $stmt = $this->db->prepare('SELECT * FROM shops WHERE owner_id = ? ORDER BY created_at DESC LIMIT 1');
        $stmt->execute([intval($ownerId)]);
        return $stmt->fetch();
    }

    public function updateStatus($shopId, $status) {
        $stmt = $this->db->prepare('UPDATE shops SET status = ? WHERE id = ?');
        return $stmt->execute([trim($status), intval($shopId)]);
    }

    public function updateStatusForOwner($shopId, $ownerId, $status) {
        $stmt = $this->db->prepare('UPDATE shops SET status = ? WHERE id = ? AND owner_id = ?');
        $success = $stmt->execute([trim($status), intval($shopId), intval($ownerId)]);
        if ($success && $this->notifications) {
            $shop = $this->getShopById($shopId);
            $shopName = $shop && !empty($shop['name']) ? trim($shop['name']) : 'Cette boutique';
            $labels = ['open' => 'ouverte', 'closed' => 'fermée', 'break' => 'en pause'];
            $label = $labels[$status] ?? 'mise à jour';
            $this->notifications->notifyShopFollowers(
                $shopId,
                'shop_status',
                'Statut de boutique',
                'La boutique "' . $shopName . '" est maintenant ' . $label . '.',
                ['shop_id' => intval($shopId), 'status' => $status, 'shop_name' => $shopName]
            );
        }
        return $success;
    }

    public function updateShop($shopId, $ownerId, $name, $category, $lat, $lng, $address) {
        $stmt = $this->db->prepare(
            'UPDATE shops SET name = ?, category = ?, lat = ?, lng = ?, address = ?
             WHERE id = ? AND owner_id = ?'
        );
        $success = $stmt->execute([
            trim($name), trim($category), floatval($lat), floatval($lng), trim($address),
            intval($shopId), intval($ownerId)
        ]);
        if ($success && $this->notifications) {
            $this->notifications->notifyShopFollowers($shopId, 'shop_updated', 'Boutique mise à jour', 'Une boutique que tu suis vient d’être mise à jour.', ['shop_id' => intval($shopId)]);
        }
        return $success;
    }

    public function createShop($ownerId, $name, $category, $lat, $lng, $address) {
        $stmt = $this->db->prepare('INSERT INTO shops (owner_id, name, category, lat, lng, status, address) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            intval($ownerId),
            trim($name),
            trim($category),
            floatval($lat),
            floatval($lng),
            'open',
            trim($address)
        ]);
        return $this->db->lastInsertId();
    }
}

class SpotProducts {
    private $db;
    private $notifications;

    public function __construct($database, $notifications = null) {
        $this->db = $database;
        $this->notifications = $notifications;
    }

    public function getProductsByShop($shopId) {
        $stmt = $this->db->prepare('SELECT p.*, (p.created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)) AS can_edit FROM products p WHERE p.shop_id = ? ORDER BY p.created_at DESC');
        $stmt->execute([intval($shopId)]);
        return $stmt->fetchAll();
    }

    public function getProductsByOwner($ownerId) {
        $stmt = $this->db->prepare(
            'SELECT p.* FROM products p
             JOIN shops s ON p.shop_id = s.id
             WHERE s.owner_id = ?
             ORDER BY p.created_at DESC'
        );
        $stmt->execute([intval($ownerId)]);
        return $stmt->fetchAll();
    }

    public function getProductById($productId) {
        $stmt = $this->db->prepare('SELECT * FROM products WHERE id = ?');
        $stmt->execute([intval($productId)]);
        return $stmt->fetch();
    }

    public function getProductOwnerId($productId) {
        $stmt = $this->db->prepare(
            'SELECT s.owner_id FROM products p
             JOIN shops s ON p.shop_id = s.id
             WHERE p.id = ?'
        );
        $stmt->execute([intval($productId)]);
        return $stmt->fetchColumn();
    }

    public function updateProduct($productId, $name, $price, $stock, $description, $image) {
        $stmt = $this->db->prepare('UPDATE products SET name = ?, price = ?, stock = ?, description = ?, image = ? WHERE id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)');
        return $stmt->execute([
            trim($name),
            floatval($price),
            intval($stock),
            trim($description),
            trim($image),
            intval($productId)
        ]);
    }

    public function deleteProduct($productId) {
        $stmt = $this->db->prepare('DELETE FROM products WHERE id = ?');
        return $stmt->execute([intval($productId)]);
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
        $productId = $this->db->lastInsertId();
        if ($this->notifications) {
            $shopStmt = $this->db->prepare('SELECT name FROM shops WHERE id = ?');
            $shopStmt->execute([intval($shopId)]);
            $shopName = $shopStmt->fetchColumn() ?: 'Une boutique';
            $this->notifications->notifyShopFollowers(
                $shopId,
                'new_product',
                'Nouveau produit',
                $shopName . ' vient de publier « ' . trim($name) . ' ».',
                ['shop_id' => intval($shopId), 'product_id' => intval($productId), 'shop_name' => $shopName, 'product_name' => trim($name)]
            );
        }
        return $productId;
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
    private $notifications;

    public function __construct($database, $notifications = null) {
        $this->db = $database;
        $this->notifications = $notifications;
    }

    public function getMessagesByShop($shopId, $userId) {
        $stmt = $this->db->prepare(
            'SELECT m.* FROM messages m
             JOIN shops s ON s.id = m.shop_id
             WHERE m.shop_id = ? AND (m.sender_id = ? OR s.owner_id = ?)
             ORDER BY m.created_at ASC'
        );
        $stmt->execute([intval($shopId), intval($userId), intval($userId)]);
        return $stmt->fetchAll();
    }

    public function createMessage($senderId, $shopId, $productId, $content) {
        $shopStmt = $this->db->prepare('SELECT s.name, s.owner_id, p.name AS product_name FROM shops s JOIN products p ON p.shop_id = s.id WHERE s.id = ? AND p.id = ?');
        $shopStmt->execute([intval($shopId), intval($productId)]);
        $shop = $shopStmt->fetch();
        if (!$shop) {
            throw new InvalidArgumentException('Boutique ou produit introuvable.');
        }

        $stmt = $this->db->prepare('INSERT INTO messages (sender_id, shop_id, product_id, content) VALUES (?, ?, ?, ?)');
        $stmt->execute([intval($senderId), intval($shopId), intval($productId), trim($content)]);
        $messageId = $this->db->lastInsertId();
        if ($this->notifications && intval($shop['owner_id']) !== intval($senderId)) {
            $this->notifications->notifyUser(
                $shop['owner_id'],
                'new_message',
                'Nouveau message',
                'Un client souhaite réserver « ' . $shop['product_name'] . ' » dans ' . $shop['name'] . '.',
                ['shop_id' => intval($shopId), 'product_id' => intval($productId), 'message_id' => intval($messageId), 'shop_name' => trim($shop['name']), 'product_name' => trim($shop['product_name'])]
            );
        }
        return $messageId;
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

    public function getFeed($lat, $lng, $maxDistance, $userId = null) {
        $sql = 'SELECT p.*, s.name AS shop_name, s.owner_id AS shop_owner_id, s.status AS shop_status, (sf.id IS NOT NULL) AS followed, s.lat, s.lng, s.category, (6371 * ACOS(
            COS(RADIANS(:lat1)) * COS(RADIANS(s.lat)) * COS(RADIANS(s.lng) - RADIANS(:lng)) +
            SIN(RADIANS(:lat2)) * SIN(RADIANS(s.lat))
        )) AS distance
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        LEFT JOIN shop_follows sf ON sf.shop_id = s.id AND sf.user_id = :userId
        HAVING distance <= :maxDistance
        ORDER BY distance ASC, p.created_at DESC';

        $params = [
            ':lat1' => floatval($lat),
            ':lng' => floatval($lng),
            ':lat2' => floatval($lat),
            ':maxDistance' => floatval($maxDistance),
            ':userId' => intval($userId)
        ];
        try {
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        } catch (PDOException $e) {
            if ($e->getCode() !== '42S02') throw $e;
            $sql = str_replace('s.owner_id AS shop_owner_id, (sf.id IS NOT NULL) AS followed, ', 's.owner_id AS shop_owner_id, 0 AS followed, ', $sql);
            $sql = str_replace('LEFT JOIN shop_follows sf ON sf.shop_id = s.id AND sf.user_id = :userId', '', $sql);
            unset($params[':userId']);
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }
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
        try {
            $stmt = $this->db->prepare('SELECT shop_id FROM shop_follows WHERE user_id = ?');
            $stmt->execute([intval($userId)]);
            return array_map('intval', array_column($stmt->fetchAll(), 'shop_id'));
        } catch (PDOException $e) {
            if ($e->getCode() === '42S02') {
                return [];
            }
            throw $e;
        }
    }

    public function getFollowedShops($userId, $limit = 10, $offset = 0) {
        $limit = max(1, min(50, intval($limit)));
        $offset = max(0, intval($offset));
        $stmt = $this->db->prepare(
            "SELECT s.*, 1 AS followed
             FROM shop_follows sf
             JOIN shops s ON s.id = sf.shop_id
             WHERE sf.user_id = ?
             ORDER BY sf.created_at DESC
             LIMIT {$limit} OFFSET {$offset}"
        );
        $stmt->execute([intval($userId)]);
        return $stmt->fetchAll();
    }
}
