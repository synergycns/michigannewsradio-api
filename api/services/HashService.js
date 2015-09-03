var hashes = require('sails-service-hash');
var BCRYPT_REGEX = /^\$2[aby]\$[0-9]{2}\$.{53}$/;

module.exports = {
  bcrypt: hashes.create('bcrypt', {}),
  isBCryptHash: function(string) {
    var blnIsHash = BCRYPT_REGEX.test(string);
    return blnIsHash;
  }
};
