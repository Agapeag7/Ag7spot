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
    $users->validatePassword('Aa1!xy');
    fwrite(STDERR, "FATAL: password shorter than 7 characters should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validatePassword('WeakPass');
    fwrite(STDERR, "FATAL: password lacking required complexity should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validatePassword('Aa1!xyz');
} catch (InvalidArgumentException $e) {
    fwrite(STDERR, "FATAL: valid 7-character password was rejected\n");
    exit(1);
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
    $users->validateRegistrationInput('alice', 'StrongPass!2026');
    fwrite(STDERR, "FATAL: username without numeric suffix should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validateRegistrationInput('alice123', 'StrongPass!2026', ['username' => 'alice123']);
    fwrite(STDERR, "FATAL: duplicated username should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validateRegistrationInput('alice123', 'StrongPass!2026');
} catch (InvalidArgumentException $e) {
    fwrite(STDERR, "FATAL: valid username with numeric suffix should be accepted\n");
    exit(1);
}

try {
    $users->validateRegistrationInput('ab12', 'StrongPass!2026');
    fwrite(STDERR, "FATAL: username shorter than 5 characters should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validateRegistrationInput('a123456789012345678901', 'StrongPass!2026');
    fwrite(STDERR, "FATAL: username longer than 20 characters should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

echo "OK\n";
