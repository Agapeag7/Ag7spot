<?php
require_once __DIR__ . '/../backend/spot.class.php';

class EmptyDatabase {
    public function prepare($sql) {
        return new class {
            public function execute($params = []) {
                return true;
            }
        };
    }
}

$users = new SpotUsers(new EmptyDatabase());

try {
    $users->validatePassword('WeakPass');
    fwrite(STDERR, "FATAL: password should be rejected when it is too short or lacks required complexity\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validatePassword('StrongPass!2026');
} catch (InvalidArgumentException $e) {
    fwrite(STDERR, "FATAL: valid strong password was rejected\n");
    exit(1);
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

if (shouldRejectConcurrentLogin(8, 5, 'token-A', 'token-B')) {
    // expected: another user already has an active session
} else {
    fwrite(STDERR, "FATAL: concurrent session check should reject a different user with a different session token\n");
    exit(1);
}

if (shouldRejectConcurrentLogin(0, 5, null, 'token-B')) {
    fwrite(STDERR, "FATAL: a fresh login without an active session should not be rejected\n");
    exit(1);
}

if (shouldRejectConcurrentLogin(5, 5, 'token-A', 'token-B')) {
    fwrite(STDERR, "FATAL: same user should be allowed to refresh their session\n");
    exit(1);
}

try {
    $users->validateRegistrationInput('alice', 'alice');
    fwrite(STDERR, "FATAL: password equal to username should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validateRegistrationInput('alice', 'StrongPass!2026', ['username' => 'alice']);
    fwrite(STDERR, "FATAL: duplicated username should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

echo "OK\n";
