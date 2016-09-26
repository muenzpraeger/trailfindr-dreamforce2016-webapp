var pg = require('pg');
var request = require('request');

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


module.exports.registerItunes = (req, resp) => {

  var mail = req.body.mail;

  console.log(mail);

  var exec = require("child_process").exec;

  exec('ruby -e "puts \'Hello from Ruby!\'"', function (err, stdout, stderr) {
      console.log(stdout);
  });

}
