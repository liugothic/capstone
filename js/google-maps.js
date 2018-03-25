var MAP;

var CURRENT_LOCATION = 
{
	latitude: 40.730610, 
	longitude: -73.935242
}

var PROCESSED_COUNT = 0;

function getCurrentLocation()
{
	GMaps.geolocate(
	{
	  success: function(position) 
	  {
	  	initMap(position.coords.latitude, position.coords.longitude);
	  	CURRENT_LOCATION = position.coords;
	  },
	  error: function(error) 
	  {
	    alert('Geolocation failed: ' + error.message + ', will use default Geolocation.');
	  },
	  not_supported: function() 
	  {
	    alert("Your browser does not support geolocation");
	  },
	  always: function() 
	  {
	  }
	});
}

function initMap(latitude, longitude)
{
	MAP = new GMaps(
	{
  		div: '.map',
  		lat: latitude,
  		lng: longitude,
  		zoom: 4
	});
}

function displayOnMap(value, key, totalCount)
{
	GMaps.geocode(
	{
	  	address: key,
	  	callback: function(results, status)
	  	{
		  	var lat;
		  	var lng;
		    if (status == 'OK') 
		    {
		      	var latlng = results[0].geometry.location;
		      	lat = latlng.lat();
		      	lng = latlng.lng();
		  	}
		  	else 
		  	{
		  		lat = value.location.latitude;
		  		lng = value.location.longitude;
		  	}

		    MAP.addMarker(
		    {
		        lat: lat,
		        lng: lng,
		        click: function(e){
		        	displayEvent(value, key);
		        	MAP.setCenter(lat, lng);
		        	MAP.setZoom(8);
		        }
		    });

		    PROCESSED_COUNT++;

		    if (PROCESSED_COUNT === totalCount)
			{
				MAP.fitZoom();
				PROCESSED_COUNT = 0;
			}
	    }
	});
}

function displayEvent(value, key)
{
	display($('.js-search-results-events')); 

	var render = [];

	var closeButtonElement = $('<button type="button" class="close">x</button>');
	closeButtonElement.on('click', function()
	{
		$('.js-search-results-events').empty();
		hide($('.js-search-results-events'));
	});
	render.push(closeButtonElement);

	var locationElement = $('<p class="address"></p>');
	locationElement.text(key);
	render.push(locationElement);  	
	
	value.events.forEach(event => 
	{
		render.push(event);
	})

	$('.js-search-results-events').html(render);
}