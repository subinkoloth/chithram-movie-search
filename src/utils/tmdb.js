const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const BASE_URL = 'https://api.themoviedb.org/3';

// Helper to format movie and tv results uniformly
const formatMovies = (results) => {
    return results.map(item => {
        const isTv = item.media_type === 'tv' || item.first_air_date !== undefined || item.name !== undefined;
        const type = isTv ? 'tv' : 'movie';
        return {
            imdbID: `${type}_${item.id}`,
            Title: item.title || item.name,
            Year: (item.release_date || item.first_air_date || '').substring(0, 4) || 'N/A',
            Poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'N/A',
            Backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'N/A',
            Type: type === 'tv' ? 'series' : 'movie',
            Plot: item.overview || 'N/A',
            GenreIds: item.genre_ids || [],
            Language: item.original_language || 'N/A'
        };
    }).filter(item => item.Poster !== 'N/A' && item.Type !== 'person');
};

export const searchMovies = async (query = '', page = 1) => {
    try {
        const url = query.trim() 
            ? `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`
            : `${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=en-US&page=${page}`;
            
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const searchResults = formatMovies(data.results || []);

        return {
            Search: searchResults,
            totalResults: (data.total_results || 0).toString(),
            Response: searchResults.length > 0 ? "True" : "False"
        };
    } catch (error) {
        console.error("Error fetching movies/series from TMDB:", error);
        return { Search: [], Response: "False", Error: error.message };
    }
};

export const getTrendingMovies = async () => {
    try {
        // Start all fetches in parallel
        const [res1, res2, res3] = await Promise.all([
            fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=en-US`),
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ml&sort_by=popularity.desc&include_adult=false`),
            fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ml&sort_by=popularity.desc&include_adult=false`)
        ]);
        
        // Convert all responses to JSON in parallel
        const [data1, data2, data3] = await Promise.all([
            res1.ok ? res1.json() : { results: [] },
            res2.ok ? res2.json() : { results: [] },
            res3.ok ? res3.json() : { results: [] }
        ]);

        const movies1 = formatMovies(data1.results || []);
        const movies2 = formatMovies(data2.results || []);
        const tv3 = formatMovies(data3.results || []);

        const combined = [...movies1, ...movies2, ...tv3]
            .filter((v, i, a) => a.findIndex(t => (t.imdbID === v.imdbID)) === i);
        return combined;
    } catch (error) {
        console.error("Error fetching trending content:", error);
        return [];
    }
};

export const getMoviesByLanguage = async (languageCode, page = 1) => {
    try {
        const [resMovie, resTv] = await Promise.all([
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=${languageCode}&sort_by=popularity.desc&include_adult=false&language=en-US&page=${page}`),
            fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=${languageCode}&sort_by=popularity.desc&include_adult=false&language=en-US&page=${page}`)
        ]);
        
        const [dataMovie, dataTv] = await Promise.all([
            resMovie.ok ? resMovie.json() : { results: [] },
            resTv.ok ? resTv.json() : { results: [] }
        ]);
        
        const combined = [...(dataMovie.results || []), ...(dataTv.results || [])]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        
        const searchResults = formatMovies(combined);

        return {
            Search: searchResults,
            totalResults: ((dataMovie.total_results || 0) + (dataTv.total_results || 0)).toString(),
            Response: searchResults.length > 0 ? "True" : "False"
        };
    } catch (error) {
        console.error("Error fetching content by language from TMDB:", error);
        return { Search: [], Response: "False", Error: error.message };
    }
};

export const getMoviesByGenre = async (genreId, page = 1) => {
    try {
        // We will fetch both since genre IDs overlap for many categories
        const [resMovie, resTv] = await Promise.all([
            fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&include_adult=false&language=en-US&page=${page}`),
            fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=${genreId}&include_adult=false&language=en-US&page=${page}`)
        ]);
        
        const [dataMovie, dataTv] = await Promise.all([
            resMovie.ok ? resMovie.json() : { results: [] },
            resTv.ok ? resTv.json() : { results: [] }
        ]);
        
        const combined = [...(dataMovie.results || []), ...(dataTv.results || [])]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            
        const searchResults = formatMovies(combined);

        return {
            Search: searchResults,
            totalResults: ((dataMovie.total_results || 0) + (dataTv.total_results || 0)).toString(),
            Response: searchResults.length > 0 ? "True" : "False"
        };
    } catch (error) {
        console.error("Error fetching content by genre from TMDB:", error);
        return { Search: [], Response: "False", Error: error.message };
    }
};

export const getMovieDetails = async (id) => {
    try {
        let type = 'movie';
        let realId = id;
        
        if (id && (id.startsWith('tv_') || id.startsWith('movie_'))) {
            [type, realId] = id.split('_');
        }

        const response = await fetch(`${BASE_URL}/${type}/${realId}?api_key=${API_KEY}&append_to_response=credits&language=en-US`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const movie = await response.json();

        let director = 'N/A';
        let writer = 'N/A';
        let actors = 'N/A';
        
        if (movie.created_by && movie.created_by.length > 0) {
            director = movie.created_by.map(c => c.name).join(', ');
        }
        
        if (movie.credits) {
            const crew = movie.credits.crew || [];
            const cast = movie.credits.cast || [];
            
            if (director === 'N/A') {
                const directorObj = crew.find(c => c.job === 'Director');
                if (directorObj) director = directorObj.name;
            }
            
            const writerObj = crew.find(c => c.department === 'Writing' || c.job === 'Screenplay' || c.job === 'Writer');
            if (writerObj) writer = writerObj.name;
            
            actors = cast.slice(0, 4).map(a => a.name).join(', ') || 'N/A';
        }

        const runtime = movie.runtime 
            ? `${movie.runtime} min` 
            : (movie.episode_run_time && movie.episode_run_time.length > 0 ? `${movie.episode_run_time[0]} min` : 'N/A');

        return {
            Response: "True",
            Title: movie.title || movie.name,
            Year: (movie.release_date || movie.first_air_date || '').substring(0, 4) || 'N/A',
            Poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'N/A',
            Backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : 'N/A',
            imdbRating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
            Runtime: runtime,
            Type: type === 'tv' ? 'series' : 'movie',
            Rated: 'N/A',
            Plot: movie.overview || 'N/A',
            Director: director,
            Writer: writer,
            Actors: actors,
            Genre: movie.genres ? movie.genres.map(g => g.name).join(', ') : 'N/A',
            Language: movie.original_language ? movie.original_language.toUpperCase() : 'N/A',
            BoxOffice: movie.revenue && movie.revenue > 0 ? `$${movie.revenue.toLocaleString()}` : 'N/A'
        };
    } catch (error) {
        console.error(`Error fetching details for ${id}:`, error);
        return null;
    }
};
