var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Destroy One Record
 * DELETE /:model/:id
 *
 * Destroys the single model instance with the specified `id` from the data adapter for the given model if it exists.
 */
module.exports = function (req, res) {
  var Model = actionUtil.parseModel(req);
  var PK = actionUtil.requirePk(req);

  Model
    .destroy(PK)
    .then(function (record) {
      if(record) {
        if (sails.hooks.pubsub) {
          //Model.publishDestroy(PK, req, { previous: record });
          Model.publishDestroy(PK, !req.options.mirror && req, record);
          if (req.isSocket) {
            Model.unsubscribe(req, record);
            Model.retire(record);
          }
        }
        return res.ok(record);
      }
      else
      {
        return res.notFound();
      }
    })
    .catch(res.serverError);
};
