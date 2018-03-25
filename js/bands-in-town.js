var SEARCH_URL = 'https://rest.bandsintown.com/artists/';

var EVENT_RESULTS = {};

var SEARCH_TERM;

var MAP;

var CURRENT_LOCATION;

function getArtistDataFromAPI(searchTerm, callBack, handleError)
{
	var query =
	{
		app_id: 'thinkful'	
	}
	var updatedUrl = SEARCH_URL + searchTerm;
	return $.getJSON(updatedUrl, query).done(callBack).fail(handleError);
}

function handleArtistData(data)
{
	clear();
	displayArtistResult(data);
	showHits(data.name);
	getEventDataFromAPI(SEARCH_TERM, handleEventData, handleNoArtist);
}

function displayArtistResult(artistResult)
{
	var render_results = [];

	var artistNameElement = $('<h2 class="js-artist-name artist-name"></h2>');
	artistNameElement.text(artistResult.name);
	
	render_results.push(artistNameElement);
	render_results.push($('<img class="artist-image" src="">').attr('src', artistResult.thumb_url));

    display($('.js-search-results-artist'));

	$('.js-search-results-artist').html(render_results);
}

function clear()
{
	MAP.removeMarkers();
	MAP.setZoom(4);
	MAP.setCenter(CURRENT_LOCATION.latitude, CURRENT_LOCATION.longitude);
	hide($('.js-search-results-artist'));
	hide($('.js-search-results-events'));
	hide($('.js-search-results-hits'));
	$('.js-search-results-events').html($(''));
	$('.js-search-results-hits').html($(''));
}

function hide(element)
{
	if (element.hasClass('search-display'))
	{
		element.toggleClass('search-display');
	}
}

function display(element)
{
	if (!element.hasClass('search-display'))
	{
		element.toggleClass('search-display');
	}
}

function handleNoArtist()
{
	clear();

	$('.js-search-results-artist').html($('<p>Artist not exist, please check your spell.</p>'));
}

function getEventDataFromAPI(searchTerm, callBack)
{
	var query ={
		app_id: 'thinkful'	
	}
	var updatedUrl = SEARCH_URL + searchTerm + '/events';
	return $.getJSON(updatedUrl, query).done(callBack);
}

function handleEventData(data)
{	
	EVENT_RESULTS.results = new Map();
	EVENT_RESULTS.locations = [];

	data.forEach((item, index) => 
	{
		var element = renderDateTicketElement(item, index);
		var address = item.venue.name + ', ' + (item.venue.region !== "" ? 
			item.venue.city + ', ' + item.venue.region + ', ' + item.venue.country :
			item.venue.city + ', ' + item.venue.country);

		var location = {latitude: item.venue.latitude, longitude: item.venue.longitude};
		if (EVENT_RESULTS.results.has(address))
		{
			EVENT_RESULTS.results.get(address).events.push(element);
		}
		else
		{
			EVENT_RESULTS.results.set(address, {location: location, events: [element]});
		}
	});

	EVENT_RESULTS.results.forEach(((value, key) => 
	{
		displayOnMap(value, key);
	}))
}

function renderDateTicketElement(item, index)
{
	var element = $('<div></div>');

	var dateElement = $('<p class="inline-block"></p>');
	var datetime = item.datetime.replace('T', ' | ');
	dateElement.text(datetime);
	element.append(dateElement);

	var ticketElement = $('<a class="ticket inline-block" href="" target="_blank"></a>');
	item.offers.forEach((iter, index) => 
	{
		if (iter.type === "Tickets")
		{
			if (iter.status === "available")
			{
				ticketElement.attr('href', iter.url).text('Get Ticket');
				element.append(ticketElement);
			}
			else
			{
				ticketElement.remove();
				element.append($('<p class="no-ticket"></p>').text('No Ticket'));
			}
		}
	});

	return element;
}

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
	    alert('Geolocation failed: ' + error.message);
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

function displayOnMap(value, key)
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
	    }
	});
}

function displayEvent(value, key)
{
	display($('.js-search-results-events'));  

	var render = [];

	var locationElement = $('<p></p>');
	locationElement.text(key);
	render.push(locationElement);  	
	
	value.events.forEach(event => 
	{
		render.push(event);
	})

	$('.js-search-results-events').html(render);
}

function search()
{
	initMap(40.730610, -73.935242);
	getCurrentLocation();

	$('.js-search-form').submit(event => 
	{
		event.preventDefault();
		var input = $(this).find('#js-search-query');
		SEARCH_TERM = input.val();
		input.val('');

		getArtistDataFromAPI(SEARCH_TERM, handleArtistData, handleNoArtist);
	});
};

$(search);