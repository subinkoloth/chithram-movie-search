import React, { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import FilterBar from './components/FilterBar';
import MovieGrid from './components/MovieGrid';
import MovieDetailsModal from './components/MovieDetailsModal';
import { searchMovies, getMoviesByGenre, getMoviesByLanguage } from './utils/tmdb';

function App() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  // API Fetch
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      let data;
      
      if (activeGenre === 'lang_ml') {
         data = await getMoviesByLanguage('ml', currentPage);
      } else if (activeGenre !== 'all') {
         data = await getMoviesByGenre(activeGenre, currentPage);
      } else {
         data = await searchMovies(submittedQuery, currentPage);
      }
      
      if (data && data.Response === "True" && data.Search) {
        setMovies(data.Search);
        const total = Math.ceil(parseInt(data.totalResults || 0) / 20);
        setTotalPages(Math.max(1, Math.min(total, 500))); // Cap at 500 per TMDB limit
      } else {
        setMovies([]);
        setTotalPages(1);
      }
      setIsLoading(false);
    };

    fetchMovies();
  }, [submittedQuery, activeGenre, currentPage]);

  const handleGenreChange = (genreId) => {
      setActiveGenre(genreId);
      setCurrentPage(1);
      if (genreId !== 'all') {
          setSubmittedQuery('');
      }
  };

  const handleSearch = (query) => {
      setSubmittedQuery(query);
      setActiveGenre('all');
      setCurrentPage(1);
      
      // Auto scroll to grid if needed
      document.getElementById('movie-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePageChange = (page) => {
      setCurrentPage(page);
      document.getElementById('movie-grid-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-textMain font-sans overflow-x-hidden">
      <main>
        <HeroSection
          onSearch={handleSearch}
          onMovieSelect={(id) => setSelectedMovieId(id)}
        />

        <div id="movie-grid-section" className="scroll-mt-24 relative z-10">
            <FilterBar
            activeGenre={activeGenre}
            setActiveGenre={handleGenreChange}
            />

            <div className="max-w-7xl mx-auto pb-20 mt-8">
            <div className="px-4 sm:px-6 lg:px-8 mb-8 flex justify-between items-end">
                <h2 className="text-3xl md:text-4xl font-serif font-extrabold tracking-tight drop-shadow-lg">
                Chalachithram Featured
                </h2>
                <span className="text-sm font-medium text-textMuted bg-surface/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-borderBase shadow-sm">
                {movies.length > 0 ? `Page ${currentPage} of ${totalPages}` : '0 results'}
                </span>
            </div>

            <MovieGrid 
                movies={movies} 
                isLoading={isLoading} 
                onMovieClick={(id) => setSelectedMovieId(id)}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
            </div>
        </div>

        {/* Details Modal */}
        {selectedMovieId && (
          <MovieDetailsModal 
            imdbID={selectedMovieId} 
            onClose={() => setSelectedMovieId(null)} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
