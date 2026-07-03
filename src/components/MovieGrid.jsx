import React from 'react';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MovieGrid = ({ movies, isLoading, onMovieClick, currentPage, totalPages, onPageChange }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-32">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!movies || movies.length === 0) {
        return (
            <div className="text-center py-32">
                <h3 className="text-3xl font-serif text-textMain mb-4">No movies found</h3>
                <p className="text-textMuted font-sans max-w-md mx-auto">We couldn't find any films matching your criteria. Try adjusting your search query or exploring a different category.</p>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-0 pb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
                {movies.map((movie) => (
                    <MovieCard key={movie.imdbID} movie={movie} onClick={() => onMovieClick(movie.imdbID)} />
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 mt-16 border-t border-borderBase pt-8">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-3 rounded-full flex items-center justify-center transition-all ${
                            currentPage === 1 
                                ? 'bg-surface text-borderBase cursor-not-allowed hidden sm:flex' 
                                : 'bg-surface text-textMain hover:bg-accent hover:text-primary shadow-sm'
                        }`}
                        aria-label="Previous Page"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <div className="flex items-center gap-2 font-sans font-medium">
                        <span className="text-textMain px-4 py-2 bg-surface rounded-lg border border-borderBase shadow-sm">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>

                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-3 rounded-full flex items-center justify-center transition-all ${
                            currentPage === totalPages 
                                ? 'bg-surface text-borderBase cursor-not-allowed hidden sm:flex' 
                                : 'bg-surface text-textMain hover:bg-accent hover:text-primary shadow-sm'
                        }`}
                        aria-label="Next Page"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default MovieGrid;
