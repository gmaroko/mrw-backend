require("dotenv").config();

const MovieListType = {
    NOW_PLAYING: "now_playing",
    POPULAR: "popular",
    COMING_SOON: "upcoming",
    TOP_RATED: "top_rated",
};

// mode to env

class TMDBApiHelper {
    listMovies = async (listType) => {
        console.log(`Fetching movies under category: ${listType}`);

        const url = `${process.env.TMDB_API_URL}/movie/${listType}?language=en-US&page=1`;
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
        };

        try {
            const res = await fetch(url, options);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Error fetching movies:", err);
            return {};
        }
    };

    getMovieDetails = async (params, movieId) => {
        var response = {};
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
        };

        const url = `${process.env.TMDB_API_URL}/movie/${movieId}?language=en-US`;

        try {
            const res = await fetch(url, options);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Error fetching movie details:", err);
            return {};
        }
    };

    searchMovies = async (params, query) => {
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
        };
        var response = {};
        const url =
            `${process.env.TMDB_API_URL}/search/movie?` +
            new URLSearchParams(params).toString();
        console.log(`Searching movies with url: ${url}`);
        try {
            const res = await fetch(url, options);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Error searching for movie data:", err);
            return {};
        }
    };

    trailer = async (movieId, params) => {
        const options = {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            },
        };
        var response = {};
        const url =
            `${process.env.TMDB_API_URL}/movie/${movieId}/videos` + new URLSearchParams(params).toString();
        try {
            const res = await fetch(url, options);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
                const trailer = data.results.find(video => video.type === "Trailer" && video.site === "YouTube" && video.official);
                if (trailer) {
                    let yt = `https://www.youtube.com/watch?v=${trailer.key}`;
                    trailer.site = yt;
                    return trailer;
                }
            }
            return {};
        } catch (err) {
            console.error("Error checking trailer link for movie data:", err);
            return {};
        }
    };
}

module.exports = new TMDBApiHelper();
