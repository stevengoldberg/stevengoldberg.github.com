SC.initialize({										//Initialize soundcloud API
   client_id: "67f2822a454cafa2b800fc88cb5c0518",
   redirect_uri: 'http://resistorsings.com'
});

$(document).ready(function() {
	numTweets = 20;
	window.scrollReveal = new scrollReveal(); // Activate scrollReveal plugin for sliding element entrances
	$('#RE').fadeTo(1000, 1, function(){	// Fade in the headline in 3 parts
		$('#SIS').fadeTo(1000, 1, function(){
			$('#TOR').fadeTo(1000, 1, function(){
			});
		});
	});
	twitterFetcher.fetch('438885011689713665', 'tweet', numTweets, true, false, true, undefined, true, handleTweets); // Fetch the last 20 tweets
	songPlayer(); // Load the music player
	photoViewer(); // Load the photo viewer
	showDates(); // Load the show dates 
	loadVideo(); // Load the video player
});

function songPlayer(){
	var	$soundcloud = $('#soundcloud'),
		$nextKnob = $('.knob.nextSong'),
		$prevKnob = $('.knob.prevSong'),
		$nextSong = $('.nextSong'),
		$prevSong = $('.prevSong'),
		$pause = $('#soundcloud .pause'),
		$play = $('#soundcloud .play'),
		$button = $('.button'),
		nextRotation = 0,
		prevRotation = 0;
	SC.get('/users/11021442/tracks', function(songs){
		var rotation = function(){
			//private variables
			var trackIndex,
			song = {},
			currentTrack = {},
			title = "";
			//initialization
			trackIndex = 1;
			currentTrack = songs[trackIndex];
			title = currentTrack.title;
			//public interface	
		return {	
			newSong: function(fade){
				var track = currentTrack;
			    SC.stream(track.uri, function(sound){
					song = sound;
				});
				changeTitle(track, fade);
				title = track.title;
				if($soundcloud.hasClass('playing')){
					rotation.play();
				}
				$soundcloud.removeClass('paused');
			},
		    changeIndex: function(direction){
				song.stop();
				if(direction=="forward"){
					trackIndex = (trackIndex + 1) % songs.length;
					nextRotation += 40;
					$nextKnob.css('transform','rotate(' + nextRotation + 'deg)');
				}
				else{
					trackIndex = (trackIndex + songs.length-1) % songs.length;
					prevRotation -= 40;
					$prevKnob.css('transform','rotate(' + prevRotation + 'deg)');
				}
				currentTrack = songs[trackIndex];
			    rotation.newSong(true);
			},
			play: function(){
		        ga('send', 'event', 'Soundcloud', 'Play', title);
				if($soundcloud.hasClass('paused')){
					$soundcloud.removeClass('paused').addClass('playing');
					$pause.show();
					$play.hide();
				}
				else{
					$soundcloud.addClass('playing');
					$pause.show();
					$play.hide();
				}
				song.play({
					onfinish: function(){ // When a song ends, start the next song
						rotation.changeIndex("forward");
		       	 	},
					whileplaying: function(){ // While a song is playing, update the progress bar
						this.percentComplete = ((this.position / this.duration) * 100);
						$('#progress').css('width', this.percentComplete + '%');
					}
				});
		    },
		    pause: function() {
		        song.togglePause();
				$soundcloud.addClass('paused').removeClass('playing');
				$pause.hide();
				$play.show();
		    },
		    stop: function() {
		        song.stop();
		    }
		};
	}();
		
		rotation.newSong(false);
		$play.on('click', function(e){
			e.preventDefault();
			rotation.play();
		});
		$pause.on('click', function(e){
			e.preventDefault();
			rotation.pause();
		});
		$nextSong.on('click', function(e){
			e.preventDefault();
			rotation.changeIndex("forward");
		});
		$prevSong.on('click', function(e){
			e.preventDefault();
			rotation.changeIndex();
		});
		$button.on('click', function(e){
			e.preventDefault();
			if($soundcloud.hasClass('playing')){
				rotation.pause();
			}
			else{
				rotation.play();
			}
		});
	});
	//playerStyle(); // Fix the style of the song player after it enters -- BREAKS FIREFOX
}

