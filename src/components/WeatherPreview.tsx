import { useEffect, useRef } from 'react'
import { SceneImage } from './SceneImage'
import type { Scene } from '../content/site'

export type Weather = 'sun' | 'rain' | 'night'

export function WeatherPreview({ scene, weather, animated }: { scene: Scene; weather: Weather; animated: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame || weather !== 'rain') return
    const context = canvas.getContext('2d')
    if (!context) return
    let animationFrame = 0
    let visible = false
    let width = 1
    let height = 1
    let lastFrame = 0
    const drops = Array.from({ length: 48 }, (_, i) => ({ x: ((i * 73) % 101) / 101, y: ((i * 41) % 97) / 97, speed: 0.003 + (i % 4) * 0.0008 }))
    const draw = (time: number) => {
      context.clearRect(0, 0, width, height)
      context.strokeStyle = 'rgba(226,239,245,0.5)'
      context.lineWidth = 1
      context.beginPath()
      for (const drop of drops) {
        const y = ((drop.y + (animated ? time * drop.speed / 16 : 0)) % 1.1) * height
        const x = drop.x * width
        context.moveTo(x, y)
        context.lineTo(x - 3, y + 14)
      }
      context.stroke()
    }
    const resize = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width
      height = entry.contentRect.height
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw(lastFrame)
    })
    const tick = (time: number) => {
      if (time - lastFrame >= 1000 / 30) { draw(time); lastFrame = time }
      animationFrame = window.requestAnimationFrame(tick)
    }
    const update = () => {
      window.cancelAnimationFrame(animationFrame)
      if (visible && !document.hidden && animated) animationFrame = window.requestAnimationFrame(tick)
      else draw(lastFrame)
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update() })
    resize.observe(frame)
    observer.observe(frame)
    document.addEventListener('visibilitychange', update)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      resize.disconnect()
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [weather, animated])

  const description = { sun: 'luz do dia', rain: 'chuva simulada', night: 'luz noturna simulada' }[weather]
  return <div className={`phone-preview weather-${weather}`} ref={frameRef} data-testid="weather-preview" data-weather={weather}>
    <SceneImage scene={scene} alt={`${scene.name}, ${description}. Prévia ilustrativa.`} sizes="(max-width: 767px) 70vw, 320px" />
    <div className="weather-tint" aria-hidden="true" />
    <div className="night-stars" aria-hidden="true" />
    <canvas ref={canvasRef} className="rain-canvas" aria-hidden="true" />
    <div className="phone-camera" aria-hidden="true" />
    <div className="phone-caption"><span>{scene.shortName}</span><span>{scene.style}</span></div>
    <div className="phone-home" aria-hidden="true" />
  </div>
}
