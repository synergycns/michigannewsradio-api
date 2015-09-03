var ciphers = require('sails-service-cipher');

module.exports = {
  jwt: ciphers.create('jwt', {secretKey: "c5bd314a6674d0780211b18ecf96c3b92d679eb99a01657bcfb4f174de206713"})
};
