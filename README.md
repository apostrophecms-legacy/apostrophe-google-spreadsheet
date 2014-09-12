# Apostrophe Google Spreadsheet

Apostrophe Google Spreadsheet allows you to connect a spreadsheet in Google Drive with your MongoDB, convert/sync the data at your whim and query the collection later on.

### Configuration

In your app js. Just initialize it in apostrophe-site as you would any other module

```javascript
modules: {
  'apostrophe-ui-2': {},
  'apostrophe-people': {},
  'apostrophe-groups': {},
  'apostrophe-editor-2': {},
  'apostrophe-redirects': {},
  'apostrophe-google-spreadsheet': {
    spreadsheetID: 'xxxxxxxxxxxxx',
    authEmail: 'xxxxxxxxxxxx',
    keyPath: __dirname + '/auth/spreadsheet.pem'
  },
  'apostrophe-pie-charts': {}
}
```

#### Required options
You absolutely need to specify a spreadsheetID, authEmail and keyPath in order for this module to work. Not sure how to get those? This article is incredibly helpful: http://www.nczonline.net/blog/2014/03/04/accessing-google-spreadsheets-from-node-js/


## Usage

#### 1. Use it as a command line task
```
$ node app apostrophe:sync-google-spreadsheet
```

####  2. Hit the /sync route with an ajax call or in browser
localhost:3000/apostrophe-google-spreadsheet/sync

By default, the data is stored in a mongo collection called "aposSheets". If you'd like this to be something different, just specify a collectionName in your options when initializing the module.

Be aware that each time you run a sync, the collection is dropped and then populated by your new spreadsheet data. There is no updating. Only total destruction and then repopulation (for now).

#### Accessing the data from other modules

You can query your aposSheets collection in the same way you would with apostrophe-snippets based modules (events, maps, etc.).

```javascript
var sheet = self.site.modules['apostrophe-google-spreadsheet'];

self.app.get('/sheet-json', function(req, res) {
  return sheet.get({}, {}, function(err, docs){
    // do something with your json or whatever!
    return res.send(docs);
  });
});
```

#### To - Do
Create aposLocal "aposSpreadsheetsMenu" and necessary templates to include sync button the admin bar

