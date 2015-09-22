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
      required: true,
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true,
    },
    order: {
      type: 'integer',
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
  afterValidate: function(item, next) {
    Model.find(item.model).exec(function(err, model) {
      if(err) {
        next(err);
      } else {
        item.modelName = model.name;
        next();
      }
    });
  }

};
