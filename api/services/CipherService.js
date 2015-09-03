var ciphers = require('sails-service-cipher');

module.exports = {
  jwt: ciphers.create('jwt', {secretKey: "0dfa6bdc033dbee9d652f3a2e39d6b31df2c0e2e2aba934773161c44b8b9d81d"})
};
