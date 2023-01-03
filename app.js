const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//get all movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
    *
    FROM 
    movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((eachMovie) => 
  convertDbObjectToResponseObject(eachMovie)));
});

//add new movie
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO 
  movie (director_id, movie_name, lead_actor) 
  VALUES (${directorId}, '${movieName}', '${leadActor}');`;
  await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//get a particular movie based on movie_id
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT 
  * 
  FROM movie 
  WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

//update a movie based on movie_id
app.put("/movies/:movieId/", (request, response) => {
    const {movieId} = request.params;
    const movieDetails = request,body;
    const {directorId, movieName, leadActor} = movieDetails;
    const updateMovieQuery = `
    UPDATE movie 
    SET director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
    await db.run(updateMovieQuery);
    response.send("Movie Details Updated");
});

//delete a movie
app.delete("/movies/:movieId/", async (request, response) => {
    const {movieId} = request.params;
    const deleteMovieQuery = `
    DELETE FROM 
    movie
    WHERE movie_id = ${movieId};`;
    await db.run(deleteMovieQuery);
    response.send("Movie Removed");
});



//get all directors from director table
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT 
    *
    FROM 
    director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray.map((eachDirector) => 
  convertDbObjectToResponseObject(eachDirector)));
});

//get director all movies
app.get("/directors/:directorId/movies/", async (request, response) => {
    const getDirectorMoviesQuery =`
    SELECT *
     FROM movie INNER JOIN director 
     on movie.movieId = director.movieId;`;
    const movies = await db.all(getDirectorMoviesQuery);
    response.send(convertDbObjectToResponseObject(movies))
});

module.exports = app;