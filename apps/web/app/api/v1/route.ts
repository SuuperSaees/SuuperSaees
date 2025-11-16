import { NextResponse } from "next/server";

// Define different response messages
const messages = [
  "I am a teapot!",
  "Sorry, no coffee here.",
  "I'm just a humble teapot.",
  "You can't brew coffee in a teapot!",
  "418 - I'm a teapot, not a coffee maker!"
];

// Function that selects a random message
function getRandomMessage(): string | undefined {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex ?? ""];
}

export function GET() {
    // Get a random message
    const randomMessage = getRandomMessage();

    // Error response structure
    const errorResponse = {
      code: 418, // HTTP status code 418 (I'm a teapot)
      message: randomMessage,
      error: "TeapotError", // Error description
      details: [] // Additional details (empty in this case)
    };

    // Return the response with status 418
    return NextResponse.json(errorResponse, { status: 418 });
}
