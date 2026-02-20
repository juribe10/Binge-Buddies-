// movie-details.js (Full Version with Watchlist + List Dropdown Support)

const API_KEY = 'c4998c97074e6e5606b5d8b589888d6d';
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BASE_URL = "https://api.themoviedb.org/3";
const WATCHMODE_API_KEY = 'BmYIM7Jx33pEgHSUjx1gMNmgOXhAZwPaiRV7fZLc';

const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');
const mediaType = urlParams.get('type') || 'movie'; // default to 'movie'

// Fetch movie or TV show details
async function fetchMovieDetails(id) {
    try {
        const response = await fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}`);
        const movie = await response.json();

        document.getElementById('movie-title').innerText = movie.title || movie.name;
        showStreamingOptions(movie.title || movie.name);

        document.getElementById('tagline').innerText = movie.tagline || "";
        document.getElementById('movie-poster').src = IMAGE_URL + movie.poster_path;
        document.getElementById('release-date').innerText = movie.release_date || movie.first_air_date || "N/A";
        document.getElementById('rating').innerText = movie.vote_average?.toFixed(1) || "N/A";
        document.getElementById('duration').innerText = movie.runtime
        
            ? `${movie.runtime} min`
            : movie.episode_run_time?.[0]
                ? `${movie.episode_run_time[0]} min/episode`
                : "N/A";
        document.getElementById('genres').innerText = movie.genres.map(g => g.name).join(", ");
        document.getElementById('overview').innerText = movie.overview || "No overview available.";

        fetchMovieTrailer(id);
        populateWatchlistDropdown();
        populateListDropdown();
    } catch (error) {
        console.error("Error fetching movie/TV details:", error);
    }
}

// Fetch trailer (works for both movie & tv)
async function fetchMovieTrailer(id) {
    try {
        const response = await fetch(`${BASE_URL}/${mediaType}/${id}/videos?api_key=${API_KEY}`);
        const data = await response.json();

        const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube");
        const trailerBtn = document.getElementById("watch-trailer");

        if (trailer) {
            trailerBtn.style.display = "inline-block";
            trailerBtn.onclick = () => {
                window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
            };
        } else {
            trailerBtn.style.display = "none";
        }
    } catch (error) {
        console.error("Error fetching trailer:", error);
    }
}

// ========== Watchlist Logic ==========
function getAllWatchlists() {
    return JSON.parse(localStorage.getItem('allWatchlists')) || {};
}

function saveAllWatchlists(data) {
    localStorage.setItem('allWatchlists', JSON.stringify(data));
}

function populateWatchlistDropdown() {
    const dropdown = document.getElementById('watchlist-dropdown');
    dropdown.innerHTML = "";

    const watchlists = getAllWatchlists();
    const keys = Object.keys(watchlists);

    if (keys.length === 0) {
        dropdown.style.display = "none";
        return;
    }

    dropdown.style.display = "inline-block";

    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "-- Select Watchlist --";
    dropdown.appendChild(defaultOption);

    keys.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        dropdown.appendChild(option);
    });
}

function addToWatchlist(movieId, title) {
    const dropdown = document.getElementById('watchlist-dropdown');
    const selectedList = dropdown.value;

    if (!selectedList) {
        alert("Please select a watchlist or create one first.");
        return;
    }

    const allWatchlists = getAllWatchlists();

    // ❌ Check if this movie exists in ANY watchlist
    for (let listName in allWatchlists) {
        if (allWatchlists[listName].some(item => item.id === parseInt(movieId))) {
            alert(`${title} is already in the '${listName}' watchlist. Remove it from there first.`);
            return;
        }
    }

    // ✅ Add it if it's not in any list
    const list = allWatchlists[selectedList] || [];
    list.push({ id: parseInt(movieId), type: mediaType });
    allWatchlists[selectedList] = list;
    saveAllWatchlists(allWatchlists);

    alert(`${title} added to '${selectedList}' watchlist!`);
    dropdown.selectedIndex = 0;
}


// ========== Custom Lists Logic ==========
function getAllLists() {
    return JSON.parse(localStorage.getItem('allLists')) || {};
  }
  
  function populateListDropdown() {
    const dropdown = document.getElementById('list-dropdown');
    dropdown.innerHTML = "";
  
    const lists = getAllLists();
    const names = Object.keys(lists);
  
    if (names.length === 0) {
      dropdown.style.display = "none";
      return;
    }
  
    dropdown.style.display = "inline-block";
  
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "-- Select List --";
    dropdown.appendChild(defaultOption);
  
    names.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      dropdown.appendChild(option);
    });
  }
  

  function addToList(id, title) {
    const dropdown = document.getElementById('list-dropdown');
    const selectedList = dropdown.value;

    if (!selectedList) {
        alert("Please select a list or create one first.");
        return;
    }

    const allLists = getAllLists();

    // ❌ Check if this movie exists in ANY list
    for (let listName in allLists) {
        if (allLists[listName].some(item => item.id === parseInt(id))) {
            alert(`${title} is already in the '${listName}' list. Remove it from there first.`);
            return;
        }
    }

    // ✅ Add it if it's not in any list
    const list = allLists[selectedList] || [];
    list.push({ id: parseInt(id), title, type: mediaType });
    allLists[selectedList] = list;
    localStorage.setItem('allLists', JSON.stringify(allLists));

    alert(`${title} added to '${selectedList}' list!`);
    dropdown.selectedIndex = 0;
}


// ========== Event Listeners ==========
document.getElementById('add-watchlist').addEventListener('click', () => {
    const title = document.getElementById('movie-title').innerText;
    addToWatchlist(movieId, title);
});

document.getElementById('add-list').addEventListener('click', () => {
    const title = document.getElementById('movie-title').innerText;
    const dropdown = document.getElementById('list-dropdown');
    const selected = dropdown.value;
  
    if (!selected) {
      alert("Please select a list or create one first.");
      return;
    }
  
    const allLists = getAllLists();
    const list = allLists[selected] || [];
  
    const exists = list.some(item => item.id === parseInt(movieId));
    if (!exists) {
      list.push({ id: parseInt(movieId), type: mediaType });
      allLists[selected] = list;
      localStorage.setItem('allLists', JSON.stringify(allLists));
      alert(`${title} added to '${selected}' list!`);
    } else {
      alert(`${title} is already in '${selected}' list.`);
    }
  
    dropdown.selectedIndex = 0;
  });
  
// ========== Streaming Info from WatchMode ==========

async function getStreamingSources(title) {
    try {
        const searchRes = await fetch(`https://api.watchmode.com/v1/search/?apiKey=${WATCHMODE_API_KEY}&search_field=name&search_value=${encodeURIComponent(title)}`);
        const searchData = await searchRes.json();
        const id = searchData.title_results[0]?.id;

        if (!id) return [];

        const sourcesRes = await fetch(`https://api.watchmode.com/v1/title/${id}/sources/?apiKey=${WATCHMODE_API_KEY}`);
        const sources = await sourcesRes.json();

        return sources.filter(src => src.region === 'US' && src.type === 'sub'); // Only subscription streaming
    } catch (error) {
        console.error("Error fetching streaming platforms:", error);
        return [];
    }
}

async function showStreamingOptions(title) {
    const platforms = await getStreamingSources(title);
    const container = document.getElementById('streaming-links');

    if (!platforms.length) {
        container.innerHTML = '<p style="color:white;">No streaming platforms found.</p>';
        return;
    }

    container.innerHTML = '<p style="color:white;">Available on:</p>';

    platforms.forEach(platform => {
        const link = document.createElement('a');
        link.href = platform.web_url;
        link.target = '_blank';
        link.textContent = platform.name;
       link.style = `
    display:inline-block;
    margin: 3px 6px 3px 0;
    background: #e50914;
    color: white;
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 0.9rem;
    text-decoration: none;
`;

`;

        `;
        container.appendChild(link);
    });
}

// Init
if (movieId) {
    fetchMovieDetails(movieId);
    populateWatchlistDropdown();
    populateListDropdown();   
  } else {
    console.error("Movie ID not found in URL");
  }
  















