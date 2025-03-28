class TMEditPlayList extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });

        const linkElem = document.createElement("link");
        linkElem.setAttribute("rel", "stylesheet");
        linkElem.setAttribute("href", "TuneMixComponents/css/TMEditPlayList.css");

        this.shadowRoot.innerHTML = `
    <div id="modal">
        <div id="modal-content">
            <h1>Edit Playlist</h1>
            <label for="playlist-name">Playlist Name:</label>
            <input type="text" id="playlist-name">
            <div id="drop-area" class="drop-area">
                <p>Drag and drop songs here</p>
            </div>
            <ul id="song-list"></ul>
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
            <button id="save-btn">Save Changes</button>
            <button id="close-btn">Close</button>
        </div>
    </div>
`;

        this.shadowRoot.prepend(linkElem);
    }

    connectedCallback() {
        this.playlist = null;
        this.selectedSongIndex = -1;
        this.shadowRoot.getElementById("modal").style.display = "none";

        // Button Listeners
        this.shadowRoot.getElementById("close-btn").addEventListener("click", () => this.closeModal());
        this.shadowRoot.getElementById("save-btn").addEventListener("click", () => this.saveChanges());
        this.shadowRoot.getElementById("update-song-btn").addEventListener("click", () => this.updateSong());
        this.shadowRoot.getElementById("cancel-edit-btn").addEventListener("click", () => this.hideEditForm());
        this.shadowRoot.getElementById("delete-song-btn").addEventListener("click", () => this.deleteSong());

        // Drag-and-Drop Listeners
        const dropArea = this.shadowRoot.getElementById("drop-area");
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

        document.addEventListener("open-edit-playlist-modal", (event) => this.openModal(event.detail));
    }

    openModal(playlist) {
        this.playlist = playlist;
        this.shadowRoot.getElementById("playlist-name").value = playlist.name;
        this.renderSongList();
        this.shadowRoot.getElementById("modal").style.display = "block";
    }

    closeModal() {
        this.shadowRoot.getElementById("modal").style.display = "none";
    }

    renderSongList() {
        const songList = this.shadowRoot.getElementById("song-list");
        songList.innerHTML = "";

        this.playlist.songs.forEach((song, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = song.title;
            listItem.addEventListener("click", () => this.editSong(index));
            songList.appendChild(listItem);
        });
    }

    editSong(index) {
        this.selectedSongIndex = index;
        const song = this.playlist.songs[index];

        this.shadowRoot.getElementById("edit-title").value = song.title;
        this.shadowRoot.getElementById("edit-artist").value = song.artist;
        this.shadowRoot.getElementById("edit-album").value = song.album;
        this.shadowRoot.getElementById("edit-year").value = song.year;
        this.shadowRoot.getElementById("edit-genre").value = song.genre;

        this.shadowRoot.getElementById("edit-song-form").style.display = "block";
    }

    hideEditForm() {
        this.shadowRoot.getElementById("edit-song-form").style.display = "none";
    }

    updateSong() {
        if (this.selectedSongIndex === -1) return;

        const song = this.playlist.songs[this.selectedSongIndex];
        song.title = this.shadowRoot.getElementById("edit-title").value;
        song.artist = this.shadowRoot.getElementById("edit-artist").value;
        song.album = this.shadowRoot.getElementById("edit-album").value;
        song.year = this.shadowRoot.getElementById("edit-year").value;
        song.genre = this.shadowRoot.getElementById("edit-genre").value;

        this.renderSongList();
        this.hideEditForm();
    }

    deleteSong() {
        if (this.selectedSongIndex === -1) return;

        this.playlist.songs.splice(this.selectedSongIndex, 1);
        this.renderSongList();
        this.hideEditForm();
        this.selectedSongIndex = -1;
    }

    handleDroppedFiles(files) {
        // Ensure this.playlist and this.playlist.songs exist
        if (!this.playlist || !Array.isArray(this.playlist.songs)) {
            console.error("Playlist structure is invalid for adding songs.");
            // Handle this error appropriately, maybe alert the user or prevent adding
            return;
        }

        Array.from(files).forEach(file => {
            if (file.type === "audio/mpeg") { // Or broaden check if needed: file.type.startsWith('audio/')
                const newSong = {
                    id: crypto.randomUUID(), // Generate a unique ID for the new song
                    title: file.name,
                    artist: "Unknown Artist", // Use consistent defaults
                    album: "Unknown Album",
                    year: new Date().getFullYear(),
                    genre: "Unknown Genre",
                    duration: "Unknown Duration", // Add if your player needs it
                    file: file, // <-- THE CRITICAL ADDITION: Store the File object
                    cover: null // Add if you handle covers
                };
                this.playlist.songs.push(newSong);
            } else {
                console.warn(`Skipping non-audio file: ${file.name} (type: ${file.type})`);
                // Optionally alert the user about skipped files
            }
        });

        this.renderSongList(); // Update the UI to show the newly added song titles
    }


    saveChanges() {
        this.playlist.name = this.shadowRoot.getElementById("playlist-name").value;

        updatePlaylist(this.playlist)
            .then(() => {
                this.dispatchEvent(new CustomEvent('playlist-updated', {
                    bubbles: true,
                    composed: true
                }));
                this.closeModal();
            })
            .catch(error => console.error("Failed to update playlist:", error));
    }
}

customElements.define("tm-edit-playlist", TMEditPlayList);
