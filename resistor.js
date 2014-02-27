$(document).ready(function() {
	$('#RE').toggle('slide', 1000, function(){
		$('#SIS').toggle('slide', {direction: 'right'}, 1000, function(){
			$('#TOR').toggle('slide', 1000);
		});
	});
});
