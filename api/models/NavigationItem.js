/**
 * NavigationItem.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  description: 'Navigation Items',
  autoPK: true,

  attributes: {
    icon: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    order: {
      type: 'integer'
    },
    model: {
      model: 'Model',
      required: true
    }
  },
  beforeCreate: function (item, next) {
    NavigationItem.count().exec(function(err, cnt) {
      if(err) {
        next(err);
      } else {
        //sails.log.info('Found ' + cnt + ' NavigationItems.');
        item.order = cnt + 1;
        next();
      }
    });
  },
  beforeUpdate: function(item, next) {

    // Check for "_iModelId" - signifies the model is being updated via the "update" blueprint
    if(item._iModelId) {

      // Look for item
      NavigationItem.findOne({ id: item._iModelId })
        .then(function(oUpdate) {

          // Check if order has changed
          if(item.order !== oUpdate.order) {

            // Look for record which currently has the item's new order
            NavigationItem.findOne({ id: { '!': item._iModelId }, order: item.order })
              .then(function(oPrevious) {
                if(oPrevious) {

                  // Change the found record's order value to the current item's old order
                  NavigationItem.update(oPrevious.id, { id: oPrevious.id, order: oUpdate.order})
                    .then(function(oUpdated) {
                      next();
                    });

                // No record found that has the item's new order
                } else {
                  next();
                }
              });

          // Order has not changed
          } else {
            next();
          }
        });
    }
  }
};
