const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys()

console.log('public', vapidKeys.publicKey);

console.log('private',vapidKeys.privateKey);
