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
    'hello': ['hi'],
    'hi': ['hi'],
    'sup': ['hi'],
    'film': ['movie'],
    'movie': ['movie'],
    'flick': ['movie'],
    'book': ['book'],
    'novel': ['book'],
    'game': ['game'],
    'videogame': ['game'],
    'spooky': ['horror'],
    'horror': ['horror'],
    'scary': ['horror'],
    'scared': ['horror'],
    'epic': ['fantasy'],
    'fantasy': ['fantasy'],
    'science': ['scifi'],
    'sciencefiction': ['scifi'],
    'scifi': ['scifi'],
    'sci-fi':['scifi']
});

//Structured Data.
//Note, each medium(movie/game/book) has the same set of subcategories(horror,scifi, and fantasy) and each subcategory contains
//A list of objects with a title property. Obviously you can add more properties depending on the need of your bot
//NOTE: you do not have to have the same number of items in each list, but you must have all the same attributes
// I.E. you MUST have horror, scifi, and fastasy for each genre, and each item in those lists MUST have a title property
//They must share important traits so we can reliably access them later
var data = {
    movie: {
        horror: [
            {title: 'The Ring'},
            {title: 'Saw'},
            {title: 'Scream'}
        ],
        scifi: [
            {title: 'Star Wars'},
            {title: 'Ex Machina'},
            {title: 'Minority Report'}
        ],
        fantasy: [
            {title: 'Lord of the Rings'},
            {title: 'Clash of the Titans'}
        ]
    },
    game: {
        horror: [
            {title: 'Dead Space'},
            {title: 'Silent Hill'},
            {title: 'Resident Evil'}
        ],
        scifi: [
            {title: 'Halo'},
            {title: 'Mass Effect'},
            {title: 'BioShock'}
        ],
        fantasy: [
            {title: 'The Witcher'},
            {title: 'Dragon Age'},
            {title: 'Skyrim'}
        ]
    },
    book: {
        horror: [
            {title: 'Frankenstein'},
            {title: 'Dracula'}
        ],
        scifi: [
            {title: 'Ender\'s Game'},
            {title: 'Discword'}
        ],
        fantasy: [
            {title: 'Wheel of Time'},
            {title: 'Game of Thrones'},
            {title: 'The Hobbit'}
        ]

    }
};

//In order to access this data you need to set up additional data as follows
var mediums = {movie: 1, game: 1, book: 1};
var genres = {horror: 1, scifi: 1, fantasy: 1};

