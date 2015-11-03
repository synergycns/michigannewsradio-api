/**
 * Download.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
  autoCreatedBy: false,
  autoUpdatedAt: false,

  attributes: {
    category: {
      model: 'ContentCategory',
      index: true,
      required: true
    },
    feed: {
      model: 'ContentFeed',
      index: true,
      required: true
    },
    file: {
      model: 'ContentFile',
      index: true,
      required: true
    },
    ipAddress: {
      type: 'string'
    },
    user: {
      index: true,
      model: 'User'
    }
  }
};

