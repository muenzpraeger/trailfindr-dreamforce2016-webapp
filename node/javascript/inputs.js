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

  var username = process.env.FASTLANE_USERNAME;
  var password = process.env.FASTLANE_PASSWORD;
  var appId = process.env.FASTLANE_APP_ID;

  var fastlaneCommand = 'ruby /app/vendor/bundle/bin/pilot add ' + mail + ' -u ' + username + ' -j ' + password + ' -a com.winkelmeyer.salesforce.trailfindr';

  var exec = require("child_process").exec;

  exec('cp -rpv /app/fastlane-mods/* /app/vendor/bundle/ruby/2.0.0/gems/pilot-1.10.0/lib/pilot', function(err, stdout, stderr) {
  console.log('Running copy command');
  console.log(err);
  console.log(stderr);
  console.log(stdout);
  console.log('Ending copy command');
});

  exec(fastlaneCommand, function (err, stdout, stderr) {
      console.log('Running Fastlane');
      console.log(err);
      console.log(stderr);
      console.log(stdout);
      console.log('Ending Fastlane');
      resp.send('done');
  });

}
