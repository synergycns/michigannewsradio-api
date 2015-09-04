/**
 * Passport configuration file where you should configure all your strategies
 * @description :: Configuration file where you configure your passport authentication
 */

var _ = require('lodash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var FacebookTokenStrategy = require('passport-facebook-token').Strategy;
var TwitterTokenStrategy = require('passport-twitter-token').Strategy;

/**
 * Configuration object for local strategy
 * @type {Object}
 * @private
 */
var LOCAL_STRATEGY_CONFIG = {
  usernameField: 'identifier',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
};

/**
 * Configuration object for JWT strategy
 * @type {Object}
 * @private
 */
var JWT_STRATEGY_CONFIG = {
  secretOrKey: "c5bd314a6674d0780211b18ecf96c3b92d679eb99a01657bcfb4f174de206713",
  tokenBodyField: 'access_token',
  tokenQueryParameterName: 'access_token',
  authScheme: 'Bearer',
  session: false,
  passReqToCallback: true
};

/**
 * Configuration object for social strategies
 * @type {Object}
 * @private
 */
var SOCIAL_STRATEGY_CONFIG = {
  clientID: '-',
  clientSecret: '-',
  consumerKey: '-',
  consumerSecret: '-',
  passReqToCallback: true
};

var EMAIL_REGEX = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;

/**
 * Use validator module isEmail function
 *
 * @see <https://github.com/chriso/validator.js/blob/3.18.0/validator.js#L38>
 * @see <https://github.com/chriso/validator.js/blob/3.18.0/validator.js#L141-L143>
 */
function validateEmail (str) {
  return EMAIL_REGEX.test(str);
}

/**
 * Triggers when user authenticates via local strategy
 * @param {Object} req Request object
 * @param {String} email Email from body field in request
 * @param {String} password Password from body field in request
 * @param {Function} next Callback
 * @private
 */
function _onLocalStrategyAuth(req, identifier, password, next) {

  var isEmail = validateEmail(identifier);
  var query = {};

  if (isEmail) {
    query.email = identifier;
  }
  else {
    query.username = identifier;
  }

  User
    .findOne(query)
    .populate('roles')
    .then(function (user) {
      if (!user) return next(null, null, {
        code: 'E_USER_NOT_FOUND',
        message: email + ' is not found'
      });

      if (!HashService.bcrypt.compareSync(password, user.password)) return next(null, null, {
        code: 'E_WRONG_PASSWORD',
        message: 'Password is wrong'
      });

      return next(null, user, {});
    })
    .catch(next);
}

/**
 * Triggers when user authenticates via JWT strategy
 * @param {Object} req Request object
 * @param {Object} payload Decoded payload from JWT
 * @param {Function} next Callback
 * @private
 */
function _onJwtStrategyAuth(req, payload, next) {
  User
    .findOne({id: payload.user.id})
    .populate('roles')
    .then(function (user) {
      if (!user) return next(null, null, {
        code: 'E_USER_NOT_FOUND',
        message: 'User with that JWT not found'
      });

      return next(null, user, {});
    })
    .catch(next);
}

/**
 * Triggers when user authenticates via one of social strategies
 * @param {Object} req Request object
 * @param {String} accessToken Access token from social network
 * @param {String} refreshToken Refresh token from social network
 * @param {Object} profile Social profile
 * @param {Function} next Callback
 * @private
 */
function _onSocialStrategyAuth(req, accessToken, refreshToken, profile, next) {
  if (!req.user) {
    var criteria = {};
    criteria['socialProfiles.' + profile.provider + '.id'] = profile.id;

    var model = {
      username: profile.username || profile.displayName || '',
      email: (profile.emails[0] && profile.emails[0].value) || '',
      firstName: (profile.name && profile.name.givenName) || '',
      lastName: (profile.name && profile.name.familyName) || '',
      socialProfiles: {}
    };
    model.socialProfiles[profile.provider] = profile._json;

    User
      .findOrCreate(criteria, model)
      .populate('roles')
      .then(function (user) {
        if (!user) return next(null, null, {
          code: 'E_AUTH_FAILED',
          message: [profile.provider, ' auth failed'].join('')
        });

        return next(null, user, {});
      })
      .catch(next);
  } else {
    req.user.socialProfiles[profile.provider] = profile._json;
    req.user.save(next);
  }
}

passport.use(new LocalStrategy(_.assign({}, LOCAL_STRATEGY_CONFIG), _onLocalStrategyAuth));
passport.use(new JwtStrategy(_.assign({}, JWT_STRATEGY_CONFIG), _onJwtStrategyAuth));
passport.use(new FacebookTokenStrategy(_.assign({}, SOCIAL_STRATEGY_CONFIG), _onSocialStrategyAuth));
passport.use(new TwitterTokenStrategy(_.assign({}, SOCIAL_STRATEGY_CONFIG), _onSocialStrategyAuth));
