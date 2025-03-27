//TMSideBar.js
class TMSideBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.playlists = [];

        const linkElem = document.createElement("link");
        linkElem.setAttribute("rel", "stylesheet");
        linkElem.setAttribute("href", "TuneMixComponents/css/TMSideBar.css");

        this.shadowRoot.innerHTML = `
            <div class="sidebar">
                <div class="logo-container">
                    <img src="../public/TuneMixIconNB.png" alt="TuneMix Logo" class="logo">
                    <h1>TuneMix</h1>
                </div>
                <button id="add-playlist-btn">Add Playlist</button>
                <div class="playlist-list">
                    <h2>Playlists</h2>
                    <ul id="playlist-ul">
                      <!-- Playlists will be dynamically added here -->
                    </ul>
                </div>
            </div>
        `;
        this.shadowRoot.prepend(linkElem);
    }

    connectedCallback() {
        this.loadPlaylists(); // Load playlists when the component is connected

        const addPlaylistBtn = this.shadowRoot.getElementById("add-playlist-btn");
        addPlaylistBtn.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent('open-add-playlist-modal', {
                bubbles: true, // Allows the event to bubble up through the DOM
                composed: true  // Allows the event to cross the shadow DOM boundary
            }));
        });
    }

    loadPlaylists() {
        if (!db) {
            console.warn("Database not initialized yet.  Trying again soon.");
            setTimeout(() => this.loadPlaylists(), 500);
            return;
        }

        getAllPlaylists()
            .then(playlists => {
                this.playlists = playlists;
                this.renderPlaylists();
            })
            .catch(error => {
                console.error("Error loading playlists:", error);
            });
    }

    renderPlaylists() {
        const playlistList = this.shadowRoot.getElementById("playlist-ul");
        playlistList.innerHTML = ""; // Clear the existing list

        this.playlists.forEach(playlist => {
            const listItem = document.createElement("li");
            listItem.textContent = playlist.name;
            listItem.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent('open-playlist', {
                    bubbles: true,
                    composed: true,
                    detail: playlist  // Pass the playlist data with the event
                }));
            });
            playlistList.appendChild(listItem);
        });
    }
}

customElements.define("tm-side-bar", TMSideBar);