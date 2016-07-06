var express = require('express');
var app     = express();
var config  = require( './config.json' );
var fs      = require( 'fs' );

var Fitbit  = require( 'fitbit-oauth2' );

// Simple token persist functions.
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

// Instanciate a fitbit client.  See example config below.
//
var fitbit = new Fitbit( config.fitbit, function (t, cb){cb();} ); 

// In a browser, http://localhost:3000/fitbit to authorize a user for the first time.
//
app.get('/', function (req, res) {
  res.redirect( fitbit.authorizeURL() );
});

// Callback service parsing the authorization token and asking for the access token.  This
// endpoint is refered to in config.fitbit.authorization_uri.redirect_uri.  See example
// config below.
//
app.get('/fitbit_auth_callback', function (req, res, next) {
  var code = req.query.code;
  fitbit.fetchToken( code, function( err, token ) {
    if ( err ) return next( err );
    // persist the token
    persist.write( tfile, token, function( err ) {
      if ( err ) return next( err );
      res.redirect( '/complete' );
    });
  });
});

app.get( '/complete', function( req, res, next ) {
  fitbit.request({
    uri: "https://api.fitbit.com/1/user/-/profile.json",
    method: 'GET',
  }, function( err, body, token ) {
    if ( err ) return next( err );
    var profile = JSON.parse( body );
    // if token is not null, a refesh has happened and we need to persist the new token
    if ( token )
      persist.write( tfile, token, function( err ) {
        if ( err ) return next( err );
          res.send( '<pre>' + JSON.stringify( profile, null, 2 ) + '</pre>' );
      });
    else
      res.send( '<p>Authorization process complete. The token was saved in ' + tfile + '. Please sync your data throught sync.js.</p>\n<pre>' + JSON.stringify( profile, null, 2 ) + '</pre>' );
  });
});

app.listen(3000, function () {
  console.log("Runtastic To Fitbit is running on port 3000. Please navigate to http://localhost:3000/fitbit to authenticate.")
});