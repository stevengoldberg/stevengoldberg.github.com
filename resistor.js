//SC.initialize({
//   client_id: "67f2822a454cafa2b800fc88cb5c0518",
//  });

var numTweets = 20;

function handleTweets(tweets){
    //var current = Math.floor(Math.random()*numTweets);
	var current = 0;
    var element = document.getElementById('tweet');
	var initial = true;
    $('#tweet ul li').append(tweets[current]);
	current = (current + 1) % numTweets;
	window.setInterval(function() {
		$('#tweet ul').fadeOut(500, function() {
			$('#tweet ul li').empty();
			$('#tweet ul li').append(tweets[current]);
			current = (current + 1) % numTweets;
			$('#tweet ul').fadeIn(500);
		});
    }, 10000);
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
	
	twitterFetcher.fetch('438885011689713665', 'tweet', numTweets, true, false, false, undefined, true, handleTweets);
	
});
