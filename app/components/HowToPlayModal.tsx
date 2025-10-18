"use client";

import { useEffect } from "react";

interface HowToPlayModalProps {
  onClose: () => void;
}

export default function HowToPlayModal({ onClose }: HowToPlayModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-2xl w-full p-8 animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white">How to Play</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 text-gray-300">
          <div>
            <h3 className="text-xl font-semibold text-indigo-400 mb-2">
              🎯 Objective
            </h3>
            <p>
              Guess the movie title based on word clues. Each clue is a word
              associated with the movie!
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-400 mb-2">
              🎮 Game Rules
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                You start with <strong className="text-white">1 clue</strong>{" "}
                revealed
              </li>
              <li>
                Make a guess by typing and selecting a movie from the
                suggestions
              </li>
              <li>
                Each <strong className="text-red-400">wrong guess</strong>{" "}
                reveals a new clue
              </li>
              <li>
                You have up to <strong className="text-white">9 clues</strong>{" "}
                and <strong className="text-white">9 guesses</strong> total
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-400 mb-2">
              💡 Hints Unlock
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>
                After{" "}
                <strong className="text-amber-400">3 wrong guesses</strong>:
                IMDb rating unlocked
              </li>
              <li>
                After{" "}
                <strong className="text-emerald-400">6 wrong guesses</strong>:
                Release year unlocked
              </li>
              <li>
                After{" "}
                <strong className="text-violet-400">8 wrong guesses</strong>:
                Main actor unlocked
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-indigo-400 mb-2">
              ✨ Tips
            </h3>
            <ul className="space-y-2 list-disc list-inside">
              <li>Think about what words connect to popular movies</li>
              <li>The clues get progressively more helpful!</li>
              <li>A new movie puzzle is available every day!</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#27272a] text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all font-semibold hover:shadow-lg hover:shadow-indigo-500/20"
          >
            Start Playing
          </button>
        </div>
      </div>
    </div>
  );
}
