/**
 * NavigationItem.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  description: 'Navigation Items',
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
  afterDestroy: function (aoDestroyed, fnNext) {

    sails.log.info('Destroyed', aoDestroyed);

    for(var i = 0; i < aoDestroyed.length; i++)
    {
      NavigationItem.find({ where: { order: { '>': aoDestroyed[i].order } }, sort: 'order ASC' })
        .then(function(aoResults) {
          if(aoResults && aoResults.length > 0) {
            sails.log.info('Results', aoResults);
            var iUpdated = 0;
            for(var j = 0; j < aoResults.length; j++) {
              NavigationItem.update(aoResults[j].id, { id: aoResults[j].id, order: (aoResults[j].order - 1) }).exec(function(oError) {
                if(oError) {
                  next(oError);
                } else {
                  iUpdated++;
                  if(iUpdated == aoResults.length) {
                    sails.log.info('All items updated');
                    fnNext();
                  }
                }
              });
            }
          } else {
            fnNext();
          }
        });
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

      //sails.log.info('_iModelId', item._iModelId);

      // Look for item
      NavigationItem.findOne({ id: item._iModelId })
        .then(function(oUpdate) {

          // Check if order has changed
          if(item.order !== oUpdate.order) {

            //sails.log.info('Order changed');

            // Look for record which currently has the item's new order
            NavigationItem.findOne({ id: { '!': item._iModelId }, order: item.order })
              .then(function(oPrevious) {
                if(oPrevious) {

                  //sails.log.info('Item', oUpdate);
                  //sails.log.info('Previous', oPrevious);


                  // Change the found record's order value to the current item's old order
                  NavigationItem.update(oPrevious.id, { id: oPrevious.id, order: oUpdate.order}).exec(
                    function(oError, oUpdated) {
                      if(oError) {
                        sails.log.error('Error', oError);
                        next(oError);
                        return;
                      }

                      //sails.log.info('Updated', oUpdated);
                      next();

                    }
                  );
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
    } else {
      next();
    }
  }
};
