var twitter = require('ntwitter'),
		WordPOS = require('wordpos'),
		natural = require('natural'),
		twit = new twitter({
  consumer_key: 'ApwwcXIDaoSUiFawySFVw',
  consumer_secret: '0EWiins2F69SQASZfFd8kragMkfjeVzrKOFgMP00Ls',
  access_token_key: '850257398-sajSlk0nV0R2yIDXtP8dpkvYKbJEIwOvnmgQvNVp',
  access_token_secret: 'MswYhTIT1qh66oxklXLclJwhS68hK8w7cfWGZfLtqMs'
}),
		wordpos = new WordPOS(),
		tokenizer = new natural.WordTokenizer();

// array of words not to include
var doNotWant = ['http', 'co', 'RT', 'I', 'i', 'the', 'The', 'lol', 'LOL', 'omg', 'so'];

var sortWordCount = function(wc, limit) {
	var sorted = [];
	for (var word in wc) {
		sorted.push([word, wc[word]]);
	}
	sorted.sort(function(a, b) {
		return b[1] - a[1];
	});

	return sorted;
};

// data json returned from twitter api call
var parseMostUsed = function(req, res, data) {
	var wordCount = {},
			combinedStr = '',
			strArray, word, top;
	for (var i=0; i<data.length; i++){
		combinedStr += data[i].text;
	}
	wordpos.getPOS(combinedStr, function(result){
		for (var i=0; i<data.length; i++) {
			strArray = tokenizer.tokenize(data[i].text);
			for (var j=0; j<strArray.length; j++){
				word = strArray[j].toLowerCase();
				if ((doNotWant.indexOf(word) < 0) && ((result.nouns.indexOf(word) > 0) ||
					(result.rest.indexOf(word) > 0)))
				{
					if (wordCount.hasOwnProperty(word)) {
						wordCount[word] += 1;
					} else {
						wordCount[word] = 1;
					}
				}
			}
		}
		top = sortWordCount(wordCount);
		res.render('top', {user: req.params.user, frequent: top});
	});
};

var getTweets = function(req, res, cb) {
	twit.getUserTimeline({
		screen_name: req.params.user,
		count: 200
	}, function(err, data) {
			if (err) {
				res.send(404, "username not found");
			}
			cb(req, res, data);
	});
};

var tweets = function(req, res) {
getTweets(req, res, function(req, res, data) {
		res.render('tweets', { user: req.params.user, result: data});
	});
};

var frequentWords = function (req, res) {
	getTweets(req, res, parseMostUsed);
};

exports.tweets = tweets;
exports.frequent = frequentWords;