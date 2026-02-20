// watchlist.js with support for multiple editable watchlists

const API_KEY = "c4998c97074e6e5606b5d8b589888d6d";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BASE_URL = "https://api.themoviedb.org/3";

const watchlistContainer = document.getElementById("watchlist-container");
const createButton = document.getElementById("create-watchlist");

function getAllWatchlists() {
  return JSON.parse(localStorage.getItem("allWatchlists")) || {};
}

function saveAllWatchlists(watchlists) {
  localStorage.setItem("allWatchlists", JSON.stringify(watchlists));
}

function createNewWatchlist() {
  const name = prompt("Enter a name for your new watchlist:").trim();
  if (!name) return;

  const watchlists = getAllWatchlists();
  if (watchlists[name]) {
    alert("Watchlist already exists.");
    return;
  }

  watchlists[name] = [];
  saveAllWatchlists(watchlists);
  renderAllWatchlists();
}

async function fetchDetails(id, type) {
  const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
  return await response.json();
}

function removeFromWatchlist(watchlistName, id) {
  const watchlists = getAllWatchlists();
  watchlists[watchlistName] = watchlists[watchlistName].filter(item => item.id !== id);
  saveAllWatchlists(watchlists);
  renderAllWatchlists();
}

function renameWatchlist(oldName) {
  const newName = prompt("Enter new name:").trim();
  if (!newName) return;

  const watchlists = getAllWatchlists();
  if (watchlists[newName]) {
    alert("A watchlist with that name already exists.");
    return;
  }

  watchlists[newName] = watchlists[oldName];
  delete watchlists[oldName];
  saveAllWatchlists(watchlists);
  renderAllWatchlists();
}

function deleteWatchlist(name) {
  const confirmed = confirm(`Are you sure you want to delete the entire '${name}' watchlist and all of its contents?`);
  if (!confirmed) return;

  const watchlists = getAllWatchlists();
  delete watchlists[name];
  saveAllWatchlists(watchlists);
  renderAllWatchlists();
}


async function renderAllWatchlists() {
  watchlistContainer.innerHTML = "";
  const watchlists = getAllWatchlists();

  for (const [name, items] of Object.entries(watchlists)) {
    const listHeader = document.createElement("div");
    listHeader.innerHTML = `
      <h2>${name}</h2>
      <button onclick="renameWatchlist('${name}')">Rename</button>
      <button onclick="deleteWatchlist('${name}')">Delete</button>
      
    `;
    watchlistContainer.appendChild(listHeader);

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.textContent = "No items in this watchlist.";
      watchlistContainer.appendChild(empty);
      continue;
    }

    for (const item of items) {
      const data = await fetchDetails(item.id, item.type);
      const card = document.createElement("div");
      card.className = "watchlist-card";
      card.innerHTML = `
        <img src="${IMAGE_URL + data.poster_path}" alt="${data.title || data.name}" class="poster">
        <div class="info">
          <h3>${data.title || data.name}</h3>
          <p><strong>Release Date:</strong> ${data.release_date || data.first_air_date || "N/A"}</p>
          <p><strong>Rating:</strong> ${data.vote_average || "N/A"}</p>
          <p>${data.overview || "No description available."}</p>
          <button onclick="removeFromWatchlist('${name}', ${item.id})">&times; Remove</button>
          <button onclick="markAsFinished('${name}', ${item.id})">✔ Finished</button>

        </div>
      `;
      watchlistContainer.appendChild(card);
    }
  }
}

// For adding to a specific list (to be called from details page)
function addToWatchlistPrompt(id, title, type = "movie") {
  const watchlists = getAllWatchlists();
  const names = Object.keys(watchlists);
  if (names.length === 0) return alert("No watchlists found. Create one first.");

  const selected = prompt(`Which watchlist?\n${names.join("\n")}`);
  if (!selected || !watchlists[selected]) return;

  const exists = watchlists[selected].some(item => item.id === id);
  if (!exists) {
    watchlists[selected].push({ id, type });
    saveAllWatchlists(watchlists);
    alert(`${title} added to ${selected}`);
  } else {
    alert("Already in watchlist.");
  }
}
function markAsFinished(watchlistName, id) {
    const watchlists = getAllWatchlists();
    const item = watchlists[watchlistName].find(movie => movie.id === id);
    if (!item) return;
  
    // Remove from watchlist
    watchlists[watchlistName] = watchlists[watchlistName].filter(movie => movie.id !== id);
    saveAllWatchlists(watchlists);
  
    // Add to history
    const history = JSON.parse(localStorage.getItem("watchHistory")) || [];
    history.push({ ...item, finishedDate: new Date().toISOString().split("T")[0] });
    localStorage.setItem("watchHistory", JSON.stringify(history));
  
    renderAllWatchlists();
  }
  

createButton.addEventListener("click", createNewWatchlist);
renderAllWatchlists(); 






