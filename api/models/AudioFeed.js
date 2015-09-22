/**
* AudioFeed.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  description: 'Feeds/groups of Audio Files',
  autoCreatedBy: false,
  autoPK: true,
  settings: {
    sortfield: 'createdAt',
    sortdirection: 'DESC'
  },
  attributes: {
    name: {
      type: 'string',
      required: true,
      unique: true,
      index: true
    },
    date: {
      type: 'datetime',
      required: true
    },
    producer: {
      type: 'string',
      required: true
    },
    category: {
      model: 'AudioCategory',
      required: true
    },
    files: {
      collection: 'AudioFile',
      via: 'feed'
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
      data: 'date',
      title: 'Date'
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
    title: 'Audio Feed',
    properties: {
      name: {
        title: 'Name',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Feed Name',
          required: true
        }
      },
      date: {
        title: 'Date',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Date',
          required: true
        }
      },
      producer: {
        title: 'Producer',
        type: 'string',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Producer',
          required: true
        }
      },
      category: {
        title: 'Category',
        type: 'number',
        'x-schema-form': {
          labelHtmlClass: 'col-sm-2',
          placeholder: 'Choose Category',
          required: true,
          type: 'strapselect',
          options: {
            httpGet: {
              url: 'USE_API:audiocategory'
            },
            map: {
              nameProperty: 'name',
              valueProperty: 'id'
            }
          }
        }
      }
    }
  }

};

