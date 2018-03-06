var SEARCH_URL = 'https://rest.bandsintown.com/artists/';

var EVENT_RESULTS_TEMPLATE = 
	'<div class="search-display">\
		<p class="event-date"></p>\
		<p class="venue-name"></p>\
		<p class="venue-location"></p>\
		<a class="ticket" href="" target="_blank"></a>\
	</div>';

var ARTIST_NAME_TEMPLATE = 
	'<div class="js-artist-name-block artist-name-block">\
		<h2 class="artist-name"></h2>\
	</div>';

var ARTIST_IMAGE_TEMPLATE = '<img class="artist-image" src="">';

var PREV_PAGE_TEMPLATE = '<button class="js-prev-page"></button>';

var NEXT_PAGE_TEMPLATE = '<button class="js-next-page next-page"></button>';

var ARTIST_RESULT = {};

var EVENT_RESULTS = {
	results: [],
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
	ARTIST_RESULT = data;

	getEventDataFromAPI(SEARCH_TERM, handleEventData, handleNoArtist);
}

function handleNoArtist(){
	var element = $('<p></p>');
	element.text('Artist not exist, please check your spell.');
	$('.js-search-results').html(element);
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
	EVENT_RESULTS.current_index = 0;

	data.forEach((item, index) => {
		EVENT_RESULTS.results.push(renderEventResult(item));
	});
	displayEventResults(true, true);
}

function renderEventResult(item){
	var element = $(EVENT_RESULTS_TEMPLATE);

	var datetime = item.datetime.replace('T', ' | ');
	element.find('.event-date').text(datetime);
	element.find('.venue-name').text(item.venue.name);
	element.find('.venue-location').text(item.venue.region !== "" ? 
		item.venue.city + ', ' + item.venue.region + ', ' + item.venue.country :
		item.venue.city + ', ' + item.venue.country);

	item.offers.forEach((iter, index) => {
		if (iter.type === "Tickets"){
			if (iter.status === "available"){
				element.find('.ticket').attr('href', iter.url).text('Get Ticket');
			}
			else{
				element.find('.ticket').remove();
				element.append($('<p class="no-ticket"></p>').text('No Ticket'));
			}
		}
	});

	return element;
}

function displayEventResults(firstCall, next){
	if (!firstCall)
	{
		updateCurrentIndex(next);
	}

	var render_results = [];

	var artistNameBlockElement = $(ARTIST_NAME_TEMPLATE);
	artistNameBlockElement.find('.artist-name').text(ARTIST_RESULT.name);
	
	render_results.push(artistNameBlockElement);
	render_results.push($(ARTIST_IMAGE_TEMPLATE).attr('src', ARTIST_RESULT.thumb_url));

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

	$('.js-search-results').html(render_results);
}

function handleNoEvent(render_results){
	render_results.push($('<p></p>').text('No upcoming events.'));
	$('.js-search-results').html(render_results);
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