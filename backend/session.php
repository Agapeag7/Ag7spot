<?php
function configureSessionLifetime(bool $rememberMe = false): void {
    $lifetime = $rememberMe ? 30 * 24 * 60 * 60 : 0;

    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'domain' => '',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

if (session_status() === PHP_SESSION_NONE) {
    $rememberMe = !empty($_COOKIE['ag7_remember_me']) && $_COOKIE['ag7_remember_me'] === '1';
    configureSessionLifetime($rememberMe);
}
