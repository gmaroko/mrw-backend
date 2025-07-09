require('dotenv').config()

const MovieListType = {
    NOW_PLAYING: 'now_playing',
    POPULAR: 'popular',
    COMING_SOON: 'upcoming',
    TOP_RATED: 'top_rated'
};

// mode to env

class TMDBApiHelper {

    listMovies = async (listType) => {
        console.log(`Fetching movies under category: ${listType}`);
        var response = {};

        const url = `${process.env.TMDB_API_URL}/movie/${listType}?language=en-US&page=1`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
        };

        fetch(url, options)
            .then(res => {
                response = res.json();
            })
            .catch(err => console.error(err));
        return response;
    }

    getMovieDetails = async (params, movieId) => {
        var response = {};
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
        };

        const url = `${process.env.TMDB_API_URL}/movie/${movieId}?language=en-US`;

        fetch(url, options)
            .then(res => {
                response = res.json();
            })
            .catch(err => console.error(err));
        return response;

    }

    searchMovies = async (params, query) => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`
            }
        };
        var response = {};
        const url = `${process.env.TMDB_API_URL}/search/movie?` + new URLSearchParams(params).toString();
        console.log(`Searching movies with url: ${url}`);
        fetch(url, options)
            .then(res => {
                response = res.json();
            })
            .catch(err => console.error(err));
        return response;
    }
}

module.exports = new TMDBApiHelper();
