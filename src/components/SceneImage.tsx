import type { CSSProperties } from 'react'
import type { Scene } from '../content/site'

export function SceneImage({ scene, className = '', alt, priority = false, sizes = '(max-width: 767px) 100vw, 50vw', style }: { scene: Scene; className?: string; alt?: string; priority?: boolean; sizes?: string; style?: CSSProperties }) {
  return <img
    className={`scene-image ${className}`}
    src={`/images/${scene.id}-960.webp`}
    srcSet={`/images/${scene.id}-480.webp 480w, /images/${scene.id}-960.webp 960w, /images/${scene.id}-1440.webp 1440w`}
    sizes={sizes}
    width={scene.width}
    height={scene.height}
    alt={alt ?? scene.name}
    loading={priority ? 'eager' : 'lazy'}
    fetchPriority={priority ? 'high' : 'auto'}
    decoding="async"
    style={{ objectPosition: scene.position, ...style }}
  />
}
