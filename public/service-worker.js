// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
var dataCacheName = 'weatherData-v1';
var cacheName = 'weatherPWA-step-6-1';
var filesToCache = [
    '/',
    '/js/home.js',
    '/images/share1.jpg',
    '/images/sshare.jpg',
    '/css/home.css',
    '/vendors/css/bootstrap.min.css',
    '/vendors/css/bootstrap-font-awesome.css',
    '/vendors/bootstrap-3.3.7.min.js',
    '/vendors/jquery-3.2.1.min.js',
    '/vendors/angular.min.js',
    '/vendors/angular-cookies.js',
    '/vendors/angular-base64.min.js',
    '/vendors/angular-messages.min.js',
    '/vendors/angular-resource.min.js',
    '/vendors/angular-ui-router.min.js',
    '/vendors/bootstrap-ui-modal.js',
    'js/modules/app.js',
    'views/login.html',
    'js/controllers/mainCtrl.js',
    '/service-worker.js',
    '/manifest.json',
    '/images/icons/icon-128x128.png',
    '/images/icons/icon-144x144.png',
    '/images/icons/icon-152x152.png',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-256x256.png'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (e.request.url.indexOf(dataUrl) > -1) {
        /*
         * When the request URL contains dataUrl, the app is asking for fresh
         * weather data. In this case, the service worker always goes to the
         * network and then caches the response. This is called the "Cache then
         * network" strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-then-network
         */
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response){
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        /*
         * The app is asking for app shell files. In this scenario the app uses the
         * "Cache, falling back to the network" offline strategy:
         * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
         */
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});



