import React from "react";

/**
 * Pyyne faceted arrowhead logo.
 * `watermark` renders the low-opacity white variant used on green surfaces.
 */
export function PyyneLogo({
  className = "w-8 h-8",
  watermark = false,
}: {
  className?: string;
  watermark?: boolean;
}) {
  if (watermark) {
    return (
      <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <polygon points="100,10 170,170 100,135" fill="white" />
        <polygon points="100,10 30,170 100,135" fill="white" opacity="0.55" />
        <polygon points="30,170 100,135 170,170" fill="white" opacity="0.3" />
        <polygon points="100,135 55,175 30,170" fill="white" opacity="0.45" />
        <polygon points="100,135 145,175 170,170" fill="white" opacity="0.2" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="100,10 170,170 100,135" fill="#4b6332" />
      <polygon points="100,10 30,170 100,135" fill="#8aad6e" />
      <polygon points="30,170 100,135 170,170" fill="#c5d9b0" />
      <polygon points="100,135 55,175 30,170" fill="#a3b18a" />
      <polygon points="100,135 145,175 170,170" fill="#d4e6c3" />
    </svg>
  );
}
