var YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
var YOUTUBE_PLAYLISTITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

var TOP_HIT_ELEMENTS = [];


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
	var playlistId = getTopTrackPlayListId(data);

	getTopHits(playlistId, handlePlayListItems);
}

function getTopTrackPlayListId(data)
{
	var playlistId = data.items[0].id.playlistId;
	var i = 0;
	while (!playlistId)
	{
		playlistId = data.items[i].id.playlistId;
		i++;
	}
	return playlistId;
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
	var hitsElement = $('.js-search-results-hits');

	TOP_HIT_ELEMENTS = [];
	var render = [];

	var moreOrLessButtonElement = $('<button type="button" class="more-or-less">+</button>').css('border', 'none');
	moreOrLessButtonElement.on('click', function()
	{
		var playListElement = hitsElement.find('.js-playlist');
		if ($(this).text() === "-")
		{
			playListElement.html(TOP_HIT_ELEMENTS[0]);
			hide(hitsElement);
			$(this).text("+");
			$(this).css('border', 'none');
		}
		else
		{
			playListElement.empty();
			display(hitsElement);
			TOP_HIT_ELEMENTS.forEach(item =>
			{
				playListElement.append(item);
			})
			$(this).text("-");
			$(this).css('border', '1px solid #ccc');
		}
	});
	render.push(moreOrLessButtonElement);

	var playListElement = $('<div class="js-playlist"></div>');

	TOP_HIT_ELEMENTS = data.items.map((item, index) => 
	{
		return renderPlayListItem(item);
	});
	playListElement.append(TOP_HIT_ELEMENTS[0]);	
	render.push(playListElement);

	hitsElement.html(render);
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