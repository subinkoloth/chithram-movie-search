# Movie Search Engine - Interview & Study Guide

This document is for your reference during interviews. It breaks down the technical implementation details of key features in the Movie Search Engine.

---

### 1. The Full-Screen Search Modal & Debouncing
**Interviewer:** *"How did you build the full-screen search feature, and how did you optimize it so it doesn't spam the API on every keystroke?"*

**Implementation Details:**
- **UI Overlay:** The search overlay is a fixed, full-screen `div` (`fixed inset-0`) with a high `z-index` and a glassmorphism blur effect (`backdrop-blur-3xl`, `bg-black/95`).
- **Scroll Locking:** When the search modal opens, `document.body.style.overflow = 'hidden'` is applied to prevent the background page from scrolling. It is unset when the modal closes.
- **Debouncing:** To prevent spamming the OMDB API on every keystroke, I implemented a custom debouncing logic inside a `useEffect` hook. A `setTimeout` is set for 300ms every time the `inputValue` changes. If the user types another letter within 300ms, the previous timeout is cleared using `clearTimeout`, and a new one starts. The API call (`fetchSuggestions`) only executes if the user stops typing for 300ms.
- **Auto-focus:** When the modal opens, an invisible timeout slightly delays calling `.focus()` on the input's `ref` so the CSS animation can start smoothly before taking text input.

---

### 2. The Glassmorphism UI
**Interviewer:** *"The UI looks very modern with the glass effect. How did you achieve that using Tailwind CSS?"*

**Implementation Details:**
- **Core utility classes:** The glassmorphism effect is built by combining a semi-transparent background color (e.g., `bg-white/5` or `bg-black/40`), a strong background blur (`backdrop-blur-xl` or `backdrop-blur-3xl`), and a subtle border (`border border-white/10`).
- **Shadows for depth:** Inner shadows (`shadow-inner`) or custom drop-shadows are used to create separation between layers.
- **Hover Transitions:** Interactive elements use `transition-all duration-300` alongside hover states (`hover:bg-white/20`, `hover:border-white/30`) to give the UI a responsive, tactile feel.
- **No solid colors:** I avoided solid colors for overlay layers, relying entirely on alphas (opacity variables) to ensure the background imagery smoothly bleeds through everything.

---

### 3. Hero Section Image Carousel
**Interviewer:** *"How does the background image rotation work in the Hero Section?"*

**Implementation Details:**
- **State Management:** The component maintains a `trending` array of movies and a `currentIndex` integer starting at `0`.
- **Interval Timer:** A `useEffect` hook sets up a `setInterval` that increments the `currentIndex` every 6000ms (6 seconds). It uses modulo arithmetic `(prevIndex + 1) % trending.length` to loop back to the first image.
- **Cleanup:** The interval is cleared (`clearInterval`) in the `useEffect` cleanup function to prevent memory leaks. Also, the timer is paused (bypassed) if the search modal is open so it doesn't distract the user.
- **Transition Animation:** All images are rendered in the DOM absolutely positioned on top of each other. The active image gets `opacity-100 scale-100`, while inactive ones get `opacity-0 scale-105` along with a very slow transition duration (`duration-[3000ms] ease-in-out`), creating a cinematic fade-and-zoom effect.

---

### 4. Movie Details Modal & Fetching
**Interviewer:** *"When I click a movie, how does the modal pop up with detailed information?"*

**Implementation Details:**
- **Component Architecture:** The `MovieDetailsModal` receives only the `imdbID` as a prop.
- **Data Fetching:** Upon mounting, a `useEffect` triggers an asynchronous call to the API to fetch the full details for that specific `imdbID`. A loading state (`isLoading = true`) displays an orbital loader animation until the data arrives.
- **Responsive Layout:** The modal uses flexbox. On mobile, it flexes naturally with the poster filling the top half (`flex-col`), and the details gracefully scrolling below it. On desktop, it adopts a side-by-side layout (`flex-row`) with an isolated scroll container for the right-side text panel (`md:overflow-y-auto`).
- **Custom Scroll Indicator:** A dynamic scroll indicator fades out when the user reaches the bottom of the content. This is achieved by attaching an `onScroll` event listener to the text container `ref` and checking if `scrollTop + clientHeight >= scrollHeight - 20`.

---

### 5. API Integration & Error Handling
**Interviewer:** *"How are you talking to the movie database, and how is it secured?"*

**Implementation Details:**
- **API Utility:** All external API logic is abstracted into `src/utils/tmdb.js`. This creates a clean separation of concerns so React components don't contain raw `fetch` calls.
- **Vite Env Variables:** The API key is stored securely (as far as client-side allows) in a `.env` file and accessed via Vite's `import.meta.env.VITE_OMDB_API_KEY`. It is never hardcoded in the repository.
- **Error Handling:** `try-catch` blocks wrap the `fetch` calls. Because OMDB returns a specific `Response: "True"` flag, the logic checks for that flag to handle edge cases like "Movie Not Found", preventing the application from crashing and allowing the UI to display a graceful fallback.
