"use client";

import { useState, useEffect, useRef } from "react";
import { Movie } from "../types";

interface MovieSearchInputProps {
  onMovieSelect: (movieTitle: string) => void;
  guessedMovies: string[];
  disabled: boolean;
}

export default function MovieSearchInput({
  onMovieSelect,
  guessedMovies,
  disabled,
}: MovieSearchInputProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search-movies?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();

        if (data.results) {
          // Filter movies with posters, sort by popularity, and take top 4
          const filteredMovies = data.results
            .filter(
              (movie: Movie) =>
                movie.poster_path !== null && movie.popularity > 0.5
            )
            .sort((a: Movie, b: Movie) => b.popularity - a.popularity)
            .slice(0, 4);

          setSuggestions(filteredMovies);
          setShowSuggestions(true);
          setSelectedIndex(-1);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleSelectMovie = (movieTitle: string) => {
    onMovieSelect(movieTitle);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && suggestions.length > 0) {
      const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;
      const targetMovie = suggestions[targetIndex];
      if (targetMovie && !isAlreadyGuessed(targetMovie.title)) {
        handleSelectMovie(targetMovie.title);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowUp") {
      e.preventDefault();
      // Move UP in the list (toward index 0, away from input)
      setSelectedIndex((prev) => {
        if (prev === -1) return suggestions.length - 1; // Start from bottom (closest to input)
        return prev > 0 ? prev - 1 : 0; // Move up, stop at top
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      // Move DOWN in the list (toward higher index, closer to input)
      setSelectedIndex((prev) => {
        if (prev === -1) return suggestions.length - 1; // Start from bottom (closest to input)
        return prev < suggestions.length - 1
          ? prev + 1
          : suggestions.length - 1; // Move down, stop at bottom
      });
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const isAlreadyGuessed = (title: string) => {
    return guessedMovies.some(
      (guessed) => guessed.toLowerCase() === title.toLowerCase()
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#18181b] border-2 border-[#27272a] rounded-xl shadow-2xl z-40 max-h-96 overflow-y-auto animate-slide-up">
          {suggestions.map((movie, index) => {
            const alreadyGuessed = isAlreadyGuessed(movie.title);
            const isSelected = index === selectedIndex;
            return (
              <button
                key={movie.id}
                onClick={() =>
                  !alreadyGuessed && handleSelectMovie(movie.title)
                }
                disabled={alreadyGuessed}
                className={`w-full flex items-center gap-4 p-3 transition-all border-b border-[#27272a] last:border-b-0 text-left ${
                  alreadyGuessed
                    ? "opacity-50 cursor-not-allowed bg-[#0a0a0f]"
                    : isSelected
                    ? "bg-indigo-600/30 cursor-pointer"
                    : "cursor-pointer hover:bg-[#27272a]"
                }`}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="w-12 h-18 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">
                    {movie.title}
                    {alreadyGuessed && (
                      <span className="ml-2 text-xs text-red-400 font-normal">
                        (Already guessed)
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isLoading && query.length >= 2 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#18181b] border-2 border-[#27272a] rounded-xl p-4 text-center text-gray-400 animate-slide-up">
          Searching...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a movie title..."
          disabled={disabled}
          className="w-full px-5 py-4 text-lg bg-[#18181b] border-2 border-[#27272a] text-white rounded-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </form>
    </div>
  );
}
