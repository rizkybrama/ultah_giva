'use client';

// DoorButton component - positions button above door in 3D world space

import { useEffect, useState } from 'react';

interface DoorButtonProps {
  label: string;
  onClick: () => void;
  doorRef: React.RefObject<any>;
  cameraRef: React.RefObject<any>;
}

export default function DoorButton({ label, onClick, doorRef, cameraRef }: DoorButtonProps) {
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0, visible: false });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const updatePosition = () => {
      if (doorRef.current && cameraRef.current) {
        try {
          // Use shared THREE instance from window (set by MiniGamePage)
          // Access via window to avoid webpack bundling
          const THREE = (window as any).THREE;
          if (!THREE || !THREE.Vector3) {
            // THREE not loaded yet, hide button
            setButtonPosition({ x: 0, y: 0, visible: false });
            return;
          }
          
          const doorWorldPos = new THREE.Vector3();
          doorRef.current.getWorldPosition(doorWorldPos);
          doorWorldPos.y = 3.5; // Above door
          
          doorWorldPos.project(cameraRef.current);
          const x = (doorWorldPos.x * 0.5 + 0.5) * window.innerWidth;
          const y = (-doorWorldPos.y * 0.5 + 0.5) * window.innerHeight;
          
          const visible = doorWorldPos.z > -1 && doorWorldPos.z < 1 && x > 0 && x < window.innerWidth && y > 0 && y < window.innerHeight;
          
          setButtonPosition({ x, y, visible });
        } catch (e) {
          setButtonPosition({ x: 0, y: 0, visible: false });
        }
      }
    };

    const interval = setInterval(updatePosition, 16);
    updatePosition();

    return () => clearInterval(interval);
  }, [doorRef, cameraRef]);

  if (!buttonPosition.visible) return null;

  return (
    <button
      onClick={onClick}
      className="glass-effect rounded-full px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 pointer-events-auto"
      style={{ 
        background: 'rgba(216, 196, 232, 0.9)',
        position: 'fixed',
        left: `${buttonPosition.x}px`,
        top: `${buttonPosition.y}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
      }}
    >
      {label}
    </button>
  );
}

