Runtastic To Fitbit
===================

This is a small script to import your activity logs from Runtastic to Fitbit.

## Installation

1. `git clone` this repo
2. `npm install`
3. copy the `config.json.smaple` file to  `config.json` and add your own API keys there
4. Since there is no official plugin to do that, you'll have to login to your runtastic account, visit your activities page (`https://www.runtastic.com/en/users/YOUR_NAME_HERE/sport-sessions#single_type_1`) and run a small script in the Javascript console to fetch them:

```Javascript
var activities = [];
$("#sumtable tbody tr").each(function (i, el) {
  activities.push({
    date: $(el).find("td:first").text(),
    distance: $(el).find("td.distance").text(),
    duration: $(el).find("td.duration").text(),
    speed: $(el).find("td.speed").text(),
    pace: $(el).find("td.pace").text(),
    cal: $(el).find("td.kcal").text()
  });
});
JSON.stringify(activities);
```

You should have a stringified JSON output in your console if everything went fine and they didn't change their HTML page structure. Please copy this output in a file called runtastic_logs.json in the root of the project.

## Authentication

Next step is to authenticate through OAuth2 and acces the Fitbit API. I'm using the `fitbit-oauth2` for that [](https://github.com/peebles/fitbit-oauth2), please read their docs on GitHub. 
Run `node auth.js` and visit `http://localhost:3000` to fetch a auth token from Fitbit.

## Sync logs

Run `node sync.js` to upload all your saved logs from Runtastic to Fitbit. If everything went then you should see your activities on the Fitbit Dashboard.
