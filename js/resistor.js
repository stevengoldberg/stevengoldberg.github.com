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
	playSongs(); // Load the music player
	getPhotos(); // Load the photo viewer
	showDates(); // Load the show dates 
});

function playSongs(){
	var	$soundcloud = $('#soundcloud'),
		$nextKnob = $('.knob.nextSong'),
		$prevKnob = $('.knob.prevSong'),
		$nextSong = $('.nextSong'),
		$prevSong = $('.prevSong'),
		$pause = $('.pause'),
		$play = $('.play'),
		$button = $('.button'),
		nextRotation = 0,
		prevRotation = 0;
	SC.get('/users/11021442/tracks', function(songs){
		var rotation = {
			trackIndex: 1,
			song: {},
			currentTrack: {},
			title: "",
			init: function(){
				this.currentTrack = songs[this.trackIndex];
				this.title = this.currentTrack.title;
		    	this.newSong(this.currentTrack, false);
				},
			newSong: function(track, fade){
			    SC.stream(track.uri, function(sound){
					rotation.song = sound;
				});
				changeTitle(track, fade);
				this.title = track.title;
				if($soundcloud.hasClass('playing')){
					this.play();
				}
				$soundcloud.removeClass('paused');
			},
		    changeIndex: function(direction){
				this.song.stop();
				if(direction=="forward"){
					this.trackIndex = (this.trackIndex + 1) % songs.length;
				}
				else{
					this.trackIndex = (this.trackIndex + songs.length-1) % songs.length;
				}
				this.currentTrack = songs[this.trackIndex];
			    this.newSong(this.currentTrack, true);
			},
			play: function(){
		        ga('send', 'event', 'Soundcloud', 'Play', this.title);
				this.song.play({
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
		        this.song.togglePause();
		    },
		    stop: function() {
		        this.song.stop();
		    }
		};
		
		rotation.init();
		($play).on('click', function(e){
			e.preventDefault();
			rotation.play();
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
		});
		$pause.on('click', function(e){
			e.preventDefault();
			rotation.pause();
			$soundcloud.addClass('paused').removeClass('playing');
			$pause.hide();
			$play.show();
		});
		$nextSong.on('click', function(e){
			e.preventDefault();
			rotation.changeIndex("forward");
			nextRotation += 40;
			$nextKnob.css('transform','rotate(' + nextRotation + 'deg)');
		});
		$prevSong.on('click', function(e){
			e.preventDefault();
			rotation.changeIndex();
			prevRotation -= 40;
			$prevKnob.css('transform','rotate(' + prevRotation + 'deg)');
		});
		$button.on('click', function(e){
			e.preventDefault();
			if($soundcloud.hasClass('playing')){
				$pause.click();
			}
			else{
				$play.click();
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

function getPhotos(){
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