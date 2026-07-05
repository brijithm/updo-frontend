import { useEffect, useRef } from 'react';
import loadingVideo from "../assets/Loading Page.mp4";

function LoadingPage({ onComplete }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onComplete) return;

    const handleEnded = () => onComplete();
    video.addEventListener('ended', handleEnded);

    return () => video.removeEventListener('ended', handleEnded);
  }, [onComplete]);

  return (
    <div className="w-screen h-screen bg-[#000B2E] flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="max-w-full max-h-full object-contain"
      >
        <source src={loadingVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default LoadingPage;