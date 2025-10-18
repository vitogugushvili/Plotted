export interface GameState {
  cluesRevealed: number;
  incorrectGuesses: number;
  guessedMovies: string[];
  gameStatus: "playing" | "won" | "lost";
  showHowToPlay: boolean;
}

export interface MovieData {
  title: string;
  clues: string[];
  imdbRating: number;
  releaseYear: number;
  mainActor: string;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  popularity: number;
}
