"use client";

import { useState, useEffect } from "react";
import HowToPlayModal from "./components/HowToPlayModal";
import GameResultModal from "./components/GameResultModal";
import MovieSearchInput from "./components/MovieSearchInput";
import { todaysMovie } from "./data/movieData";
import { GameState } from "./types";

const STORAGE_KEY = "movieAssociationGame";

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

const loadGameState = (): GameState | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Check if it's from today
    if (data.date !== getTodayDateString()) {
      // Old data, clear it
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data.gameState;
  } catch (error) {
    console.error("Error loading game state:", error);
    return null;
  }
};

const saveGameState = (gameState: GameState) => {
  if (typeof window === "undefined") return;

  try {
    const data = {
      date: getTodayDateString(),
      gameState,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving game state:", error);
  }
};

const hasSeenHowToPlayToday = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const seen = localStorage.getItem("howToPlaySeen");
    if (!seen) return false;

    const data = JSON.parse(seen);
    return data.date === getTodayDateString();
  } catch (error) {
    return false;
  }
};

const markHowToPlayAsSeen = () => {
  if (typeof window === "undefined") return;

  try {
    const data = {
      date: getTodayDateString(),
    };
    localStorage.setItem("howToPlaySeen", JSON.stringify(data));
  } catch (error) {
    console.error("Error saving how to play state:", error);
  }
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    cluesRevealed: 1,
    incorrectGuesses: 0,
    guessedMovies: [],
    gameStatus: "playing",
    showHowToPlay: true,
  });
  const [shake, setShake] = useState(false);
  const [showResultModal, setShowResultModal] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);

  // Load saved state on mount
  useEffect(() => {
    const savedState = loadGameState();
    const hasSeenModal = hasSeenHowToPlayToday();

    if (savedState) {
      setGameState(savedState);
      if (savedState.gameStatus !== "playing") {
        setShowResultModal(true);
      }
    } else {
      setGameState((prev) => ({
        ...prev,
        showHowToPlay: !hasSeenModal,
      }));
    }

    setIsInitialized(true);
  }, []);

  // Save state whenever it changes (after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveGameState(gameState);
    }
  }, [gameState, isInitialized]);

  const handleMovieGuess = (movieTitle: string) => {
    if (gameState.gameStatus !== "playing") return;

    // Reset give up confirmation when making a guess
    setShowGiveUpConfirm(false);

    const isCorrect =
      movieTitle.toLowerCase() === todaysMovie.title.toLowerCase();

    if (isCorrect) {
      setShowResultModal(true);
      setGameState((prev) => ({
        ...prev,
        gameStatus: "won",
      }));
    } else {
      // Trigger shake animation
      setShake(true);
      setTimeout(() => setShake(false), 500);

      const newIncorrectGuesses = gameState.incorrectGuesses + 1;
      const newCluesRevealed = Math.min(gameState.cluesRevealed + 1, 9);

      if (newIncorrectGuesses >= 9) {
        setShowResultModal(true);
      }

      setGameState((prev) => ({
        ...prev,
        incorrectGuesses: newIncorrectGuesses,
        cluesRevealed: newCluesRevealed,
        guessedMovies: [...prev.guessedMovies, movieTitle],
        gameStatus: newIncorrectGuesses >= 9 ? "lost" : "playing",
      }));
    }
  };

  const handleSkip = () => {
    if (gameState.gameStatus !== "playing") return;
    if (gameState.incorrectGuesses >= 9) return;

    // If on last guess (incorrectGuesses === 8), require confirmation
    if (gameState.incorrectGuesses === 8) {
      if (!showGiveUpConfirm) {
        setShowGiveUpConfirm(true);
        return;
      }
      // User confirmed, proceed with giving up
    }

    const newIncorrectGuesses = gameState.incorrectGuesses + 1;
    const newCluesRevealed = Math.min(gameState.cluesRevealed + 1, 9);

    if (newIncorrectGuesses >= 9) {
      setShowResultModal(true);
    }

    setGameState((prev) => ({
      ...prev,
      incorrectGuesses: newIncorrectGuesses,
      cluesRevealed: newCluesRevealed,
      gameStatus: newIncorrectGuesses >= 9 ? "lost" : "playing",
    }));

    setShowGiveUpConfirm(false);
  };

  const handleCancelGiveUp = () => {
    setShowGiveUpConfirm(false);
  };

  const showImdbRating = gameState.incorrectGuesses >= 3;
  const showReleaseYear = gameState.incorrectGuesses >= 6;
  const showMainActor = gameState.incorrectGuesses >= 8;

  return (
    <div
      className={`min-h-screen bg-[#0a0a0f] flex flex-col ${
        shake ? "animate-shake" : ""
      }`}
    >
      {/* Header */}
      <header className="bg-[#18181b] border-b border-[#27272a] py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Plotted
            </h1>
            <button
              onClick={() =>
                setGameState((prev) => ({ ...prev, showHowToPlay: true }))
              }
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-semibold hover:shadow-lg hover:shadow-indigo-500/20"
            >
              How to Play
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Clues Display */}
        <div className="w-full max-w-2xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            Clues
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {todaysMovie.clues.map((clue, index) => (
              <div
                key={index}
                className={`bg-[#18181b] border-2 rounded-lg p-4 text-center transition-all duration-300 ${
                  index < gameState.cluesRevealed
                    ? "border-indigo-500/50 opacity-100 transform scale-100"
                    : "border-[#27272a] opacity-30 transform scale-95"
                }`}
              >
                <div
                  className={`text-lg font-semibold ${
                    index < gameState.cluesRevealed
                      ? "text-white"
                      : "text-gray-600"
                  }`}
                >
                  {index < gameState.cluesRevealed ? clue : "???"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hints Section */}
        <div className="w-full max-w-xl mb-8">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Hints</h3>
            <div className="space-y-3">
              <div
                className={`p-3 rounded-lg transition-all duration-300 ${
                  showImdbRating
                    ? "bg-amber-500/20 border-2 border-amber-500/50"
                    : "bg-[#0a0a0f] border border-[#27272a]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-300">
                    IMDb Rating
                  </span>
                  <span
                    className={`font-bold ${
                      showImdbRating ? "text-amber-400" : "text-gray-500"
                    }`}
                  >
                    {showImdbRating
                      ? `⭐ ${todaysMovie.imdbRating}`
                      : "🔒 Locked"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg transition-all duration-300 ${
                  showReleaseYear
                    ? "bg-emerald-500/20 border-2 border-emerald-500/50"
                    : "bg-[#0a0a0f] border border-[#27272a]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-300">
                    Release Year
                  </span>
                  <span
                    className={`font-bold ${
                      showReleaseYear ? "text-emerald-400" : "text-gray-500"
                    }`}
                  >
                    {showReleaseYear
                      ? `📅 ${todaysMovie.releaseYear}`
                      : "🔒 Locked"}
                  </span>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg transition-all duration-300 ${
                  showMainActor
                    ? "bg-violet-500/20 border-2 border-violet-500/50"
                    : "bg-[#0a0a0f] border border-[#27272a]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-300">
                    Main Actor
                  </span>
                  <span
                    className={`font-bold ${
                      showMainActor ? "text-violet-400" : "text-gray-500"
                    }`}
                  >
                    {showMainActor
                      ? `🎬 ${todaysMovie.mainActor}`
                      : "🔒 Locked"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Input */}
        <div className="w-full max-w-xl mb-8">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            Enter Your Guess
          </h3>
          <MovieSearchInput
            onMovieSelect={handleMovieGuess}
            guessedMovies={gameState.guessedMovies}
            disabled={gameState.gameStatus !== "playing"}
          />
          <div className="mt-4 text-center">
            {!showGiveUpConfirm ? (
              <button
                onClick={handleSkip}
                disabled={
                  gameState.gameStatus !== "playing" ||
                  gameState.incorrectGuesses >= 9
                }
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-all font-semibold hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-600 disabled:hover:shadow-none cursor-pointer"
              >
                {gameState.incorrectGuesses === 8 ? "Give Up" : "Skip"}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-400 text-sm font-semibold">
                  Are you sure you want to give up?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleSkip}
                    className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all font-semibold hover:shadow-lg hover:shadow-red-500/20 cursor-pointer"
                  >
                    Yes, Give Up
                  </button>
                  <button
                    onClick={handleCancelGiveUp}
                    className="px-5 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all font-semibold hover:shadow-lg hover:shadow-gray-500/20 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#18181b] border-t border-[#27272a] py-4">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          © DailyPlay Studious 2025
        </div>
      </footer>

      {/* Modals */}
      {gameState.showHowToPlay && (
        <HowToPlayModal
          onClose={() => {
            markHowToPlayAsSeen();
            setGameState((prev) => ({ ...prev, showHowToPlay: false }));
          }}
        />
      )}

      {gameState.gameStatus !== "playing" && showResultModal && (
        <GameResultModal
          gameStatus={gameState.gameStatus}
          movieTitle={todaysMovie.title}
          guessCount={gameState.cluesRevealed}
          onClose={() => setShowResultModal(false)}
        />
      )}
    </div>
  );
}
