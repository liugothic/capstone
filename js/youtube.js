var YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
var YOUTUBE_PLAYLISTITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

var PLAYLIST_ITEM_TEMPLATE = '<a class="top-hit" href="" target="_blank"></a>';

var STATE = {
	artistName: '',
	contents: [],
	clicked: false
};


function getTopHitsPlayList(searchTerm, callBack){
	var query = {
		q: `top tracks ${searchTerm} in:playlist`,
		part: 'snippet',
		key: 'AIzaSyBERGANqxpkXtGEJR1XIMOvqfdAQczTPXA'
	};
	return $.getJSON(YOUTUBE_SEARCH_URL, query, callBack);
}

function handlePlayList(data){
	var playlistId = data.items[0].id.playlistId;

	getTopHits(playlistId, handlePlayListItems);
}

function getTopHits(playlistId, callBack){
	var query = {
		part: 'snippet',
		playlistId: `${playlistId}`,
		key: 'AIzaSyBERGANqxpkXtGEJR1XIMOvqfdAQczTPXA'
	};
	return $.getJSON(YOUTUBE_PLAYLISTITEMS_URL, query, callBack);
}

function handlePlayListItems(data){
	var results = [];

	results.push($('.js-artist-name'));

	data.items.forEach((item, index) => {
		results.push(renderPlayListItem(item));
	});

	STATE.artistName = $('.js-artist-name').text();
	STATE.contents = results;
	STATE.clicked = true;

	$('.js-artist-block').html(results);
}

function renderPlayListItem(item){
	var element = $(PLAYLIST_ITEM_TEMPLATE);
	element.text(item.snippet.title);
	element.attr('href', 'https://www.youtube.com/watch?v=' + item.snippet.resourceId.videoId);

	return element;
}

function showHits(){
	$('.js-search-results-artist').on('click', '.js-artist-block', event =>{
		if (!STATE.clicked){
			var searchTerm = $(this).find('.js-artist-name').text();
			if (searchTerm === STATE.artistName){
				$('.js-artist-block').html(STATE.contents);
				STATE.clicked = true;
			}
			else{
				getTopHitsPlayList(searchTerm, handlePlayList);
			}
		}
		else{
			$('.js-artist-block').html($('.js-artist-name'));
			STATE.clicked = false;
		}
	})
}

$(showHits);