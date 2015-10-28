var express = require('express'),
  bodyParser = require('body-parser'),
  cors = require('cors'),
  spots = require('./routes/spots');
var app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
  res.send('REST main');
});

app.get('/spots', spots.findAll);
app.get('/spots/:id', spots.findById);
app.post('/spots', spots.addSpot);
app.put('/spots/:id', spots.updateSpot);
app.delete('/spots/:id', spots.deleteSpot);

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