// var version = 'v1';
// var filesToCache = [
//     '/',
//     '/js/home.js',
//     '/images/share1.jpg',
//     '/images/sshare.jpg',
//     '/css/home.css',
//     '/vendors/css/bootstrap.min.css',
//     '/vendors/css/bootstrap-font-awesome.css',
//     '/vendors/bootstrap-3.3.7.min.js',
//     '/vendors/jquery-3.2.1.min.js',
//     '/vendors/angular.min.js',
//     '/vendors/angular-cookies.js',
//     '/vendors/angular-base64.min.js',
//     '/vendors/angular-messages.min.js',
//     '/vendors/angular-resource.min.js',
//     '/vendors/angular-ui-router.min.js',
//     '/vendors/bootstrap-ui-modal.js',
//     'js/modules/app.js',
//     'views/login.html',
//     'js/controllers/mainCtrl.js'
//
// ];
// self.addEventListener("install", function(event) {
//     console.log('WORKER: install event in progress.');
//     event.waitUntil(
//         /* The caches built-in is a promise-based API that helps you cache responses,
//          as well as finding and deleting them.
//          */
//         caches
//         /* You can open a cache by name, and this method returns a promise. We use
//          a versioned cache name here so that we can remove old cache entries in
//          one fell swoop later, when phasing out an older service worker.
//          */
//             .open(version + 'fundamentals')
//             .then(function(cache) {
//                 /* After the cache is opened, we can fill it with the offline fundamentals.
//                  The method below will add all resources we've indicated to the cache,
//                  after making HTTP requests for each of them.
//                  */
//                 return cache.addAll(filesToCache);
//             })
//             .then(function() {
//                 console.log('WORKER: install completed');
//             })
//     );
// });
//
// self.addEventListener("fetch", function(event) {
//     console.log('WORKER: fetch event in progress.');
//
//     /* We should only cache GET requests, and deal with the rest of method in the
//      client-side, by handling failed POST,PUT,PATCH,etc. requests.
//      */
//     if (event.request.method !== 'GET') {
//         /* If we don't block the event as shown below, then the request will go to
//          the network as usual.
//          */
//         console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
//         return;
//     }
//     /* Similar to event.waitUntil in that it blocks the fetch event on a promise.
//      Fulfillment result will be used as the response, and rejection will end in a
//      HTTP response indicating failure.
//      */
//     event.respondWith(
//         caches
//         /* This method returns a promise that resolves to a cache entry matching
//          the request. Once the promise is settled, we can then provide a response
//          to the fetch request.
//          */
//             .match(event.request)
//             .then(function(cached) {
//                 /* Even if the response is in our cache, we go to the network as well.
//                  This pattern is known for producing "eventually fresh" responses,
//                  where we return cached responses immediately, and meanwhile pull
//                  a network response and store that in the cache.
//                  Read more:
//                  https://ponyfoo.com/articles/progressive-networking-serviceworker
//                  */
//                 var networked = fetch(event.request)
//                 // We handle the network request with success and failure scenarios.
//                     .then(fetchedFromNetwork, unableToResolve)
//                     // We should catch errors on the fetchedFromNetwork handler as well.
//                     .catch(unableToResolve);
//
//                 /* We return the cached response immediately if there is one, and fall
//                  back to waiting on the network as usual.
//                  */
//                 console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
//                 return cached || networked;
//
//                 function fetchedFromNetwork(response) {
//                     /* We copy the response before replying to the network request.
//                      This is the response that will be stored on the ServiceWorker cache.
//                      */
//                     var cacheCopy = response.clone();
//
//                     console.log('WORKER: fetch response from network.', event.request.url);
//
//                     caches
//                     // We open a cache to store the response for this request.
//                         .open(version + 'pages')
//                         .then(function add(cache) {
//                             /* We store the response for this request. It'll later become
//                              available to caches.match(event.request) calls, when looking
//                              for cached responses.
//                              */
//                             cache.put(event.request, cacheCopy);
//                         })
//                         .then(function() {
//                             console.log('WORKER: fetch response stored in cache.', event.request.url);
//                         });
//
//                     // Return the response so that the promise is settled in fulfillment.
//                     return response;
//                 }
//
//                 /* When this method is called, it means we were unable to produce a response
//                  from either the cache or the network. This is our opportunity to produce
//                  a meaningful response even when all else fails. It's the last chance, so
//                  you probably want to display a "Service Unavailable" view or a generic
//                  error response.
//                  */
//                 function unableToResolve () {
//                     /* There's a couple of things we can do here.
//                      - Test the Accept header and then return one of the `offlineFundamentals`
//                      e.g: `return caches.match('/some/cached/image.png')`
//                      - You should also consider the origin. It's easier to decide what
//                      "unavailable" means for requests against your origins than for requests
//                      against a third party, such as an ad provider
//                      - Generate a Response programmaticaly, as shown below, and return that
//                      */
//
//                     console.log('WORKER: fetch request failed in both cache and network.');
//
//                     /* Here we're creating a response programmatically. The first parameter is the
//                      response body, and the second one defines the options for the response.
//                      */
//                     return new Response('<h1>Service Unavailable</h1>', {
//                         status: 503,
//                         statusText: 'Service Unavailable',
//                         headers: new Headers({
//                             'Content-Type': 'text/html'
//                         })
//                     });
//                 }
//             })
//     );
// });
//
// self.addEventListener("activate", function(event) {
//     /* Just like with the install event, event.waitUntil blocks activate on a promise.
//      Activation will fail unless the promise is fulfilled.
//      */
//     console.log('WORKER: activate event in progress.');
//
//     event.waitUntil(
//         caches
//         /* This method returns a promise which will resolve to an array of available
//          cache keys.
//          */
//             .keys()
//             .then(function (keys) {
//                 // We return a promise that settles when all outdated caches are deleted.
//                 return Promise.all(
//                     keys
//                         .filter(function (key) {
//                             // Filter by keys that don't start with the latest version prefix.
//                             return !key.startsWith(version);
//                         })
//                         .map(function (key) {
//                             /* Return a promise that's fulfilled
//                              when each outdated cache is deleted.
//                              */
//                             return caches.delete(key);
//                         })
//                 );
//             })
//             .then(function() {
//                 console.log('WORKER: activate completed.');
//             })
//     );
// });
