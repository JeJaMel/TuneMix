class TMAddPlayList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.songs = [];
        this.selectedSongIndex = -1;

        const linkElem = document.createElement("link");
        linkElem.setAttribute("rel", "stylesheet");
        linkElem.setAttribute("href", "TuneMixComponents/css/TMAddPlayList.css");

        this.shadowRoot.innerHTML = `
        
        <div id="modal" style="display: none;"> 
            <div id="modal-content">
                <h1>Create Playlist</h1>
                <label for="playlist-name"></label>
                <input type="text" id="playlist-name" placeholder="Enter Playlist Name">
                <div id="drop-area">Drag and drop your songs here</div>
                <ul id="file-list"></ul>

                <div class="edit-form" id="edit-song-form" style="display: none;">
                    <label for="edit-title">Title:</label>
                    <input type="text" id="edit-title">
                    <label for="edit-artist">Artist:</label>
                    <input type="text" id="edit-artist">
                    <label for="edit-album">Album:</label>
                    <input type="text" id="edit-album">
                    <label for="edit-year">Year:</label>
                    <input type="number" id="edit-year">
                    <label for="edit-genre">Genre:</label>
                    <input type="text" id="edit-genre">
                    <button id="update-song-btn">Update Song</button>
                    <button id="cancel-edit-btn">Cancel</button>
                    <button id="delete-song-btn" class="delete-btn">Delete Song</button>
                </div>

                <button id="save-btn">Save Playlist</button>
                <button id="close-btn">Close</button>
            </div>
        </div>
    `;

        this.shadowRoot.prepend(linkElem);
    }


    connectedCallback() {
        const modal = this.shadowRoot.getElementById("modal");
        const closeModal = this.shadowRoot.getElementById("close-btn");
        const dropArea = this.shadowRoot.getElementById("drop-area");
        const saveBtn = this.shadowRoot.getElementById("save-btn");
        const fileList = this.shadowRoot.getElementById("file-list");
        const playlistNameInput = this.shadowRoot.getElementById("playlist-name");

        const editSongForm = this.shadowRoot.getElementById("edit-song-form");
        const editTitleInput = this.shadowRoot.getElementById("edit-title");
        const editArtistInput = this.shadowRoot.getElementById("edit-artist");
        const editAlbumInput = this.shadowRoot.getElementById("edit-album");
        const editYearInput = this.shadowRoot.getElementById("edit-year");
        const editGenreInput = this.shadowRoot.getElementById("edit-genre");
        const updateSongBtn = this.shadowRoot.getElementById("update-song-btn");
        const cancelEditBtn = this.shadowRoot.getElementById("cancel-edit-btn");
        const deleteSongBtn = this.shadowRoot.getElementById("delete-song-btn");

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
            this.hideEditForm();
        });

        // Drag and Drop Handling
        ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
            dropArea.addEventListener(eventName, event => event.preventDefault());
        });

        dropArea.addEventListener("dragover", () => dropArea.classList.add("dragover"));
        dropArea.addEventListener("dragleave", () => dropArea.classList.remove("dragover"));
        dropArea.addEventListener("drop", event => {
            dropArea.classList.remove("dragover");
            const files = event.dataTransfer.files;
            this.handleDroppedFiles(files);
        });

        // Save Playlist Button
        saveBtn.addEventListener("click", () => this.saveToIndexedDB(playlistNameInput.value));

        //Edit Form
        updateSongBtn.addEventListener("click", () => this.updateSongDetails());
        cancelEditBtn.addEventListener("click", () => this.hideEditForm());
        deleteSongBtn.addEventListener("click", () => this.deleteSongFromList());
    }

    handleDroppedFiles(files) {
        const fileList = this.shadowRoot.getElementById("file-list");
        for (const file of files) {
            if (file.type === "audio/mpeg") {
                const metadata = {
                    id: crypto.randomUUID(),
                    title: file.name,
                    artist: "Unknown Artist",
                    album: "Unknown Album",
                    year: new Date().getFullYear(),
                    genre: "Unknown Genre",
                    duration: "Unknown Duration",
                    file: file,
                    cover: null
                };
                this.songs.push(metadata);
                this.renderSongList();
            }
        }
    }

    renderSongList() {
        const fileList = this.shadowRoot.getElementById("file-list");
        fileList.innerHTML = "";  // Clear the list
        this.songs.forEach((song, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = song.title;
            listItem.addEventListener("click", () => this.editSong(index));
            fileList.appendChild(listItem);
        });
    }

    editSong(index) {
        this.selectedSongIndex = index;
        const song = this.songs[index];
        const editTitleInput = this.shadowRoot.getElementById("edit-title");
        const editArtistInput = this.shadowRoot.getElementById("edit-artist");
        const editAlbumInput = this.shadowRoot.getElementById("edit-album");
        const editYearInput = this.shadowRoot.getElementById("edit-year");
        const editGenreInput = this.shadowRoot.getElementById("edit-genre");

        editTitleInput.value = song.title;
        editArtistInput.value = song.artist;
        editAlbumInput.value = song.album;
        editYearInput.value = song.year;
        editGenreInput.value = song.genre;

        this.showEditForm();
    }

    updateSongDetails() {
        if (this.selectedSongIndex === -1) return;

        const editTitleInput = this.shadowRoot.getElementById("edit-title");
        const editArtistInput = this.shadowRoot.getElementById("edit-artist");
        const editAlbumInput = this.shadowRoot.getElementById("edit-album");
        const editYearInput = this.shadowRoot.getElementById("edit-year");
        const editGenreInput = this.shadowRoot.getElementById("edit-genre");

        this.songs[this.selectedSongIndex].title = editTitleInput.value;
        this.songs[this.selectedSongIndex].artist = editArtistInput.value;
        this.songs[this.selectedSongIndex].album = editAlbumInput.value;
        this.songs[this.selectedSongIndex].year = editYearInput.value;
        this.songs[this.selectedSongIndex].genre = editGenreInput.value;

        this.renderSongList();
        this.hideEditForm();
    }

    deleteSongFromList() {
        if (this.selectedSongIndex === -1) return;
        this.songs.splice(this.selectedSongIndex, 1);
        this.renderSongList();
        this.hideEditForm();
        this.selectedSongIndex = -1;
    }

    showEditForm() {
        this.shadowRoot.getElementById("edit-song-form").style.display = "block";
    }

    hideEditForm() {
        this.shadowRoot.getElementById("edit-song-form").style.display = "none";
        this.selectedSongIndex = -1;
    }

    saveToIndexedDB(playlistName) {
        if (!db) {
            createGlobalNotification({
                type: "error",
                message: "Database not initialized.  Please try again.",
                icon: "error",
                dismissible: "true",
                    fadeOut: "2",
            });
            return;
        }

        if (this.songs.length === 0) {
            createGlobalNotification({
                type: "warning",
                message: "No songs to save!",
                icon: "warning",
                dismissible: "true",
                fadeOut: "2",

            });
            return;
        }

        if (!playlistName) {
            createGlobalNotification({
                type: "warning",
                message: "Please enter a playlist name.",
                icon: "warning",
                dismissible: "true",
                fadeOut: "2",

            });
            return;
        }

        const playlist = {
            id: crypto.randomUUID(),
            name: playlistName,
            songs: this.songs.map(song => ({ // Store minimal info + the file
                id: song.id,
                title: song.title,
                artist: song.artist,
                album: song.album,
                year: song.year,
                genre: song.genre,
                file: song.file
            }))
        };

        addPlaylist(playlist)
            .then(() => {
                createGlobalNotification({
                    type: "success",
                    message: "Playlist saved successfully!",
                    icon: "success",
                    dismissible: "true",
                    fadeOut: "2",
                    "action-text": "Refresh",
                    "action-url": "http://127.0.0.1:5500/WD_VS/Web1/TuneMix/src/index.html",
                });
                this.shadowRoot.getElementById("modal").style.display = "none";
                this.songs = [];
                this.renderSongList(); // Clear the rendered list
                this.shadowRoot.getElementById("playlist-name").value = "";
            })
            .catch(error => {
                console.error("Error saving playlist:", error);
                createGlobalNotification({
                    type: "server",
                    message: "Error saving playlist!",
                    icon: "error",
                    dismissible: "true",
                    fadeOut: "2",
                });
            });
    }
}

customElements.define("tm-add-playlist", TMAddPlayList);