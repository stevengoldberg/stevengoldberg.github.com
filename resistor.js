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
			//$('#text, #buttons').empty();
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
    $('#text').html(tweetText);
	$('#buttons').html(buttons);
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
		//showPhotos(images.data);
		addPhotos(images.data);
		rotatePhotos(images.data);
	}, "jsonp");
}


function addPhotos(photos){
	$('#photoContainer').append('<a href="' + photos[0].link + '">' + '<img id="slide0" src="' + photos[0].images.standard_resolution.url + '">' + '</a>');
	$('#slide0').addClass('active');
	/*$('#photoContainer').hover(function(){
		$('#photoContainer a img.active').css('opacity','1');
	}, function(){
		$('#photoContainer a img.active').css('opacity','.75');
	});*/
	for(i=1;i<photos.length;i++){
		photoUrl = photos[i].images.standard_resolution.url;
		photoLink = photos[i].link;
		$('#photoContainer').append('<a href="' + photoLink + '">' + '<img id="slide' + (i) + '"' + 'src="' + photoUrl + '">' + '</a>');
	}
}

function rotatePhotos(photos){
	window.setInterval(function() {
		var $active = $('#photoContainer a img.active');
		var $next = ($active.parent().next().length > 0) ? $active.parent().next().contents() : $('#photoContainer a:first img');
		$next.css('z-index',2);
		$active.fadeOut(1000,function(){
			$active.css('z-index',1).show().removeClass('active');
			$next.css('z-index',3).addClass('active');
		    });
		 }, 7000);
	}


