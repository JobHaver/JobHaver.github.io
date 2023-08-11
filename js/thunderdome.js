// This will be the object that will contain the Vue attributes
// and be used to initialize it.
function getRandomInt(max){
	return Math.floor(Math.random() * max);
}

app = {}

app.data = {
	songs: [],
	recomended_songs: [],
	playlist: [],
	token: 0,
	chosen_songs: [],
	cloak: false,
	canvas: document.createElement('canvas'),
	genres: [],
	chosen_genres: []
};

//1138
// Constr.prototype.getTracks = function (trackIds, options, callback) {
// var requestData = {
  // url: _baseUri + '/tracks/',
  // params: { ids: trackIds.join(',') }
// };
// return _checkParamsAndPerformRequest(requestData, options, callback);
// };

get_genres = () => {
	var url = 'https://api.spotify.com/v1/recommendations/available-genre-seeds';
	var request = url;
	
	axios.get(request, {
		headers: { 'Authorization' : 'Bearer ' + app.data.token}
	}).then((result) => {
		// console.log(result.data.genres);
		app.data.genres = result.data.genres;
	})
};

load_recomended = () => {
	var song1 = app.data.recomended_songs.shift();
	while(song1.preview_url == null){
		song1 = app.data.recomended_songs.shift();
	}
	var song2 = app.data.recomended_songs.shift();
	while(song2.preview_url == null){
		song2 = app.data.recomended_songs.shift();
	}
	app.data.songs = [song1, song2];
	app.data.cloak = true;
	document.getElementById("player_1").load();
	document.getElementById("player_2").load();
}

get_recomended_genres = () => {
	var cg_length = app.data.chosen_genres.length;
	if(!cg_length){
		return;
	}
	
	var url = 'https://api.spotify.com/v1/recommendations/';
	var seed_genres = '?seed_genres=';
	var market = '&market=US';
	
	for(let i = 0; i < cg_length; i++){
		seed_genres += app.data.chosen_genres[i] + ',';
	}
	
	var request = url + seed_genres + market;
	
	axios.get(request, {
		headers: { 'Authorization' : 'Bearer ' + app.data.token}
	}).then((result) => {
		app.data.recomended_songs = result.data.tracks;
		load_recomended();
		toggleElement("dome");
		document.getElementById("dome_nav").style.display = "flex";//needs to be flex because of bulma
	})
};

get_recomended = () => {
	if(!app.data.chosen_songs.length){
		return;
	}
	
	var url = 'https://api.spotify.com/v1/recommendations/';
	var seed_tracks = '?seed_tracks=';
	var market = '&market=US';
	
	var cs_length = app.data.chosen_songs.length;
	for (let i = 0; i < 5 && i < cs_length; i++){
		seed_tracks += app.data.chosen_songs[cs_length - (1 + i)].href.slice(34) + ',';
	}
	
	var request = url + seed_tracks + market;
	
	axios.get(request, {
		headers: { 'Authorization' : 'Bearer ' + app.data.token}
	}).then((result) => {
		// console.log(result);
		app.data.recomended_songs = result.data.tracks;
	})
};

get_tracks = () => {
	song1_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	song2_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	
	while(song1_url == song2_url){
		song2_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	}
	
	url = 'https://api.spotify.com/v1/tracks/';
	songs_url = '?ids=' + song1_url + ',' + song2_url + '&';
	market = 'market=US';
	
	axios.get(url + songs_url + market, {
		headers: { 'Authorization' : 'Bearer ' + app.data.token}
	}).then((result) => {
		app.data.songs = [result.data.tracks[0], result.data.tracks[1]];
		app.data.cloak = true;
		document.getElementById("player_1").load();
		document.getElementById("player_2").load();
	})	
};

play = (player, albumA, albumB) => {
	//var canvas = document.createElement('canvas');
	var canvas = app.data.canvas;
	var context = canvas.getContext('2d');
	var img = document.getElementById(albumA);
	img.crossOrigin = "Anonymous";
	canvas.width = img.width; // these two needed so it doesnt glitch out
	canvas.height = img.height;
	context.drawImage(img, 0, 0);
	
	var p = context.getImageData(getRandomInt(img.width), getRandomInt(img.height), 1, 1).data;
	var hex = '#' + p[0].toString(16) + p[1].toString(16) + p[2].toString(16);
	// console.log("x: " + x + " y: " + y + " hex: " + hex + " p: " + p);
	// console.log(" hex: " + hex + " p: " + p);
	
	if(p[3]){ //need to do this bc p does not work the first time, also error handeling
		document.documentElement.style.backgroundColor = hex;//DocumentElement is HTML
	}
	
	document.getElementById(player).play();
	// document.getElementById(albumB).style.filter = 'grayscale(1)';
	// document.getElementById(albumA).style.transform = 'scale(1.03)';
};

