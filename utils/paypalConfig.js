const paypal = require('@paypal/checkout-server-sdk');

// PayPal Environment Setup (sandbox for testing)
const environment = new paypal.core.SandboxEnvironment(
    'AbL_nnhY9uU0lL2fe15JrKG0KNDpX9dC5uV6fpoJnPpGJC5I4teu8iXSSrfR4OHmsnOncb9rx_BJ61Is',     // Replace with your PayPal client ID
    'EC8kD3EUtSmoKblNBeexcbKlHizzEh1Mw8IR6dKyN7UzJLv21BiBM7hclnkLakKsAGpW09F2rVQT6Y2L'  // Replace with your PayPal client secret
);

// PayPal client setup
const client = new paypal.core.PayPalHttpClient(environment);

module.exports = client;


