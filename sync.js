var config = require( './config.json' );
var fs     = require( 'fs' );
var Fitbit = require( 'fitbit-oauth2' );
var async  = require('async');

// Simple token persist code
//
var tfile = 'fb-token.json';
var persist = {
  read: function( filename, cb ) {
    fs.readFile( filename, { encoding: 'utf8', flag: 'r' }, function( err, data ) {
      if ( err ) return cb( err );
      try {
          var token = JSON.parse( data );
          cb( null, token );
      } catch( err ) {
          cb( err );
      }
    });
  },
  write: function( filename, token, cb ) {
    console.log( 'persisting new token:', JSON.stringify( token ) );
    fs.writeFile( filename, JSON.stringify( token ), cb );
  }
};

// Instanciate the client
//
var fitbit = new Fitbit( config.fitbit, function (t, cb){cb();} );

// Read the persisted token, initially captured by a webapp.
//
persist.read( tfile, function( err, token ) {
  if ( err ) {
    console.log( err );
    process.exit(1);
  }

  // Set the client's token
  fitbit.setToken( token );

  var logActivity = function (data, cb) {
    // {"date":"24.06.16","distance":"4.34 km","duration":"27:58","speed":"9.32 km/h","pace":"6:26","cal":"344"}
    var duration = data.duration.split(":");
    duration = (parseInt(duration[0]) * 60 + parseInt(duration[1])) * 1000;
    var distance = parseFloat(data.distance.split(" ")[0])
    var date = data.date.split(".");
    date = "20" + date[2] + "-" + date[1] + "-" + date[0]
    fitbit.request({
      uri: "https://api.fitbit.com/1/user/-/activities.json",
      method: 'POST',
      form: {
        activityName: "Run",
        manualCalories: data.cal,
        startTime: "19:00:00",
        durationMillis: duration,
        date: date,
        distance: distance
      }
    }, function( err, body, token ) {
      if ( err ) {
        console.log( err );
        process.exit(1);
      }
      console.log( JSON.stringify( JSON.parse( body ), null, 2 ) );

      if (!token ) return cb();

      // If the token arg is not null, then a refresh has occured and
      // we must persist the new token.
      persist.write( tfile, token, function( err ) {
        if ( err ) console.log( err );
        cb(err);
      });    
    });
  };

  var activities = require("./runtastic_logs")
  async.mapSeries(activities, logActivity, function(err) {
    if (err) console.error(err);
    process.exit(0);
  })
});