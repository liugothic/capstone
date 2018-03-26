var SEARCH_URL = 'https://rest.bandsintown.com/artists/';

var EVENT_RESULTS = {};

var SEARCH_TERM;

var ARTIST_IMAGE;


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
	var artistElement = $('.js-search-results-artist');
	var render_results = [];

	var moreOrLessButtonElement = $('<button type="button" class="more-or-less-artist more-or-less">-</button>');
	moreOrLessButtonElement.on('click', function()
	{
		var artistImageBlockElement = artistElement.find('.js-artist-image-block');
		if ($(this).text() === "-")
		{
			ARTIST_IMAGE = artistImageBlockElement.find('.js-artist-image');

			hide(artistElement);
			artistImageBlockElement.empty();
			$(this).text("+");
			$(this).css('border', 'none');
		}
		else
		{
			display(artistElement);
			artistImageBlockElement.append(ARTIST_IMAGE);
			$(this).text("-");
			$(this).css('border', '1px solid #ccc');
		}
	});
	render_results.push(moreOrLessButtonElement);

	var artistNameElement = $('<h2 class="js-artist-name artist-name"></h2>');

	var wikiLinkElement = $('<a class="artist-wiki" href="" target="_blank"></a>');
	wikiLinkElement.text(artistResult.name);
	wikiLinkElement.attr('href', 'https://en.wikipedia.org/wiki/' + artistResult.name);
	artistNameElement.append(wikiLinkElement);

	render_results.push(artistNameElement);

	var imageElement = $('<div class="js-artist-image-block"></div>');
	imageElement.append($('<img class="js-artist-image artist-image" src="">').attr('src', artistResult.thumb_url));
	render_results.push(imageElement);

    display(artistElement);

	artistElement.html(render_results);
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
	$('.js-timeline').html($(''));
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
	if (data.length === 0)
	{
		displayNoEvent();
		return;
	}

	processAddressMap(data);
}

function displayNoEvent()
{
	var element = $('.js-search-results-events');
	hide(element); 

	element.append($('<p>No events scheduled</p>'));
}

function processAddressMap(data)
{
	EVENT_RESULTS.addressMap = new Map();

	data.forEach((item, index) => 
	{
		var element = renderDateTicketElement(item, index);
		var date = item.datetime.split('T')[0];
		var address = item.venue.name + ', ' + (item.venue.region !== "" ? 
			item.venue.city + ', ' + item.venue.region + ', ' + item.venue.country :
			item.venue.city + ', ' + item.venue.country);

		var location = {latitude: item.venue.latitude, longitude: item.venue.longitude};
		if (EVENT_RESULTS.addressMap.has(address))
		{
			EVENT_RESULTS.addressMap.get(address).events.push(element);
			EVENT_RESULTS.addressMap.get(address).dates.push(date);
		}
		else
		{
			EVENT_RESULTS.addressMap.set(address, {dates: [date], location: location, events: [element]});
		}
	});

	EVENT_RESULTS.addressMap.forEach(((value, key) => 
	{
		displayOnMap(value, key, EVENT_RESULTS.addressMap.size);
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

function search()
{
	initMap(CURRENT_LOCATION.latitude, CURRENT_LOCATION.longitude);
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