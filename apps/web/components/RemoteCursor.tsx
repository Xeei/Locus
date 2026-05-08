import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { CursorPulse } from '../types/cursor';

interface RemoteCursorProps {
  cursor: CursorPulse;
  map: mapboxgl.Map;
}

export function RemoteCursor({ cursor, map }: RemoteCursorProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Update projection on map move or zoom, and also every time cursor lng/lat updates
    const updatePosition = () => {
      const { x, y } = map.project([cursor.lng, cursor.lat]);
      setPosition({ x, y });
    };

    updatePosition();

    map.on('move', updatePosition);
    map.on('zoom', updatePosition);
    
    return () => {
      map.off('move', updatePosition);
      map.off('zoom', updatePosition);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cursor.lng, cursor.lat, map]);

  // Don't render if it's off-screen or uninitialized
  if (position.x === -100 && position.y === -100) return null;

  const isActive = cursor.isBusy;
  const cursorColor = isActive ? '#a855f7' : cursor.color; // Electric Purple (tailwind purple-500) if active
  const glowColor = isActive ? 'rgba(168, 85, 247, 0.4)' : `${cursor.color}66`;

  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-50 flex items-start"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: 'transform 0.1s linear',
      }}
    >
      {/* The inverted triangle cursor */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative"
        style={{
          filter: `drop-shadow(0px 0px 4px ${glowColor})`,
        }}
      >
        <path
          d="M5.65376 21.3113C5.14815 21.7327 4.36442 21.3655 4.37213 20.7093L4.99611 11.2332C5.00344 10.608 5.68962 10.2319 6.20815 10.5694L14.7337 16.1177C15.2676 16.4651 15.0999 17.2917 14.4716 17.4087L10.3707 18.1713C10.1583 18.2108 9.96499 18.3283 9.82476 18.498L5.65376 21.3113Z"
          fill={cursorColor}
        />
        <path
          d="M5.65376 21.3113C5.14815 21.7327 4.36442 21.3655 4.37213 20.7093L4.99611 11.2332C5.00344 10.608 5.68962 10.2319 6.20815 10.5694L14.7337 16.1177C15.2676 16.4651 15.0999 17.2917 14.4716 17.4087L10.3707 18.1713C10.1583 18.2108 9.96499 18.3283 9.82476 18.498L5.65376 21.3113Z"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {/* 2px glowing trail effect pseudo-element could go here, but complex in pure SVG. I'll rely on the drop-shadow. */}

      {/* Label Tooltip */}
      <div
        className="ml-2 mt-4 rounded-sm border border-white/10 px-2 py-0.5 text-xs font-bold text-white shadow-lg backdrop-blur-md"
        style={{
          backgroundColor: cursorColor,
        }}
      >
        {cursor.username}
      </div>
    </div>
  );
}
