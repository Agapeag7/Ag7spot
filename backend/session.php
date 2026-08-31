<?php
function configureSessionLifetime(bool $rememberMe = false): void {
    session_set_cookie_params([
        'lifetime' => $rememberMe ? 30 * 24 * 60 * 60 : 0,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

if (session_status() === PHP_SESSION_NONE) {
    configureSessionLifetime();
}
