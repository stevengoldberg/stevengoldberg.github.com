SC.initialize({
   client_id: "67f2822a454cafa2b800fc88cb5c0518",
   redirect_uri: 'http://stevengoldberg.github.io'
  });

var numTweets = 20;

function handleTweets(tweets){
    var currentTweet = Math.floor(Math.random()*numTweets);
	var initial = true;
	splitTweet(tweets[currentTweet]);
	currentTweet = (currentTweet + 1) % numTweets;
	window.setInterval(function() {
		$('#text').fadeOut(500, function() {
			$('#text, #buttons').empty();
			splitTweet(tweets[currentTweet]);
			currentTweet = (currentTweet + 1) % numTweets;
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

Track = function (trackId){
    var currentTrack = "";
	
    SC.stream(trackId, function(sound){
        currentTrack = sound;
	});

    this.play = function() {
        currentTrack.play({
			onfinish: function(){
        	$('#nextsong').click();
       	 	},
			whileplaying: function(){
				var percentComplete = ((this.position / this.duration) * 100);
				$('#progress').css('width', percentComplete + '%');
			}
		});
    };

    this.pause = function() {
        currentTrack.togglePause();
    };
	

    this.stop = function() {
        currentTrack.stop();
    };
};

Rotation = function(tracks) {
    var currentTrack = tracks[1];

    this.currentTrack = function() {
        return currentTrack;
    };

    this.nextTrack = function () {
        var currentIndex = tracks.indexOf(currentTrack);
        var nextTrackIndex = (currentIndex + 1) % tracks.length;
        var nextTrackId = tracks[nextTrackIndex];
        currentTrack = nextTrackId;
        return currentTrack
    };
	
    this.prevTrack = function () {
        var currentIndex = tracks.indexOf(currentTrack);
        var prevTrackIndex = (currentIndex - 1);
		if(prevTrackIndex<0){
			prevTrackIndex=(tracks.length)-1;
		}
        var prevTrackId = tracks[prevTrackIndex];
        currentTrack = prevTrackId;
        return currentTrack
    };
};

function changeTitle(newTrack, oldTrack){
	var titleHtml = "<a href='" + newTrack.permalink_url + "'>" + newTrack.title + "</a>"
	if(oldTrack){
		$('#title').fadeOut(500, function(){
			$('#title').empty();
			$('#title').append(titleHtml);
			$('#title').fadeIn(500);
		});
	}
	else{
		$('#title').append(titleHtml);
		$('#title').fadeIn(500);
	}
}


$(document).ready(function() {
	
	$('#RE').fadeTo(1000, 1, function(){
		$('#SIS').fadeTo(1000, 1, function(){
			$('#TOR').fadeTo(1000, 1, function(){
			});
		});
	});
	twitterFetcher.fetch('438885011689713665', 'tweet', numTweets, true, false, true, undefined, true, handleTweets);
	SC.get('/users/11021442/tracks', function(songs){
		var rotation = new Rotation(songs);
		var currentTrack = rotation.currentTrack();
		changeTitle(currentTrack, undefined);
		var currentPlayingTrack = new Track(currentTrack.uri);
		$('#play').on('click', function(e){
			e.preventDefault();
			if($('#soundcloud').hasClass('paused')){
				$('#soundcloud').removeClass('paused');
				$('#soundcloud').addClass('playing');
				currentPlayingTrack.pause();
				$('#pause').show();
				$('#play').hide();
			}
			else{
				$('#soundcloud').addClass('playing');
				currentPlayingTrack.play();
				$('#pause').show();
				$('#play').hide();
			}
		});

		$('#pause').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.pause();
			$('#soundcloud').addClass('paused');
			$('#soundcloud').removeClass('playing');
			$('#pause').hide();
			$('#play').show();
		});

		$('#nextsong').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.stop();
			currentTrack = rotation.nextTrack();
			currentPlayingTrack = new Track(currentTrack.uri);
			changeTitle(currentTrack, true);
			if($('#soundcloud').hasClass('playing')){
				currentPlayingTrack.play();
			}
			$('#soundcloud').removeClass('paused');
		});
		
		$('#prevsong').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.stop();
			currentTrack = rotation.prevTrack();
			currentPlayingTrack = new Track(currentTrack.uri);
			changeTitle(currentTrack, true);
			if($('#soundcloud').hasClass('playing')){
				currentPlayingTrack.play();
			}
			$('#soundcloud').removeClass('paused');
		});
	});
	getPhotos();
});

function getPhotos(){
	$.get('https://api.instagram.com/v1/users/252833323/media/recent/?client_id=027d4ba8024541bda9174d50c1592dfa', function(images){
		console.log(images);
		showPhotos(images.data);
	}, "jsonp");
}

function showPhotos(photos){
	var currentPhoto = Math.floor(Math.random()*photos.length);
	photoUrl = photos[currentPhoto].images.standard_resolution.url;
	photoLink = photos[currentPhoto].link;
	$('#photoContainer').append('<a href="' + photoLink + '">' + '<img src="' + photoUrl + '">' + '</a>');
	window.setInterval(function() {
		$('#photoContainer img').fadeOut(500, function() {
			$('#photoContainer').empty();
			currentPhoto = (currentPhoto + 1) % numTweets;
			photoUrl = photos[currentPhoto].images.standard_resolution.url;
			photoLink = photos[currentPhoto].link;
			$('#photoContainer').append('<a href="' + photoLink + '">' + '<img src="' + photoUrl + '">' + '</a>');
			$('#photoContainer img').fadeIn(500);
		});
    }, 7000);
}



