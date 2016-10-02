var pg = require('pg');
var xml = require('xml');

pg.defaults.ssl = true;

var keys = [];

module.exports.getVenue = (req, resp) => {
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err) throw err;

    var query = client.query('select poi.name, poi.venue_type__c, beacon.major_id__c, beacon.minor_id__c FROM trailfindr.point_of_interest__c AS poi, trailfindr.beacon__c AS beacon WHERE poi.beacon__c = beacon.sfid ORDER BY poi.venue_type__c;');

    var exits = [];
    var venues = [];
    var venue = {};
    var tempVenueName = '';
    var venueElements = [];
    var wrapper = {};

    query.on('row', function(row) {
      if (row.venue_type__c != tempVenueName) {
        if (tempVenueName != '') {
          if (tempVenueName == 'Exits') {
            exits = venueElements;
          } else {
            venue.pois = venueElements;
            venues.push(venue);
          }
          venueElements = [];
        }
        venue = {};
        tempVenueName = row.venue_type__c;
        venue.name = tempVenueName;
      }
      var venueElement = {};
      venueElement.name = row.name;
      venueElement.entrance_beacon_minor = row.minor_id__c;
      venueElement.entrance_beacon_major = row.major_id__c;
      venueElement.exit_beacon_minor = row.minor_id__c;
      venueElement.exit_beacon_major = row.major_id__c;
      if (tempVenueName != 'Exits') {
        var destinations = [];
        destinations.push(row.name)
        venueElement.destinations = destinations;
      }
      venueElements.push(venueElement);
    });

    query.on('end', function() {
        venue.pois = venueElements;
        if (tempVenueName == 'Exits') {
          exits = venueElements;
        } else {
          venue.pois = venueElements;
          venues.push(venue);
        }
        wrapper.venues = venues;
        wrapper.exits = exits;
        resp.set('Content-Type', 'application/json');
        resp.send(JSON.stringify(wrapper));
        client.end();
    });

  });
}

module.exports.getGraph = (req, resp) => {
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err) throw err;

    getNodes(client, function(nodes){
      getEdges(client, function(edges) {
        buildXml(nodes, edges, function(graphml) {
          //console.log(xml(graphml, true));
          resp.set('Content-Type', 'text/xml');
          resp.send(xml(graphml, true));
        });
      });
    });
  });
}


module.exports.getBeacons = (req, resp) => {
  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err) throw err;

    var query = client.query('select beacon.name, beacon.major_id__c, beacon.minor_id__c, beacon.uuid__c FROM trailfindr.point_of_interest__c AS poi, trailfindr.beacon__c AS beacon WHERE poi.beacon__c = beacon.sfid;');

    var beacons = [];

    query.on('row', function(row) {
      var beacon = {};
      beacon.minor = row.minor_id__c;
      beacon.major = row.major_id__c;
      beacon.uuid = row.uuid__c;
      beacon.name = row.name;
      beacons.push(beacon);
    });

    query.on('end', function(err1) {
        var wrapper = {};
        wrapper.beacons = beacons;
        resp.set('Content-Type', 'application/json');
        resp.send(JSON.stringify(wrapper));
        client.end();
    });

  });
}


function getNodes(client, callback) {
  var query = client.query('select poi.id, poi.name, beacon.major_id__c, beacon.minor_id__c, beacon.accuracy__c FROM trailfindr.point_of_interest__c AS poi, trailfindr.beacon__c AS beacon WHERE poi.beacon__c = beacon.sfid;');

  var nodes = [];

  query.on('row', function(row) {
    var node = {node:
      [
        { _attr: { id: row.id}},
        {data: [{ _attr: {key: 'major'}}, row.major_id__c]},
        {data: [{ _attr: {key: 'minor'}}, row.minor_id__c]},
        {data: [{ _attr: {key: 'accuracy'}}, row.accuracy__c]},
        {data: [{ _attr: {key: 'name'}}, row.name]},
        {data: [{ _attr: {key: 'waypoint_type'}}, row.type]}
      ]
    };
    nodes.push(node);
  });

  query.on('end', function() {
    var graph = {graph:
      [
        { _attr: { id: 'Venue', edgedefault: 'directed'}},
        {nodes: nodes}
      ]
    };
    callback(nodes);
  });
}


