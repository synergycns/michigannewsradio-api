/**
 * Affidavit.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  //migrate: 'alter',

  description: 'Affidavit entries for affiliates pertaining to schedules',
  attributes: {
    schedule: {
      model: 'Schedule',
      required: true
    },
    user: {
      model: 'User',
      required: true
    },
    makeGoods : {
      collection: 'MakeGood',
      via: 'affidavit'
    }
  },
  afterDestroy: function(aoDestroyed, fnCallback) {
    MakeGood.destroy({ affidavit: _.pluck(aoDestroyed, 'id') }).exec(fnCallback);
  }

};

