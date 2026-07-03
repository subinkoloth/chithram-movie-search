import React, { useState, useEffect, useRef } from 'react';
import { Search, Info, X } from 'lucide-react';
import { searchMovies, getTrendingMovies } from '../utils/tmdb';
import logo from '../assets/movie/logo.png';

const HeroSection = ({ onSearch, onMovieSelect }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchInputRef = useRef(null);

    const [trending, setTrending] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Fetch and randomize trending for carousel
    useEffect(() => {
        const fetchTrending = async () => {
            const data = await getTrendingMovies();
            if (data && data.length > 0) {
                // Better Fisher-Yates shuffle to guarantee true randomness and no clumps
                const shuffled = [...data];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                
                // Prioritize Malayalam movies explicitly (extract them, then fill the rest)
                const malayalam = shuffled.filter(m => m.Language === 'ml');
                const others = shuffled.filter(m => m.Language !== 'ml');
                
                // Construct a 10-movie array: exactly 5 Malayalam + filled with others
                let selection = [...malayalam.slice(0, 5), ...others].slice(0, 10);
                
                // Shuffle the selection again so Malayalam aren't all clumped at the start
                for (let i = selection.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [selection[i], selection[j]] = [selection[j], selection[i]];
                }

                setTrending(selection);
            }
        };
        fetchTrending();
    }, []);

    // 6s rotation timer
    useEffect(() => {
        if (trending.length === 0 || showSuggestions) return; // Pause rotation when searching
        const intervalId = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % trending.length);
        }, 6000);
        return () => clearInterval(intervalId);
    }, [trending, showSuggestions]);

    // Auto-focus the overlay search input when modal opens
    useEffect(() => {
        if (showSuggestions && searchInputRef.current) {
            // Small timeout allows the CSS transition to initiate before focusing
            setTimeout(() => searchInputRef.current.focus(), 100);
        } else if (!showSuggestions) {
            // Prevent background from scrolling when the search overlay is open
            document.body.style.overflow = 'unset';
            return;
        }
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [showSuggestions]);

    // Debounced fetch for search suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!inputValue.trim()) {
                setSuggestions([]);
                return;
            }
            const data = await searchMovies(inputValue.trim(), 1);
            if (data && data.Response === "True" && data.Search) {
                setSuggestions(data.Search.slice(0, 6)); // Increase to 6 for full screen layout
            } else {
                setSuggestions([]);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (inputValue.trim()) {
            onSearch(inputValue);
            setInputValue(''); // Clear input after search submission
        }
    };

    return (
        <div className="relative w-full min-h-screen overflow-hidden flex flex-col p-4 sm:p-6 lg:p-8">
            {/* Ambient Base Layer */}
            <div className="absolute inset-0 bg-background z-0" />

            {/* Branding Header */}
            <header className="absolute top-0 left-0 z-50 py-8 px-8 animate-fade-in-down">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 shadow-[0_5px_15px_rgba(0,0,0,0.8)] group-hover:scale-110 transition-transform duration-500">
                        <img src={logo} alt="Chalachithram Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm md:text-base font-serif font-bold text-red-500/90 tracking-widest drop-shadow-[0_4px_4px_rgba(0,0,0,1)] group-hover:text-red-400 transition-colors duration-300">
                        CHALACHITHRAM
                    </span>
                </div>
            </header>

            {/* Rotating Background Images */}
            {trending.map((movie, index) => (
                <div 
                    key={movie.imdbID}
                    className={`absolute inset-0 w-full h-full transform-gpu transition-all duration-[3000ms] ease-in-out z-0 ${index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/20 z-10" />
                    <img
                        src={movie.Backdrop !== 'N/A' ? movie.Backdrop : movie.Poster}
                        alt={movie.Title}
                        className="w-full h-full object-cover object-top opacity-100 filter brightness-110 contrast-[1.1] saturate-[1.1]"
                    />
                </div>
            ))}

            {/* Cinematic Hero Text */}
            <div className="relative z-20 w-full max-w-5xl mx-auto flex flex-col items-center justify-end h-full flex-1 pb-[180px] md:pb-[240px] text-center">
                {trending.length > 0 ? trending.map((movie, index) => (
                    <div 
                        key={`info-${movie.imdbID}`}
                        className={`absolute bottom-[180px] md:bottom-[240px] w-full transform-gpu transition-all duration-[1200ms] ease-out flex flex-col justify-end items-center ${index === currentIndex ? 'opacity-100 translate-y-0 scale-100 z-30' : 'opacity-0 translate-y-12 scale-95 pointer-events-none z-10'}`}
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-extrabold text-white/90 tracking-tight leading-[1.1] mb-5 drop-shadow-[0_10px_30px_rgba(0,0,0,1)] px-4">
                            {movie.Title}
                        </h1>
                        
                        <div className="flex items-center justify-center gap-4 text-sm md:text-base font-sans text-white/90 font-medium tracking-widest mb-6 drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]">
                            <span>{movie.Year}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_15px_rgba(250,204,21,1)]"></span>
                            <span className="uppercase">{movie.Type}</span>
                        </div>

                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                onMovieSelect(movie.imdbID);
                            }}
                            className="px-6 py-2.5 bg-white/5 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white font-sans text-xs font-bold uppercase tracking-[0.2em] rounded-full transition-all duration-300 flex items-center gap-2 hover:scale-105 hover:border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                        >
                            <Info size={16} className="text-accent" />
                            View Details
                        </button>
                    </div>
                )) : null}
            </div>

            {/* Inactive Hero Search Button (Dummy trigger) */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[8vh] md:bottom-[12vh] w-[calc(100%-2rem)] max-w-3xl z-30">
                <div 
                    onClick={() => setShowSuggestions(true)}
                    className="flex justify-between items-center w-full pl-6 pr-4 py-4 sm:py-5 border border-white/10 hover:border-white/30 rounded-[2.5rem] bg-surface/40 hover:bg-surface/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-text group transition-all duration-500 hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-4">
                        <Search className="h-6 w-6 text-white/60 group-hover:text-accent transition-colors duration-300" />
                        <span className="text-white/40 font-sans text-lg md:text-xl font-medium tracking-wide">Search the Movie</span>
                    </div>
                    <div className="px-6 py-2.5 bg-white/10 rounded-full text-white text-sm font-bold tracking-widest uppercase border border-white/10">Search</div>
                </div>
            </div>

            {/* Active Full-Screen Search Modal (Smartphone-like) */}
            <div 
                className={`fixed inset-0 z-[200] flex flex-col items-center bg-black/95 backdrop-blur-3xl transform-gpu transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showSuggestions ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-8 invisible pointer-events-none'}`}
            >
                {/* Search Modal Header (Fixed at the top of the screen) */}
                <div className="w-full max-w-4xl mx-auto px-4 pt-10 pb-6 border-b border-white/10 flex-shrink-0 animate-fade-in-down">
                    <form onSubmit={handleSubmit} className="relative flex items-center w-full">
                        <Search className="absolute left-6 h-6 w-6 text-accent z-10" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Enter movie title..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full bg-white/5 border border-white/20 hover:border-white/30 focus:border-accent rounded-[2rem] py-5 md:py-6 pl-16 pr-32 text-white text-xl md:text-2xl font-sans font-bold placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-accent/50 shadow-2xl transition-all duration-300"
                        />
                        <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
                            {inputValue.trim() && (
                                <button type="button" onClick={() => setInputValue('')} className="p-2 md:p-3 text-white/50 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-colors duration-200">
                                    <X size={18} />
                                </button>
                            )}
                            <button type="button" onClick={() => { setShowSuggestions(false); setInputValue(''); }} className="hidden sm:flex px-6 bg-white/5 hover:bg-white/20 text-white hover:text-white rounded-full text-sm font-bold tracking-widest uppercase border border-white/10 transition-colors duration-200 h-full items-center justify-center">
                                Close
                            </button>
                            {/* Mobile close icon only */}
                            <button type="button" onClick={() => { setShowSuggestions(false); setInputValue(''); }} className="sm:hidden flex p-3 text-accent hover:text-white bg-accent/10 rounded-full transition-colors duration-200 h-full aspect-square items-center justify-center">
                                <X size={20} />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Search Modal Scrolling Suggestions Area */}
                <div className="flex-1 w-full max-w-4xl mx-auto overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {inputValue.trim().length > 0 && suggestions.length > 0 ? (
                        <div className="flex flex-col gap-2 p-4 animate-fade-in">
                            {suggestions.map((movie) => (
                                <div
                                    key={movie.imdbID}
                                    onClick={() => {
                                        setShowSuggestions(false);
                                        onMovieSelect(movie.imdbID);
                                        setInputValue('');
                                    }}
                                    className="flex items-center gap-6 p-4 md:p-5 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors duration-300 group border border-transparent hover:border-white/10"
                                >
                                    <div className="relative w-16 md:w-20 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-background border border-white/10 shadow-lg group-hover:shadow-[0_10px_30px_rgba(250,204,21,0.2)] transition-all duration-500">
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300 z-10" />
                                        <img
                                            src={movie.Poster !== "N/A" ? movie.Poster : `https://via.placeholder.com/100x150/1e293b/facc15?text=N/A`}
                                            alt={movie.Title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col min-w-0 justify-center">
                                        <div className="text-white font-serif font-bold text-2xl md:text-3xl truncate drop-shadow-md group-hover:text-accent transition-colors duration-300 tracking-wide">{movie.Title}</div>
                                        <div className="mt-3 flex items-center gap-3">
                                            <span className="bg-white/10 px-3 py-1 rounded border border-white/20 text-xs text-white/90 font-sans font-bold tracking-widest">{movie.Year}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : inputValue.trim().length > 2 ? (
                        <div className="flex flex-col items-center justify-center h-full text-white/30 font-sans tracking-widest uppercase text-lg p-10 animate-fade-in">
                            <Search size={48} className="mb-6 opacity-20" />
                            No matches found in the archive.
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-white/20 font-sans tracking-widest uppercase text-sm md:text-base p-10 animate-fade-in">
                            <span className="mb-2">Enter a movie title</span>
                            <span className="text-white/10 font-serif lowercase italic">to explore the cinematic database</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Glass Progress Indicators */}
            {trending.length > 0 && (
                <div className="absolute bottom-4 md:bottom-6 z-20 w-full flex justify-center gap-4">
                    {trending.map((_, idx) => (
                        <div 
                            key={`dot-${idx}`}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full cursor-pointer transition-all duration-700 ease-in-out ${idx === currentIndex ? 'w-12 bg-accent shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HeroSection;