function getEdges(client, callback) {
  //var query = client.query('SELECT path.id, path.name, beacon.major_id__c, beacon.minor_id__c FROM trailfindr.point_of_interest__c AS poi, trailfindr.beacon__c AS beacon WHERE poi.beacon__c = beacon.sfid;');
  var queryPois = client.query('SELECT poi.id, poi.sfid FROM trailfindr.point_of_interest__c AS poi;');
  var pois = {};

  queryPois.on('row', function(row) {
    pois[row.sfid] = row.id;
  });

  queryPois.on('end', function() {

    var queryPathways = client.query('SELECT * FROM trailfindr.pathway__c AS pathway;');

    var edges = [];

    queryPathways.on('row', function(row) {
      var calcId = pois[row.start_point__c] + 'to' + pois[row.end_point__c];
      var edge = {edge:
        [
          { _attr: { id: calcId, source: pois[row.start_point__c], target: pois[row.end_point__c]}},
          {data: [{ _attr: {key: 'travel_time'}}, row.travel_time__c]},
          {data: [{ _attr: {key: 'beginning'}}, row.beginning__c]},
          {data: [{ _attr: {key: 'ending'}}, row.ending__c]},
          {data: [{ _attr: {key: 'heading'}}, row.heading__c]},
          {data: [{ _attr: {key: 'language'}}, 'en-GB']}
        ]
      };
      edges.push(edge);
    });

    queryPathways.on('end', function() {
      client.end();
      callback(edges);
    });
  });
}

function buildXml(nodes, edges, callback) {
  var graphml = {graphml:
    [
      { _attr: { xmlns: 'http://graphml.graphdrawing.org/xmlns', 'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance', 'xsi:schemaLocation': 'http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd'}},
      {key:{ _attr: { id: 'travel_time', for: 'edge', 'attr.name': 'travel_time', 'attr.type': 'double' }}},
      {key: { _attr: { id: 'language', for: 'edge', 'attr.name': 'language', 'attr.type': 'string' }}},
      {key: { _attr: { id: 'beginning', for: 'edge', 'attr.name': 'instruction-beginning', 'attr.type': 'string' }}},
      {key: { _attr: { id: 'middle', for: 'edge', 'attr.name': 'instruction-middle', 'attr.type': 'string' }}},
      {key: { _attr: { id: 'ending', for: 'edge', 'attr.name': 'instruction-end', 'attr.type': 'string' }}},
      {key: { _attr: { id: 'starting_only', for: 'edge', 'attr.name': 'instruction-starting_only', 'attr.type': 'string' }}},
      {key: { _attr: { id: 'major', for: 'node', 'attr.name': 'major', 'attr.type': 'int' }}},
      {key: { _attr: { id: 'minor', for: 'node', 'attr.name': 'travel_time', 'attr.type': 'int' }}},
      {key: { _attr: { id: 'name', for: 'node', 'attr.name': 'name', 'attr.type': 'string' }}},
      {key: { _attr: { id: 'waypoint_type', for: 'node', 'attr.name': 'waypoint_type', 'attr.type': 'string' }}},
      {key: [{ _attr: { id: 'accuracy', for: 'node', 'attr.name': 'accuracy', 'attr.type': 'double' }}, {default: 10}]},
      {graph:
        [
          { _attr: { id: 'ExampleStation', edgedefault: 'directed'}},
          {'nodes': nodes},
          {'edges': edges}
        ]
      }
    ]
  };
  callback(graphml);
}

module.exports.getConfig = (req, resp) => {

  var config = {};
  var heading = {};

  heading.heading = true;
  heading.vibrate = true;
  heading.deviation = 20;
  config.heading = heading;

  resp.send(JSON.stringify(config));

}
