export const site = {
  name: 'Terra',
  // Adicione aqui a URL pública ou o link de adesão ao teste no Google Play.
  playStoreUrl: null as string | null,
  supportEmail: 'suporteterrabr@gmail.com',
  privacyUrl: '/documentos/privacidade/index.html',
  termsUrl: '/documentos/termos/index.html',
  contactUrl: '/documentos/contato/index.html',
}

export function getPrimaryAction(playStoreUrl: string | null) {
  return playStoreUrl
    ? { label: 'Ver no Google Play', href: playStoreUrl, external: true }
    : { label: 'Ver em ação', href: '#demonstracao', external: false }
}

export type Scene = {
  id: string
  name: string
  shortName: string
  style: string
  description: string
  width: number
  height: number
  position: string
}

export const scenes: Scene[] = [
  { id: 'cabana', name: 'Cabana na floresta', shortName: 'Cabana', style: 'Pixel art', description: 'Um refúgio de madeira à beira do lago. A floresta faz companhia, faça chuva ou faça sol.', width: 688, height: 1538, position: '50% 63%' },
  { id: 'bruxa', name: 'Casa da bruxa', shortName: 'Casa da bruxa', style: 'Argila', description: 'Um casario torto, um lago tranquilo e um pouco de encanto para os dias comuns.', width: 1086, height: 1448, position: '50% 65%' },
  { id: 'lavanda', name: 'Campo de lavanda', shortName: 'Lavanda', style: 'Aquarela', description: 'Fileiras de lavanda encontram uma casa de pedra. Um horizonte para respirar mais devagar.', width: 1086, height: 1448, position: '50% 68%' },
  { id: 'esfinge', name: 'Esfinge', shortName: 'Esfinge', style: 'Van Gogh', description: 'A Esfinge e as pirâmides sob um céu que muda. O deserto em outra forma de olhar.', width: 1086, height: 1448, position: '50% 62%' },
  { id: 'jardim', name: 'Jardim japonês', shortName: 'Jardim japonês', style: 'Ukiyo-e', description: 'Cerejeiras, uma ponte vermelha e o lago aos pés do monte. Seu instante de calma.', width: 841, height: 1870, position: '50% 64%' },
]

export const artStyles = ['Pixel art', 'Argila', 'Aquarela', 'Ukiyo-e', 'Van Gogh']
