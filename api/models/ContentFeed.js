/**
* ContentFeed.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  description: 'Feeds/groups of Content Files',
  autoCreatedBy: false,
  autoPK: true,
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
    queued: {
      type: 'boolean',
      defaultsTo: false
    },
    category: {
      model: 'ContentCategory',
      required: true
    },
    files: {
      collection: 'ContentFile',
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
    title: 'Content Feed',
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
              url: 'USE_API:contentcategory'
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

