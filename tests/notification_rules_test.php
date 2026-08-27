<?php
require_once __DIR__ . '/../backend/spot.class.php';

class MockNotificationStatement {
    private $result;
    private $paramsLog;

    public function __construct($result = [], &$paramsLog = []) {
        $this->result = $result;
        $this->paramsLog = &$paramsLog;
    }

    public function execute($params = []) {
        $this->paramsLog[] = $params;
        return true;
    }

    public function fetchAll() {
        return $this->result;
    }

    public function fetchColumn() {
        return 0;
    }
}

class MockNotificationDatabase {
    public $queries = [];
    public $executeParams = [];
    public $latestSql = '';

    public function prepare($sql) {
        $this->latestSql = $sql;
        $this->queries[] = $sql;

        if (stripos($sql, 'DELETE FROM notifications') === 0) {
            return new MockNotificationStatement([], $this->executeParams);
        }

        return new MockNotificationStatement([
            ['id' => 1, 'type' => 'new_message', 'title' => 'Test', 'body' => 'Body', 'data_json' => null, 'read_at' => null, 'created_at' => '2026-08-27 10:00:00'],
        ], $this->executeParams);
    }
}

$db = new MockNotificationDatabase();
$notifications = new SpotNotifications($db);
$result = $notifications->getForUser(42);

if (count($db->queries) < 2) {
    fwrite(STDERR, "FATAL: getForUser should purge stale notifications before fetching\n");
    exit(1);
}

if (stripos($db->queries[0], 'DELETE FROM notifications WHERE user_id = ? AND read_at IS NOT NULL AND created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)') !== 0) {
    fwrite(STDERR, "FATAL: stale read notifications were not purged before listing\n");
    exit(1);
}

if (stripos($db->queries[1], 'SELECT id, type, title, body, data_json, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30 OFFSET 0') !== 0) {
    fwrite(STDERR, "FATAL: notification pagination default limit should be 30\n");
    exit(1);
}

if (count($result) !== 1 || $result[0]['title'] !== 'Test') {
    fwrite(STDERR, "FATAL: notification items should still be returned after purge\n");
    exit(1);
}

echo "OK\n";
