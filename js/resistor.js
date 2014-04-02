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
	twitterFetcher.fetch('438885011689713665', 'tweet', numTweets, true, false, true, undefined, true, handleTweets); // Print the tweets
	playSongs(); // Load the music player
	getPhotos(); // Load the photo viewer
	showDates(); // Load the show dates 
});

function handleTweets(tweets){
    var currentTweet = 0,
		prevRotation = 0,
		nextRotation = 0;
	splitTweet(tweets[currentTweet]); // Print the current tweet
	$('.prevTweet').click(function(e){ // Rotate the knob, fade out the text, replace it with the previous tweet in the list
		e.preventDefault();
		prevRotation -= 40;
		$('img.oscillator.prevTweet').css('transform','rotate(' + prevRotation + 'deg)');
		currentTweet = (currentTweet===0) ? numTweets-1 : currentTweet-1;
		$('#text').fadeOut(500, function() {
			splitTweet(tweets[currentTweet]);
			$('#text').fadeIn(500);
		});
	});
	$('.nextTweet').click(function(e){ //Rotate the knob, fade out the text, replace it with the next tweet in the list
		e.preventDefault();
		nextRotation += 40;
		$('img.oscillator.nextTweet').css('transform','rotate(' + nextRotation + 'deg)');
		currentTweet = (currentTweet + 1) % numTweets;
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

Track = function (trackId){
    var currentTrack = "";
    SC.stream(trackId, function(sound){
        currentTrack = sound;
	});
    this.play = function() {
        currentTrack.play({
			onfinish: function(){ // When a song ends, start the next song
        	$('.nextSong').click();
       	 	},
			whileplaying: function(){ // While a song is playing, update the progress bar
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
        var currentIndex = tracks.indexOf(currentTrack),
        	nextTrackIndex = (currentIndex + 1) % tracks.length,
        	nextTrackId = tracks[nextTrackIndex];
        currentTrack = nextTrackId;
        return currentTrack;
    };
    this.prevTrack = function () {
        var currentIndex = tracks.indexOf(currentTrack),
        	prevTrackIndex = (currentIndex - 1),
			prevTrackId = tracks[prevTrackIndex];
		if(prevTrackIndex<0){
			prevTrackIndex=(tracks.length)-1;
		}
        currentTrack = prevTrackId;
        return currentTrack;
    };
};

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

function getPhotos(){
	$.get('https://api.instagram.com/v1/users/252833323/media/recent/?client_id=027d4ba8024541bda9174d50c1592dfa', function(images){
		addPhotos(images.data);
		rotatePhotos();
	}, "jsonp");
}

function playSongs(){
	SC.get('/users/11021442/tracks', function(songs){
		var rotation = new Rotation(songs),
			currentTrack = rotation.currentTrack(),
			currentPlayingTrack = new Track(currentTrack.uri),
			$soundcloud = $('#soundcloud'),
			$nextKnob = $('#soundcloud img.knob.nextSong'),
			$prevKnob = $('#soundcloud img.knob.prevSong'),
			controlSize = ($(window).width() <= 700) ? '.small' : '.large',
			nextRotation = 0,
			prevRotation = 0;		
		changeTitle(currentTrack);
		$('.play').on('click', function(e){
			e.preventDefault();
			if($soundcloud.hasClass('paused')){
				$soundcloud.removeClass('paused').addClass('playing');
				currentPlayingTrack.pause();
				$(controlSize+'.pause').show();
				$(controlSize+'.play').hide();
			}
			else{
				$soundcloud.addClass('playing');
				currentPlayingTrack.play();
				ga('send', 'event', 'Soundcloud', 'Play', currentTrack.title);
				$(controlSize+'.pause').show();
				$(controlSize+'.play').hide();
			}
		});
		$('.pause').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.pause();
			$soundcloud.addClass('paused').removeClass('playing');
			$(controlSize+'.pause').hide();
			$(controlSize+'.play').show();
		});
		$('.nextSong').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.stop();
			currentTrack = rotation.nextTrack();
			currentPlayingTrack = new Track(currentTrack.uri);
			changeTitle(currentTrack, true);
			nextRotation += 40;
			$nextKnob.css('transform','rotate(' + nextRotation + 'deg)');
			if($soundcloud.hasClass('playing')){
				currentPlayingTrack.play();
			}
			$soundcloud.removeClass('paused');
		});
		$('.prevSong').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.stop();
			currentTrack = rotation.prevTrack();
			currentPlayingTrack = new Track(currentTrack.uri);
			changeTitle(currentTrack, true);
			prevRotation -= 40;
			$prevKnob.css('transform','rotate(' + prevRotation + 'deg)');
			if($soundcloud.hasClass('playing')){
				currentPlayingTrack.play();
			}
			$soundcloud.removeClass('paused');
		});
	});
	//playerStyle(); // Fix the style of the song player after it enters -- BREAKS FIREFOX
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
		.done(function(data){
			typewriter("shows_headline", "Upcoming Shows", 150);
			for(var i=0;i<data.shows.length;i++){
				if(isUpcoming(data.shows[i])){
					upcomingShows++;
					if(data.shows[i].url)
					{
						$("#upcomingDates ul").append("<li>" + data.shows[i].date + " - " + "<a href=\"http://" + data.shows[i].url + "\"" + 'onclick=\"ga(\'send\', \'event\', \'live\', \'' + data.shows[i].date + '\');">' + data.shows[i].venue + "</a>" + " - " + data.shows[i].city + "</li>");
					}
					else{
						$("#upcomingDates ul").append("<li>" + data.shows[i].date + " - " + data.shows[i].venue + " - " + data.shows[i].city + "</li>");
					}
				}
			}
			if(upcomingShows === 0){
				$("#upcomingDates ul").append("<li>" + "Shows TBD ... Check back soon ..." + "</li>");
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
	var showDate = Date.parse(show.date),
		comparison = Date.today().compareTo(showDate);
	if(comparison != 1)
		{return true;}
	else
		{return false;}
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