//since we want to be able to randomly select from each of these, we will create a list with these elements as well
var mediumlist = ['movie', 'game', 'book'];
var genrelist = ['horror', 'scifi', 'fantasy'];


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


            //Our bot is expecting a message like this 'I want to play a scary game' or 'I want to read a scifi book'
            //As such we expect 2 classifiers in a message
            if (classifiedMessage.length === 2) {
                //Variables intended to hold our 2 items we are expect, genre, and medium
                var medium;
                var genre;
                for (var j = 0; j < classifiedMessage.length; j++) {
                    //Compare the word to what we have listed as a medium above.
                    //E.G. mediums is defined as {movie:1,book:1,game:1} so we are testing if the word we is one of those
                    //if so, we store it as our medium
                    if (mediums[classifiedMessage[j]] !== undefined) {
                        medium = classifiedMessage[j];
                    }
                    //Same for genre
                    if (genres[classifiedMessage[j]] !== undefined) {
                        genre = classifiedMessage[j];
                    }
                }
                //If we do not have a genre or medium after going through the words, we need to say we don't understand the message
                if (medium === undefined || genre === undefined) {
                    sendMessage(event.sender.id, {
                        text: "Sorry, I didn't understand. Please say something like 'I want a spooky game to play' or 'Recommend something epic'"
                    });
                }
                else {
                    //we have a genre and a medium
                    //E.G. we want a horror game
                    //We can access our list of games we defined above and choose a random one to recommend

                    //We save our subcategory of the items for each genre in our medium, eg only the stuff for games
                    var firstSubcategory = data[medium];
                    //We get the list of data for the genre within the subcategory, eg now we only have the elements listed as horror within games
                    var secondSubcategory = firstSubcategory[genre];

                    //We want to get a random element from our list of items such as an individual game within the horror genre list
                    var index = Math.floor(Math.random() * secondSubcategory.length);
                    //We have saved our item and can use this variable to access its data. We only have title in this example so we will use it in our message
                    var item = secondSubcategory[index];

                    sendMessage(event.sender.id, {
                        text: 'A great ' + genre + ' ' + medium + ' that you might enjoy is: ' + item.title
                    });
                }
            }

            else {
                if (classifiedMessage.length === 1) {
                    //Say hi
                    if (classifiedMessage[0] == 'hi') {
                        sendMessage(event.sender.id, {
                            text: 'Hey there, I can make recommendations for movies, books, and video games and/or horror, fantasy, and sci-fi genres!'
                        })
                    }

                    //They asked for a game so we will randomly retrieve a game by randomly selecting a genre, and then a game within that genre
                    if (classifiedMessage[0] == 'game') {
                        //Get all of our game data
                        var GameData = data['game'];
                        //Select a random genre
                        var index = Math.floor(Math.random() * genrelist.length);
                        //Get the list of items for that genre
                        var Items = GameData[genrelist[index]];
                        //Pick a random item from our options by getting a new random index and getting that item
                        index = Math.floor(Math.random() * Items.length);
                        var Item = Items[index];
                        sendMessage(event.sender.id, {
                            text: Item.title + ' is an awesome game! Check it out :)'
                        });
                    }
                    //They asked for a book so we will randomly retrieve a book by randomly selecting a genre, and then a book within that genre
                    if (classifiedMessage[0] == 'book') {
                        //Get all of our book data
                        var GameData = data['book'];
                        //Select a random genre
                        var index = Math.floor(Math.random() * genrelist.length);
                        //Get the list of items for that genre
                        var Items = GameData[genrelist[index]];
                        //Pick a random item from our options by getting a new random index and getting that item
                        index = Math.floor(Math.random() * Items.length);
                        var Item = Items[index];
                        sendMessage(event.sender.id, {
                            text: Item.title + ' is a great read! Enjoy :)'
                        });
                    }
                    //They asked for a movie so we will randomly retrieve a movie by randomly selecting a genre, and then a movie within that genre
                    if (classifiedMessage[0] == 'movie') {
                        //Get all of our movie data
                        var GameData = data['movie'];
                        //Select a random genre
                        var index = Math.floor(Math.random() * genrelist.length);
                        //Get the list of items for that genre
                        var Items = GameData[genrelist[index]];
                        //Pick a random item from our options by getting a new random index and getting that item
                        index = Math.floor(Math.random() * Items.length);
                        var Item = Items[index];
                        sendMessage(event.sender.id, {
                            text: Item.title + ' is definitely worth watching! :D'
                        });
                    }
                    //They asked for something scary, so we will randomly select a medium, then randomly select something from the horror subcategory
                    if (classifiedMessage[0] == 'horror') {
                        //Get a random medium
                        var index = Math.floor(Math.random() * mediumlist.length);
                        var Medium = mediumlist[index];
                        //Get the data in our chosen medium
                        var MediumData = data[Medium];
                        //Get the items in the horror genre of our medium
                        var Items = MediumData['horror'];
                        index = Math.floor(Math.random() * Items.length);
                        var Item = Items[index];
                        sendMessage(event.sender.id, {
                            text: 'Looking to be scared? You can\'t go wrong with ' + Item.title + '!'
                        });

                    }
                    //They asked for something epic/fantasy, so we will randomly select a medium, then randomly select something from the fantasy subcategory
                    if (classifiedMessage[0] == 'fantasy') {
                        //Get a random medium
                        var index = Math.floor(Math.random() * mediumlist.length);
                        var Medium = mediumlist[index];
                        //Get the data in our chosen medium
                        var MediumData = data[Medium];
                        //Get the items in the fantasy genre of our medium
                        var Items = MediumData['fantasy'];
                        index = Math.floor(Math.random() * Items.length);
                        var Item = Items[index];
                        sendMessage(event.sender.id, {
                            text: 'If you love epic fantasy, you\'ll dig ' + Item.title + '!'
                        });
                    }
                    //They asked for something scifi, so we will randomly select a medium, then randomly select something from the scifi subcategory
                    if (classifiedMessage[0] == 'scifi') {
                        //Get a random medium
                        var index = Math.floor(Math.random() * mediumlist.length);
                        var Medium = mediumlist[index];
                        //Get the data in our chosen medium
                        var MediumData = data[Medium];
                        //Get the items in the scifi genre of our medium
                        var Items = MediumData['scifi'];
                        index = Math.floor(Math.random() * Items.length);
                        var Item = Items[index];
                        sendMessage(event.sender.id, {
                            text: 'Sci-fi is sweet! One of the best is' + Item.title + ', trust me ;)'
                        });

                    }
                }
                else {
                    sendMessage(event.sender.id, {
                        text: "Sorry, I didn't understand. Please say something like 'I want a spooky game to play' or 'Recommend something epic'"

                    });
                }
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
