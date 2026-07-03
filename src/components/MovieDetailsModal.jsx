import React, { useState, useEffect, useRef } from 'react';
import { X, Star, Clock, Film, ChevronDown } from 'lucide-react';
import { getMovieDetails } from '../utils/tmdb';

const MovieDetailsModal = ({ imdbID, onClose }) => {
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            const data = await getMovieDetails(imdbID);
            if (data && data.Response === "True") {
                setMovie(data);
            }
            setIsLoading(false);
        };
        fetchDetails();
        
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [imdbID]);

    // Handle scroll to hide indicator
    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
            setIsScrolledToBottom(true);
        } else {
            setIsScrolledToBottom(false);
        }
    };

    if (!imdbID) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 lg:p-12 bg-black/90 backdrop-blur-3xl animate-fade-in overflow-y-auto md:overflow-hidden scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div className="bg-black/40 shadow-[0_30px_100px_rgba(0,0,0,0.9)] w-full min-h-[100dvh] md:min-h-0 md:h-[85vh] md:max-w-7xl relative flex flex-col md:flex-row md:rounded-[2.5rem] md:border border-white/10 md:overflow-hidden animate-slide-up my-auto">
                
                {/* Close Button - Stays fixed on mobile so it's always accessible */}
                <button 
                    onClick={onClose}
                    className="fixed md:absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-black/40 hover:bg-white/30 backdrop-blur-xl text-white rounded-full z-50 transition-all duration-300 hover:scale-110 border border-white/20 shadow-2xl flex items-center justify-center group"
                    aria-label="Close modal"
                >
                    <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {isLoading ? (
                    <div className="w-full h-[100dvh] md:h-full flex items-center justify-center bg-transparent relative overflow-hidden">
                        {/* Majestic Dual-Ring Orbital Loader (No Text) */}
                        <div className="absolute w-32 h-32 rounded-full border border-white/5 border-t-accent animate-[spin_2s_cubic-bezier(0.4,0,0.2,1)_infinite] shadow-[0_0_40px_rgba(250,204,21,0.1)]"></div>
                        <div className="absolute w-24 h-24 rounded-full border border-white/10 border-b-accent/50 animate-[spin_3s_linear_infinite_reverse]"></div>
                        <div className="w-12 h-12 bg-accent/20 rounded-full blur-md animate-pulse shadow-[0_0_50px_rgba(250,204,21,0.4)]"></div>
                    </div>
                ) : movie ? (
                    <>
                        {/* Poster Side - Natural flow on mobile, absolute/fixed on desktop */}
                        <div className="relative w-full md:w-[40%] xl:w-[35%] h-[50vh] min-h-[50vh] md:min-h-0 md:h-full flex-shrink-0 bg-black md:border-r border-white/10">
                            <img 
                                src={movie.Poster !== "N/A" ? movie.Poster : `https://via.placeholder.com/500x750/1e293b/facc15?text=${encodeURIComponent(movie.Title)}`} 
                                alt={movie.Title}
                                className="w-full h-full object-cover filter contrast-[1.1] saturate-[1.1] absolute inset-0"
                            />
                        </div>

                        {/* Details Pane - Flexes to content on mobile, isolated scroll on desktop */}
                        <div className="relative flex-1 bg-transparent flex flex-col md:overflow-hidden">
                            <div 
                                ref={scrollContainerRef}
                                onScroll={handleScroll}
                                className="p-6 md:p-12 lg:p-16 flex-1 pb-32 md:overflow-y-auto hide-scrollbar scroll-smooth"
                                style={{ WebkitOverflowScrolling: 'touch' }}
                            >
                                {/* Accent line */}
                                <div className="w-12 h-1 bg-accent mb-8 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)]"></div>

                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold mb-4 leading-[1.1] tracking-tight drop-shadow-2xl text-white">
                                    {movie.Title}
                                </h2>
                                
                                <p className="text-lg md:text-xl font-serif text-white/50 italic mb-10">
                                    {movie.Year} • <span className="text-white/80">{movie.Director}</span>
                                </p>
                                
                                <div className="flex flex-wrap items-center gap-3 text-xs font-sans font-bold tracking-widest text-white mb-12">
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-lg shadow-inner">
                                        <Star className="text-accent fill-accent" size={14} />
                                        <span>{movie.imdbRating}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-lg shadow-inner">
                                        <Clock size={14} className="text-white/60" />
                                        <span>{movie.Runtime}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-lg shadow-inner">
                                        <Film size={14} className="text-white/60" />
                                        <span className="uppercase text-accent">{movie.Type}</span>
                                    </div>
                                    <div className="bg-accent/10 border border-accent/20 rounded-lg backdrop-blur-md px-4 py-2 text-accent shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                                        {movie.Rated}
                                    </div>
                                </div>

                                <div className="mb-12">
                                    <h3 className="text-xs font-sans text-accent uppercase tracking-[0.25em] font-bold mb-4 drop-shadow-sm">Synopsis</h3>
                                    <p className="text-white/80 font-sans text-base md:text-lg leading-relaxed font-light drop-shadow selection:bg-accent selection:text-black">
                                        {movie.Plot !== "N/A" ? movie.Plot : 'No plot available.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12 pt-10 border-t border-white/5">
                                    <div>
                                        <h3 className="text-[10px] font-sans text-white/40 uppercase tracking-[0.2em] font-bold mb-3">Director</h3>
                                        <p className="text-base font-serif text-white drop-shadow">{movie.Director}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-[10px] font-sans text-white/40 uppercase tracking-[0.2em] font-bold mb-3">Writer</h3>
                                        <p className="text-base font-serif text-white drop-shadow">{movie.Writer}</p>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <h3 className="text-[10px] font-sans text-white/40 uppercase tracking-[0.2em] font-bold mb-3">Top Cast</h3>
                                        <p className="text-base font-serif text-accent drop-shadow">{movie.Actors}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-x-8 gap-y-4 font-sans text-sm font-medium text-white/70 bg-white/5 backdrop-blur-xl p-6 rounded-[1.5rem] border border-white/5 shadow-inner">
                                    <span><strong className="text-white uppercase tracking-[0.1em] text-[10px] mr-3">Genres</strong> {movie.Genre}</span>
                                    <span><strong className="text-white uppercase tracking-[0.1em] text-[10px] mr-3">Language</strong> {movie.Language}</span>
                                    <span><strong className="text-white uppercase tracking-[0.1em] text-[10px] mr-3">Box Office</strong> {movie.BoxOffice || 'N/A'}</span>
                                </div>
                            </div>
                            
                            {/* Scroll Indicator Overlay - Hidden on mobile, vibrant on desktop */}
                            <div className={`hidden md:flex absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none transition-opacity duration-500 items-end justify-center pb-6 ${isScrolledToBottom ? 'opacity-0' : 'opacity-100'}`}>
                                <div className="flex flex-col items-center text-white/50 animate-bounce">
                                    <span className="text-[10px] uppercase tracking-widest font-sans font-bold mb-1">Scroll to discover</span>
                                    <ChevronDown size={16} className="text-accent" />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                        <p className="text-2xl font-serif tracking-widest">ARCHIVE UNAVAILABLE</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieDetailsModal;
