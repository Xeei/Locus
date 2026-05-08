'use client'

import React, { useRef, useEffect, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import throttle from 'lodash/throttle'
import { useCursorSync } from '../hooks/useCursorSync'
import { RemoteCursor } from './RemoteCursor'

// Silence Mapbox worker warnings for Next.js
if (typeof window !== 'undefined') {
  ;(mapboxgl as any).workerClass = require('mapbox-gl/dist/mapbox-gl-csp-worker').default;
}

// Set the token from the environment variable
const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
mapboxgl.accessToken = token

const COLORS = ['#a855f7', '#06b6d4', '#84cc16', '#ec4899', '#f59e0b'];

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  
  const { remoteCursors, emitCursorMove } = useCursorSync()

  // Generate identity on mount
  const identity = useMemo(() => ({
    username: `Guest_${Math.floor(Math.random() * 1000)}`,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }), []);

  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Initialize Mapbox
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [100.5231, 13.7367], // Bangkok Coordinates
      zoom: 12,
      pitch: 45,
      bearing: -17,
      antialias: true,
    })

    map.current.on('load', () => {
      setIsLoaded(true)

      // Add a subtle blue glow to the terrain (Optional aesthetic)
      map.current?.setFog({
        range: [0.5, 10],
        color: '#010b19',
        'high-color': '#1d0e2e',
        'space-color': '#000000',
        'horizon-blend': 0.1,
      })
    })

    // Cleanup on unmount
    return () => map.current?.remove()
  }, [])

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const currentMap = map.current;

    // Throttled cursor move emitter (40ms ~ 25fps)
    const handleMouseMove = throttle((e: MouseEvent) => {
      // Only fire if hovering over the map container specifically
      if (e.target instanceof Node && mapContainer.current?.contains(e.target)) {
         // Get Geographic coordinates from screen pixels
         const lngLat = currentMap.unproject([e.clientX, e.clientY]);
         emitCursorMove({
           username: identity.username,
           color: identity.color,
           lng: lngLat.lng,
           lat: lngLat.lat,
           isBusy,
         });
      }
    }, 40);

    const handleMouseDown = () => setIsBusy(true);
    const handleMouseUp = () => setIsBusy(false);

    // Attach native DOM events for better performance
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      handleMouseMove.cancel();
    };
  }, [isLoaded, emitCursorMove, identity, isBusy]);

  return (
    <div className="relative h-screen w-full bg-slate-950 overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Render Remote Cursors */}
      {isLoaded && map.current && remoteCursors.map((cursor) => (
        <RemoteCursor key={cursor.id} cursor={cursor} map={map.current!} />
      ))}

      {/* Vyperion UI Overlay */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="rounded-sm border-l-2 border-cyan-500 bg-black/80 px-4 py-2 font-mono backdrop-blur-md">
          <h1 className="text-lg font-black tracking-widest text-white">
            LOCUS<span className="text-cyan-400">LABS</span>
          </h1>
          <div className="flex items-center gap-2 text-[10px]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isLoaded ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
            />
            <span className="tracking-tighter text-slate-400 uppercase">
              {isLoaded ? 'System Online' : 'Initializing Engine...'}
            </span>
          </div>
        </div>
      </div>

      {/* Coordinate HUD */}
      <div className="absolute bottom-6 left-6 z-10 font-mono text-[10px] tracking-widest text-cyan-500/50 uppercase pointer-events-none">
        Grid_Reference: 13.7367° N, 100.5231° E
      </div>
    </div>
  )
}
