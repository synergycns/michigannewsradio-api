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
      required: true
    },
    feed: {
      model: 'ContentFeed',
      required: true
    },
    file: {
      model: 'ContentFile',
      required: true
    },
    ipAddress: {
      type: 'string'
    },
    user: {
      model: 'User'
    }
  }
};

