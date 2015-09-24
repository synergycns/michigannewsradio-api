var _ = require('lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Create Record
 * POST /:model
 *
 * An API call to create and return a single model instance using the specified parameters.
 */
module.exports = function (req, res) {
  var Model = actionUtil.parseModel(req);
  var values = actionUtil.parseValues(req);

  Model
    .create(values)
    .then(function(newInstance) {
      // If we have the pubsub hook, use the model class's publish method
      // to notify all subscribers about the created item
      if (req._sails.hooks.pubsub) {
        if (req.isSocket) {
          Model.subscribe(req, newInstance);
          Model.introduce(newInstance);
        }
        Model.publishCreate(newInstance, !req.options.mirror && req);
      }
      return res.created(newInstance);
    })
    .catch(res.serverError);
};
