var MAP;

var CURRENT_LOCATION = 
{
	latitude: 40.730610, 
	longitude: -73.935242
}

var PROCESSED_COUNT = 0;

var TIMELINE_ELEMENTS = [];

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
  		zoom: 4,
  		zoomControl: true,
      	zoomControlOptions: {
          position: google.maps.ControlPosition.LEFT_BOTTOM
      	},
      	mapTypeControl: true,
      	mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
          position: google.maps.ControlPosition.RIGHT_BOTTOM
      	},
      	streetViewControl: false,
      	fullscreenControl: true,
      	fullscreenControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
      	}
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

		  	var marker = 
		  	{
		        lat: lat,
		        lng: lng,
		        click: function(e)
		        {
		        	displayEvent(value, key);
		        	MAP.setCenter(lat, lng);
		        	MAP.setZoom(8);
		        }
		    };

		    MAP.addMarker(marker);    
		    processTimeLineElements(value.dates, marker);

		    PROCESSED_COUNT++;

		    if (PROCESSED_COUNT === totalCount)
			{
				onCompleteAllMarkers();
			}
	    }
	});
}

function displayEvent(value, key)
{
	var element = $('.js-search-results-events');
	display(element); 

	var render = [];

	var closeButtonElement = $('<button type="button" class="close">x</button>');
	closeButtonElement.on('click', function()
	{
		element.empty();
		hide(element);
		MAP.fitZoom();
	});
	render.push(closeButtonElement);

	var locationElement = $('<p class="address"></p>');
	locationElement.text(key);
	render.push(locationElement);  	
	
	value.events.forEach(event => 
	{
		render.push(event);
	})

	element.html(render);
}

function processTimeLineElements(dates, marker)
{
	dates.forEach((date, index) => 
	{
		var element = $('<div class="inline-block js-timeline-element timeline-element"></div>');
		element.text(date);

		element.on('click', function()
		{
			$(marker.click);
		});

		TIMELINE_ELEMENTS.push(element);
	});
}

function onCompleteAllMarkers()
{
	MAP.fitZoom();
	sortTimeLineElementArray(TIMELINE_ELEMENTS);
	$('.js-timeline').html(TIMELINE_ELEMENTS);

	TIMELINE_ELEMENTS = [];
	PROCESSED_COUNT = 0;
}

function sortTimeLineElementArray(array)
{
	array.sort(function(a,b)
	{
		var aInt = getDateInt(a.text());
		var bInt = getDateInt(b.text());
		return aInt - bInt;
	});
}

function getDateInt(dateString)
{
	var intArray = dateString.split('-');
	var int = intArray[0] * 10000 + intArray[1] * 100 + intArray[2];
	return int;
}