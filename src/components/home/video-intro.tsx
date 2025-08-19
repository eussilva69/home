
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type VideoIntroProps = {
  activeVideo: string | null;
  onVideoEnd: () => void;
  redirectUrl: string;
};

export default function VideoIntro({ activeVideo, onVideoEnd, redirectUrl }: VideoIntroProps) {
  const [showVideo, setShowVideo] = useState(false);
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRedirecting = useRef(false);

  useEffect(() => {
    if (activeVideo && redirectUrl) {
      setShowVideo(true);
      isRedirecting.current = false; // Reset redirect flag
    }
  }, [activeVideo, redirectUrl]);

  const handleVideoEnded = () => {
    if (isRedirecting.current || !redirectUrl) return;
    isRedirecting.current = true;

    // Start fade out, then navigate
    setShowVideo(false);
    
    // The exit animation on motion.div will take 1.5s.
    // We navigate after a short delay within that timeframe.
    setTimeout(() => {
        router.push(redirectUrl);
        // The onVideoEnd() will be called after the page transition is complete or after a timeout
        // to ensure the black screen persists long enough.
        setTimeout(() => {
             onVideoEnd(); // Reset state in parent
        }, 500);
    }, 500); 
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && redirectUrl) {
        // Prefetch 1 second before the end
        if (video.duration - video.currentTime <= 1) {
            router.prefetch(redirectUrl);
            // Remove the event listener once prefetching is done to avoid re-triggering
            video.removeEventListener('timeupdate', handleTimeUpdate);
        }
    }
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
            ref={videoRef}
            src={activeVideo!}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnded}
            onTimeUpdate={handleTimeUpdate}
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
