import { NextRequest, NextResponse } from "next/server";

// TMDB API key - In production, use environment variables
const TMDB_API_KEY = "8a8f2c8f7e8a8f8e8a8f2c8f7e8a8f8e"; // This is a placeholder, will use a demo key

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Using TMDB API - you can get a free API key at https://www.themoviedb.org/settings/api
    // For demo purposes, using a public demo approach
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(
        query
      )}&include_adult=false&language=en-US&page=1&api_key=8265bd1679663a7ea12ac168da84d2e8`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from TMDB");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching movies:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    );
  }
}

