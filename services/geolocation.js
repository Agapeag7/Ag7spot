// =========================================
// GEOLOCATION SERVICE
// =========================================
let userPosition = null;
let watchId = null;
let locationRequestPromise = null;

function getUserPosition() {
    if (userPosition) {
        return Promise.resolve(userPosition);
    }

    if (locationRequestPromise) {
        return locationRequestPromise;
    }

    if (!navigator.geolocation) {
        return Promise.reject(new Error('La géolocalisation n\'est pas supportée'));
    }

    locationRequestPromise = new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userPosition = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                };
                resolve(userPosition);
            },
            (err) => {
                userPosition = null;
                reject(err);
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    }).finally(() => {
        locationRequestPromise = null;
    });

    return locationRequestPromise;
}

function watchUserPosition(callback) {
    if (!navigator.geolocation) return;

    watchId = navigator.geolocation.watchPosition(
        (pos) => {
            userPosition = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy
            };
            if (callback) callback(userPosition);
        },
        (err) => console.warn('Watch position error:', err),
        { enableHighAccuracy: true, timeout: 5000 }
    );
    return watchId;
}

function stopWatching() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function getDistanceBetween(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function isNearShop(shopLat, shopLng, thresholdKm = 0.1) {
    if (!userPosition) return false;
    const dist = getDistanceBetween(userPosition.lat, userPosition.lng, shopLat, shopLng);
    return dist <= thresholdKm;
}