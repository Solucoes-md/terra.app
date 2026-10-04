import type { CSSProperties } from 'react'

const paths = {
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  diagonal: <><path d="M6 18 18 6M6 6h12v12" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20.5 13.1A8.8 8.8 0 0 1 10.9 3.5 9 9 0 1 0 20.5 13.1Z" />,
  rain: <><path d="M5 15a5 5 0 0 1-1-9.9A7 7 0 0 1 17.7 7 4 4 0 0 1 19 15M8 17l-1 3m6-3-1 3m6-3-1 3" /></>,
  leaf: <><path d="M20 4c-8-1-16 2-16 9a7 7 0 0 0 7 7c7 0 10-8 9-16ZM4 20 15 9" /></>,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  play: <path d="m8 5 11 7-11 7V5Z" />,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M6 18 18 6" /></>,
  sparkle: <path d="M12 2c0 7-3 10-10 10 7 0 10 3 10 10 0-7 3-10 10-10-7 0-10-3-10-10Z" />,
} as const

export function Icon({ name, size = 22, style }: { name: keyof typeof paths; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>
}
