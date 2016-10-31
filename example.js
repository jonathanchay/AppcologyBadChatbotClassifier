/************************************
 This is the heart of your bot.

 This program is coded in JavaScript and requires the installation of additional software and an established server.
 BEFORE MODIFYING THIS CODE SEE THE GITHUB REPOSITORY FOR SETUP INSTRUCTIONS (https://github.com/ssyz/fb-appcologybot)

 The code has been simplified to if...else statements that you can modify to the functionalities you want.
 I have provided a few examples for handling typical situations and one API integration example - more details below.
 For the basics of if...else statements, please read: http://www.w3schools.com/js/js_if_else.asp

 How to use this code:
 - Use this code as a framework when you are working on your Project. Copy, paste, expand, delete, and create anything you need!
 - Any line followed by // or *** indicates a comment that is not processed by a compiler. The comments are here to explain the code and guide you along.

 If you have additional questions, post on the Canvas page or contact Jay at s.m.syz@emory.edu
 ************************************/

//**** Copy and Paste From Here Until next comment into your Javascript code @ the top ******
function Classifier(keywords) {
    this.classifiers = keywords;
}
Classifier.prototype = {
    Classify: function (s) {
        var possibleClassifications = {};
        var words = s.toLowerCase().trim().replace(/[^A-Za-z0-9]+/g, " ").split(" ");
        for (var i = 0; i < words.length; i++) {
            if (this.classifiers[words[i]] !== undefined) {
                var pwords = this.classifiers[words[i]];
                for (var j = 0; j < pwords.length; j++) {
                    if (possibleClassifications[pwords[j]] === undefined)
                        possibleClassifications[pwords[j]] = 1;
                    else
                        possibleClassifications[pwords[j]]++;
                }
            }
        }
        if (Object.keys(possibleClassifications).length < 1)
            return [];
        var tuples = [];
        for (var key in possibleClassifications) tuples.push([key, possibleClassifications[key]]);
        tuples.sort(function (a, b) {
            a = a[1];
            b = b[1];
            return a < b ? -1 : (a > b ? 1 : 0);
        });
        tuples.reverse();
        var results = [];
        results.push(tuples[0]);
        for (var j = 1; j < tuples.length; j++) {
            if (results[0][1] > tuples[j][1]) {
                break;
            }
            else
                results.push(tuples[j]);
        }
        var finalClassifications = [];
        for (var x = 0; x < results.length; x++) {
            finalClassifications.push([results[x][0]]);
        }
        return finalClassifications;
    }
};

var myClassifier = new Classifier({
    'where': ['order-status', 'store-location'],
    'time': ['order-status', 'store-hours'],
    'here': ['order-status'],
    'when': ['order-status', 'store-hours'],
    'how': ['order'],
    'order': ['order', 'order-status'],
    'my': ['order-status'],
    'store': ['store-hours', 'store-location'],
    'located': ['store-location'],
    'location': ['store-location'],
    'hours': ['store-hours'],
    'open': ['store-hours'],
    'close': ['store-hours'],
    'closed': ['store-hours'],
    'place': ['order'],
    'want': ['order']
});

//**** End Copy Here ******


/************************************
 *************************************
 DO NOT TOUCH THE CODE IN THIS SECTION
 *************************************
 ************************************/

// declare requirements
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));


