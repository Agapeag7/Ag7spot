<?php
require_once __DIR__ . '/../backend/spot.class.php';

class MockPushNotificationDatabase {
    public $queries = [];
    public $executeParams = [];

    public function prepare($sql) {
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
        };
    }
}

$db = new MockPushNotificationDatabase();
$notifications = new SpotNotifications($db);
$notifications->notifyUser(7, 'new_message', 'Nouveau message', 'Un message est arrivé.');

if (count($db->queries) !== 1 || stripos($db->queries[0], 'INSERT INTO notifications') !== 0) {
    fwrite(STDERR, "FATAL: in-app notification should be stored without calling an external push service\n");
    exit(1);
}

if (method_exists($notifications, 'sendPushToUser') || method_exists($notifications, 'savePushSubscription')) {
    fwrite(STDERR, "FATAL: external push notification support should be disabled\n");
    exit(1);
}

echo "OK\n";
