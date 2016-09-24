var pg = require('pg');

pg.defaults.ssl = true;


module.exports.setFeedback = (req, resp) => {

  var feedback = req.body;

  pg.connect(process.env.DATABASE_URL, function(err, client) {
    if (err) throw err;

    var query = client.query('insert into trailfindr.feedback__c(input__c, from__c, to__c, rating__c) values ($1,$2,$3,$4)', [feedback.input, feedback.from, feedback.to, feedback.rating]);

    query.on('error', function(){
      resp.status(800);
      resp.send('error');
      client.end();
    });

    query.on('end', function() {
        resp.send('done');
        client.end();
    });

  });
}
