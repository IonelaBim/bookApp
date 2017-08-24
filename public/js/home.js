
// Check for browser support of service worker

const applicationServerPublicKey = 'BD5WTwwULXbchhPVwDcq5ztmnfOCHR2sKd6_s4x0MdFPaUhmet6FRt4mKfIjuSHC2S89ncvozqnSC0KcIInLduQ';
const pushButton = document.querySelector('.js-push-btn');
const pushButton22 = document.querySelector('.sendpushnotuf');
var hasSubscription = false;
var serviceWorkerRegistration = null;
var subscriptionData = false;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function updatePushButton() {
    // pushWrapper.classList.remove('hidden');

    if (hasSubscription) {
        pushButton.textContent = 'Disable Push Notifications';
    } else {
        pushButton.textContent = 'Enable Push Notifications';
    }
}

function subscribeUser() {
    serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: new urlB64ToUint8Array(applicationServerPublicKey)
    })
        .then(function(subscription) {

            fetch('/push/subscribe',{
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscription)
            })
                .then(function(response) {
                    return response;
                })
                .then(function(text) {
                    console.log('User is subscribed.');
                    hasSubscription = true;

                    updatePushButton();
                })
                .catch(function(error) {
                    hasSubscription = false;
                    console.error('error fetching subscribe', error);
                });

        })
        .catch(function(err) {
            console.log('Failed to subscribe the user: ', err);
        });
}

function unsubscribeUser() {
    serviceWorkerRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                subscriptionData = {
                    endpoint: subscription.endpoint
                };

                fetch('/push/unsubscribe',{
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(subscriptionData)
                })
                    .then(function(response) {
                        return response;
                    })
                    .then(function(text) {
                        console.log('User is unsubscribed.');
                        hasSubscription = false;

                        updatePushButton();
                        subscription.unsubscribe();
                    })
                    .catch(function(error) {
                        hasSubscription = true;
                        console.error('error fetching subscribe', error);
                    });
            }
        });
}

function initPush() {

    pushButton.addEventListener('click', function() {
        if (hasSubscription) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    serviceWorkerRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            hasSubscription = !(subscription === null);

            updatePushButton();
        });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../service-worker.js')
        .then(function (registration) {
            // Successful registration
            console.log('Hooray. Registration successful, scope is:', registration.scope);
            // swRegistration = registration;
            // initialiseUI();
            serviceWorkerRegistration = registration;
            initPush();
            Notification.requestPermission(function (status) {
                console.log('Notification permission status:', status);
            });

        }).catch(function (err) {
        // Failed registration, service worker won’t be installed
        console.log('Whoops. Service worker registration failed, error:', err);
    });
}

pushButton22.addEventListener('click', function() {
 fetch('/send/subscription',{
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body: null
 })
    .then(function(response) {
        return response;
    })

    .catch(function(error) {

        console.error('error fetching subscribe', error);
    });

})
