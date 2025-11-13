"use client"

import * as React from "react"
import Hls from "hls.js"
import { cn } from "@/lib/utils"

export interface HlsPlayerProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string
  className?: string
}

export function HlsPlayer({ src, className, autoPlay = true, controls = true, muted = true, ...rest }: HlsPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setError(null)
    const video = videoRef.current
    if (!video || !src) return

    // Native HLS support (Safari, iOS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src
      video.play().catch(() => {
        // Autoplay might be blocked; ignore silently
      })
      return
    }

    // hls.js fallback
    if (Hls.isSupported()) {
      const hls = new Hls({
        // Tweak as needed
        maxBufferLength: 30,
      })
      hls.attachMedia(video)
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.loadSource(src)
      })
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data?.fatal) {
          setError(data?.details || "HLS fatal error")
        }
      })

      return () => {
        hls.destroy()
      }
    }

    setError("Seu navegador não suporta HLS.")
  }, [src])

  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full"
        autoPlay={autoPlay}
        muted={muted}
        controls={controls}
        playsInline
        // src is set programmatically for hls.js; keep for native
        {...rest}
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  )
}
