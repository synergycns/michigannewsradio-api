/**
 * AudioFeed.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  description: 'Individual Audio Files',
  autoCreatedBy: false,
  autoPK: true,

  attributes: {
    file: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    caption: {
      type: 'string',
      required: true
    },
    description: {
      type: 'text',
      required: true
    },
    length: {
      type: 'string',
      required: true,
      size: 8
    },
    category: {
      model: 'AudioCategory'
    },
    feed: {
      model: 'AudioFeed'
    }
  }

};