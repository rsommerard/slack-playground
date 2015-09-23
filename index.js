var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var iconv  = require('iconv-lite');
var fs  = require("fs");

const SULLY_TOKEN_EXPECTED = "";
const RU_TOKEN_EXPECTED = "";
const DWITCH_TOKEN_EXPECTED = "";
const MENU_TOKEN_EXPECTED = "";

const PERSON_1_ID = "";
const PERSON_1_FIRSTNAME = "";
const PERSON_2_ID = "";
const PERSON_2_FIRSTNAME = "";
const PERSON_3_ID = "";
const PERSON_3_FIRSTNAME = "";
const PERSON_4_ID = "";
const PERSON_4_FIRSTNAME = "";
const PERSON_5_ID = "";
const PERSON_5_FIRSTNAME = "";
const PERSON_6_ID = "";
const PERSON_6_FIRSTNAME = "";
const PERSON_7_ID = "";
const PERSON_7_FIRSTNAME = "";
const PERSON_8_ID = "";
const PERSON_8_FIRSTNAME = "";
const PERSON_9_ID = "";
const PERSON_9_FIRSTNAME = "";
const PERSON_10_ID = "";
const PERSON_10_FIRSTNAME = "";
const PERSON_11_ID = "";
const PERSON_11_FIRSTNAME = "";

// #wstest
//var MY_SLACK_WEBHOOK_URL = '';

// @slackbot
var MY_SLACK_WEBHOOK_URL = '';

var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);
var app = express();

const URL = "http://www.crous-lille.fr/admin-site/restauration_menu_print_w.php?ru=25&midi=1"

String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

app.set('port', (process.env.PORT || 5000));

function getFirstName(name) {
  switch(name) {
    case PERSON_1_ID:
      return PERSON_1_FIRSTNAME;
      break;
    case PERSON_2_ID:
      return PERSON_2_FIRSTNAME;
      break;
    case PERSON_3_ID:
      return PERSON_3_FIRSTNAME;
      break;
    case PERSON_4_ID:
      return PERSON_4_FIRSTNAME;
      break;
    case PERSON_5_ID:
      return PERSON_5_FIRSTNAME;
      break;
    case PERSON_6_ID:
      return PERSON_6_FIRSTNAME;
      break;
    case PERSON_7_ID:
      return PERSON_7_FIRSTNAME;
      break;
    case PERSON_8_ID:
      return PERSON_8_FIRSTNAME;
      break;
    case PERSON_9_ID:
      return PERSON_9_FIRSTNAME;
      break;
    case PERSON_10_ID:
      return PERSON_10_FIRSTNAME;
      break;
    case PERSON_11_ID:
      return PERSON_11_FIRSTNAME;
      break;
    default:
      return '';
      break;
  }
}

