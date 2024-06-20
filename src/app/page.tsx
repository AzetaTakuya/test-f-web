"use client"
import React, { useRef, useState } from 'react';
import VirtualSpace from '@/app/components/VirtualSpace';
import nextConfig from "../../next.config.mjs";

const BASE_PATH = nextConfig.basePath || "";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const progressRef = useRef(null);

  const handleProgress = (value) => {
    console.log(`progress ${value}%`);
    if (progressRef.current) {
      progressRef.current.style.width = `${value}%`;
    }

    if (value >= 101) {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 1000); // 1秒後にロード完了とする
      console.log('initialized');
    }
  };

  return (
    <main className="mx-auto max-w-[1960px] bg-white">
      {loading && (
        <div className={`fixed top-0 left-0 w-screen h-screen bg-white bg-opacity-90 flex justify-center items-center z-50 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-4/5 bg-gray-200 rounded overflow-hidden relative h-1">
            <div ref={progressRef} className="h-full w-0 bg-blue-500 transition-all duration-200"></div>
          </div>
        </div>
      )}
      <div>
        <VirtualSpace basePath={BASE_PATH} onProgress={handleProgress} />
      </div>
    </main>
  );
}
