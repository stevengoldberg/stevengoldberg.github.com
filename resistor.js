//SC.initialize({
//   client_id: "67f2822a454cafa2b800fc88cb5c0518",
//  });

var numTweets = 20;

function handleTweets(tweets){
    var current = Math.floor(Math.random()*numTweets);
	var initial = true;
	splitTweet(tweets[current]);
	current = (current + 1) % numTweets;
	window.setInterval(function() {
		$('#text').fadeOut(500, function() {
			$('#text, #buttons').empty();
			splitTweet(tweets[current]);
			current = (current + 1) % numTweets;
			$('#text').fadeIn(500);
		});
    }, 10000);
}

function splitTweet(tweet){
	var end = tweet.length - 1;
	var search = tweet.search('<p class="interact">');
	var tweetText = tweet.slice(0,search);
	var buttons = tweet.slice(search, end);	
    $('#text').append(tweetText);
	$('#buttons').append(buttons);
}

$(document).ready(function() {
	
	$('#RE').fadeTo(1000, 1, function(){
		$('#SIS').fadeTo(1000, 1, function(){
			$('#TOR').fadeTo(1000, 1, function(){
				//$('#vincent').fadeTo(1000, 1);
			});
		});
	});
//	SC.oEmbed("http://soundcloud.com/resistorsings/vincent-van-gogh-1", {color: '#E6E6E6'}, document.getElementById('vincent'));
	
	twitterFetcher.fetch('438885011689713665', 'tweet', numTweets, true, false, true, undefined, true, handleTweets);
	
});
