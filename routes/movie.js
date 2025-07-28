const { default: axios, HttpStatusCode } = require("axios");
const express = require("express");
const router = express.Router();
const HelperMethods = require("../utils/sharedutils");
const TMDBApiHelper = require("../utils/tmdb");

const defaultStatusMessage = "Invalid request / Invalid user information";

/**
 * @swagger
 * /:
 *   get:
 *     summary: Landing Page List
 *     description: Landing Page List.
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           description: Movie list type category: now_playing, popular, upcoming, top_rated.
 *           enum: [now_playing, popular, upcoming, top_rated]
 *           default: top_rated
 *     responses:
 *       200:
 *         description: Successful response with list of content found.
 *       401:
 *         description: Authentication error
 *       400:
 *         description: Search Content bad request / Server error
 */
router.get("/", async (req, res) => {
    console.log(`Landing Page Content List Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = defaultStatusMessage;
    var data = {};
    var successful = false;

    const { type } = req.query
    params = {
        type: type || ""
    }

    try {
        data = await TMDBApiHelper.listMovies(params.type);
        // console.log("Data fetched successfully:", data);

        successful = true;
        statusCode = HttpStatusCode.Ok.toString();
        statusMessage = "Movies search successfully";
    } catch (error) {
        statusMessage = "Error searching movies";
    }

    res.json(
        HelperMethods.makeResponseObject(
            statusCode,
            statusMessage,
            successful,
            data
        )
    );
    res.end();
});


/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search Movies
 *     description: Search for movies using a query string.
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           description: The search keyword for the movie.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *           description: Page number for paginated results.
 *       - in: query
 *         name: include_adult
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *           description: Whether to include adult rated content in results.
 *       - in: query
 *         name: language
 *         required: false
 *         schema:
 *           type: string
 *           default: "en-US"
 *           description: The language of the results.
 *      - in: query
 *        name: primary_release_year
 *        required: false
 *        schema:
 *          type: string
 *          description: The primary release year of the movie.
 *      - in: query
 *         name: region
 *         required: false
 *         schema:
 *          type: string
 *          description: The region for the movie search.
 *     responses:
 *       200:
 *         description: Successful response with list of content found.
 *       401:
 *         description: Authentication error
 *       400:
 *         description: Search Content bad request / Server error
 */
router.get("/search", async (req, res) => {
    console.log(`Discover Content Request Handler: [request = ${JSON.stringify(req.body)}, Received on: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}]`);

    // Response variables
    var statusCode = HttpStatusCode.Unauthorized.toString();
    var statusMessage = defaultStatusMessage;
    var data = {};
    var successful = false;

    // TODO: implement service
    const { query, include_adult, language, primary_release_year, page, region, year } = req.query
    params = {
        query: query || "",
        include_adult: include_adult || false,
        language: language || "en-US",
        primary_release_year: primary_release_year || "",
        page: page || 1,
        region: region || "",
        year: year || ""
    }

  try {
    data = await TMDBApiHelper.searchMovies(params);
    successful = true;
    statusCode = HttpStatusCode.Ok.toString();
    statusMessage = "Movies search successfully";
  } catch (error) {
    console.error("Error searching movies:", error);
    statusMessage = "Error searching movies";
  }

  res.json(
    HelperMethods.makeResponseObject(
      statusCode,
      statusMessage,
      successful,
      data
    )
  );
  res.end();
});



/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: View Movie Details
 *     description: View Movie Details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the movie
 *     responses:
 *       200:
 *         description: Successful response with movie details.
 *       401:
 *         description: Authentication error
 *       400:
 *         description: Search Content bad request / Server error
 */
router.get("/:id", async (req, res) => {
  console.log(
    `Movie Details Request Handler: [request = ${JSON.stringify(
      req.body
    )}, Received on: ${new Date().toLocaleString("en-US", {
      timeZoneName: "short",
    })}]`
  );

  const movieId = req.params.id;

  // Response variables
  var statusCode = HttpStatusCode.Unauthorized.toString();
  var statusMessage = defaultStatusMessage;
  var data = {};
  var successful = false;

  // TODO: implement service

  try {
    data = await TMDBApiHelper.getMovieDetails({}, movieId);
    successful = true;
    statusCode = HttpStatusCode.Ok.toString();
    statusMessage = "Movie details fetched successfully";
  } catch (error) {
    statusMessage = "Error fetching movie details";
  }
  res.json(
    HelperMethods.makeResponseObject(
      statusCode,
      statusMessage,
      successful,
      data
    )
  );
  res.end();
});

module.exports = router;
