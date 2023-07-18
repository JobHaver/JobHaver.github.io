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
	cloak: false
};

//1138
// Constr.prototype.getTracks = function (trackIds, options, callback) {
// var requestData = {
  // url: _baseUri + '/tracks/',
  // params: { ids: trackIds.join(',') }
// };
// return _checkParamsAndPerformRequest(requestData, options, callback);
// };

get_recomended = () => {
	if(!app.data.chosen_songs.length){
		return;
	}
	
	var url = 'https://api.spotify.com/v1/recommendations/';
	var seed_tracks = '?seed_tracks=';
	var market = '&market=US';
	
	if(app.data.chosen_songs.length < 5){
		for (let i = 0; i < app.data.chosen_songs.length; i++) {
		  seed_tracks += app.data.chosen_songs[i] + ',';
		}
	}
	else{
		for (let i = 0; i < 5; i++){
		  seed_tracks += app.data.chosen_songs[app.data.chosen_songs.length - (1 + i)] + ',';
		}
		// console.log(seed_tracks);
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
	document.getElementById(albumB).style.filter = 'grayscale(1)';
	document.getElementById(albumA).style.transform = 'scale(1.03)';
	document.getElementById(player).play();
};

stop = (player, albumA, albumB) => {
	document.getElementById(albumB).style.filter = 'grayscale(0)';
	document.getElementById(albumA).style.transform = 'scale(1)';
	document.getElementById(player).pause();
};

choose = (chosen) => {
	chosen = chosen.slice(34);
	// console.log(chosen);
	app.data.chosen_songs.push(chosen);
	
	// console.log(app.data.chosen_songs.length);
	if(app.data.chosen_songs.length % 5 == 0){
			get_recomended();
	}
	
	if(app.data.chosen_songs.length > 5){
		// console.log(app.data.recomended_songs.length);
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
	else{
		get_tracks();
	}
};

// We form the dictionary of all methods, so we can assign them
// to the Vue app in a single blow.
app.methods = {
	play: play,
	stop: stop,
	choose: choose,
	get_recomended: get_recomended,
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
};

app.init();