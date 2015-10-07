var _ = require('lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Update One Record
 * PUT /:model/:id
 *
 * An API call to update a model instance with the specified `id`, treating the other unbound parameters as attributes.
 */
module.exports = function (req, res) {
  var Model = actionUtil.parseModel(req);
  var PK = actionUtil.requirePk(req);
  var values = actionUtil.parseValues(req);

  Model.findOne(PK)
    .then(function(matchingRecord) {
      values._iModelId = values.id;
      Model
        .update(PK, _.omit(values, 'id'))
        .then(function (records) {
          if(records[0]) {
            // If we have the pubsub hook, use the Model's publish method
            // to notify all subscribers about the update.
            if (req._sails.hooks.pubsub) {
              if (req.isSocket) { Model.subscribe(req, records); }
              Model.publishUpdate(PK, _.cloneDeep(values), !req.options.mirror && req, {
                previous: matchingRecord.toJSON()
              });
            }
            res.ok(records[0]);
          } else {
            res.serverError();
          }
        })
        .catch(res.serverError);
    })
    .catch(res.serverError);

};
