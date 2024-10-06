'use client';

import React from 'react';

const VideoDescriptionRenderer = ({ description }: { description: string }) => {
  // Regex patterns for detecting specific video URLs
  const urlRegex = /<a href="([^"]+)">([^<]+)<\/a>/g;

  // Helper function to render appropriate iframe or link
  const renderMedia = (url: string) => {
    // YouTube embed
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('watch?v=')
        ? url.split('v=')[1]
        : url.split('.be/')[1];
      return (
        <iframe
          width="320px"
          height="200px"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          allowFullScreen
          className="m-2 rounded-md"
        />
      );
    }
    // Instagram embed
    if (url.includes('instagram.com')) {
      return (
        <iframe
          width="320px"
          height="200px"
          src={`${url}embed`}
          title="Instagram video"
          allowFullScreen
          className="m-2 rounded-md"
        />
      );
    }
    // Google Drive embed
    if (url.includes('drive.google.com')) {
      const driveId = url.match(/\/d\/(.*)\//)?.[1];
      return (
        <iframe
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          width="320px"
          height="200px"
          allow="autoplay"
          className="m-2 rounded-md"
        />
      );
    }
    // For any other URL, return a simple anchor link
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="m-2 rounded-md text-blue-500 underline"
      >
        {url}
      </a>
    );
  };

  // Function to parse and render content with media
  const parseDescription = (description: string) => {
    const media = [];
    const textParts = [];
    let lastIndex = 0;
    let match;

    // Iterate through all matched URLs
    while ((match = urlRegex.exec(description)) !== null) {
      const [fullMatch, url] = match;

      // Push the text before the match
      textParts.push(description.slice(lastIndex, match.index));

      // Push media URL into separate array
      if (url) media.push(renderMedia(url));

      // Update the last index position
      lastIndex = match.index + fullMatch.length;
    }

    // Push remaining text after the last URL
    if (lastIndex < description.length) {
      textParts.push(description.slice(lastIndex));
    }

    return { text: textParts.join(''), media }; // Return both text and media separately
  };

  const { text, media } = parseDescription(description);

  return (
    <div>
      {/* Render the text part */}
      <p className="mb-4 text-[0.8rem] text-muted-foreground">{text}</p>

      {/* Render the media part */}
      {media.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-md">
          {media.map((mediaElement, index) => (
            <div key={index} className="overflow-hidden rounded-md">
              {mediaElement}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoDescriptionRenderer;
