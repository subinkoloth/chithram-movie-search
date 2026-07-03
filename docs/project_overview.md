# Movie Search Engine: Project Overview

This document outlines the architecture and design choices made while building the Movie Search Engine.

## Project Structure

The project was bootstrapped with Vite for high performance and fast hot-module replacement during development. It uses React for the UI and Tailwind CSS for styling.

```
movie-engine/
├── src/
│   ├── components/
│   │   ├── HeroSection.jsx    # Hero area and Search bar
│   │   ├── FilterBar.jsx      # Language dropdown and Year Range Slider
│   │   ├── MovieCard.jsx     # Individual movie item with glassmorphism
│   │   └── MovieGrid.jsx      # Grid layout for rendering multiple cards
│   ├── utils/
│   │   └── tmdb.js            # Mock API utility representing TMDB responses
│   ├── App.jsx                # Main container tying logic and state
│   ├── index.css              # Global styles and Tailwind configuration
│   └── main.jsx               # React entry point
├── docs/
│   └── project_overview.md    # This file
└── tailwind.config.js         # Custom theme colors (background, accent)
```

## React Components and Their Purpose

### 1. `HeroSection.jsx`
- **Purpose**: Acts as the landing banner. It holds the main Search Input. 
- **Reason**: Separating the search bar UI from the main App component keeps the layout clean and modular.

### 2. `FilterBar.jsx`
- **Purpose**: Contains the regional language filter and the release year range slider.
- **Dependencies**: Uses `react-range` for the dual-handle slider.
- **Reason**: Grouping filters linearly across the top of the grid makes navigation intuitive.

### 3. `MovieGrid.jsx`
- **Purpose**: A responsive grid wrapper that iterates over the filtered movie array and renders `MovieCard` components.
- **Reason**: Handles empty states ("No movies found") and loading spinners instead of cluttering `App.jsx`.

### 4. `MovieCard.jsx`
- **Purpose**: Represents a single movie object with visual flair (glassmorphism overlay, bottom-aligned metadata).
- **Reason**: Encapsulates data rendering for individual items independently.

### 5. `App.jsx`
- **Purpose**: This is the "Smart Component" or Container. All state lives here: `searchQuery`, `selectedLanguage`, `yearRange`, and `movies`, along with `isDarkMode`.
- **Reason**: "Lifting state up" to the App level allows sibling components (`FilterBar` and `MovieGrid`) to share and reflect changes instantly.

## Core Functionality Logic

### useMemo for Dynamic Filtering
Instead of triggering an API call every time a user types in the search bar or slides the year range, we fetch the movies once via `useEffect` and apply client-side filtering via `useMemo`.

```javascript
const filteredMovies = useMemo(() => {
  return movies.filter((movie) => {
    // Check search, language, and year range
  });
}, [movies, searchQuery, selectedLanguage, yearRange]);
```
- **Why `useMemo`?**: Filtering an array of elements on every React render can be expensive. `useMemo` caches the filtered array and only recalculates it when its dependencies change, ensuring high UI responsiveness.

### Dark Theme configuration
Tailwind's custom configuration powers the design system. We extended `theme.colors` to include custom variables like `background` and `accent`. The toggle in `App.jsx` handles dynamically applying the `dark` class to the HTML root object, making switching instantaneous.

## Mocking TMDB
Currently, the `src/utils/tmdb.js` file returns a hardcoded list of varied region movies with a simulated network delay. 
