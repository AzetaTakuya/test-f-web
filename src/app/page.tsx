"use client"
import React, { useState } from 'react';
import Link from 'next/link'
import VirtualSpace from '@/app/components/VirtualSpace';

import nextConfig from "../../next.config.mjs";
const BASE_PATH = nextConfig.basePath || "";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const handleProgress = (progress: number) => {
    console.log(`${progress}%`);
    
    if (progress >= 100) {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 1000); // フェードアウト時間と一致させる
      console.log('initialized');
    }
  };

  return (
    <main className={`mx-auto max-w-[1960px] bg-white`}>
      {loading && (
        <div className={`spinner-background ${fadeOut ? 'fade-out' : ''}`}>
          <div className="spinner"></div>
        </div>
      )}
      <div className="">
        <div>
          <VirtualSpace basePath={BASE_PATH} onProgress={handleProgress} />
        </div>
      </div>
      <style jsx>{`
        .spinner-background {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          opacity: 1;
          transition: opacity 1s ease-in-out;
        }

        .fade-out {
          opacity: 0;
        }

        .spinner {
          border: 16px solid #f3f3f3; /* Light grey */
          border-top: 16px solid #3498db; /* Blue */
          border-radius: 50%;
          width: 120px;
          height: 120px;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}
      </style>
    </main>
  );
}