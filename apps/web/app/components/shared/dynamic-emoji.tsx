'use client';

import React from 'react';

interface DynamicEmojiProps {
  emoji: string | null | undefined;
  fallback?: string;
  className?: string;
}

/**
 * Checks if a string is a valid emoji character
 */
const isValidEmoji = (str: string | null | undefined): boolean => {
  if (!str) return false;
  
  // Basic emoji validation using regex
  // This checks for emoji pattern in Unicode
  const emojiRegex = /\p{Emoji}/u;
  return emojiRegex.test(str);
};

/**
 * DynamicEmoji component that renders an emoji character
 * 
 * @param emoji - The emoji character to render
 * @param fallback - Fallback emoji to use if none is provided (defaults to 🔗)
 * @param className - Additional CSS classes
 * @returns The emoji or fallback emoji
 * 
 * @example
 * ```tsx
 * <DynamicEmoji emoji="🚀" className="text-lg" />
 * ```
 */
export const DynamicEmoji = ({ 
  emoji, 
  fallback = "🔗", 
  className = "" 
}: DynamicEmojiProps) => {
  // Check if the emoji is valid, otherwise use the fallback
  const displayEmoji = emoji && isValidEmoji(emoji) ? emoji : fallback;
  
  return (
    <span className={className}>
      {displayEmoji}
    </span>
  );
}; 