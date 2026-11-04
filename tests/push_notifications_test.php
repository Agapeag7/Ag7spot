<?php
require_once __DIR__ . '/../backend/spot.class.php';

putenv('VAPID_PUBLIC_KEY=');
putenv('VAPID_PRIVATE_KEY=');
putenv('VAPID_SUBJECT=');

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
    fwrite(STDERR, "FATAL: in-app notification should be stored before optional push delivery\n");
    exit(1);
}

if (!method_exists($notifications, 'savePushSubscription')
    || !method_exists($notifications, 'removePushSubscription')
    || !method_exists($notifications, 'getPushSubscriptionsForUser')) {
    fwrite(STDERR, "FATAL: push subscriptions should be supported\n");
    exit(1);
}

$endpoint = 'https://fcm.googleapis.com/fcm/send/test-endpoint';
$notifications->savePushSubscription(7, $endpoint, 'browser-public-key', 'browser-auth-token');
if (count($db->queries) !== 2
    || stripos($db->queries[1], 'INSERT INTO push_subscriptions') !== 0
    || $db->executeParams[1][2] !== hash('sha256', $endpoint)) {
    fwrite(STDERR, "FATAL: push subscriptions should be saved with a hashed endpoint\n");
    exit(1);
}

echo "OK\n";
