function displayMap(eventDisplayBlock){
	var mapElement = eventDisplayBlock.find('.js-map');

	var id = eventDisplayBlock.find('.js-id').text();
	var className = 'js-map' + id;

	mapElement.toggleClass(className);
	mapElement.toggleClass('display-map');

	var map = new GMaps({
	  div: '.' + className
	});

	var location = eventDisplayBlock.find('.js-venue-name').text() + ', ' + eventDisplayBlock.find('.js-venue-location').text();
	GMaps.geocode({
	  address: location,
	  callback: function(results, status) {
	    if (status == 'OK') {
	      var latlng = results[0].geometry.location;
	      map.setCenter(latlng.lat(), latlng.lng());
	      map.addMarker({
	        lat: latlng.lat(),
	        lng: latlng.lng()
	      });
	    }
	  }
	});
}

function showMap(){
	$('.js-search-results-events').on('click', '.js-venue-name', event =>{
		displayMap($(event.target).closest('.js-search-display'));
	})
}

$(showMap);