function changeTitle(newTrack, oldTrack){
	var titleHtml = "<a href='" + newTrack.permalink_url + "' onClick=ga('send', 'event', 'Soundcloud', 'Click', " + newTrack.title + ");>" + newTrack.title + "</a>";
	if(oldTrack){
		$('#title').fadeOut(500, function(){
			$('#title').html(titleHtml).fadeIn(500);
		});
	}
	else{ // If changing tracks, fade the old one out first
		$('#title').html(titleHtml).fadeIn(500);
	}
}

function handleTweets(tweets){
    var currentTweet = 0,
		nextRotation = 0,
		prevRotation = 0;
	splitTweet(tweets[currentTweet]); // Print the current tweet
	$('.nextTweet, .prevTweet').click(function(e){ //Rotate the knob, fade out the text, replace it with the next tweet in the list
		e.preventDefault();
		if((e.currentTarget.classList[1]) == ('nextTweet')){
			nextRotation += 40;
			currentTweet = (currentTweet + 1) % numTweets;
			$(this).css('transform','rotate(' + nextRotation + 'deg)');
			}
		else{
			prevRotation -= 40;
			currentTweet = (currentTweet + numTweets-1) % numTweets;
			$(this).css('transform','rotate(' + prevRotation + 'deg)');
		}
		$('#text').fadeOut(500, function() {
			splitTweet(tweets[currentTweet]);
			$('#text').fadeIn(500);
		});
	});
}

function splitTweet(tweet){
	var end = tweet.length - 1,
		search = tweet.search('<p class="interact">'), 
		tweetText = tweet.slice(0,search),
		buttons = tweet.slice(search, end);	
    $('#text').html(tweetText); // Print the body of the tweet to the main panel and the interaction buttons to the switches
	$('#buttons').html(buttons);
}

function photoViewer(){
	$.get('https://api.instagram.com/v1/users/252833323/media/recent/?client_id=027d4ba8024541bda9174d50c1592dfa', function(images){
		addPhotos(images.data);
		rotatePhotos();
	}, "jsonp");
}

function addPhotos(photos){
	var photoUrl = "",
		photoLink = "";
	$('#photoContainer').append('<a href="' + photos[0].link + '" onClick="ga(\'send\', \'event\',  \'Instagram\', &#39;' + photos[0].link + '&#39;);\">' + '<img id="slide0" src="' + photos[0].images.low_resolution.url + '">' + '</a>');
	$('#slide0').addClass('active');
	for(var i=1;i<photos.length;i++){
		photoUrl = photos[i].images.low_resolution.url;
		photoLink = photos[i].link;
		$('#photoContainer').append('<a href="' + photoLink + '" onClick="ga(\'send\', \'event\', \'Instagram\', &#39;' + photoLink + '&#39;);>\">' + '<img id="slide' + (i) + '" src="' + photoUrl + '">' + '</a>');
	}
}

function rotatePhotos(){
	$('.nextPhoto').click(function(e){
		e.preventDefault();
		var $active = $('#photoContainer a img.active'),
			$next = ($active.parent().next().length > 0) ? $active.parent().next().contents() : $('#photoContainer a:first img');
		$next.css('z-index',2);
		$active.fadeOut(750,function(){
			$active.css('z-index',1).show().removeClass('active');
			$next.css('z-index',3).addClass('active');
		    });
	});
	$('.prevPhoto').click(function(e){
		e.preventDefault();
		var $active = $('#photoContainer a img.active'),
			$prev = ($active.parent().prev().length > 0) ? $active.parent().prev().contents() : $('#photoContainer a:last img');
		$prev.css('z-index',2);
		$active.fadeOut(750,function(){
			$active.css('z-index',1).show().removeClass('active');
			$prev.css('z-index',3).addClass('active');
		    });
	});	
}

function showDates(){
	var printed = false,
		upcomingShows = 0;
	//$('#live').watch('opacity', function(){	
	if(!printed){	
		$.getJSON('shows.json')
		.success(function(data){
			typewriter("upcoming_shows", "Upcoming Shows", 150);
			typewriter("past_shows", "Past Shows", 150);
			for(var i=0;i<data.shows.length;i++){
				if(isUpcoming(data.shows[i].date)){
					upcomingShows++;
					if(data.shows[i].url)
					{
						$("#upcoming_dates ul").append("<li>" + data.shows[i].date + " - " + "<a href=\"http://" + data.shows[i].url + "\"" + 'onclick=\"ga(\'send\', \'event\', \'live\', \'' + data.shows[i].date + '\');">' + data.shows[i].venue + "</a>" + " - " + data.shows[i].city + "</li>");
					}
					else{
						$("#upcoming_dates ul").append("<li>" + data.shows[i].date + " - " + data.shows[i].venue + " - " + data.shows[i].city + "</li>");
					}
				}
				else{
					$("#past_dates ul").append("<li>" + data.shows[i].date + " - " + data.shows[i].venue + " - " + data.shows[i].city + "</li>");
				}
			}
			if(upcomingShows === 0){
				$("#upcoming_dates ul").append("<li>" + "Shows TBD ... Check back soon ..." + "</li>");
			}
		})
		.fail(function (jqxhr, textStatus, error ) {
			var err = textStatus + ", " + error;
			console.log( "Request Failed: " + err );
		});
	printed = true;
	}
}

