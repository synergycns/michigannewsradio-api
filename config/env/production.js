/**
 * Production environment settings
 * @description :: This section overrides all other config values ONLY in production environment
 */
var fs = require('fs');

module.exports = {
  port: 443,
  log: {
    level: 'silly'
  },
  ssl: {
    key: fs.readFileSync('/srv/www/backend/shared/config/ssl.key'),
    cert: fs.readFileSync('/srv/www/backend/shared/config/ssl.crt'),
    ca: fs.readFileSync('/srv/www/backend/shared/config/ssl.ca')
  }
};
