import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart, Shuffle, Users, Wifi, WifiOff, ArrowLeft, ArrowRight, Sparkles, Copy, Check, ShieldCheck } from 'lucide-react'
import { categories, levels, cards, randomCards } from './data/cards'
import { broadcastState, createRoomChannel, supabaseConfigured } from './lib/supabase'

const allCards = [...cards, ...randomCards]
const roomFromUrl = () => new URLSearchParams(window.location.search).get('room') || ''

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function App() {
  const [page, setPage] = useState('home')
  const [roomCode, setRoomCode] = useState(roomFromUrl())
  const [roomInput, setRoomInput] = useState(roomFromUrl())
  const [activeCategory, setActiveCategory] = useState('deep')
  const [activeLevel, setActiveLevel] = useState(1)
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [seen, setSeen] = useState([])
  const [connection, setConnection] = useState(supabaseConfigured ? 'connecting' : 'local')
  const [copied, setCopied] = useState(false)
  const [showFollowUp, setShowFollowUp] = useState(false)

  const channelRef = useRef(null)
  const gameStateRef = useRef(null)
  gameStateRef.current = {
    page, roomCode, activeCategory, activeLevel, deck, index, flipped, seen, showFollowUp,
  }

  const currentCard = deck[index]
  const currentCategory = categories.find((item) => item.id === activeCategory)
  const visibleCount = useMemo(() => allCards.filter((c) => c.category === activeCategory).length, [activeCategory])

  const applyRemoteState = useCallback((state) => {
    if (!state || state.roomCode !== roomCode) return
    setPage(state.page ?? 'home')
    setActiveCategory(state.activeCategory ?? 'deep')
    setActiveLevel(state.activeLevel ?? 1)
    setDeck(state.deck ?? [])
    setIndex(state.index ?? 0)
    setFlipped(Boolean(state.flipped))
    setSeen(state.seen ?? [])
    setShowFollowUp(Boolean(state.showFollowUp))
  }, [roomCode])

  const sync = useCallback(async (patch) => {
    const next = {
      page, roomCode, activeCategory, activeLevel, deck, index, flipped, seen, showFollowUp,
      ...patch,
    }
    if (roomCode) await broadcastState(channelRef.current, next)
  }, [page, roomCode, activeCategory, activeLevel, deck, index, flipped, seen, showFollowUp])

  useEffect(() => {
    if (!roomCode || !supabaseConfigured) {
      channelRef.current = null
      setConnection(supabaseConfigured ? 'disconnected' : 'local')
      return
    }

    setConnection('connecting')
    const channel = createRoomChannel(
      roomCode,
      applyRemoteState,
      (status) => setConnection(
        status === 'SUBSCRIBED' ? 'connected' : status.toLowerCase()
      ),
      () => gameStateRef.current,
    )
    channelRef.current = channel

    return () => {
      if (channelRef.current === channel) channelRef.current = null
      channel?.unsubscribe()
    }
  }, [roomCode, applyRemoteState])

  const joinRoom = (event) => {
    event.preventDefault()
    const clean = roomInput.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 24)
    if (!clean) return
    setRoomCode(clean)
    setRoomInput(clean)
    const url = new URL(window.location.href)
    url.searchParams.set('room', clean)
    window.history.replaceState({}, '', url)
  }

  const shareRoom = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      window.prompt('Copy this room link:', window.location.href)
    }
  }

  const cardsFor = (categoryId, level) => shuffle(
    (categoryId === 'random' ? randomCards : allCards.filter((card) => card.category === categoryId && card.level === level))
  )

  const chooseCategory = (id) => {
    const firstLevelDeck = cardsFor(id, 1)
    setPage('play')
    setActiveCategory(id)
    setActiveLevel(1)
    setDeck(firstLevelDeck)
    setIndex(0)
    setFlipped(false)
    setShowFollowUp(false)
    sync({ page: 'play', activeCategory: id, activeLevel: 1, deck: firstLevelDeck, index: 0, flipped: false, showFollowUp: false })
  }

  const chooseLevel = (level) => {
    const nextDeck = cardsFor(activeCategory, level)
    setActiveLevel(level)
    setDeck(nextDeck)
    setIndex(0)
    setFlipped(false)
    setShowFollowUp(false)
    sync({ page, activeLevel: level, deck: nextDeck, index: 0, flipped: false, showFollowUp: false })
  }

  const drawCard = (randomMode = false) => {
    const source = randomMode
      ? randomCards
      : allCards.filter((c) => c.category === activeCategory && c.level === activeLevel)
    const available = source.filter((c) => !seen.includes(c.id))
    const pool = available.length ? available : source
    const selected = shuffle(pool).slice(0, Math.max(1, pool.length))
    setDeck(selected)
    setIndex(0)
    setFlipped(false)
    setShowFollowUp(false)
    if (randomMode) setActiveCategory('random')
    if (selected[0]) setSeen((old) => [...old, selected[0].id])
    sync({ page: 'play', deck: selected, index: 0, flipped: false, showFollowUp: false, activeCategory: randomMode ? 'random' : activeCategory, activeLevel })
  }

  const flipCard = () => {
    const next = !flipped
    setFlipped(next)
    setShowFollowUp(false)
    sync({ flipped: next, showFollowUp: false })
  }

  const nextCard = () => {
    if (!deck.length) return drawCard(activeCategory === 'random')
    let nextIndex = index + 1
    if (nextIndex >= deck.length) {
      drawCard(activeCategory === 'random')
      return
    }
    setIndex(nextIndex)
    setFlipped(false)
    setShowFollowUp(false)
    const nextCardData = deck[nextIndex]
    if (nextCardData) setSeen((old) => [...old, nextCardData.id])
    sync({ index: nextIndex, flipped: false, showFollowUp: false })
  }

  const prevCard = () => {
    if (index <= 0) return
    const nextIndex = index - 1
    setIndex(nextIndex)
    setFlipped(false)
    setShowFollowUp(false)
    sync({ index: nextIndex, flipped: false, showFollowUp: false })
  }

  const showFollow = () => {
    setShowFollowUp(true)
    sync({ showFollowUp: true })
  }

  const cardCountLabel = activeCategory === 'random' ? `${randomCards.length} surprise cards` : `${allCards.filter((c) => c.category === activeCategory && c.level === activeLevel).length} cards in this level` 
  const connectionLabel = !supabaseConfigured ? 'Local preview' : connection === 'connected' ? 'Room synced' : 'Connecting room'

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Closer home" onClick={(e) => { e.preventDefault(); setPage('home') }}>
          <span className="brand-mark"><Heart size={18} fill="currentColor" /></span>
          <span><strong>CLOSER</strong><small>ESSO & MAYA</small></span>
        </a>
        <div className={`connection ${connection === 'connected' ? 'online' : ''}`}>
          {connection === 'connected' ? <Wifi size={14} /> : supabaseConfigured ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{connectionLabel}</span>
        </div>
      </header>

      <main>
        {page === 'home' && <section className="hero">
          <div className="eyebrow"><Sparkles size={14} /> YOUR SPACE, JUST FOR TWO</div>
          <h1>Closer, even<br /><em>miles apart.</em></h1>
          <p>Questions that open doors. Cards that bring you closer.</p>
          <div className="room-panel">
            <form onSubmit={joinRoom} className="room-form">
              <label htmlFor="room">SHARED ROOM CODE</label>
              <div className="room-input-row">
                <Users size={17} />
                <input id="room" value={roomInput} onChange={(e) => setRoomInput(e.target.value)} placeholder="e.g. MOONLIGHT-27" maxLength={24} />
                <button type="submit" className="small-gold">Join</button>
              </div>
            </form>
            <button className="share-button" onClick={shareRoom} disabled={!roomCode}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Link copied' : roomCode ? 'Copy room link' : 'Join a room to share'}
            </button>
          </div>
          {!supabaseConfigured && <div className="setup-note"><ShieldCheck size={15} /> Preview mode: add Supabase keys to enable cross-device sync.</div>}
        </section>}

        {page === 'home' && <section className="category-section">
          <div className="section-heading">
            <div><span className="section-kicker">01 / CHOOSE YOUR PATH</span><h2>Pick a category</h2></div>
            <span className="tiny-note">8 DECKS</span>
          </div>
          <div className="category-grid">
            {categories.map((cat, i) => (
              <button key={cat.id} className={`category-card ${cat.color} ${activeCategory === cat.id ? 'selected' : ''}`} onClick={() => chooseCategory(cat.id)}>
                <span className="category-number">0{i + 1}</span>
                <span className="category-icon">{cat.icon}</span>
                <span className="category-title">{cat.title}</span>
                <span className="category-subtitle">{cat.subtitle}</span>
                <span className="category-arrow">↗</span>
              </button>
            ))}
          </div>
          <div className="category-description"><span>{currentCategory?.icon}</span><p>{currentCategory?.description}</p></div>
        </section>}



        {page === 'play' && <section className="play-page">
          <button className="back-to-decks" onClick={() => setPage('home')}><ArrowLeft size={16} /> All categories</button>
          <div className="play-title"><span className="section-kicker">NOW PLAYING</span><h2>{activeCategory === 'random' ? 'Surprise Deck' : currentCategory?.title}</h2><p>{currentCategory?.description}</p></div>
          <div className="level-row play-level-row">{levels.map((level) => <button key={level.id} className={`level-pill ${activeLevel === level.id ? 'active' : ''}`} onClick={() => chooseLevel(level.id)}><span>0{level.id}</span><strong>{level.title}</strong></button>)}</div>
          <section className="draw-section">
          <div className="section-heading">
            <div><span className="section-kicker">03 / DRAW A CARD</span><h2>The next reveal</h2></div>
            <button className="text-button" onClick={() => drawCard(true)}><Shuffle size={15} /> Random mode</button>
          </div>
          <div className="card-stage">
            <button className="stage-arrow stage-prev" onClick={prevCard} disabled={!deck.length || index === 0} aria-label="Previous card"><ArrowLeft size={22} /></button>
            <div className="table-scene">
            <div className="ambient ambient-one" />
            <div className="ambient ambient-two" />
            <button className={`playing-card ${activeCategory === 'posecards' ? 'pose-playing-card' : ''} ${flipped ? 'is-flipped' : ''} ${currentCategory?.color || 'ruby'}`} onClick={flipCard} aria-label={flipped ? 'Hide card' : 'Reveal card'}>
              <span className="card-face card-back">
                <span className="card-corner top">C</span>
                <span className="card-ornament"><span>✦</span><Heart size={36} strokeWidth={1.1} /><span>✦</span></span>
                <span className="card-back-title">CLOSER</span>
                <span className="card-back-sub">A MOMENT FOR TWO</span>
                <span className="card-corner bottom">C</span>
                <span className="tap-hint">TAP TO REVEAL</span>
              </span>
              <span className="card-face card-front">
                {currentCard ? <>
                  <span className="front-label">{currentCard.type === 'dare' ? (currentCard.category === 'stripquiz' ? 'STRIP QUIZ' : currentCard.category === 'posecards' ? 'POSE CHALLENGE' : 'YOUR CHALLENGE') : currentCard.type === 'random' ? 'WILDCARD' : 'YOUR QUESTION'}</span>
                  {activeCategory === 'posecards' ? <div className="pose-photo-slot">{currentCard.image ? <img className="pose-photo" src={currentCard.image} alt="Pose reference for this challenge" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="pose-photo-placeholder"><span className="pose-photo-icon">▧</span><strong>POSE PHOTO</strong><small>Image unavailable</small></div>}</div> : <span className="front-symbol">{currentCard.visual || currentCategory?.icon}</span>}
                  <span className="front-level">LEVEL {currentCard.level}</span>
                  <span className="front-prompt">{currentCard.prompt}</span>
                  {showFollowUp && <span className="front-follow">{currentCard.followUp}</span>}
                  <span className="front-bottom">CLOSER · BE CURIOUS, BE KIND</span>
                </> : <>
                  <span className="front-label">READY WHEN YOU ARE</span>
                  <span className="front-symbol">{currentCategory?.icon || '♡'}</span>
                  <span className="front-prompt">Draw a card to start your conversation.</span>
                  <span className="front-bottom">CLOSER · BE CURIOUS, BE KIND</span>
                </>}
              </span>
            </button>
            </div>
            <button className="stage-arrow stage-next" onClick={() => deck.length ? nextCard() : drawCard(activeCategory === 'random')} aria-label="Next card"><ArrowRight size={22} /></button>
          </div>
          <div className="card-actions">
            <button className="secondary-button" onClick={prevCard} disabled={!deck.length || index === 0}><ArrowLeft size={16} /> Previous</button>
            <button className="primary-button" onClick={() => deck.length ? nextCard() : drawCard(activeCategory === 'random')}>{deck.length ? 'Next card' : 'Draw a card'} <ArrowRight size={16} /></button>
          </div>
          {currentCard && flipped && currentCard.followUp && <button className="follow-button" onClick={showFollow} disabled={showFollowUp}>{showFollowUp ? 'Follow-up revealed' : 'Reveal follow-up question'}</button>}
          <p className="table-note">One card at a time. Take turns, talk honestly, and skip anything that does not feel right.</p>
        </section>

        </section>}

        {page === 'home' && <section className="random-section">
          <div className="random-art"><span className="random-star">✦</span><span className="random-heart">♡</span><span className="random-dice">⚄</span></div>
          <div className="random-copy">
            <span className="section-kicker">THE UNEXPECTED</span>
            <h2>Leave it to chance.</h2>
            <p>Surprise prompts, playful missions, and wildcard moments when you cannot decide what comes next.</p>
            <button className="primary-button" onClick={() => { setPage('play'); setActiveCategory('random'); drawCard(true) }}>Draw a surprise <Shuffle size={16} /></button>
          </div>
        </section>}

        <section className="safety-note">
          <ShieldCheck size={18} />
          <p><strong>Always mutual. Always optional.</strong> Either player can skip a card or choose another. Intimate content should never be recorded or shared without explicit consent.</p>
        </section>
      </main>

      <footer><span>CLOSER © 2026</span><span>MADE FOR TWO, WHEREVER YOU ARE</span></footer>
    </div>
  )
}
