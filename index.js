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
        var words = s.toLowerCase().trim().replace(/[^A-Za-z]+/g, " ").split(" ");
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
//Classifier set up to pick out keywords and who they might relate to.
var myClassifier = new Classifier({
    'javascript': ['Toby', 'Jay'],
    'python': ['Robert'],
    'swift': ['Robert'],
    'chatbot': ['Robert', 'Jay'],
    'vr' : ['Toby'],
    'android': ['Jay'],
    'ios': ['Robert'],
    'unity': ['Toby'],
    'random':['Random'],
    'ta':['Robert','Toby','Jay'],
    'robert':['Robert'],
    'toby':['Toby'],
    'jay':['Jay'],
    'game':['Toby'],
    'app':['Robert','Jay'],
    'web':['Toby'],
    'website':['Toby'],
    'chat':['Robert','Jay'],
    'bot':['Robert','Jay']
});
//Example of how to structure data in an object. Accessed like TAData['Toby']
var TAData={
    Toby: {phoneNumber:8594288629, email: 'tobydgosselin@gmail.com', nickname:'T-Bone'},
    Jay : {phoneNumber: 1234567890, email: 'jayDaBest@AOL.com', nickname:'J-Dawg'},
    Robert: {phoneNumber: 1098765432, email: 'RobertCashMoney@money.net', nickname:'Cash-Money'}
};
//Example data in an array, accessed like RandomExample[index starting at 0]
var RandomExample=['Toby','Jay','Robert'];


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
            /************************************
             *************************************
             MODIFY CODE BELOW FOR YOUR CHATBOT
             *************************************
             ************************************/

            //We have several classifications and need clarification
            if (classifiedMessage.length > 1) {
                //Build a message by appending all of the possibilities to it.
                var msg = "You could be talking about ";
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
            //One classification which we can handle based on what we used to set up our classifier
            else if (classifiedMessage.length === 1) {
                //Handle message classified as Toby
                if (classifiedMessage[0] == 'Toby') {
                    sendMessage(event.sender.id, {
                        text: 'Toby can help! You can email him at: ' + TAData['Toby'].email + ' or call/text at: ' + TAData['Toby'].phoneNumber
                    });
                }
                //Handle message classified as Jay
                if (classifiedMessage[0] == 'Jay') {
                    sendMessage(event.sender.id, {
                        text: 'Jay can help! You can email him at: ' + TAData['Jay'].email + ' or call/text at: ' + TAData['Jay'].phoneNumber
                    });
                }
                //Handle message classified as Robert
                if (classifiedMessage[0] == 'Robert') {
                    sendMessage(event.sender.id, {
                        text: 'Robert can help! You can email him at: ' + TAData['Robert'].email + ' or call/text at: ' + TAData['Robert'].phoneNumber
                    });
                }
                //Example of how to get random data from an array
                //Might be useful for providing random recipes/other information
                if (classifiedMessage[0] == 'Random') {
                    var index = Math.floor(Math.random() * RandomExample.length);
                    sendMessage(event.sender.id, {
                        text: "Did you know that " + RandomExample[index] + '\s nickname is ' + TAData[RandomExample[index]].nickname + '? Pretty cool!'
                    });
                }
            }
            //There were no classifications so we can provide some information about what we can actually do.
            else {
                sendMessage(event.sender.id, {
                    text: "I don't understand what you're talking about. I can tell you which TA you should contact for what kind of project! Tell me the technologies and type."
                });
            }

        }
        else if (event.postback) {
            console.log("Postback received: " + JSON.stringify(event.postback));
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
    }
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
//Modified by; Toby G
