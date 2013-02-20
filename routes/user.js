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
var doNotWant = ['http', 'co', 'RT', 'I', 'i', 'the', 'The', 'lol', 'LOL', 'omg', 'so',
				'amp', 'https'];

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
		res.render('tweets/top', {user: req.params.user, frequent: top});
	});
};

var getTweets = function(req, res, cb) {
	twit.getUserTimeline({
		screen_name: req.params.user,
		count: 200
	}, function(err, data) {
			if (err) {
				res.send(404, "username not found or is private");
				return;
			}
			cb(req, res, data);
	});
};

var tweets = function(req, res) {
getTweets(req, res, function(req, res, data) {
		res.render('tweets/tweets', { user: req.params.user, result: data});
	});
};

var frequentWords = function (req, res) {
	getTweets(req, res, parseMostUsed);
};

var topReroute = function(req, res) {
	res.redirect('/top/' + req.query.username);
};

var findGift = function (req, res) {
	res.render('tweets/gift', { user: req.params.user });
};

exports.tweets = tweets;
exports.toproute = topReroute;
exports.frequent = frequentWords;
exports.gift = findGift;