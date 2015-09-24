/**
 * Market.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  description: 'Markets for Stations/Users',
  autoCreatedBy: false,
  autoPK: true,

  settings: {
    sortfield: 'name',
    sortdirection: 'ASC'
  },
  attributes: {
    commercials: {
      collection: 'Commercial',
      via: 'markets'
    },
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    users: {
      collection: 'User',
      via: 'markets'
    }
  },
  columns: [
    {
      data: 'id',
      title: '',
      visible: false
    },
    {
      data: 'name',
      title: 'Name'
    },
    {
      data: null,
      title: '',
      edit: true,
      sortable: false
    },
    {
      data: null,
      title: '',
      delete: true,
      sortable: false
    }
  ],
  formschema: {
    type: 'object',
    title: 'Market',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Market Name',
          required: true
        }
      }
    }
  }

};