function isUpcoming(show){
	var today = Date.now(),
		compare = new Date(show);
	if(today < compare){
		return true;
	}
	else{
		return false;
	}
}

function playerStyle(){
	$('#soundcloud').watch('opacity', function(){
		if(((this).style('opacity')) == 1){
			$(this).css({"opacity":".85", "transition": "opacity .6s", "-webkit-transition": "opacity .6s"});
		}
	});
}

function typewriter(element, string, speed){
	var index = 0;
	var	intObject = setInterval(function() {
		document.getElementById(element).innerHTML+=string[index];
		index++;
		if(index==string.length){
			clearInterval(intObject);
		}
	}, speed);
}

function loadVideo(){
	var params = { allowScriptAccess: "always" },
		atts = { id: "myytplayer" };
	swfobject.embedSWF("http://www.youtube.com/v/ToJSB43V_JU?controls=0&enablejsapi=1&fs=1&modestbranding=1&rel=0&showinfo=0&version=3&playerapiid=ytplayer",
	                       "narcissist", "549", "309", "8", null, null, params, atts);
}

function onYouTubePlayerReady(playerId) {
	var videoPlayer = document.getElementById("myytplayer");
	playVideo(videoPlayer);
}

function playVideo(player){
	var $play = $('#video .play'),
		$pause = $('#video .pause'),
		$fullScreen = $('#video .fullscreen');
	$play.click(function(e){
		e.preventDefault();
		player.playVideo();
	});
	$pause.click(function(e){
		e.preventDefault();
		player.pauseVideo();
	});
	$fullScreen.click(function(e){
		e.preventDefault();
		fullScreenVideo(player);
	});
	player.addEventListener("onStateChange", "onVideoPlayerStateChange");
}

function onVideoPlayerStateChange(newState){
	var $play = $('#video .play'),
		$pause = $('#video .pause'),
		player = document.getElementById("myytplayer");
		
	switch(newState){
	case 1:
		$play.hide();
		$pause.show();
		break;
	case 2:
		$pause.hide();
		$play.show();
		break;
	case 0:
		$pause.hide();
		$play.show();
		exitFullscreenVideo(player);
		break;
	}
}


function fullScreenVideo(player){
	var videoWidth = screen.width,
		videoHeight = videoWidth / 16 * 9;
	
	document.addEventListener("fullscreenchange", function(){exitFullscreenVideo(player)}, false);
	document.addEventListener("mozfullscreenchange", function(){exitFullscreenVideo(player)}, false);
	document.addEventListener("webkitfullscreenchange", function(){exitFullscreenVideo(player)}, false);
	document.addEventListener("msfullscreenchange", function(){exitFullscreenVideo(player)}, false);
	
	if (player.requestFullScreen) {
	  	player.requestFullScreen();
	} else if (player.mozRequestFullScreen) {
	  	player.mozRequestFullScreen();
	} else if (player.webkitRequestFullScreen) {
	  	player.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	} else if (player.msRequestFullscreen) {
		player.msRequestFullscreen();
	}
	player.setAttribute("width", videoWidth + "px");
	player.setAttribute("height", videoHeight + "px");
	
	window.addEventListener("keydown", function(){exitFullscreenVideo(player)}, true);
}

function exitFullscreenVideo(player){
	var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	
	if(!fullscreenElement){
		if (player.exitFullscreen) {
		      player.exitFullscreen();
		    } else if (player.msExitFullscreen) {
		      player.msExitFullscreen();
		    } else if (player.mozCancelFullScreen) {
		      player.mozCancelFullScreen();
		    } else if (player.webkitExitFullscreen) {
		      player.webkitExitFullscreen();
		    }
		player.setAttribute("width", "549px");
		player.setAttribute("height", "309px");	
		player.setAttribute("fullscreen", "false");			
	}
}