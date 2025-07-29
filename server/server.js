const express = require('express');
const cors = require('cors');
const path = require('path');
const ExchangeRateScheduler = require('./services/exchangeRateScheduler');
const SubscriptionRenewalScheduler = require('./services/subscriptionRenewalScheduler');

// Load environment variables from root .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import database pool
const { getDatabasePool } = require('./config/database');
const { apiKeyAuth } = require('./middleware/auth');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { createSubscriptionRoutes, createProtectedSubscriptionRoutes } = require('./routes/subscriptions');
const { createSubscriptionManagementRoutes } = require('./routes/subscriptionManagement');
const { createAnalyticsRoutes } = require('./routes/analytics');
const { createSettingsRoutes, createProtectedSettingsRoutes } = require('./routes/settings');
const { createExchangeRateRoutes, createProtectedExchangeRateRoutes } = require('./routes/exchangeRates');
const { createPaymentHistoryRoutes, createProtectedPaymentHistoryRoutes } = require('./routes/paymentHistory');
const { createMonthlyCategorySummaryRoutes, createProtectedMonthlyCategorySummaryRoutes } = require('./routes/monthlyCategorySummary');
const { createCategoriesRoutes, createProtectedCategoriesRoutes, createPaymentMethodsRoutes, createProtectedPaymentMethodsRoutes } = require('./routes/categoriesAndPaymentMethods');
const { createSubscriptionRenewalSchedulerRoutes, createProtectedSubscriptionRenewalSchedulerRoutes } = require('./routes/subscriptionRenewalScheduler');

const app = express();
const port = process.env.PORT || 3001; // Use PORT from .env or default to 3001

// Middleware
app.use(cors());
app.use(express.json());

// Async wrapper to start the app after DB initializes
(async () => {
  try {
    // Get persistent DB pool
    const db = getDatabasePool();

    // Initialize schedulers
    const exchangeRateScheduler = new ExchangeRateScheduler(db, process.env.TIANAPI_KEY);
    exchangeRateScheduler.start();

    const subscriptionRenewalScheduler = new SubscriptionRenewalScheduler(db);
    subscriptionRenewalScheduler.start();

    // Serve static frontend build
    app.use(express.static(path.join(__dirname, '..', 'public')));

    // API health check
    app.get('/api/health', (req, res) => {
      res.json({ message: 'Subscription Management Backend is running!', status: 'healthy' });
    });

    // Routers
    const apiRouter = express.Router();
    const protectedApiRouter = express.Router();
    protectedApiRouter.use(apiKeyAuth);

    // Register route modules
    apiRouter.use('/subscriptions', createSubscriptionRoutes(db));
    protectedApiRouter.use('/subscriptions', createProtectedSubscriptionRoutes(db));
    protectedApiRouter.use('/subscriptions', createSubscriptionManagementRoutes(db));

    apiRouter.use('/analytics', createAnalyticsRoutes(db));

    apiRouter.use('/settings', createSettingsRoutes(db));
    protectedApiRouter.use('/settings', createProtectedSettingsRoutes(db));

    apiRouter.use('/exchange-rates', createExchangeRateRoutes(db));
    protectedApiRouter.use('/exchange-rates', createProtectedExchangeRateRoutes(db, exchangeRateScheduler));

    apiRouter.use('/payment-history', createPaymentHistoryRoutes(db));
    protectedApiRouter.use('/payment-history', createProtectedPaymentHistoryRoutes(db));

    apiRouter.use('/monthly-category-summary', createMonthlyCategorySummaryRoutes(db));
    protectedApiRouter.use('/monthly-category-summary', createProtectedMonthlyCategorySummaryRoutes(db));

    apiRouter.use('/categories', createCategoriesRoutes(db));
    protectedApiRouter.use('/categories', createProtectedCategoriesRoutes(db));

    apiRouter.use('/payment-methods', createPaymentMethodsRoutes(db));
    protectedApiRouter.use('/payment-methods', createProtectedPaymentMethodsRoutes(db));

    apiRouter.use('/subscription-renewal-scheduler', createSubscriptionRenewalSchedulerRoutes(subscriptionRenewalScheduler));
    protectedApiRouter.use('/subscription-renewal-scheduler', createProtectedSubscriptionRenewalSchedulerRoutes(subscriptionRenewalScheduler));

    // Register routers
    app.use('/api', apiRouter);
    app.use('/api/protected', protectedApiRouter);

    // SPA fallback (for React frontend routing)
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      const indexPath = path.join(__dirname, '..', 'public', 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error serving index.html:', err);
          res.status(404).send('Frontend not found');
        }
      });
    });

    // Error handling
    app.use(notFoundHandler);
    app.use(errorHandler);

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Subscription Management Server running at http://localhost:${port}`);
      console.log(`📂 Frontend available at: http://localhost:${port}`);
      console.log(`🔧 API available at: http://localhost:${port}/api`);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();

