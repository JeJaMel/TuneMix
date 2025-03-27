class TMPlaylistPlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.playlist = null;
        this.currentSongIndex = 0;
        this.audio = new Audio();
        this.isPlaying = false;

        const linkElem = document.createElement("link");
        linkElem.setAttribute("rel", "stylesheet");
        linkElem.setAttribute("href", "TuneMixComponents/css/TMPlaylistPlayer.css");

        this.shadowRoot.innerHTML = `
    <div id="player-modal" style="display: none;">
        <div id="player-bar">
            <div id="player-header">
                <h2>Playlist: <span id="playlist-name"></span></h2>
            </div>

            <div id="song-info">
                <p><span id="song-title"></span> - <span id="song-artist"></span></p>
            </div>

            <div id="progress-volume-container">
                <div id="progress-container">
                    <input type="range" id="progress-bar" value="0" min="0" max="100">
                </div>
                <div id="volume-controls">
                    <label for="volume">🔊</label>
                    <input type="range" id="volume" min="0" max="1" step="0.01" value="1">
                </div>
            </div>

            <div id="player-controls">
                <button id="prev-btn">⏮</button>
                <button id="play-pause-btn">▶</button>
                <button id="next-btn">⏭</button>
                <button id="random-btn">⇆</button>
            </div>

            <span id="close-player-btn">×</span> <!-- Moved outside #player-header -->
        </div>
    </div>
`;



        this.shadowRoot.prepend(linkElem);
    }

    connectedCallback() {
        this.closeButton = this.shadowRoot.getElementById("close-player-btn");
        this.playlistNameDisplay = this.shadowRoot.getElementById("playlist-name");
        this.songTitleDisplay = this.shadowRoot.getElementById("song-title");
        this.songArtistDisplay = this.shadowRoot.getElementById("song-artist");
        this.playPauseButton = this.shadowRoot.getElementById("play-pause-btn");
        this.prevButton = this.shadowRoot.getElementById("prev-btn");
        this.nextButton = this.shadowRoot.getElementById("next-btn");
        this.randomButton = this.shadowRoot.getElementById("random-btn");
        this.progressBar = this.shadowRoot.getElementById("progress-bar");
        this.volumeControl = this.shadowRoot.getElementById("volume");

        this.closeButton.addEventListener("click", () => this.closePlayer());
        this.playPauseButton.addEventListener("click", () => this.togglePlayPause());
        this.prevButton.addEventListener("click", () => this.playPrevious());
        this.nextButton.addEventListener("click", () => this.playNext());
        this.randomButton.addEventListener("click", () => this.playRandom());

        this.audio.addEventListener("timeupdate", () => this.updateProgressBar());
        this.progressBar.addEventListener("input", () => this.seekTo());
        this.volumeControl.addEventListener("input", () => this.changeVolume());

        this.audio.addEventListener("ended", () => this.playNext()); // Play next song when current ends
    }

    loadPlaylist(playlist) {
        this.playlist = playlist;
        this.currentSongIndex = 0;
        this.playlistNameDisplay.textContent = this.playlist.name;
        this.loadSong();
        this.openPlayer();
    }

    loadSong() {
        if (!this.playlist || this.playlist.songs.length === 0) {
            console.warn("No playlist loaded or playlist is empty.");
            return;
        }

        const song = this.playlist.songs[this.currentSongIndex];
        this.audio.src = URL.createObjectURL(song.file);
        this.songTitleDisplay.textContent = song.title;
        this.songArtistDisplay.textContent = song.artist;

        this.audio.onloadedmetadata = () => {
            this.progressBar.max = this.audio.duration; 
            if (this.isPlaying) {
                this.audio.play();
            }
        };

        this.audio.onerror = (error) => {
            console.error("Audio loading error:", error);
        };
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.playPauseButton.textContent = "▶";
        } else {
            this.audio.play();
            this.playPauseButton.textContent = "❚❚";
        }
        this.isPlaying = !this.isPlaying;
    }

    playNext() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.playlist.songs.length;
        this.loadSong();
    }

    playPrevious() {
        this.currentSongIndex = (this.currentSongIndex - 1 + this.playlist.songs.length) % this.playlist.songs.length;
        this.loadSong();
    }

    playRandom() {
        this.currentSongIndex = Math.floor(Math.random() * this.playlist.songs.length);
        this.loadSong();
    }

    openPlayer() {
        this.shadowRoot.getElementById("player-modal").style.display = "flex";
    }

    closePlayer() {
        this.audio.pause();
        this.isPlaying = false;
        this.shadowRoot.getElementById("player-modal").style.display = "none";
        this.playPauseButton.textContent = "▶";
    }

    updateProgressBar() {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.value = this.audio.currentTime;
        this.progressBar.style.background = `linear-gradient(to right, #0c5526 ${progress}%, #1db954 ${progress}%)`;
    }


    seekTo() {
        this.audio.currentTime = this.progressBar.value;
    }

    changeVolume() {
        this.audio.volume = this.volumeControl.value;
        const percentage = this.volumeControl.value * 100;
        this.volumeControl.style.background = `linear-gradient(to right, #1db954 ${percentage}%, #121212 ${percentage}%)`;
    }
}

customElements.define('tm-playlist-player', TMPlaylistPlayer);