/**
 * AuthController
 * @description :: Server-side logic for manage user's authorization
 */

var _ = require('lodash');
var passport = require('passport');

/**
 * Triggers when user authenticates via passport
 * @private
 */
function _onPassportAuth(req, res, error, user, info) {
  if (error) return res.serverError(error);
  if (!user) return res.unauthorized(null, info && info.code, info && info.message);

  user.sIPAddress = req.headers['x-forwarded-for'] || (req.connection && req.connection.remoteAddress) || (req.socket && req.socket.handshake && req.socket.handshake.headers && req.socket.handshake.headers['x-forwarded-for']) || (req.socket && req.socket.handshake && req.socket.handshake.address) || 'Unknown';
  
  return res.ok({
    token: CipherService.jwt.encodeSync({user: user}),
    user: user
  });
}

module.exports = {

  /**
   * Sign in by email\password
   */
  signin: function (req, res) {
    passport.authenticate('local', _.partial(_onPassportAuth, req, res))(req, res);
  },

  /**
   * Sign up in system by email\password
   */
  signup: function (req, res) {
    var values = _.omit(req.allParams(), 'id');

    User
      .create(values)
      .then(function (user) {
        return {
          token: CipherService.jwt.encodeSync({user: user}),
          user: user
        };
      })
      .then(res.created)
      .catch(res.serverError);
  },

  /**
   * Authorization via social networks
   */
  social: function (req, res) {
    var type = req.param('type') ? req.param('type').toLowerCase() : '-';
    var strategyName = [type, 'token'].join('-');

    if (Object.keys(passport._strategies).indexOf(strategyName) === -1) {
      return res.badRequest(null, null, [type, ' is not supported'].join(''));
    }

    passport.authenticate('jwt', function (error, user, info) {
      req.user = user;
      passport.authenticate(strategyName, _.partial(_onPassportAuth, req, res))(req, res);
    })(req, res);
  },

  /**
   * Accept JSON Web Token and updates with new one
   */
  refresh_token: function (req, res) {
    var oldDecoded = CipherService.jwt.decodeSync(req.param('token'));

    res.ok({
      token: CipherService.jwt.encodeSync({user: oldDecoded.user})
    });
  }
};
