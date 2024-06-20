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
    <main className={`mx-auto max-w-[1960px] bg-white`}>
      {loading && (
        <div className={`progress-background ${fadeOut ? 'fade-out' : ''}`}>
          <div className="progress-container">
            <div id="progress-bar" className="progress-bar" ref={progressRef}></div>
          </div>
        </div>
      )}
      <div className="">
        <div>
          <VirtualSpace basePath={BASE_PATH} onProgress={handleProgress} />
        </div>
      </div>
      <style jsx>{`
        .progress-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(255, 255, 255, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          transition: opacity 1s ease-in-out;
          opacity: 1;
        }

        .fade-out {
          opacity: 0;
        }

        .progress-container {
          width: 80%;
          background: #eee;
          border-radius: 5px;
          overflow: hidden;
          position: relative;
          height: 5px;
        }

        .progress-bar {
          height: 100%;
          width: 0%;
          background: #3b82f6;
          transition: width 0.2s ease-in-out;
        }
      `}
      </style>
    </main>
  );
}
