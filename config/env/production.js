/**
 * Production environment settings
 * @description :: This section overrides all other config values ONLY in production environment
 */

module.exports = {
  port: 8080,
  log: {
    level: 'error'
  }
};
