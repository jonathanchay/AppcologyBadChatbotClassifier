//**** Copy and Paste From Here Until next comment into your Javascript code @ the top ******
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
//**** End Copy Here ******

//Example below:

//Create a new classifier - this will classify your messages based on keywords you have predefined
//This is a pretty crude, but effective system. You need to define an object {} which is composed of
//any number of pairings of a keyword and an array of classifications. See below for a pizza store example
//NOTE: it is important to decide on the possible things you want your bot to handle. In the example,
//it's order-status, order, store-location, and store-hours. You need to be consistent.
//These pairings are words that might show up in a sentence, and what the desired result might be
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

//After you have initialized your classifier, in your chatbot you will need to classify the message before you can respond to it.
//When you classify a sentence, an array containing the classifications are returned. Hopefully it is only 1 element, but we will need
//to handle cases where there are several.

var messageFromFacebook = 'Whatever the message text is. This is an example variable. You WON"T use this';

var classifiedMessage = myClassifier.Classify(messageFromFacebook);
//We have several classifications and need clarification
if (classifiedMessage.length > 1) {
    //maybe send a message saying I thought you were talking about A or B, what did you mean?
    //You can do this through a loop like the one below
    var reply = 'Are you asking about ';
    for (var i = 0; i < classifiedMessage.length; i++) {
        reply += classifiedMessage[i];
        if (i + 1 < classifiedMessage)
            reply + ' or ';
        if (i + 1 === classifiedMessage.length)
            reply + '. Please clarify :)'
    }
    //send message with text as our variable, reply
}
else if (classifiedMessage.length === 1) {
    var msg = classifiedMessage[0];
    if (msg == 'order') {
        //do something
    }
    if (msg == 'store-hours') {
        //do something
    }
    if (msg == 'store-location') {
        //do something
    }
    if (msg == 'order-status') {
        //do something
    }
}
//No classification could be made
else {
    //send a message saying you don't understand, maybe say what you can handle

}


//Below are some examples of what is returned from queries.
console.log(myClassifier.Classify('Where is my pizza?'));
//output: [ [ 'order-status' ] ]
console.log(myClassifier.Classify('When will my pizza be here?'));
//output: [ [ 'order-status' ] ]
console.log(myClassifier.Classify('Where is the store?'));
//output: [ [ 'store-location' ] ]
console.log(myClassifier.Classify('When will the store open?'));
//output: [ [ 'store-hours' ] ]
console.log(myClassifier.Classify('Where is my order?'));
//output: [ [ 'order-status' ] ]
console.log(myClassifier.Classify('When will my order get here?'));
//output: [ [ 'order-status' ] ]
console.log(myClassifier.Classify('Where is the store and what are your hours?'));
//output: [ [ 'store-hours' ], [ 'store-location' ] ]
