/**
 * Production environment settings
 * @description :: This section overrides all other config values ONLY in production environment
 */

module.exports = {
  port: 443,
  log: {
    level: 'silly'
  },
  ssl: {
    key: '/srv/www/backend/shared/config/ssl.key',
    cert: '/srv/www/backend/shared/config/ssl.crt',
    ca: '/srv/www/backend/shared/config/ssl.ca'
  }
};
