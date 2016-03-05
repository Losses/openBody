const express = require('express');
const   later = require('later');

const    data = require('./modules/data.js');
const     net = require('./modules/network.js');
const  config = require('./modules/config.js');
const       r = require('./modules/r.js');

const          app = express();
const _db_location = './data.db';
const        _port = config.port;

later.setInterval(later.parse.text(config.scheduleString, r.refreshDb));
data.dbInit(_db_location);

app.use('/assets', express.static('assets'));
app.post('/api/list/*', data.getList);
app.get('/api/activity/*', data.getActivity);
app.get('/data.db', (req, res) => res.sendFile(_db_location, { root: __dirname }));
app.get('/favicon.ico', (req, res) => res.sendFile('assets/imgs/favicon.ico', { root: __dirname }));
app.get('*', (req, res) => res.sendFile('assets/index.html', { root: __dirname }));

var server = app.listen(_port, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Open Body listening at http://%s:%s', host, port);
});