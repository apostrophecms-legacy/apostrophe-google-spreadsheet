var fs = require('fs');
var ss = require('edit-google-spreadsheet');

module.exports = function(self, apos, callback) {
  console.log('Synching Google Spreadsheet to collection: '+self.collectionName);

  ss.load({
    debug: true,
    spreadsheetId: self.spreadsheetID,
    worksheetId: 'od6',
    oauth : {
      email: self.authEmail,
      keyFile: self.keyPath
    }

  }, function sheetReady(err, data) {
    if(err) {
      console.log(err);
    }
    
    return data.receive(function(err, rows, info) {
      var json = [];
      var index = 2;

      console.log('Data received. Converting to json.');

      while(rows[1][index]) {
        var dPoint = {};

        for(var r in rows) {
          if(rows[r][1] == '_id' && rows[r][index].length == 0) {
            console.log('No assigned ID. Generating one automatically');
          } else {
            dPoint[self.validateMongoFieldName(rows[r][1])] = rows[r][index];
          }
        }

        json.push(dPoint);
        index ++;
      }

      console.log('Dropping existing data.');
      self.collection.drop();

      console.log('Inserting documents in MongoDB');
      self.collection.insert(json, function(err) {
        if(err) {
          return callback(err);
        }

        console.log('Sync complete!');
        return callback(null);
      });
    });
  });
}