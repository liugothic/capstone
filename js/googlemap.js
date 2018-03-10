function displayMap(className, location) {
	new GMaps({
	  div: '.' + className,
	  lat: location.latitude,
	  lng: location.longitude
	});
}

function displayMap(eventDisplayBlock){
	var mapElement = eventDisplayBlock.find('.js-map');

	var id = eventDisplayBlock.find('.js-id').text();
	var className = 'js-map' + id;

	mapElement.toggleClass(className);
	mapElement.toggleClass('display-map');

	var location = EVENT_RESULTS.locations[id];
	var map = new GMaps({
	  div: '.' + className,
	  lat: location.latitude,
	  lng: location.longitude
	});
	map.addMarker({
  		lat: location.latitude,
  		lng: location.longitude
	});
}

function showMap(){
	$('.js-search-results-events').on('click', '.js-venue-name', event =>{
		displayMap($(event.target).closest('.js-search-display'));
	})
}

$(showMap);