stop = (player, albumA, albumB) => {
	// document.documentElement.style.backgroundColor = "#FFEBCD";
	document.getElementById(player).pause();
	// document.getElementById(albumB).style.filter = 'grayscale(0)';
	// document.getElementById(albumA).style.transform = 'scale(1)';
};

choose = (chosen) => {
	app.data.chosen_songs.push(chosen); //chosen is full song
	document.getElementById("chosen_nav").style.display = "flex";//needs to be flex because of bulma
	
	// console.log(app.data.chosen_songs.length);
	if(app.data.chosen_songs.length % 5 == 0){
		get_recomended();
		// document.getElementById("rec_nav").style.display = "flex";//needs to be flex because of bulma
	}
	
	// console.log(app.data.recomended_songs.length);
	if(app.data.recomended_songs.length > 5){
		load_recomended();
	}
	else{
		get_tracks(); //just in case of failure
	}
};

default_playlsit = () => {
	toggleElement("dome");
	document.getElementById("dome_nav").style.display = "flex";//needs to be flex because of bulma
};

click_genre = (genre) => {
	const index = app.data.chosen_genres.indexOf(genre);
	var elem = document.getElementById(genre);
	var atMax = app.data.chosen_genres.length >= 5;
	
	if(index > -1){
		app.data.chosen_genres.splice(index, 1);
		elem.style.backgroundColor = "#363636";
	}
	else if(!atMax){
		app.data.chosen_genres.push(elem.id);
		elem.style.backgroundColor = "#6ec45a";
	}
};

// We form the dictionary of all methods, so we can assign them to the Vue app.
app.methods = {
	play: play,
	stop: stop,
	choose: choose,
	get_recomended: get_recomended,
	default_playlsit: default_playlsit,
	click_genre: click_genre,
	get_recomended_genres: get_recomended_genres
};

// This creates the Vue instance.
app.vue = new Vue({
	el: "#vue-target",
	data: app.data,
	methods: app.methods,
	// mounted: function (){
		// document.onreadystatechange = () => {
			// if (document.readyState == "complete") {
				// document.getElementById("player_1").volume = 0.5;
				// document.getElementById("player_2").volume = 0.5;
			// }
		// }
	// }
});

// And this initializes it.
// Generally, this will be a network call to the server to
// load the data.
// For the moment, we 'load' the data from a string.
app.init = async () => {
	clientId = '1d6c8601b56b4a77bc332a0c041878a0';
	clientSecret = '5179fc9dda60495c80be781b75cf6ec9';
	
	result = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/x-www-form-urlencoded', 
			'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
		},
		body: 'grant_type=client_credentials'
	});
	
	data = await result.json();
	app.data.token = data.access_token;
	// console.log('Token: ' + app.data.token);
	
	app.data.playlist = JSON.parse(playlist);
	
	get_tracks();
	get_genres();//test genres
};

app.init();

//non vue js funcs
function hideAll(){
	const list = ["dome", "rec", "chosen", "but"];
	
	for(let i = 0; i < list.length; i++){
		document.getElementById(list[i]).setAttribute("hidden", "hidden");
	}
}

function toggleElement(element){
	var t = document.getElementById(element);
	
	if(t.getAttribute("hidden")){
		hideAll();
		t.removeAttribute("hidden");
	}
}

// prevent multiple audio sources from playing at once, works even when items change
function onlyPlayOneIn(container){
	container.addEventListener("play", function(event){
		audio_elements = container.getElementsByTagName("audio")
		for(i=0; i < audio_elements.length; i++){
			audio_element = audio_elements[i];
			if (audio_element !== event.target){
				audio_element.pause();
			}
		}
	}, true);
}

document.addEventListener("DOMContentLoaded", function() {
  onlyPlayOneIn(document.body);
});