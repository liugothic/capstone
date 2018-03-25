var YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
var YOUTUBE_PLAYLISTITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';


function getTopHitsPlayList(searchTerm, callBack)
{
	var query = 
	{
		q: `top tracks ${searchTerm} in:playlist`,
		part: 'snippet',
		key: 'AIzaSyBERGANqxpkXtGEJR1XIMOvqfdAQczTPXA'
	};
	return $.getJSON(YOUTUBE_SEARCH_URL, query, callBack);
}

function handlePlayList(data)
{
	var playlistId = data.items[0].id.playlistId;

	getTopHits(playlistId, handlePlayListItems);
}

function getTopHits(playlistId, callBack)
{
	var query = 
	{
		part: 'snippet',
		playlistId: `${playlistId}`,
		key: 'AIzaSyBERGANqxpkXtGEJR1XIMOvqfdAQczTPXA'
	};
	return $.getJSON(YOUTUBE_PLAYLISTITEMS_URL, query, callBack);
}

function handlePlayListItems(data)
{
	display($('.js-search-results-hits'));

	var render_results = [];

	data.items.forEach((item, index) => 
	{
		render_results.push(renderPlayListItem(item));
	});

	$('.js-search-results-hits').html(render_results);
}

function renderPlayListItem(item)
{
	var hitElement = $('<div class="top-hit"></div>');
	var element = $('<a class="top-hit" href="" target="_blank"></a>');
	element.text(item.snippet.title);
	element.attr('href', 'https://www.youtube.com/watch?v=' + item.snippet.resourceId.videoId);
	hitElement.append(element);

	return hitElement;
}

function showHits(searchTerm){
	getTopHitsPlayList(searchTerm, handlePlayList);
}