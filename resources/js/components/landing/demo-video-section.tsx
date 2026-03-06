import { Pause, Play, Maximize2, Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef, useState } from "react"

export function DemoVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlay, setShowOverlay] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const [hasVideo, setHasVideo] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video && video.src && video.src !== window.location.href) {
      // Check if the video can actually load
      const handleCanPlay = () => setHasVideo(true)
      const handleError = () => setHasVideo(false)
      video.addEventListener("canplay", handleCanPlay)
      video.addEventListener("error", handleError)
      return () => {
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("error", handleError)
      }
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
      setShowOverlay(false)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video || !video.duration) return
    setProgress((video.currentTime / video.duration) * 100)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    video.currentTime = ratio * video.duration
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setShowOverlay(true)
    setProgress(0)
  }

  const handleFullscreen = () => {
    const video = videoRef.current
    if (!video) return
    if (video.requestFullscreen) {
      video.requestFullscreen()
    }
  }

  return (
    <section id="demo-video" className="border-t border-border/15 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-10 text-center animate-landing-fade-in">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary">
            See it in action
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Watch the 2-minute demo
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
            Log a visit, check your efficiency score, and chat with the AI coach — all in under two minutes.
          </p>
        </div>

        {/* Video container */}
        <div className="relative mx-auto max-w-4xl animate-landing-fade-in [animation-delay:200ms]">
          {/* Browser chrome wrapper */}
          <div className="overflow-hidden rounded-xl border border-border/40 bg-card shadow-2xl">
            {/* Browser top bar */}
            <div className="flex items-center gap-1.5 border-b border-border/30 bg-muted/40 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-red-400/60" />
              <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
              <div className="h-2 w-2 rounded-full bg-green-400/60" />
              <div className="ml-3 flex-1 rounded-md bg-background/50 px-4 py-0.5 text-center text-[9px] text-muted-foreground/40">
                Medica — Product Demo
              </div>
            </div>

            {/* Video area */}
            <div className="relative aspect-video bg-black/95">
              {/* The actual video element — replace src with your recording */}
              <video
                ref={videoRef}
                className="h-full w-full object-contain"
                muted={isMuted}
                playsInline
                preload="metadata"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnd}
                onPlay={() => { setIsPlaying(true); setShowOverlay(false) }}
                onPause={() => setIsPlaying(false)}
                src="/videos/medica-demo.mp4"
                poster="/videos/medica-demo-poster.jpg"
              />

              {/* Play overlay (shows when paused/initial) */}
              {showOverlay && (
                <div
                  className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all"
                  onClick={togglePlay}
                >
                  {/* Animated play button */}
                  <div className="group flex h-20 w-20 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm ring-1 ring-white/20 transition-all hover:scale-110 hover:bg-white/25">
                    <Play className="h-8 w-8 translate-x-0.5 text-white" fill="currentColor" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-white/80">Click to play</p>
                  <p className="mt-1 text-[11px] text-white/40">2 min · No audio required</p>
                </div>
              )}

              {/* Click-to-toggle on the video itself */}
              {!showOverlay && (
                <div
                  className="absolute inset-0 cursor-pointer"
                  onClick={togglePlay}
                />
              )}

              {/* Bottom controls */}
              {!showOverlay && (
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-8">
                  {/* Progress bar */}
                  <div
                    className="mb-2 h-1 w-full cursor-pointer rounded-full bg-white/20 transition-all hover:h-1.5"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Control buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePlay() }}
                        className="rounded-md p-1 text-white/80 transition-colors hover:text-white"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleMute() }}
                        className="rounded-md p-1 text-white/80 transition-colors hover:text-white"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </button>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFullscreen() }}
                      className="rounded-md p-1 text-white/80 transition-colors hover:text-white"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Fallback: if no video file exists yet, show a pretty placeholder */}
              {!hasVideo && showOverlay && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-br from-primary/10 via-background to-accent/10">
                  <div className="group flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 ring-1 ring-primary/30 transition-all hover:scale-110 hover:bg-primary/25">
                    <Play className="h-8 w-8 translate-x-0.5 text-primary" fill="currentColor" />
                  </div>
                  <p className="mt-5 text-sm font-semibold text-foreground">Demo video coming soon</p>
                  <p className="mt-1 max-w-xs text-center text-[12px] leading-relaxed text-muted-foreground">
                    In the meantime, try the live demo — log in with a test account and explore everything yourself.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Glow effect behind the player */}
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-primary/5 blur-2xl" />
        </div>

        {/* Bottom note */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground/50 animate-landing-fade-in [animation-delay:400ms]">
          Recorded on the live product · No staging tricks
        </p>
      </div>
    </section>
  )
}
