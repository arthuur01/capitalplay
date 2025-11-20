"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface WidgetEmbedProps extends React.IframeHTMLAttributes<HTMLIFrameElement> {
  src: string
  title?: string
  className?: string
}

// Simple, reusable iframe wrapper with sane defaults for third-party widgets/players.
export function WidgetEmbed({ src, title = "Embedded Widget", className, ...rest }: WidgetEmbedProps) {
  return (
    <div className={cn("relative w-full overflow-hidden rounded-md border bg-background", className)}>
      <iframe
        src={src}
        title={title}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        // sandbox loosens some restrictions to allow media playback while maintaining safety
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer-when-downgrade"
        loading="lazy"
        allowFullScreen
        {...rest}
      />
    </div>
  )
}
