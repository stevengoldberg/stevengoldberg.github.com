SC.initialize({
   client_id: "67f2822a454cafa2b800fc88cb5c0518",
   redirect_uri: 'http://stevengoldberg.github.io'
  });

var numTweets = 20;

function handleTweets(tweets){
    var currentTweet = 0;
	splitTweet(tweets[currentTweet]);
	var prevRotation = 0;
	$('.prevTweet').click(function(e){
		e.preventDefault();
		prevRotation -= 40;
		$('img.oscillator.prevTweet').css('transform','rotate(' + prevRotation + 'deg)');
		currentTweet = (currentTweet==0) ? numTweets-1 : currentTweet-1;
		$('#text').fadeOut(500, function() {
			splitTweet(tweets[currentTweet]);
			$('#text').fadeIn(500);
		});
	});
	var nextRotation = 0;
	$('.nextTweet').click(function(e){
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
        	$('.nextSong').click();
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
	var titleHtml = "<a href='" + newTrack.permalink_url + "' onClick=ga('send', 'event', 'Soundcloud', 'Click', &#39;" + newTrack.title + "&#39;);>" + newTrack.title + "</a>";
	if(oldTrack){
		$('#title').fadeOut(500, function(){
			$('#title').html(titleHtml).fadeIn(500);
		});
	}
	else{
		$('#title').html(titleHtml).fadeIn(500);
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
	playSongs();
	getPhotos();
	showDates();
});


function getPhotos(){
	$.get('https://api.instagram.com/v1/users/252833323/media/recent/?client_id=027d4ba8024541bda9174d50c1592dfa', function(images){
		addPhotos(images.data);
		rotatePhotos(images.data);
	}, "jsonp");
}

function playSongs(){
	SC.get('/users/11021442/tracks', function(songs){
		var rotation = new Rotation(songs);
		var currentTrack = rotation.currentTrack();
		changeTitle(currentTrack, undefined);
		var currentPlayingTrack = new Track(currentTrack.uri);
		var $soundcloud = $('#soundcloud');
		var controlSize;
		$('.play').on('click', function(e){
			e.preventDefault();
			controlSize = ($(window).width() <= 700) ? '.small' : '.large';
			if($soundcloud.hasClass('paused')){
				$($soundcloud).removeClass('paused');
				$soundcloud.addClass('playing');
				currentPlayingTrack.pause();
				$(controlSize+'.pause').show();
				$(controlSize+'.play').hide();
			}
			else{
				controlSize = ($(window).width() <= 700) ? '.small' : '.large';
				$soundcloud.addClass('playing');
				currentPlayingTrack.play();
				ga('send', 'event', 'Soundcloud', 'Play', '&#39;' + currentTrack.title + '&#39;');
				$(controlSize+'.pause').show();
				$(controlSize+'.play').hide();
			}
		});

		$('.pause').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.pause();
			controlSize = ($(window).width() <= 700) ? '.small' : '.large';
			$soundcloud.addClass('paused');
			$soundcloud.removeClass('playing');
			$(controlSize+'.pause').hide();
			$(controlSize+'.play').show();
		});
		var nextRotation = 0;
		$('.nextSong').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.stop();
			currentTrack = rotation.nextTrack();
			currentPlayingTrack = new Track(currentTrack.uri);
			changeTitle(currentTrack, true);
			nextRotation += 40;
			$('#soundcloud img.knob.nextSong').css('transform','rotate(' + nextRotation + 'deg)');
			if($soundcloud.hasClass('playing')){
				currentPlayingTrack.play();
			}
			$soundcloud.removeClass('paused');
		});
		var prevRotation = 0;
		$('.prevSong').on('click', function(e){
			e.preventDefault();
			currentPlayingTrack.stop();
			currentTrack = rotation.prevTrack();
			currentPlayingTrack = new Track(currentTrack.uri);
			changeTitle(currentTrack, true);
			prevRotation -= 40;
			$('#soundcloud img.knob.prevSong').css('transform','rotate(' + prevRotation + 'deg)');
			if($soundcloud.hasClass('playing')){
				currentPlayingTrack.play();
			}
			$soundcloud.removeClass('paused');
		});
	});
}

function addPhotos(photos){
	$('#photoContainer').append('<a href="' + photos[0].link + '" onClick="ga(\'send\', \'event\',  \'Instagram\', &#39;' + photos[0].link + '&#39;);\">' + '<img id="slide0" src="' + photos[0].images.low_resolution.url + '">' + '</a>');
	$('#slide0').addClass('active');
	for(i=1;i<photos.length;i++){
		photoUrl = photos[i].images.low_resolution.url;
		photoLink = photos[i].link;
		$('#photoContainer').append('<a href="' + photoLink + '" onClick="ga(\'send\', \'event\', \'Instagram\', &#39;' + photoLink + '&#39;);>\">' + '<img id="slide' + (i) + '" src="' + photoUrl + '">' + '</a>');
	}
}

function rotatePhotos(photos){
	$('.nextPhoto').click(function(e){
		e.preventDefault();
		var $active = $('#photoContainer a img.active');
		var $next = ($active.parent().next().length > 0) ? $active.parent().next().contents() : $('#photoContainer a:first img');
		$next.css('z-index',2);
		$active.fadeOut(750,function(){
			$active.css('z-index',1).show().removeClass('active');
			$next.css('z-index',3).addClass('active');
		    });
	});
	$('.prevPhoto').click(function(e){
		e.preventDefault();
		var $active = $('#photoContainer a img.active');
		var $prev = ($active.parent().prev().length > 0) ? $active.parent().prev().contents() : $('#photoContainer a:last img');
		$prev.css('z-index',2);
		$active.fadeOut(750,function(){
			$active.css('z-index',1).show().removeClass('active');
			$prev.css('z-index',3).addClass('active');
		    });
	});	
}

function showDates(){
	$.getJSON('shows.json')
	.done(function(data){
		$("#upcomingDates").prepend("<h3>Upcoming Shows</h3>");
		for(i=0;i<data.shows.length;i++){
			if(isUpcoming(data.shows[i])){
				if(data.shows[i].url)
				{
					$("#upcomingDates ul").append("<li>" + data.shows[i].date + " - " + "<a href=\"http://" + data.shows[i].url + "\"" + ">" + data.shows[i].venue + "</a>" + " - " + data.shows[i].city + "</li>")
				}
				else{
					$("#upcomingDates ul").append("<li>" + data.shows[i].date + " - " + data.shows[i].venue + " - " + data.shows[i].city + "</li>")
				}
			}
		}
	})
	.fail(function (jqxhr, textStatus, error ) {
		var err = textStatus + ", " + error;
		console.log( "Request Failed: " + err );
	})
}

function isUpcoming(show){
	var showDate = Date.parse(show.date);
	var comparison = Date.today().compareTo(showDate);
	if(comparison != 1){return true;}
	else{return false;}
}


