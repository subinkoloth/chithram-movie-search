import React from 'react';
import { Filter } from 'lucide-react';

const genres = [
    { id: 'all', name: 'All Movies' },
    { id: 'lang_ml', name: 'Malayalam' },
    { id: 28, name: 'Action' },
    { id: 35, name: 'Comedy' },
    { id: 10749, name: 'Romance' },
    { id: 53, name: 'Thriller' },
    { id: 878, name: 'Sci-Fi' },
    { id: 99, name: 'Documentary' },
    { id: 9648, name: 'Mystery' },
    { id: 14, name: 'Fantasy' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' }
];

const FilterBar = ({ activeGenre, setActiveGenre }) => {
    return (
        <div className="bg-black/40 border-y border-white/10 backdrop-blur-3xl sticky top-0 z-40 w-full mb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                    <div className="flex items-center gap-3 text-white font-medium mb-2 md:mb-0">
                        <Filter size={20} className="text-accent" />
                        <span className="font-sans tracking-[0.15em] text-sm font-bold uppercase drop-shadow-md">Categories</span>
                    </div>

                    <div className="flex-1 w-full overflow-x-auto hide-scrollbar relative">
                        <div className="flex items-center gap-3 justify-start px-6 pb-2 md:pb-0">
                            {genres.map(genre => (
                                <button
                                    key={genre.id}
                                    onClick={() => setActiveGenre(genre.id)}
                                    className={`px-6 py-2.5 rounded-full whitespace-nowrap text-sm font-sans tracking-wide transition-all duration-300 border ${
                                        activeGenre === genre.id 
                                            ? 'bg-accent border-accent text-black shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-105 font-bold' 
                                            : 'bg-white/10 border-white/30 text-white/90 hover:bg-white/20 hover:border-white/50 hover:text-white font-medium shadow-sm'
                                    }`}
                                >
                                    {genre.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterBar;
