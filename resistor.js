$(document).ready(function() {
	SC.initialize({
	    client_id: "67f2822a454cafa2b800fc88cb5c0518",
	  });
	SC.oEmbed("http://soundcloud.com/resistorsings/vincent-van-gogh-1", {color: '#E6E6E6'}, document.getElementById('vincent'));
	
	$('#RE').toggle('slide', 1000, function(){
		$('#SIS').toggle('slide', {direction: 'right'}, 1000, function(){
			$('#TOR').toggle('slide', 1000, function(){
				$('#vincent').fadeTo(1000, 1);
			});
		});
	});
});
