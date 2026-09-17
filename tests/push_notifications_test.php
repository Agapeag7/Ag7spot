<?php
require_once __DIR__ . '/../backend/spot.class.php';

class MockPushNotificationDatabase {
    public $queries = [];
    public $executeParams = [];
    public $latestSql = '';

    public function prepare($sql) {
        $this->latestSql = $sql;
        $this->queries[] = $sql;
        return new class($this->executeParams) {
            private $paramsLog;
            public function __construct(&$paramsLog) {
                $this->paramsLog = &$paramsLog;
            }
            public function execute($params = []) {
                $this->paramsLog[] = $params;
                return true;
            }
            public function fetchAll() {
                return [
                    ['user_id' => 7, 'endpoint' => 'https://example.com/push', 'p256dh' => 'abc', 'auth' => 'def'],
                ];
            }
            public function fetchColumn() {
                return 0;
            }
        };
    }
}

$db = new MockPushNotificationDatabase();
$notifications = new SpotNotifications($db);

if (!method_exists($notifications, 'savePushSubscription')) {
    fwrite(STDERR, "FATAL: savePushSubscription is required for push subscriptions\n");
    exit(1);
}

if (!method_exists($notifications, 'getPushSubscriptions')) {
    fwrite(STDERR, "FATAL: getPushSubscriptions is required to dispatch push notifications\n");
    exit(1);
}

if (!method_exists($notifications, 'sendPushToUser')) {
    fwrite(STDERR, "FATAL: sendPushToUser is required to push browser notifications\n");
    exit(1);
}

echo "OK\n";
