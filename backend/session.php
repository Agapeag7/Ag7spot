<?php
function configureSessionLifetime(bool $rememberMe = false): void {
    $lifetime = $rememberMe ? 30 * 24 * 60 * 60 : 0;
    $secure = !empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off';

    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'domain' => '',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

function setRememberMeCookie(bool $rememberMe): void {
    $secure = !empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off';
    setcookie('ag7_remember_me', $rememberMe ? '1' : '', [
        'expires' => $rememberMe ? time() + (30 * 24 * 60 * 60) : time() - 3600,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

if (session_status() === PHP_SESSION_NONE) {
    $rememberMe = !empty($_COOKIE['ag7_remember_me']) && $_COOKIE['ag7_remember_me'] === '1';
    configureSessionLifetime($rememberMe);
}
