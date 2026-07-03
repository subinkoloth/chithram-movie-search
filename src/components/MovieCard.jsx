import React from 'react';
import { Film, Calendar } from 'lucide-react';

const MovieCard = ({ movie, onClick }) => {
    const year = movie.Year ? movie.Year : 'N/A';

    // Real image URL with fallback, OMDB returns "N/A" if no poster
    const imageSrc = movie.Poster && movie.Poster !== "N/A"
        ? movie.Poster
        : `https://via.placeholder.com/500x750/050507/ffffff?text=${encodeURIComponent(movie.Title)}`;

    return (
        <div 
            onClick={onClick}
            className="relative group rounded-3xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 transition-all duration-500 transform hover:-translate-y-3 shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] cursor-pointer flex flex-col h-full"
        >
            {/* Poster Image */}
            <div className="relative w-full aspect-[2/3] overflow-hidden bg-black/50">
                <img
                    src={imageSrc}
                    alt={movie.Title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 filter brightness-90 group-hover:brightness-105"
                />
            </div>

            {/* Content Metadata Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
                <h3 className="text-lg font-serif font-extrabold text-white mb-2 line-clamp-1 group-hover:text-amber-100 transition-colors drop-shadow-md">
                    {movie.Title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-white/70 font-sans tracking-wide font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-white/40" />
                        <span>{year}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                    <div className="flex items-center gap-1.5">
                        <Film size={13} className="text-white/40" />
                        <span className="uppercase">{movie.Type}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
