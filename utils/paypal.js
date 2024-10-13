const paypal = require('@paypal/checkout-server-sdk');

// Sandbox or Live environment based on your client credentials
const environment = new paypal.core.SandboxEnvironment(
    'YOUR_PAYPAL_CLIENT_ID',
    'YOUR_PAYPAL_CLIENT_SECRET'
);

const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;
