SC.initialize({										//Initialize soundcloud API
	client_id: "67f2822a454cafa2b800fc88cb5c0518",
	redirect_uri: 'http://resistorsings.com'
});

$(document).ready(function() {
	$('#RE').fadeTo(1000, 1, function(){	// Fade in the headline in 3 parts
		$('#SIS').fadeTo(1000, 1, function(){
			$('#TOR').fadeTo(1000, 1);
		});
	});
	twitterFetcher.fetch('438885011689713665', 'tweet', 20, true, false, true, undefined, true, handleTweets); // Fetch the last 20 tweets
	loadVideo(); // Load the video player
	photoViewer(); // Load the photo viewer
	songPlayer(); // Load the music player
	showDates(); // Load the show dates 
	loadImages(); // Load images based on screen size
	
	if ($(window).width() > 700){
		$('.home').data('mobile', false);
	}
	else{
		$('.home').data('mobile', true);
	}
	$(window).resize(resizeImages);
    $('#first-world-problems').on("click", "img", function() {
        $('#onlinestores').dialog({
            title: "FIRST WORLD PROBLEMS",
            height: "auto",
            modal: true,
            resizable: false,
            hide: "slideUp",
            show: "slideDown"
        });
    });
});

function loadImages(){
	var $imageSrc = $('.widget').children('a').filter('.responsive'),
		numImages = $imageSrc.length,
		contentWidth = $(window).width(),
		altTitle,
		imageArray = [];

	for(var i=0; i<numImages; i++){
		imageArray[i] = new Image();
		if(contentWidth > 700){
			imageArray[i].src = $imageSrc[i].href.replace("small", "large");
		}
		else{
			imageArray[i].src = $imageSrc[i].href;
		}
		altTitle = $imageSrc[i].title.split(". ");
		imageArray[i].title = altTitle[1];
		imageArray[i].alt = altTitle[0];
		imageArray[i].className = $imageSrc[i].className;
		$imageSrc[i].parentNode.replaceChild(imageArray[i], $imageSrc[i]);
		imageArray[i].addEventListener("load", function(){
			if(this.parentNode.id === "soundcloud"){
				this.parentNode.style.opacity = 0.85;
			}
			else{
				this.parentNode.style.opacity = 1;
			}
		}, false);
	}
}

function resizeImages(){
	var contentWidth = $(window).width(),
		$responsiveImages = $('.home').children(".widget").children(".responsive"),
		mobile = $('.home').data('mobile');
	
	if ((contentWidth < 700) && (mobile === false)){
    	$responsiveImages.each(function(){
        	var thisImg = $(this);
        	var newSrc = thisImg.attr('src').replace('large', 'small');
        	thisImg.attr('src', newSrc);
			$('.home').data('mobile', true);
			if(player){
				player.setSize(250, 141);
			}
		});
    }
	else if((contentWidth > 700) && (mobile === true)){
    	$responsiveImages.each(function(){
        	var thisImg = $(this);
        	var newSrc = thisImg.attr('src').replace('small', 'large');
        	thisImg.attr('src', newSrc);
			$('.home').data('mobile', false);
			if(player){	
				player.setSize(549, 309);
			}
		});
	}
}

