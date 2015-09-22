/**
 * Create default navigation items
 * @param models models that have been added
 */
exports.create = function (models) {
  var modelaudio, modelnav, modelusers, modelmarket;
  models.forEach(function(model) {
    switch (model.identity) {
      case 'audiofeed':
            modelaudio = model;
            break;
      case 'navigationitem':
            modelnav = model;
            break;
      case 'user':
            modelusers = model;
            break;
      case 'market':
            modelmarket = model;
            break;
    }
  });
  return NavigationItem.findOrCreate({ name: 'Audio' }, { icon: 'fa-music', name: 'Audio', model: modelaudio })
    .then(function() {
      NavigationItem.findOrCreate({ name: 'Markets'}, { icon: 'fa-gear', name: 'Markets', model: modelmarket })
        .then(function() {
          NavigationItem.findOrCreate({ name: 'Navigation' }, { icon: 'fa-gears', name: 'Navigation', model: modelnav })
            .then(function() {
              return NavigationItem.findOrCreate({ name: 'Users' }, { icon: 'fa-users', name: 'Users', model: modelusers });
            });
        })
    });
};
