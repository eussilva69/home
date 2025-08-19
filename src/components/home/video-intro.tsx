
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type VideoIntroProps = {
  activeVideo: string | null;
  onVideoEnd: () => void;
  redirectUrl: string;
};

// IMPORTANT: This component assumes you have a video file at /public/quarto.mp4
// You need to add this file to your project manually.

export default function VideoIntro({ activeVideo, onVideoEnd, redirectUrl }: VideoIntroProps) {
  const [showVideo, setShowVideo] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (activeVideo) {
      setShowVideo(true);
    }
  }, [activeVideo]);

  const handleVideoEnded = () => {
    // Start fade out, then navigate
    setShowVideo(false);
    setTimeout(() => {
        router.push(redirectUrl);
        onVideoEnd(); // Reset state in parent
    }, 1500); // Corresponds to fade-out duration
  };

  return (
    <AnimatePresence>
      {showVideo && (
        <motion.div
          className="fixed inset-0 bg-black z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
          transition={{ duration: 0.5 }}
        >
          <video
            src={activeVideo!}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
