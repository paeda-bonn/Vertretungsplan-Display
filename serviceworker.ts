/*
 * Copyright (c) 2020.
 */

const staticCacheName = 'StaticCache'

const filesToCache = [
    'index.html',
    'assets/css/aushang.scss',
    'assets/css/display.css',
    'assets/css/klausuren.scss',
    'assets/css/vertretungsplan.scss',
    'assets/js/display.js',
    'assets/js/jsonparse.js',
    'assets/js/swConnector.js'
];

//Event to install and initialise the service worker
self.addEventListener('install', event => {
    console.log('Attempting to install service worker and cache static assets');
    // @ts-ignore
    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                return cache.addAll(filesToCache);
            })
    );
    // @ts-ignore
    self.skipWaiting();
});


//Event for the control takeover
self.addEventListener('activate', async (event) => {
    setTimeout(function () {
        refreshClients();
    }, 500);
});

//Event if a site requests a file from the server
self.addEventListener('fetch', event => {
    // @ts-ignore
    event.respondWith(
        // @ts-ignore
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                // @ts-ignore
                return fetch(event.request)
            }).catch(error => {

        })
    );
});

//Messages between sites ---> worker
self.addEventListener("message", async (event) => {
    let data = event.data;

    if (data.hasOwnProperty("command")) {
        let disableCache;
        if (data.command === "disableCache") {
            caches.delete(staticCacheName);
            disableCache = true;
            event.ports[0].postMessage({"cache": "disabled"});
        } else if (data.command === "enableCache") {
            disableCache = false;
            event.ports[0].postMessage({"cache": "enabled"});
        } else if (data.command === "updateCache") {
            //loadCacheManifest();
        }
    }
});

function refreshClients() {
    // @ts-ignore
    self.clients.matchAll({type: 'window'})
        .then(clients => {
            return clients.map(client => {
                if ('navigate' in client) {
                    console.log(client.url)
                    return client.navigate(client.url);
                }
            });
        })
}