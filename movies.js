const TMDB_API_KEY = "c4998c97074e6e5606b5d8b589888d6d";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

// Fetch Movies for Sections (Trending, Latest Trailers, What's Popular)
async function fetchMovies(endpoint, containerId) {
    let url = `${BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;

    try {
        let response = await fetch(url);
        let data = await response.json();
        if (data.results) {
            displayMovies(data.results, containerId);
        } else {
            document.getElementById(containerId).innerHTML = `<p style="color: red;">No movies found.</p>`;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to Display Movies
function displayMovies(movies, containerId) {
    let container = document.getElementById(containerId);
    container.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path) return;

        let movieElement = document.createElement("div");
        movieElement.classList.add("movie");
        movieElement.innerHTML = `
            <a href="movie-details.html?id=${movie.id}&type=movie">
                <img src="${IMAGE_URL}${movie.poster_path}" alt="${movie.title || movie.name}">
                <h3>${movie.title || movie.name}</h3>
            </a>
        `;
        container.appendChild(movieElement);
    });
}

// Function to fetch movies by category
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".dropdown-menu li a").forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            let category = this.dataset.category;
            let type = this.dataset.type;
            document.getElementById("category-results").innerHTML = "";
            fetchCategory(category, type);
        });
    });
});

async function fetchCategory(category, type) {
    let url = `${BASE_URL}/${type}/${category}?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        displayCategoryResults(data.results);
    } catch (error) {
        console.error("Error fetching category:", error);
    }
}

function displayCategoryResults(movies) {
    let container = document.getElementById("category-results");
    container.innerHTML = "";

    movies.forEach(movie => {
        if (!movie.poster_path || !movie.id) return;

        const title = movie.title || movie.name;
        const mediaType = movie.media_type || (movie.first_air_date ? "tv" : "movie");
        const year = movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : "N/A");

        const itemElement = document.createElement("div");
        itemElement.classList.add("movie");
        itemElement.innerHTML = `
            <a href="movie-details.html?id=${movie.id}&type=${mediaType}">
                <img src="${IMAGE_URL}${movie.poster_path}" alt="${title}">
                <h3>${title} (${year})</h3>
            </a>
        `;
        container.appendChild(itemElement);
    });
}

const SEARCH_URL = `${BASE_URL}/search/multi`;
document.getElementById("searchButton").addEventListener("click", function () {
    let query = document.getElementById("searchInput").value.trim();
    if (query === "") {
        alert("Please enter a movie or TV show name.");
        return;
    }
    fetchSearchResults(query);
});

async function fetchSearchResults(query) {
    let url = `${SEARCH_URL}?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
    try {
        let response = await fetch(url);
        let data = await response.json();
        displaySearchResults(data.results);
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
}

function displaySearchResults(results) {
    let container = document.getElementById("category-results");
    container.innerHTML = "";

    if (results.length === 0) {
        container.innerHTML = "<p style='color: red;'>No results found.</p>";
        return;
    }

    results.forEach(item => {
        if (!item.poster_path || !item.id) return;

        const title = item.title || item.name;
        const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
        const year = item.release_date
            ? new Date(item.release_date).getFullYear()
            : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : "N/A");

        const itemElement = document.createElement("div");
        itemElement.classList.add("movie");
        itemElement.innerHTML = `
            <a href="movie-details.html?id=${item.id}&type=${mediaType}">
                <img src="${IMAGE_URL}${item.poster_path}" alt="${title}">
                <h3>${title} (${year})</h3>
            </a>
        `;
        container.appendChild(itemElement);
    });
}

function toggleProfileMenu() {
    document.getElementById("profileMenu").classList.toggle("active");
}

function logout() {
    alert("Logging out...");
    window.location.href = "index.html";
}

document.addEventListener("click", function(event) {
    const profileMenu = document.getElementById("profileMenu");
    const profileIcon = document.querySelector(".profile-icon");

    if (!profileIcon.contains(event.target) && !profileMenu.contains(event.target)) {
        profileMenu.classList.remove("active");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    fetchMovies("/trending/movie/day", "trending");
    fetchMovies("/movie/now_playing", "latest-trailers");
    fetchMovies("/movie/popular", "popular");
});





