"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import poster from "../../public/waitlist-video-poster.jpg";
import { Icon } from "./icon";

/*
  The video element is always in the markup but carries preload="none", so none
  of its 8.5MB is fetched until someone asks for it. The poster is a separate
  next/image rather than the element's own `poster` attribute: that attribute
  takes a raw URL, which would ship the full-size JPEG on every page load and
  cost more than the rest of the page put together.

  play() is called straight from the click handler so it runs inside a real user
  gesture and never trips an autoplay policy.
*/
export function WaitlistVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const coverRef = useRef<HTMLButtonElement>(null);
  const [started, setStarted] = useState(false);
  // Skip the focus handoff on first render so the page does not steal focus.
  const hasStarted = useRef(false);

  useEffect(() => {
    if (started) {
      hasStarted.current = true;
      // The cover becomes inert on play, which would drop focus to the body.
      // Hand it to the player instead, then back again when the video ends.
      videoRef.current?.focus();
    } else if (hasStarted.current) {
      coverRef.current?.focus();
    }
  }, [started]);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    void video.play().catch(() => {
      // Playback refused (a data-saver mode, say). The native controls are
      // showing by now, so the video is still reachable.
    });
  }

  return (
    <div className="video-frame" data-started={started}>
      <video
        ref={videoRef}
        className="video-player"
        preload="none"
        playsInline
        controls={started}
        width={1920}
        height={1080}
        onEnded={() => setStarted(false)}
      >
        <source src="/Oppra-Waitlist-Video.mp4" type="video/mp4" />
        Your browser cannot play this video.
      </video>

      <button
        ref={coverRef}
        type="button"
        className="video-cover"
        onClick={play}
        aria-label="Play the Oppra intro video, 36 seconds"
        inert={started}
      >
        <Image src={poster} alt="" sizes="(max-width: 980px) 100vw, 920px" placeholder="blur" />
        <span className="video-play"><Icon name="play" /></span>
        <span className="video-caption">Meet Oppra <span className="video-duration">0:36</span></span>
      </button>
    </div>
  );
}