function Classifier(keywords) {
    this.classifiers = keywords;
}
Classifier.prototype = {
    Classify: function (s) {
        var possibleClassifications = {};
        var words = s.toLowerCase().trim().replace(/[^A-Za-z0-9]+/g, " ").split(" ");
        for (var i = 0; i < words.length; i++) {
            //Modification to check if 10 digit phone number is entered

            var numCheck = words[i].replace(/[^0-9]/g, "");
            if (numCheck.length === 10)
                return ([['phone-number',numCheck]]);
            if (this.classifiers[words[i]] !== undefined) {
                var pwords = this.classifiers[words[i]];
                for (var j = 0; j < pwords.length; j++) {
                    if (possibleClassifications[pwords[j]] === undefined)
                        possibleClassifications[pwords[j]] = 1;
                    else
                        possibleClassifications[pwords[j]]++;
                }
            }
        }
        if (Object.keys(possibleClassifications).length < 1)
            return [];
        var tuples = [];
        for (var key in possibleClassifications) tuples.push([key, possibleClassifications[key]]);
        tuples.sort(function (a, b) {
            a = a[1];
            b = b[1];
            return a < b ? -1 : (a > b ? 1 : 0);
        });
        tuples.reverse();
        var results = [];
        results.push(tuples[0]);
        for (var j = 1; j < tuples.length; j++) {
            if (results[0][1] > tuples[j][1]) {
                break;
            }
            else
                results.push(tuples[j]);
        }
        var finalClassifications = [];
        for (var x = 0; x < results.length; x++) {
            finalClassifications.push([results[x][0]]);
        }
        return finalClassifications;
    }
};
var myClassifier = new Classifier({
    'where': ['order-status', 'store-location'],
    'time': ['order-status', 'store-hours'],
    'here': ['order-status'],
    'when': ['order-status', 'store-hours'],
    'how': ['order'],
    'order': ['order', 'order-status'],
    'my': ['order-status'],
    'store': ['store-hours', 'store-location'],
    'located': ['store-location'],
    'location': ['store-location'],
    'hours': ['store-hours'],
    'open': ['store-hours'],
    'close': ['store-hours'],
    'closed': ['store-hours'],
    'place': ['order'],
    'want': ['order']
});

var pizzaData={
    '8594288629':{
        deliveryTime:'6:30PM',
        name: 'Toby Geeee'
    },
    '4127675400':{
        deliveryTime:'1:15AM',
        name: 'Alison'
    }
};


// Server frontpage
app.get('/', function (req, res) {
    res.send('This is your bots server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// main handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            var classifiedMessage = myClassifier.Classify(event.message.text);
            //We have several classifications and need clarification
            if (classifiedMessage.length > 1 ) {
                var msg = "Yo, are you asking about ";
                for (var j = 0; j < classifiedMessage.length; j++) {
                    msg += classifiedMessage[j];
                    if (j + 1 < classifiedMessage.length)
                        msg += " or ";
                    if (j + 1 === classifiedMessage.length)
                        msg += "? Please clarify :)";
                }
                sendMessage(event.sender.id, {
                    text: msg
                });
            }
            else if (classifiedMessage.length === 1) {
                if (classifiedMessage[0] == 'order') {
                    sendMessage(event.sender.id, {
                        text: "You want to know how to order? Check this out: pizzahut.com!"
                    });
                }
                if (classifiedMessage[0] == 'store-hours') {
                    sendMessage(event.sender.id, {
                        text: "24/7 BABY!"
                    });
                }
                if (classifiedMessage[0] == 'store-location') {
                    sendMessage(event.sender.id, {
                        text: "Right down the street dude!"
                    });
                }
                if (classifiedMessage[0] == 'order-status') {
                    sendMessage(event.sender.id, {
                        text: "Gimme yo digits gurl. No dashes, spaces, parenthesis, or periods tho cuz I'm dumb AF!"
                    });
                }
                if (classifiedMessage[0][0] == 'phone-number') {
                    var msg;
                    if(pizzaData[classifiedMessage[0][1]]===undefined){
                        msg = "Sorry, there is no order from that number"
                    }
                    else {
                        var record = pizzaData[classifiedMessage[0][1]];
                        msg = "Hi " + record.name + ", your pizza should be there at: " + record.deliveryTime;
                    }
                    sendMessage(event.sender.id, {
                        text: msg
                    });
                }
                //Can't classify it
            }
            else {
                sendMessage(event.sender.id, {
                    text: "Dude, I don't know wtf you are talking about. I can help you with your oder, store hours and location, and send you to our website for a delicious pie"
                });
            }

        }
        else if (event.postback) {
            console.log("Postback received: " + JSON.stringify(event.postback));
        }
    }

    /*******************************************
     ********************************************
     ********************************************
     *******************************************/


    /************************************
     *************************************
     DO NOT TOUCH THE CODE IN THIS SECTION
     *************************************
     ************************************/

    res.sendStatus(200);
});

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

/************************************
 *************************************
 ************************************/

// Written by: Jay Syz
