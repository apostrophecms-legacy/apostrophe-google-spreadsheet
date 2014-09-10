module.exports = spreadsheet;

function spreadsheet(options, callback) {
  return new Spreadsheet(options, callback);
}

Spreadsheet = function(options, callback) {
  var self = this;

  self.app = options.app;
  self.apos = options.apos;
  self._pages = options.pages;
  self._action = '/apos-google-spreadsheet';

  self.collection;
  self.collectionName = options.collectionName || 'sheets';

  self.apos.mixinModuleAssets(self, 'google-sheets', __dirname, options);

  self.apos.db.collection(self.collectionName, function(err, collection){
    self.collection = collection;
  });

  self.checkPermissions = function(req, res, next) {
    if(req.user && (req.user.permissions.admin || req.user.permissions.edior)) {
      return next();
    }

    return res.end('UNAUTHORIZED');
  }

  self.app.get('/test', self.checkPermissions, function(req, res){
    self.collection.find({},{}).toArray(function(err, docs) {
      res.send(docs);
    });
  });

  return process.nextTick(function() {
    return callback(null);
  });
}

spreadsheet.Spreadsheet = Spreadsheet;