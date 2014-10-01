var child_process = require('child_process');
var sync = require('./lib/tasks/sync');

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

  if(!options.keyPath || !options.authEmail || ! options.spreadsheetID) {
    throw "CONFIGURATION ERROR: You need to specify a keyPath, authEmail and spreadsheetID in your app.js."
  }

  // Required options
  self.spreadsheetID = options.spreadsheetID;
  self.authEmail = options.authEmail;
  self.keyPath = options.keyPath;

  // Optional... options
  self.collectionName = options.collectionName || 'aposSheets';
  self.worksheetID = options.worksheetID || 'od6';

  // Initialize our collection
  self.apos.db.collection(self.collectionName, function(err, collection){
    self.collection = collection;
  });

  // Mixin those module assets
  self.apos.mixinModuleAssets(self, 'google-sheets', __dirname, options);

  // Middleware for ensuring only logged in users are able to party 
  self.checkPermissions = function(req, res, next) {
    if(req.user && (req.user.permissions.admin || req.user.permissions.edior)) {
      return next();
    }

    return res.end('UNAUTHORIZED');
  }

  // Helper function for making sure we're putting the right stuff in our database
  self.validateMongoFieldName = function(string) {
    if(string == '_id') {
      return string;
    } else {
      return self.apos.camelName(string)
    }
  }

  // Register a task that calls our sync method. Pass it the proper options.
  self.apos.on('tasks:register', function(taskGroups){
    taskGroups.apostrophe.syncGoogleSpreadsheet = function(apos, argv, callback) {
      return sync(self, apos, callback);
    }
  });

  // Register a route that triggers the sync task in the background.
  self.app.get(self._action+'/sync', self.checkPermissions, function(req, res) {
    child_process.exec('node app apostrophe:sync-google-spreadsheet', function(err, stdout, stderr) {
      if(err) {
        return callback(err);
      }

      console.log(stdout);
      console.log(stderr);

      return res.end('done');
    });
  });

  // Expose a get method so other modules can make queries on our collection
  self.get = function(criteria, projection, callback){
    return self.collection.find(criteria, projection).toArray(callback);
  }

  // Obligatory process.nextTick callback thing
  return process.nextTick(function() {
    return callback(null);
  });
}

spreadsheet.Spreadsheet = Spreadsheet;