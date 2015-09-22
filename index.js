var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

// #wstest
//var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/token';

// #cuisine
var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/token';

var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);
var app = express();

const URL = "http://www.crous-lille.fr/admin-site/restauration_menu_print_w.php?ru=25&midi=1"

app.set('port', (process.env.PORT || 5000));

app.get('/sully', function (req, res) {
  request(URL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body);
      $ = cheerio.load(body);
      var dates = $('.menu_ru_date').get();
      var nbdays = dates.length;
      var dateNow = new Date();
      var date;
      var menu = '';
      var index = 0;
      //console.log(nbdays);
      //console.log($(dates[1]).html());
      for(var i = 0; i < nbdays; i++) {
        date = $(dates[i]).html().replace('<i><b>', '').replace('</b></i>', '');

        var day = date.split(' ')[0];
        var numDay = date.split(' ')[1];
        var month = date.split(' ')[2];

        //console.log(dateNow.getMonth())
        //console.log(">" + new Date(date).getMonth())

        if(dateNow.getDate() != numDay) {
            index++;
            continue;
        }

        //console.log(date);

        var trParent = $(dates[i].parent.parent.parent);

        var plats = $('.menu_ru_plat', trParent);
        var nbPlats = plats.length;

        //menu += '```\n';
        for(var j = 0; j < nbPlats; j++) {
          menu += $(plats[j]).html() + '\n';
        }

        //menu += '```'

        break;

        //console.log(menu);
      }

      var strToReturn = '*Menu du sully du ' + date.toLowerCase() + '.*' + '\n\n>>>' + menu;

      strToReturn = strToReturn.replace('&#xFFFD;', 'â');

      slack.send({ text: strToReturn, username: "Maité", mrkdwn: true }, function (err) {
        if (err) {
          console.log('API error:', err);
        } else {
          console.log('Message received!');
          return;
        }
      });
      res.sendStatus(200);
      return;
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
