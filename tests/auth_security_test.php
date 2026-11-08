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

class AuthTestDatabase {
    private $users;

    public function __construct($users) {
        $this->users = $users;
    }

    public function prepare($sql) {
        $database = $this;
        return new class($database, $sql) {
            private $database;
            private $sql;
            private $rows = [];

            public function __construct($database, $sql) {
                $this->database = $database;
                $this->sql = $sql;
            }

            public function execute($params = []) {
                $this->rows = $this->database->findUsers($this->sql, $params);
                return true;
            }

            public function fetch() {
                return $this->rows[0] ?? false;
            }

            public function fetchAll() {
                return $this->rows;
            }
        };
    }

    public function findUsers($sql, $params) {
        if (strpos($sql, 'WHERE username = ?') !== false) {
            return array_values(array_filter($this->users, function ($user) use ($params) {
                return $user['username'] === trim($params[0]);
            }));
        }

        if (strpos($sql, 'RIGHT(username, 4)') !== false) {
            return array_values(array_filter($this->users, function ($user) use ($params) {
                $username = $user['username'];
                return strlen($username) >= 4
                    && preg_match('/^[0-9]{4}$/', substr($username, -4))
                    && substr($username, 0, -4) === trim($params[0]);
            }));
        }

        return [];
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

$storedUser = [
    'id' => 42,
    'username' => 'alice5831',
    'password' => password_hash('StrongPass!2026', PASSWORD_DEFAULT),
];
$loginUsers = new SpotUsers(new AuthTestDatabase([$storedUser]));
if (($loginUsers->verifyCredentials('alice', 'StrongPass!2026')['id'] ?? null) !== 42) {
    fwrite(STDERR, "FATAL: login without the generated four-digit suffix should succeed\n");
    exit(1);
}
if ($loginUsers->verifyCredentials('alice', 'WrongPass!2026') !== null) {
    fwrite(STDERR, "FATAL: login with an incorrect password should fail when using the base username\n");
    exit(1);
}
if (!$loginUsers->usernameExistsForLogin('alice')) {
    fwrite(STDERR, "FATAL: generated-suffix username should be recognized for login errors\n");
    exit(1);
}
if ($loginUsers->verifyCredentials('alice5831', 'StrongPass!2026')['id'] !== 42) {
    fwrite(STDERR, "FATAL: login with the full username should continue to succeed\n");
    exit(1);
}
$ambiguousUsers = new SpotUsers(new AuthTestDatabase([
    $storedUser,
    [
        'id' => 43,
        'username' => 'alice9274',
        'password' => $storedUser['password'],
    ],
]));
if ($ambiguousUsers->verifyCredentials('alice', 'StrongPass!2026') !== null) {
    fwrite(STDERR, "FATAL: ambiguous base username should not authenticate multiple accounts\n");
    exit(1);
}

echo "OK\n";
