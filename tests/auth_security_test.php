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

try {
    $users->validateRegistrationInput('alice', 'alice@example.com', 'alice', ['email' => 'other@example.com']);
    fwrite(STDERR, "FATAL: password equal to username should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validateRegistrationInput('alice', 'alice@example.com', 'StrongPass!2026', ['email' => 'alice@example.com']);
    fwrite(STDERR, "FATAL: duplicated email should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

try {
    $users->validateRegistrationInput('alice', 'alice@example.com', 'StrongPass!2026', null, ['username' => 'alice']);
    fwrite(STDERR, "FATAL: duplicated username should be rejected\n");
    exit(1);
} catch (InvalidArgumentException $e) {
    // expected
}

echo "OK\n";
