var Promise = require('bluebird');
/**
 * Creates default Roles
 *
 * @public
 */
exports.create = function () {
  return Promise.all([
    Role.findOrCreate({ name: 'Administrator' }, { name: 'Administrator' }),
    Role.findOrCreate({ name: 'User' }, { name: 'User' }),
    Role.findOrCreate({ name: 'Public' }, { name: 'Public' })
  ]);
};
