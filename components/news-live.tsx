"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HlsPlayer } from "@/components/hls-player"
import { WidgetEmbed } from "@/components/widget-embed"

type Channel = {
  id: string
  label: string
  hlsUrl?: string
  widgetUrl?: string
  siteUrl?: string
}

// We don’t have an official m3u8 from freespeech.org, so we use their Live TV page via iframe.
const DEFAULT_CHANNELS: Channel[] = [
  {
    id: "cnn",
    label: "CNN",
    widgetUrl: "https://www.youtube.com/embed/DojdIaaDTRg?si=3SzEyOjJtkpinsAb&autoplay=1&mute=1",
    siteUrl: "https://www.youtube.com/@CNN",
  },
  {
    id: "record",
    label: "Record News",
    widgetUrl: "https://www.youtube.com/embed/4JtpYkuOHjQ?si=hEgHj7k144ge7pOl&autoplay=1&mute=1",
    siteUrl: "https://www.youtube.com/@recordnews",
  },
  {
    id: "band",
    label: "Band News",
    widgetUrl: "https://www.youtube.com/embed/xrsNSv2VGfY?si=sZR1Z69xxZ3Te2ac&autoplay=1&mute=1",
    siteUrl: "https://www.youtube.com/@bandjornalismo",
  },
  {
    id: "sbt",
    label: "SBT Central",
    widgetUrl: "https://www.youtube.com/embed/VayOrXlERHs?si=Tgd2osDDCZro9BCP&autoplay=1&mute=1",
    siteUrl: "https://www.youtube.com/@SBTNews",
  },
  {
    id: "skynews",
    label: "Sky News",
    widgetUrl: "https://www.youtube.com/embed/YDvsBbKfLPA?si=nhoRGTqHFW4MP88L&autoplay=1&mute=1",
    siteUrl: "https://www.youtube.com/@SkyNews",
  },
]

export function NewsLive({ channels = DEFAULT_CHANNELS }: { channels?: Channel[] }) {
  const [active, setActive] = React.useState(channels[0]?.id ?? "freespeech")
  const channel = channels.find((c) => c.id === active) ?? channels[0]

  return (
    <Card className="p-3 md:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Transmissão ao vivo</h2>
          <p className="text-xs text-muted-foreground">Fonte: {channel?.label}</p>
        </div>
        {channel?.siteUrl && (
          <Button asChild size="sm" variant="outline">
            <a href={channel.siteUrl} target="_blank" rel="noreferrer noopener">
              Abrir site oficial
            </a>
          </Button>
        )}
      </div>

      <Tabs value={active} onValueChange={setActive} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {channels.map((c) => (
            <TabsTrigger key={c.id} value={c.id} className="whitespace-nowrap">
              {c.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {channels.map((c) => (
          <TabsContent key={c.id} value={c.id} className="mt-3">
            {c.hlsUrl ? (
              <HlsPlayer src={c.hlsUrl} className="aspect-video" />
            ) : c.widgetUrl ? (
              <WidgetEmbed src={c.widgetUrl} title={c.label} className="aspect-video" />
            ) : (
              <div className="aspect-video flex items-center justify-center rounded-md border text-sm text-muted-foreground">
                Nenhuma fonte configurada para {c.label}.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  )
}
