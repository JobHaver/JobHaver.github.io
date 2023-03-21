// This will be the object that will contain the Vue attributes
// and be used to initialize it.
function getRandomInt(max){
	return Math.floor(Math.random() * max);
}

app = {}

app.data = {
	songs: [],
	token: -1,
	playlist: []
};

// get_tracks = (tracks) => {
	// url = 'https://api.spotify.com/v1/tracks/';
	// axios.get(url + tracks + '?market=NA', {
		// headers: { 'Authorization' : 'Bearer ' + app.data.token}
	// }).then((result) => {
		// song = result.data;
		
		// app.data.songs = [song, song];
		// var audio1 = document.getElementById("player_1");
		// audio1.src = app.data.songs[0]['preview_url'];
		// audio1.load();
		// var audio2 = document.getElementById("player_2");
		// audio2.src = app.data.songs[1]['preview_url'];
		// audio2.load();
	// })
// };

play = (imageNum) => {
	if(imageNum == 1){
		var audio = document.getElementById("player_1");
		var iGrey = document.getElementById("album_2");
		var iTrans = document.getElementById("album_1");
	}
	else{
		var audio = document.getElementById("player_2");
		var iGrey = document.getElementById("album_1");
		var iTrans = document.getElementById("album_2");
	}

	iGrey.style.filter = 'grayscale(1)';
	iTrans.style.transform = 'scale(1.03)';
	audio.play();
};

stop = (imageNum) => {
	if(imageNum == 1){
		var audio = document.getElementById("player_1");
		var iGrey = document.getElementById("album_2");
		var iTrans = document.getElementById("album_1");
	}
	else{
		var audio = document.getElementById("player_2");
		var iGrey = document.getElementById("album_1");
		var iTrans = document.getElementById("album_2");
	}
	
	iGrey.style.filter = 'grayscale(0)';
	iTrans.style.transform = 'scale(1)';
	audio.pause();
};

choose = () => {
	song1_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	song2_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	
	while(song1_url == song2_url){
		song2_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	}
	
	url = 'https://api.spotify.com/v1/tracks/';
	songs_url = '?ids=' + song1_url + ',' + song2_url + '&';
	market = 'market=US';
	
	console.log(song1_url + ' vs ' + song2_url);
	
	//'?market=NA' <- need to get this back in there somehow
	
	axios.get(url + songs_url + market, {
		headers: { 'Authorization' : 'Bearer ' + app.data.token}
	}).then((result) => {
		app.data.songs = [result.data.tracks[0], result.data.tracks[1]];
		var audio1 = document.getElementById("player_1");
		audio1.src = app.data.songs[0]['preview_url'];
		audio1.load();
		var audio2 = document.getElementById("player_2");
		audio2.src = app.data.songs[1]['preview_url'];
		audio2.load();
	})
};

// We form the dictionary of all methods, so we can assign them
// to the Vue app in a single blow.
app.methods = {
	play: play,
	stop: stop,
	choose: choose,
};

// This creates the Vue instance.
app.vue = new Vue({
	el: "#vue-target",
	data: app.data,
	methods: app.methods,
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
	console.log('Token: ' + app.data.token);
	
	app.data.playlist = JSON.parse(playlist);
	
	song1_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	song2_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	
	while(song1_url == song2_url){
		song2_url = app.data.playlist[getRandomInt(app.data.playlist.length)];
	}
	
//1138
// Constr.prototype.getTracks = function (trackIds, options, callback) {
// var requestData = {
  // url: _baseUri + '/tracks/',
  // params: { ids: trackIds.join(',') }
// };
// return _checkParamsAndPerformRequest(requestData, options, callback);
// };
	
	url = 'https://api.spotify.com/v1/tracks/';
	songs_url = '?ids=' + song1_url + ',' + song2_url + '&'; // don't know why i need extra , to make this work
	market = 'market=US';
	console.log(song1_url + ' vs ' + song2_url);
	
	axios.get(url + songs_url + market, {
		headers: { 'Authorization' : 'Bearer ' + app.data.token}
	}).then((result) => {
		app.data.songs = [result.data.tracks[0], result.data.tracks[1]];
		// all this data can be found in chrome debuger, much easier process
		// console.log('href: ' +result['data']['href']);
	})
};

app.init();