app.get('/menu', function (req, res) {
  var token = req.param('token');

  if(token != MENU_TOKEN_EXPECTED) {
    res.sendStatus(403);
    return;
  }

  var requestOptions  = { encoding: null, method: "GET", uri: URL};
  request(requestOptions, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var utf8Body = iconv.decode(new Buffer(body), "ISO-8859-1");
      //console.log(utf8Body);

      $ = cheerio.load(utf8Body);
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
          menu += $(plats[j]).text() + '\n';
        }

        //menu += '```'

        break;

        //console.log(menu);
      }

      var strToReturn = '*Menu du sully du ' + date.toLowerCase() + '.*' + '\n\n>>>' + menu;
      //console.log(strToReturn);

      var user = req.param('user_name');
      var chan = '@' + user;

      slack.send({ text: strToReturn, username: "Maité", mrkdwn: true, icon_emoji: null, channel: chan  }, function (err) {
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

app.get('/dwitch', function (req, res) {
  var token = req.param('token');

  if(token != DWITCH_TOKEN_EXPECTED) {
    res.sendStatus(403);
    return;
  }

  var user = req.param('user_name');

  var dateNow = new Date();
  var dayNow = dateNow.getDate();
  var monthNow = dateNow.getMonth();

  var dwitchData = '';
  var i = 0;
  fs.readFileSync('./dwitch.txt').toString().split('\n').forEach(function (line) {
    if(i === 0) {
      var day = line.split(':')[0];
      var month = line.split(':')[1];

      if(dayNow == day && monthNow == month) {
        i++;
      } else {
        return;
      }

    } else {
      if(line != '') {
        if(!line.contains(user)) {
          dwitchData += line + "\n";
        }
      }
    }
  });

  dwitchData = dayNow + ':' + monthNow + "\n" + dwitchData + user;
  fs.writeFileSync('./dwitch.txt', dwitchData);

  var sullyData = '';
  var i = 0;
  fs.readFileSync('./sully.txt').toString().split('\n').forEach(function (line) {
    if(i === 0) {
      var day = line.split(':')[0];
      var month = line.split(':')[1];

      if(dayNow == day && monthNow == month) {
        i++;
      } else {
        return;
      }

    } else {
      if(line != '') {
        if(!line.contains(user)) {
          sullyData += line + "\n";
        }
      }
    }
  });

  sullyData = dayNow + ':' + monthNow + "\n" + sullyData;
  fs.writeFileSync('./sully.txt', sullyData);

  var sullyData = '';
  fs.readFileSync('./sully.txt').toString().split('\n').forEach(function (line) {
    if(line != '') {
      sullyData += line + "#";
    }
  });

  var dwitchData = '';
  fs.readFileSync('./dwitch.txt').toString().split('\n').forEach(function (line) {
    if(line != '') {
      dwitchData += line + "#";
    }
  });

  var strToReturn = '*Sully*\n```';

  var sullyNames = sullyData.split('#');

  console.log(sullyNames);

  for(var i = 0; i < sullyNames.length; i++) {
    var firstName = getFirstName(sullyNames[i]);

    strToReturn += firstName + '\n';
  }

  strToReturn += '```\n\n*Dwitch\'*\n```'

  var dwitchNames = dwitchData.split('#');

  console.log(dwitchNames);

  for(var i = 0; i < dwitchNames.length; i++) {
    var firstName = getFirstName(dwitchNames[i]);

    strToReturn += firstName + '\n';
  }

  strToReturn += '```';

  console.log(strToReturn);

  var user = req.param('user_name');
  var chan = '@' + user;

  slack.send({ text: strToReturn, username: "Qui mange où ?!", mrkdwn: true, icon_emoji: ':hamburger:', channel: chan  }, function (err) {
    if (err) {
      console.log('API error:', err);
    } else {
      console.log('Message received!');
      return;
    }
  });

  res.sendStatus(200);
});

app.get('/sully', function (req, res) {
  var token = req.param('token');

  if(token != SULLY_TOKEN_EXPECTED) {
    res.sendStatus(403);
    return;
  }

  var user = req.param('user_name');

  var dateNow = new Date();
  var dayNow = dateNow.getDate();
  var monthNow = dateNow.getMonth();

  var sullyData = '';
  var i = 0;
  fs.readFileSync('./sully.txt').toString().split('\n').forEach(function (line) {
    if(i === 0) {
      var day = line.split(':')[0];
      var month = line.split(':')[1];

      if(dayNow == day && monthNow == month) {
        i++;
      } else {
        return;
      }

    } else {
      if(line != '') {
        if(!line.contains(user)) {
          sullyData += line + "\n";
        }
      }
    }
  });

  sullyData = dayNow + ':' + monthNow + "\n" + sullyData + user;
  fs.writeFileSync('./sully.txt', sullyData);

  var dwitchData = '';
  var i = 0;
  fs.readFileSync('./dwitch.txt').toString().split('\n').forEach(function (line) {
    if(i === 0) {
      var day = line.split(':')[0];
      var month = line.split(':')[1];

      if(dayNow == day && monthNow == month) {
        i++;
      } else {
        return;
      }

    } else {
      if(line != '') {
        if(!line.contains(user)) {
          dwitchData += line + "\n";
        }
      }
    }
  });

  dwitchData = dayNow + ':' + monthNow + "\n" + dwitchData;
  fs.writeFileSync('./dwitch.txt', dwitchData);

  var sullyData = '';
  fs.readFileSync('./sully.txt').toString().split('\n').forEach(function (line) {
    if(line != '') {
      sullyData += line + "#";
    }
  });

  var dwitchData = '';
  fs.readFileSync('./dwitch.txt').toString().split('\n').forEach(function (line) {
    if(line != '') {
      dwitchData += line + "#";
    }
  });

  var strToReturn = '*Sully*\n```';

  var sullyNames = sullyData.split('#');

  console.log(sullyNames);

  for(var i = 0; i < sullyNames.length; i++) {
    var firstName = getFirstName(sullyNames[i]);

    strToReturn += firstName + '\n';
  }

  strToReturn += '```\n\n*Dwitch\'*\n```'

  var dwitchNames = dwitchData.split('#');

  console.log(dwitchNames);

  for(var i = 0; i < dwitchNames.length; i++) {
    var firstName = getFirstName(dwitchNames[i]);

    strToReturn += firstName + '\n';
  }

  strToReturn += '```';

  console.log(strToReturn);

  var user = req.param('user_name');
  var chan = '@' + user;

  slack.send({ text: strToReturn, username: "Qui mange où ?!", mrkdwn: true, icon_emoji: ':hamburger:', channel: chan  }, function (err) {
    if (err) {
      console.log('API error:', err);
    } else {
      console.log('Message received!');
      return;
    }
  });

  res.sendStatus(200);
});

app.get('/ru', function (req, res) {
  var token = req.param('token');

  if(token != RU_TOKEN_EXPECTED) {
    res.sendStatus(403);
    return;
  }

  var sullyData = '';
  fs.readFileSync('./sully.txt').toString().split('\n').forEach(function (line) {
    if(line != '') {
      sullyData += line + "#";
    }
  });

  var dwitchData = '';
  fs.readFileSync('./dwitch.txt').toString().split('\n').forEach(function (line) {
    if(line != '') {
      dwitchData += line + "#";
    }
  });

  var strToReturn = '*Sully*\n```';

  var sullyNames = sullyData.split('#');

  console.log(sullyNames);

  for(var i = 0; i < sullyNames.length; i++) {
    var firstName = getFirstName(sullyNames[i]);

    strToReturn += firstName + '\n';
  }

  strToReturn += '```\n\n*Dwitch\'*\n```'

  var dwitchNames = dwitchData.split('#');

  console.log(dwitchNames);

  for(var i = 0; i < dwitchNames.length; i++) {
    var firstName = getFirstName(dwitchNames[i]);

    strToReturn += firstName + '\n';
  }

  strToReturn += '```';

  console.log(strToReturn);

  var user = req.param('user_name');
  var chan = '@' + user;

  slack.send({ text: strToReturn, username: "Qui mange où ?!", mrkdwn: true, icon_emoji: ':hamburger:', channel: chan  }, function (err) {
    if (err) {
      console.log('API error:', err);
    } else {
      console.log('Message received!');
      return;
    }
  });
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
