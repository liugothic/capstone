var SEARCH_URL = 'https://rest.bandsintown.com/artists/';

var EVENT_RESULTS_TEMPLATE = 
	'<div class="js-search-display search-display">\
		<p class="js-event-date event-date"></p>\
		<p class="js-venue-name venue-name clickable" data-tooltip="click me!"></p>\
		<p class="js-venue-location venue-location"></p>\
		<a class="js-ticket ticket" href="" target="_blank"></a>\
		<div class="js-id"></div>\
		<div class="js-map"></div>\
	</div>';

var ARTIST_NAME_TEMPLATE = 
	'<div class="js-artist-block artist-block">\
		<h2 class="js-artist-name artist-name clickable" data-tooltip="click me!"></h2>\
	</div>';

var ARTIST_IMAGE_TEMPLATE = '<img class="artist-image" src="">';

var PREV_PAGE_TEMPLATE = '<button class="js-prev-page"></button>';

var NEXT_PAGE_TEMPLATE = '<button class="js-next-page next-page"></button>';

var EVENT_RESULTS = {
	results: [],
	locations: [],
	current_index: 0
};

var PER_PAGE_NUMBER = 3;

var SEARCH_TERM;

function getArtistDataFromAPI(searchTerm, callBack, handleError){
	var query ={
		app_id: 'thinkful'	
	}
	var updatedUrl = SEARCH_URL + searchTerm;
	return $.getJSON(updatedUrl, query).done(callBack).fail(handleError);
}

function handleArtistData(data){
	displayArtistResult(data);

	getEventDataFromAPI(SEARCH_TERM, handleEventData, handleNoArtist);
}

function displayArtistResult(artistResult){
	var render_results = [];

	var artistNameBlockElement = $(ARTIST_NAME_TEMPLATE);
	artistNameBlockElement.find('.artist-name').text(artistResult.name);
	
	render_results.push(artistNameBlockElement);
	render_results.push($(ARTIST_IMAGE_TEMPLATE).attr('src', artistResult.thumb_url));

	$('.js-search-results-artist').html(render_results);
}

function handleNoArtist(){
	var element = $('<p></p>');
	element.text('Artist not exist, please check your spell.');
	$('.js-search-results-artist').html(element);
	$('.js-search-results-events').html($(''));
}

function getEventDataFromAPI(searchTerm, callBack){
	var query ={
		app_id: 'thinkful'	
	}
	var updatedUrl = SEARCH_URL + searchTerm + '/events';
	return $.getJSON(updatedUrl, query).done(callBack);
}

function handleEventData(data){	
	EVENT_RESULTS.results = [];
	EVENT_RESULTS.locations = [];
	EVENT_RESULTS.current_index = 0;

	data.forEach((item, index) => {
		EVENT_RESULTS.results.push(renderEventResult(item, index));
		EVENT_RESULTS.locations.push({latitude: item.venue.latitude, longitude: item.venue.longitude});
	});

	displayEventResults(true, true);
}

function renderEventResult(item, index){
	var element = $(EVENT_RESULTS_TEMPLATE);

	var datetime = item.datetime.replace('T', ' | ');
	element.find('.js-event-date').text(datetime);
	element.find('.js-venue-name').text(item.venue.name);
	element.find('.js-venue-location').text(item.venue.region !== "" ? 
		item.venue.city + ', ' + item.venue.region + ', ' + item.venue.country :
		item.venue.city + ', ' + item.venue.country);

	item.offers.forEach((iter, index) => {
		if (iter.type === "Tickets"){
			if (iter.status === "available"){
				element.find('.js-ticket').attr('href', iter.url).text('Get Ticket');
			}
			else{
				element.find('.js-ticket').remove();
				element.append($('<p class="no-ticket"></p>').text('No Ticket'));
			}
		}
	});

	element.find('.js-id').text(index).hide();

	return element;
}

function displayEventResults(firstCall, next){
	if (!firstCall)
	{
		updateCurrentIndex(next);
	}

	var render_results = [];

	if (EVENT_RESULTS.results.length === 0){
		handleNoEvent(render_results);
		return;
	}

	render_results.push($(PREV_PAGE_TEMPLATE).text('Prev'));
	render_results.push($(NEXT_PAGE_TEMPLATE).text('Next'));	

	EVENT_RESULTS.results.forEach((item, index) => {
	if (index >= EVENT_RESULTS.current_index && index <= EVENT_RESULTS.current_index + PER_PAGE_NUMBER - 1){ 
		render_results.push(item)};
	});

	$('.js-search-results-events').html(render_results);
}

function handleNoEvent(render_results){
	render_results.push($('<p></p>').text('No upcoming events.'));
	$('.js-search-results-events').html(render_results);
}

function updateCurrentIndex(next){
	var currentIndex = EVENT_RESULTS.current_index;
	if (next){
		var updatedIndex = EVENT_RESULTS.current_index + PER_PAGE_NUMBER;
		if (updatedIndex <= EVENT_RESULTS.results.length - 1)
		{
			EVENT_RESULTS.current_index = updatedIndex;
		}
	}
	if (!next){
		EVENT_RESULTS.current_index = Math.max(0, EVENT_RESULTS.current_index - PER_PAGE_NUMBER);
	}	
}


function search(){
	$('.js-search-form').submit(event => {
		event.preventDefault();
		var input = $(this).find('#js-search-query');
		SEARCH_TERM = input.val();
		input.val('');

		getArtistDataFromAPI(SEARCH_TERM, handleArtistData, handleNoArtist);
	});

	$('main').on('click', '.js-prev-page', event => {
		displayEventResults(false, false);
	})

	$('main').on('click', '.js-next-page', event => {
		displayEventResults(false, true);
	})
};

$(search);