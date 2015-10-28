var mongo = require('mongodb');

var Server = mongo.Server,
  Db = mongo.Db,
  ObjectID = mongo.ObjectID;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('c2db', server);

var EarthEquatorialRadius = 6378100;

db.open(function (err, db) {
  if (!err) {
    console.log('connected to c2db');
    db.collection('spots', {strict: true}, function (err, collection) {
      if (err) {
        console.log('Collection doesn\'t exist, creating it');
        fillDb();
      }
    });
  }
});

exports.findAll = function (req, res) {
  var location = req.query.location;
  var radius = req.query.radius;

  var query = {};

  if (location && radius) {
    location = location.split(',').map(function (num) {
      return parseFloat(num);
    });
    query = {'location': {$geoWithin: {$centerSphere: [location, parseInt(radius) / EarthEquatorialRadius]}}};
  }

  db.collection('spots', function (err, collection) {
    collection.find(query).toArray(function (err, items) {
      res.send(items);
    });
  });
};

exports.findById = function (req, res) {
  var id = req.params.id;
  console.log('Loading spot with id: ' + id);
  db.collection('spots', function (err, collection) {
    collection.find({'_id': new ObjectID(id)}).limit(1).next(function (err, item) {
      res.send(item);
    });
  });
};

exports.addSpot = function (req, res) {
  var spot = req.body;
  console.log('Adding spot: ' + JSON.stringify(spot));
  db.collection('spots', function (err, collection) {
    collection.insert(spot, {safe: true}, function (err, result) {
      if (err) {
        res.send({'error': 'an error has occurred'});
      } else {
        console.log('Succes: ' + JSON.stringify(result[0]));
        res.send(result[0]);
      }
    });
  });
};

exports.updateSpot = function (req, res) {
  var id = req.params.id;
  var spot = req.body;
  console.log('Updating spot: ' + id);
  console.log(JSON.stringify(spot));
  db.collection('spots', function (err, collection) {
    collection.update({'_id': new ObjectID(id)}, spot, {safe: true}, function (err, result) {
      if (err) {
        console.log('Error updating spot: ' + err);
        res.send({'error': 'An error has occurred'});
      } else {
        console.log('' + result + ' document(s) updated');
        res.send(spot);
      }
    });
  });
};

exports.deleteSpot = function (req, res) {
  var id = req.params.id;
  console.log('Deleting spot: ' + id);
  db.collection('spots', function (err, collection) {
    collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function (err, result) {
      if (err) {
        res.send({'error': 'An error has occurred - ' + err});
      } else {
        console.log('' + result + ' document(s) deleted');
        res.send(req.body);
      }
    });
  });
};

var fillDb = function () {
  var spots = [{
    title: 'pothole',
    location: {type: 'Point', coordinates: [11.9759733, 57.68313]}
  }, {
    title: 'blockage',
    location: {type: 'Point', coordinates: [11.9721963, 57.6834508]}
  }, {
    title: 'construction',
    location: {type: 'Point', coordinates: [11.972385, 57.683842]}
  }];

  db.collection('spots', function (err, collection) {
    collection.createIndex('idx_location', {location: '2dsphere'});
    collection.insert(spots, {safe: true}, function (err, result) {
    });
  });
};