function songPlayer(){
	var	$soundcloud = $('#soundcloud'),
		$nextKnob = $('.knob').filter('.next-song'),
		$prevKnob = $('.knob').filter('.prev-song'),
		nextRotation = 0,
		prevRotation = 0;
	SC.get('/users/11021442/tracks', function(songs){
		var rotation = function(){
			//private variables
			var trackIndex,
			song = {},
			currentTrack = {},
			title = "",
			$pause = $soundcloud.children('.pause'),
			$play = $soundcloud.children('.play');
			//initialization
			trackIndex = 0;
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
				if(direction === "forward"){
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
		    pause: function(){
		        song.togglePause();
				$soundcloud.addClass('paused').removeClass('playing');
				$pause.hide();
				$play.css('display', 'inline-block');
		    },
		    stop: function(){
		        song.stop();
		    }
		};
	}();
		
		rotation.newSong(false);
		$soundcloud.on('click', ".play", function(e){
			e.preventDefault();
			rotation.play();
		});
		$soundcloud.on('click', ".pause", function(e){
			e.preventDefault();
			rotation.pause();
		});
		$soundcloud.on('click', ".next-song", function(e){
			e.preventDefault();
			rotation.changeIndex("forward");
		});
		$soundcloud.on('click', ".prev-song", function(e){
			e.preventDefault();
			rotation.changeIndex();
		});
		$soundcloud.on('click', ".button", function(e){
			e.preventDefault();
			if($soundcloud.hasClass('playing')){
				rotation.pause();
			}
			else{
				rotation.play();
			}
		});
	});
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
		prevRotation = 0,
		numTweets = tweets.length;
	splitTweet(tweets[currentTweet]); // Print the current tweet
	$('.nextTweet, .prevTweet').click(function(e){ //Rotate the knob, fade out the text, replace it with the next tweet in the list
		e.preventDefault();
		if((e.currentTarget.classList[1]) === ('nextTweet')){
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
		var $active = $('#photoContainer').children('a').children('img').filter('.active'),
			$next = ($active.parent().next().length > 0) ? $active.parent().next().contents() : $('#photoContainer').children('a').first().children('img');
		$next.css('z-index',2);
		$active.fadeOut(750,function(){
			$active.css('z-index',1).show().removeClass('active');
			$next.css('z-index',3).addClass('active');
		    });
	});
	$('.prevPhoto').click(function(e){
		e.preventDefault();
		var $active = $('#photoContainer').children('a').children('img').filter('.active'),
			$prev = ($active.parent().prev().length > 0) ? $active.parent().prev().contents() : $('#photoContainer').children('a').last().children('img');
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
						$("#upcoming_dates").children("ul").append("<li>" + data.shows[i].date + " - " + "<a href=\"http://" + data.shows[i].url + "\"" + 'onclick=\"ga(\'send\', \'event\', \'live\', \'' + data.shows[i].date + '\');">' + data.shows[i].venue + "</a>" + " - " + data.shows[i].city + "</li>");
					}
					else{
						$("#upcoming_dates").children("ul").append("<li>" + data.shows[i].date + " - " + data.shows[i].venue + " - " + data.shows[i].city + "</li>");
					}
				}
				else{
					$("#past_dates").children("ul").append("<li>" + data.shows[i].date + " - " + data.shows[i].venue + " - " + data.shows[i].city + "</li>");
				}
			}
			if(upcomingShows === 0){
				$("#upcoming_dates").children("ul").append("<li>" + "Shows TBD ... Check back soon ..." + "</li>");
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

function typewriter(element, string, speed){
	var index = 0,
		target = document.getElementById(element);
	var	intObject = setInterval(function() {
		target.innerHTML+=string[index];
		index++;
		if(index===string.length){
			clearInterval(intObject);
		}
	}, speed);
}

function loadVideo(){
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
	
var player;
function onYouTubeIframeAPIReady() {
	var windowWidth = $(window).width(),
		playerWidth = 549,
		playerHeight = 309;
		
	if (windowWidth < 700){
		playerWidth = 250;
		playerHeight = 141;
	}
	
	var mobile = ( navigator.userAgent.match(/(mobi)/gi) ? true : false );
	if(mobile){
		$('.fullscreen').hide();
		$('#video').children('.play').hide();
	}
	
	player = new YT.Player('narcissist', {
		width: playerWidth,
		height: playerHeight,
		videoId: 'abGPBUadggA',
		playerVars: {
			controls: 0,
			modestbranding: 1,
			showinfo: 0,
			rel: 0
		},
        events: {
        	'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
          	}
		});
}
	
function onPlayerReady(event){
	playVideo();
}


function playVideo(){
	var $play = $('#video').children('.play'),
		$pause = $('#video').children('.pause'),
		$fullScreen = $('#video .fullscreen');
	$play.click(function(e){
		e.preventDefault();
		if(player.getPlayerState() === -1 || player.getPlayerState() === 0){
			ga('send', 'event', 'Youtube', 'Play', "Narcissist");
		}
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
}

function onPlayerStateChange(newState){
	var $play = $('#video').children('.play'),
		$pause = $('#video').children('.pause');
		
	switch(newState.data){
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
		exitFullscreenVideo();
		break;
	}
}

function fullScreenVideo(){
	var container = document.getElementById('narcissist');	
	
	if (container.requestFullScreen) {
	  	container.requestFullScreen();
	} else if (container.mozRequestFullScreen) {
	  	container.mozRequestFullScreen();
	} else if (container.webkitRequestFullScreen) {
	  	container.webkitRequestFullScreen();
	} else if (container.msRequestFullscreen) {
		container.msRequestFullscreen();
	}
}

function exitFullscreenVideo(){
	var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
	
	if(fullscreenElement){
		if (document.exitFullscreen) {
		      document.exitFullscreen();
		    } else if (document.msExitFullscreen) {
		      document.msExitFullscreen();
		    } else if (document.mozCancelFullScreen) {
		      document.mozCancelFullScreen();
		    } else if (document.webkitExitFullscreen) {
		      document.webkitExitFullscreen();
		    }
	}
}