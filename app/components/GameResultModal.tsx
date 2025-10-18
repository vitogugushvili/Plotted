"use client";

import { useEffect } from "react";

interface GameResultModalProps {
  gameStatus: "won" | "lost";
  movieTitle: string;
  guessCount: number;
  onClose: () => void;
}

export default function GameResultModal({
  gameStatus,
  movieTitle,
  guessCount,
  onClose,
}: GameResultModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const isWon = gameStatus === "won";

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#18181b] border border-[#27272a] rounded-2xl max-w-md w-full p-8 animate-scale-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {isWon ? (
            <>
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-emerald-400 mb-3">
                Well Done!
              </h2>
              <p className="text-gray-300 text-lg mb-2">
                You guessed <strong className="text-white">{movieTitle}</strong>{" "}
                in <strong className="text-emerald-400">{guessCount}</strong>{" "}
                {guessCount === 1 ? "guess" : "guesses"}!
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-3xl font-bold text-red-400 mb-3">
                Out of Lives
              </h2>
              <p className="text-gray-300 text-lg mb-2">
                The movie was{" "}
                <strong className="text-white">{movieTitle}</strong>
              </p>
            </>
          )}

          <div className="mt-8 pt-6 border-t border-[#27272a]">
            <p className="text-gray-400 font-medium text-base">
              Come back tomorrow for a new movie!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
