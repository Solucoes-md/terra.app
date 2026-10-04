import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { artStyles, getPrimaryAction, scenes, site } from './content/site'
import { Icon } from './components/Icon'
import { SceneImage } from './components/SceneImage'
import { WeatherPreview } from './components/WeatherPreview'
import type { Weather } from './components/WeatherPreview'
import { useReducedMotion } from './hooks/useReducedMotion'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function App() {
  const root = useRef<HTMLDivElement>(null)
  const menuButton = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedScene, setSelectedScene] = useState(0)
  const [weather, setWeather] = useState<Weather>('sun')
  const [paused, setPaused] = useState(false)
  const [marqueePaused, setMarqueePaused] = useState(false)
  const reducedMotion = useReducedMotion()
  const animated = !paused && !reducedMotion
  const action = getPrimaryAction(site.playStoreUrl)
  const scene = scenes[selectedScene]

  useGSAP(() => {
    if (!animated) return
    const media = gsap.matchMedia()
    gsap.utils.toArray<HTMLElement>('.scroll-art').forEach(image => {
      const target = image.closest('.art-scroll-target') ?? image
      gsap.timeline({ scrollTrigger: { trigger: target, start: 'top 95%', end: 'bottom 5%', scrub: 0.8 } })
        .fromTo(image, { scale: 0.8, opacity: 1, filter: 'brightness(1)' }, { scale: 1, duration: 0.4, ease: 'none' })
        .to(image, { scale: 1, duration: 0.2 })
        .to(image, { opacity: 0.2, filter: 'brightness(0.6)', duration: 0.4, ease: 'none' })
    })
    media.add('(min-width: 1024px)', () => {
      const stage = root.current?.querySelector<HTMLElement>('.stack-stage')
      if (!stage) return
      const cards = Array.from(stage.querySelectorAll<HTMLElement>('.stack-card'))
      stage.dataset.stacked = 'true'
      gsap.set(cards.slice(1), { yPercent: 110 })
      let activeCard = -1
      const syncControls = (active: number) => {
        if (active === activeCard) return
        activeCard = active
        cards.forEach((card, index) => {
          const covered = index !== active
          if (covered && card.contains(document.activeElement)) {
            const heading = cards[active].querySelector<HTMLElement>('h3')
            heading?.setAttribute('tabindex', '-1')
            heading?.focus({ preventScroll: true })
          }
          card.querySelectorAll<HTMLElement>('a, button').forEach(control => { control.inert = covered })
        })
      }
      syncControls(0)
      const timeline = gsap.timeline({
        onUpdate: () => syncControls(Math.round(timeline.progress() * (cards.length - 1))),
        scrollTrigger: { trigger: stage, start: 'top 96px', end: '+=1350', pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      })
      cards.slice(1).forEach((card, index) => {
        timeline.to(cards[index], { scale: 0.94, opacity: 0.5, duration: 1 }, index)
          .to(card, { yPercent: 0, duration: 1, ease: 'none' }, index)
      })
      return () => {
        delete stage.dataset.stacked
        cards.forEach(card => {
          card.querySelector('h3')?.removeAttribute('tabindex')
          card.querySelectorAll<HTMLElement>('a, button').forEach(control => { control.inert = false })
        })
      }
    })
    return () => media.revert()
  }, { scope: root, dependencies: [animated], revertOnUpdate: true })

  function closeMenu(restoreFocus = false) {
    setMenuOpen(false)
    if (restoreFocus) menuButton.current?.focus()
  }

  return <div ref={root} className="app" data-motion={animated ? 'on' : 'off'}>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="site-header" onKeyDown={event => { if (event.key === 'Escape') closeMenu(true) }}>
      <div className="nav-shell container">
        <a href="#inicio" className="wordmark" aria-label="Terra, início">terra<span className="wordmark-dot">.</span></a>
        <nav aria-label="Navegação principal" className={menuOpen ? 'main-nav is-open' : 'main-nav'} id="main-navigation">
          <a href="#o-terra" onClick={() => closeMenu()}>O Terra</a>
          <a href="#cenarios" onClick={() => closeMenu()}>Cenários</a>
          <a href="#demonstracao" onClick={() => closeMenu()}>Como funciona</a>
        </nav>
        <div className="nav-actions">
          <button className="icon-button motion-button" onClick={() => setPaused(!paused)} aria-label={reducedMotion ? 'Movimento reduzido ativado' : paused ? 'Retomar animações' : 'Pausar animações'} title={reducedMotion ? 'Movimento reduzido ativado' : paused ? 'Retomar animações' : 'Pausar animações'} disabled={reducedMotion}>
            <Icon name={animated ? 'pause' : 'play'} size={18} />
          </button>
          <a className="button button-small nav-cta" href={action.href} {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{action.label}<Icon name="diagonal" size={15} /></a>
          <button ref={menuButton} className="icon-button menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} aria-controls="main-navigation" aria-expanded={menuOpen}><Icon name={menuOpen ? 'close' : 'menu'} /></button>
        </div>
      </div>
    </header>

    <main id="conteudo" tabIndex={-1} className="overflow-x-hidden w-full max-w-full">
      <section id="inicio" className="hero" aria-labelledby="hero-title">
        <div className="hero-backdrop" aria-hidden="true"><SceneImage scene={scenes[0]} alt="" priority sizes="100vw" /></div>
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content container">
          <p className="hero-intro">Papel de parede animado para Android</p>
          <h1 id="hero-title" className="max-w-6xl"><span>O clima muda.</span><span>Sua tela também.</span></h1>
          <p className="hero-description">Quando chove lá fora, chove na sua tela.<br className="desktop-break" /> Um pequeno mundo que acompanha o tempo de verdade.</p>
          <div className="hero-actions">
            <a className="button" href={action.href} {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{action.label}<Icon name="arrow" size={19} /></a>
            <a className="button button-outline" href="#cenarios">Explorar cenários<Icon name="diagonal" size={18} /></a>
          </div>
          <div className="hero-gallery" aria-label="Artes de cenários do Terra">
            <div className="hero-art hero-art-left"><SceneImage scene={scenes[1]} sizes="(max-width: 767px) 30vw, 220px" /></div>
            <div className="hero-art hero-art-center"><SceneImage scene={scenes[0]} priority sizes="(max-width: 767px) 45vw, 280px" /><div className="hero-art-caption"><Icon name="sun" size={17} /><span>Cabana na floresta</span></div></div>
            <div className="hero-art hero-art-right"><SceneImage scene={scenes[2]} sizes="(max-width: 767px) 30vw, 220px" /></div>
          </div>
        </div>
      </section>

      <section id="o-terra" className="benefits section-pad container" aria-labelledby="benefits-title">
        <div className="section-heading heading-split">
          <h2 id="benefits-title">Lá fora, o tempo.<br />Aqui, o seu refúgio.</h2>
          <p>O Terra transforma sua tela em uma cena viva. A arte fica. A luz, o céu e o clima seguem o ritmo do dia.</p>
        </div>
        <div className="bento grid-flow-dense">
          <article className="bento-card bento-day art-scroll-target">
            <SceneImage scene={scenes[4]} className="scroll-art" />
            <div className="bento-overlay" />
            <div className="bento-copy"><span className="feature-icon"><Icon name="moon" size={26} /></span><h3>O dia passa.<br />A cena acompanha.</h3><p>Do amanhecer à noite, a luz do cenário muda com a hora da sua região.</p></div>
          </article>
          <article className="bento-card bento-weather"><div className="weather-orbit" aria-hidden="true"><Icon name="rain" size={58} /><span /><span /></div><div className="bento-copy"><h3>O clima lá fora,<br />na sua tela.</h3><p>Sol, nuvens, chuva ou névoa. O cenário acompanha o clima real.</p></div></article>
          <article className="bento-card bento-quiet"><div className="quiet-mark" aria-hidden="true"><Icon name="leaf" size={60} /></div><div className="bento-copy"><h3>Sem anúncios.<br />Só o seu cenário.</h3><p>Uma tela para olhar com calma, sem interrupções do app.</p></div></article>
          <article className="bento-card bento-art"><div className="bento-copy"><h3>Uma arte para cada<br />jeito de olhar.</h3><p>Pixel art, argila, aquarela.<br />Escolha o cenário e a arte dele.</p></div><div className="art-fan" aria-hidden="true">{[scenes[0], scenes[1], scenes[2]].map(item => <SceneImage key={item.id} scene={item} alt="" sizes="140px" />)}</div></article>
        </div>
      </section>

      <section id="cenarios" className="scene-section section-pad" aria-labelledby="scenes-title">
        <div className="container">
          <div className="section-heading heading-split"><h2 id="scenes-title">Encontre o seu<br /><span className="inline-heading">pequeno <span className="inline-art" aria-hidden="true"><SceneImage scene={scenes[2]} alt="" sizes="150px" /></span> mundo.</span></h2><p>Uma floresta, um jardim, um horizonte distante. Cinco cenários embarcados, cada um com uma arte gratuita para experimentar.</p></div>
          <div className="scene-accordion" aria-label="Escolha um cenário para a demonstração">
            {scenes.map((item, index) => <article className={`scene-panel ${selectedScene === index ? 'is-selected' : ''}`} key={item.id} onPointerEnter={event => { if (event.pointerType === 'mouse') setSelectedScene(index) }}>
              <SceneImage scene={item} alt="" sizes="(max-width: 767px) 100vw, 650px" />
              <div className="scene-panel-shade" aria-hidden="true" />
              <button id={`scene-${item.id}`} className="scene-select" aria-expanded={selectedScene === index} aria-controls={`description-${item.id}`} aria-label={item.name} onClick={() => setSelectedScene(index)} onKeyDown={event => {
                const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End']
                if (!keys.includes(event.key)) return
                event.preventDefault()
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? scenes.length - 1 : (index + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + scenes.length) % scenes.length
                setSelectedScene(next)
                document.getElementById(`scene-${scenes[next].id}`)?.focus()
              }}><span className="scene-name">{item.name}</span><span className="scene-open-icon"><Icon name="diagonal" size={24} /></span></button>
              <div id={`description-${item.id}`} className="scene-description" hidden={selectedScene !== index}><span>{item.style}</span><p>{item.description}</p></div>
            </article>)}
          </div>
          <div className="gallery-note"><span>Artes reais do aplicativo. A escolha acima também muda a prévia abaixo.</span><a className="text-link" href="#demonstracao">Ver {scene.shortName.toLocaleLowerCase('pt-BR')} em ação<Icon name="arrow" size={18} /></a></div>
        </div>
        <div className="marquee" role="region" aria-label={`Estilos de arte: ${artStyles.join(', ')}`}><div className="marquee-track" style={{ animationPlayState: marqueePaused ? 'paused' : 'running' }} aria-hidden="true">{[0, 1].map(copy => <div className="marquee-group" key={copy}>{artStyles.map(style => <span key={style}>{style}<Icon name="sparkle" size={28} /></span>)}</div>)}</div></div>
        <div className="marquee-controls container"><button className="marquee-toggle" onClick={() => setMarqueePaused(!marqueePaused)} disabled={!animated} aria-pressed={marqueePaused}><Icon name={marqueePaused || !animated ? 'play' : 'pause'} size={15} />{marqueePaused ? 'Retomar faixa' : 'Pausar faixa'}</button></div>
      </section>

      <section id="demonstracao" className="demo-section section-pad container" aria-labelledby="demo-title">
        <div className="section-heading heading-split"><h2 id="demo-title">O mesmo lugar.<br />Um novo instante.</h2><div><p>Experimente a luz do dia, a chuva e a noite. No Android, o Terra acompanha o clima e o horário da sua região.</p><p className="simulation-note">Prévia ilustrativa. As condições abaixo são simuladas.</p></div></div>
        <div className="stack-stage">
          <article className="stack-card stack-sun">
            <div className="stack-copy"><Icon name="sun" size={32} /><h3>Deixe o dia<br />entrar.</h3><p>Aquele cenário que você escolheu encontra a luz lá fora. E ganha outro jeito de ser seu.</p><div className="weather-controls" role="group" aria-label="Condição da prévia">{([{ id: 'sun', label: 'Sol', icon: 'sun' }, { id: 'rain', label: 'Chuva', icon: 'rain' }, { id: 'night', label: 'Noite', icon: 'moon' }] as const).map(item => <button key={item.id} aria-pressed={weather === item.id} onClick={() => setWeather(item.id)}><Icon name={item.icon} size={17} />{item.label}</button>)}</div><span className="preview-label">{scene.name} · {scene.style}</span></div>
            <div className="stack-visual"><div className="ambient-orb" aria-hidden="true" /><WeatherPreview scene={scene} weather={weather} animated={animated} /></div>
          </article>
          <article className="stack-card stack-rain"><div className="stack-copy"><Icon name="rain" size={32} /><h3>A chuva chega<br />de mansinho.</h3><p>Se o tempo muda na sua região, a cena muda junto. A paisagem continua ali; a atmosfera se transforma.</p><span className="preview-label">Chuva simulada · {scene.shortName}</span></div><div className="stack-visual"><div className="ambient-orb" aria-hidden="true" /><WeatherPreview scene={scene} weather="rain" animated={animated} /></div></article>
          <article className="stack-card stack-night"><div className="stack-copy"><Icon name="moon" size={32} /><h3>A noite encontra<br />seu ritmo.</h3><p>A luz baixa, o dia descansa. Seu papel de parede acompanha a passagem do tempo, sem você precisar trocar a imagem.</p><a href="#convite" className="text-link">Encontre seu próximo cenário<Icon name="arrow" size={19} /></a><span className="preview-label">Noite simulada · {scene.shortName}</span></div><div className="stack-visual"><div className="ambient-orb" aria-hidden="true" /><WeatherPreview scene={scene} weather="night" animated={animated} /></div></article>
        </div>
        <p className="demo-footnote">Esta apresentação usa as artes do app e efeitos simplificados. A animação completa roda no Android.</p>
      </section>

      <section id="convite" className="final-section section-pad" aria-labelledby="final-title"><div className="container final-content"><span className="final-symbol" aria-hidden="true"><Icon name="sparkle" size={42} /></span><h2 id="final-title">Seu celular.<br />Seu pequeno mundo.</h2><p>Escolha um lugar que combine com você.<br />Deixe o tempo cuidar do resto.</p><div className="final-actions"><a href={action.href} className="button" {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{action.label}<Icon name="arrow" size={19} /></a><a href={`mailto:${site.supportEmail}`} className="button button-outline">Falar com suporte<Icon name="diagonal" size={18} /></a></div><span className="availability-note">Feito para Android 8.0 ou mais recente.</span></div></section>
    </main>

    <footer className="site-footer container"><div className="footer-top"><a className="wordmark" href="#inicio" aria-label="Terra, voltar ao início">terra<span className="wordmark-dot">.</span></a><p>Cenário animado. Clima real.</p><nav aria-label="Links do rodapé"><a href={site.privacyUrl}>Privacidade</a><a href={site.termsUrl}>Termos</a><a href={site.contactUrl}>Contato</a></nav></div><div className="footer-bottom"><span>Terra — Papel de parede animado para Android.</span><span>Um pouco do mundo, perto de você.</span></div></footer>
  </div>
}
