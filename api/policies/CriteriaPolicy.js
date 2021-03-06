/**
 * CriteriaPolicy
 * @depends PermissionPolicy
 *
 * Verify that the User fulfills permission 'where' conditions and attribute blacklist restrictions
 */
var wlFilter = require('waterline-criteria');
var Promise = require('bluebird');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = function(req, res, next) {
  var permissions = req.permissions;

  if (_.isEmpty(permissions)) {
    return next();
  }

  var action = PermissionService.getMethod(req.method);

  var body = req.body || req.query;

  // if we are creating, we don't need to query the db, just check the where clause vs the passed in data
  if (action === 'create') {
    if (!PermissionService.hasPassingCriteria(body, permissions, body)) {
      return res.badRequest({
        error: 'Can\'t create this object, because of failing where clause'
      });
    }
    return next();
  }


  // set up response filters if we are not mutating an existing object
  if (!_.contains(['update', 'delete'], action)) {

    // get all of the where clauses and blacklists into one flat array
    var criteria = _.compact(_.flatten(_.pluck(permissions, 'criteria')));

    if (criteria.length) {
      bindResponsePolicy(req, res, criteria);
    }
    return next();
  }

  PermissionService.findTargetObjects(req)
    .then(function(objects) {

      sails.log.info('Target objects', objects);

      // attributes are not important for a delete request
      if (action === 'delete') {
        body = undefined;
      }

      if (!PermissionService.hasPassingCriteria(objects, permissions, body, req.user.id)) {
        return res.badRequest({
          error: 'Can\'t ' + action + ', because of failing where clause or attribute permissions'
        });
      }

      next();
    })
    .catch(next);
};

function bindResponsePolicy(req, res, criteria) {
  res._ok = res.ok;

  res.ok = _.bind(responsePolicy, {
    req: req,
    res: res
  }, criteria);
}

function responsePolicy(criteria, _data, options) {
  var req = this.req;
  var res = this.res;
  var user = req.owner;
  var method = PermissionService.getMethod(req);
  var isResponseArray = _.isArray(_data);
  var where = actionUtil.parseCriteria(req);
  var limit = actionUtil.parseLimit(req);
  var skip = actionUtil.parseSkip(req);
  var Model = actionUtil.parseModel(req);
  var countQuery = Model.count(where);
  var totalQuery = Model.count();

  var data = isResponseArray ? _data : [_data];

  var permitted = data.reduce(function(memo, item) {
    criteria.some(function(crit) {
      var filtered = wlFilter([item], {
        where: {
          or: [crit.where || {}]
        }
      }).results;

      if (filtered.length) {

        if (crit.blacklist && crit.blacklist.length) {
          crit.blacklist.forEach(function (term) {
            delete item[term];
          });
        }
        memo.push(item);
        return true;
      }
    });
    return memo;
  }, []);


  if (permitted.length === 0) {
    sails.log.silly('permitted.length === 0');
    return res.send(404);
  } else if (isResponseArray) {
    Promise.all([countQuery, totalQuery])
      .then(function (_count, _total) {
        return res._ok(permitted, null, null, {
          criteria: where,
          limit: limit,
          start: skip,
          end: skip + limit,
          total: _count[0],
          draw: 1,
          recordsTotal: _total,
          recordsFiltered: _count[0]
        });
      });
  } else {
    res._ok(permitted[0], options);
  }
}
