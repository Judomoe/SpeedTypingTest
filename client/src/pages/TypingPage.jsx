import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'

// ── Word banks ───────────────────────────────────────────────────────────────
const WORD_BANKS = {
  english: [
    "the quick brown fox jumps over the lazy dog and then runs away into the misty forest where ancient trees stand tall",
    "programming is the art of telling another human what one wants the computer to do in the most elegant and efficient way",
    "every great developer got there by solving problems they were unqualified to solve until they actually did it and learned",
    "practice does not make perfect only perfect practice makes perfect so slow down think about accuracy before you chase raw speed",
    "consistency beats intensity every time ten minutes of focused practice each day will improve your typing far more than one long session",
    "touch typing is the skill of typing without looking at the keyboard using muscle memory to find each key by feel alone",
    "the home row keys are your anchor always return your fingers to asdf and jkl semicolon after reaching for other keys",
    "accuracy matters more than speed in the long run because fast but inaccurate typing produces more errors than careful steady typing",
  ],
  arabic: [
    "الكتابة السريعة مهارة تحتاج إلى تدريب يومي منتظم لتحسين السرعة والدقة في آن واحد",
    "تعلم الكتابة على لوحة المفاتيح بدون النظر إليها يوفر الوقت ويزيد الإنتاجية بشكل ملحوظ",
    "الممارسة المستمرة هي المفتاح الحقيقي لإتقان أي مهارة سواء كانت الكتابة أو البرمجة أو غيرها",
  ],
  french: [
    "la dactylographie est l art de taper sur un clavier sans regarder les touches en utilisant la memoire musculaire",
    "la pratique quotidienne est essentielle pour ameliorer votre vitesse de frappe et votre precision sur le clavier",
    "chaque grande competence necessite du temps et de la perseverance avant de devenir une seconde nature pour vous",
  ],
  spanish: [
    "la mecanografia es el arte de escribir con el teclado sin mirar las teclas usando la memoria muscular",
    "la practica diaria es esencial para mejorar tu velocidad de escritura y tu precision en el teclado",
    "cada gran habilidad requiere tiempo y perseverancia antes de convertirse en algo natural para ti",
  ],
  german: [
    "das Maschinenschreiben ist die Kunst auf einer Tastatur zu tippen ohne auf die Tasten zu schauen",
    "tagliche Ubung ist unerlasslich um Ihre Tippgeschwindigkeit und Genauigkeit auf der Tastatur zu verbessern",
  ],
  italian: [
    "la dattilografia e l arte di scrivere sulla tastiera senza guardare i tasti usando la memoria muscolare",
    "la pratica quotidiana e essenziale per migliorare la velocita di battitura e la precisione sulla tastiera",
  ],
}

const QUOTE_TEXTS = [
  "The only way to do great work is to love what you do. If you haven't found it yet keep looking. Don't settle.",
  "In the middle of every difficulty lies opportunity. The measure of intelligence is the ability to change.",
  "It does not matter how slowly you go as long as you do not stop moving forward every single day.",
  "Success is not final failure is not fatal it is the courage to continue that counts above all else.",
  "Whether you think you can or you think you cannot you are right either way so choose to believe.",
]

const CODE_TEXTS = [
  "function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }",
  "const quickSort = arr => arr.length <= 1 ? arr : [...quickSort(arr.slice(1).filter(x => x <= arr[0])), arr[0], ...quickSort(arr.slice(1).filter(x => x > arr[0]))];",
  "async function fetchData(url) { try { const res = await fetch(url); if (!res.ok) throw new Error(res.status); return await res.json(); } catch (e) { console.error(e); } }",
]

const LESSON_TEXTS = {
  'basic-1':  'fj fj dk dk fd jk fj dk fd jk dfkj jkfd fdjk kjdf fjdk dkfj jfkd kdfj fjdk dkjf kfjd jdkf dfkj fjkd',
  'basic-2':  'fg jh fgh jhg gfj hjf fghj jhgf fhgj gjhf hfjg fjhg ghjf jhfg ghfj hjfg fghj jfgh hgfj gfhj jghf',
  'basic-3':  'sal las alls fall lass slab fad fads dad adds lads salsa flask falls slabs falls jabs labs labs flasks',
  'basic-4':  'die side like life idea ride diet file lies idle fled edit tile site line mile ride hide tide file',
  'basic-5':  'slide filed ideas fades liked kills deals leads asked faked jails sales fails alike slide field ideal sides',
  'basic-6':  'Ask Sale Faded Files Ideas Slide Fades Deals Liked Kills Deals Leads Asked Filed Jake Sake Dial Aisle',
  'basic-7':  'rule fury rude urge blur four pure sure lure dour urge rule true blur guru lure pure sure ruse fuel',
  'basic-8':  'the quick brown fox jumps over a lazy dog every good job requires vital key experience with simple tricks',
  'basic-9':  'the and for you are not that have with this from they will be at but we by its he on are or as at',
  'basic-10': 'the and for you are not that have with this from they will be at but we by its he on are one which had',
  'prog-1':   '() [] {} (()) [[]] {{}} ([]){} {[()]} ()[]{} ([{}]) {()}[] ()[]{} ()[] {}{} []() (){}',
  'prog-2':   '= + - * / == != <= >= && || ++ -- += -= *= /= % ** >>> & | ^ ~ << >> %= **= &&= ||= ??=',
  'prog-3':   '@ # $ % ^ & * ! ~ | < > ? / : ; , . @email #tag $var %format ^xor &ref *ptr !flag ~bit',
  'prog-4':   'const load = async (url) => { const res = await fetch(url); return res.json(); }; export default load;',
  'prog-5':   'def greet(name="world"): print(f"Hello, {name}!") return len(name)',
  'num-1':    '1 2 3 4 5 6 7 8 9 0 12 34 56 78 90 123 456 789 1234 5678 9012 12345 67890',
  'num-2':    '3.14 2.71 1.41 0.99 42.0 100.5 3.14159 2.71828 1.41421 0.99999',
  'num-3':    '10% 25% 50% 75% 100% 9.99 19.99 99.00 50 30 1000 42 100 50',
}

// ── Virtual keyboard layout ──────────────────────────────────────────────────
const KB_ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l',';'],
  ['z','x','c','v','b','n','m',',','.','/'],
]
// Finger color map: 0=pinky,1=ring,2=middle,3=index,4=index,5=index,6=index,7=middle,8=ring,9=pinky
const FINGER_COLORS = ['#c084fc','#57ffd8','#e8ff57','#ff9f57','#ff9f57','#ff9f57','#ff9f57','#e8ff57','#57ffd8','#c084fc']

function VirtualKeyboard({ nextChar }) {
  const next = nextChar ? nextChar.toLowerCase() : ''
  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, userSelect: 'none' }}>
      {KB_ROWS.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 4, marginLeft: ri === 1 ? 16 : ri === 2 ? 32 : 0 }}>
          {row.map((key, ki) => {
            const isNext = key === next
            const fingerColor = FINGER_COLORS[ki]
            return (
              <div key={key} style={{
                width: 36, height: 36, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 500,
                background: isNext ? fingerColor : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isNext ? fingerColor : 'rgba(255,255,255,0.08)'}`,
                color: isNext ? '#0c0c10' : fingerColor,
                boxShadow: isNext ? `0 0 12px ${fingerColor}60` : 'none',
                transition: 'background 0.1s, box-shadow 0.1s',
              }}>{key}</div>
            )
          })}
        </div>
      ))}
      {/* Space bar */}
      <div style={{
        width: 200, height: 30, borderRadius: 6, marginTop: 2,
        background: next === ' ' ? '#ff9f57' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${next === ' ' ? '#ff9f57' : 'rgba(255,255,255,0.08)'}`,
        boxShadow: next === ' ' ? '0 0 12px #ff9f5760' : 'none',
        transition: 'background 0.1s',
      }} />
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        {[['#c084fc','Pinky'],['#57ffd8','Ring'],['#e8ff57','Middle'],['#ff9f57','Index']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#55556a' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sound engine ─────────────────────────────────────────────────────────────
function createClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    return function playClick(correct = true) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.setValueAtTime(correct ? 800 : 300, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(correct ? 400 : 150, ctx.currentTime + 0.04)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.07)
    }
  } catch {
    return () => {}
  }
}

const ZEN_PLACEHOLDER = 'Just start typing freely. No target. No timer. Only flow…'
const MODES = ['words', 'quotes', 'code', 'zen']
const TIMES = [15, 30, 60, 120]

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function getTextForMode(mode, language = 'english') {
  switch (mode) {
    case 'quotes': return rand(QUOTE_TEXTS)
    case 'code':   return rand(CODE_TEXTS)
    case 'zen':    return ''
    default:       return rand(WORD_BANKS[language] || WORD_BANKS.english)
  }
}

// ── Dynamically load Google Font ─────────────────────────────────────────────
const FONT_URLS = {
  'JetBrains Mono': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap',
  'Fira Code':      'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;700&display=swap',
  'Source Code Pro':'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;700&display=swap',
  'IBM Plex Mono':  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap',
  'Courier New':    null,
  'Consolas':       null,
}
function ensureFontLoaded(font) {
  const url = FONT_URLS[font]
  if (!url) return
  const id = `gf-${font.replace(/\s/g,'-')}`
  if (!document.getElementById(id)) {
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'; link.href = url
    document.head.appendChild(link)
  }
}

export default function TypingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const lessonId  = searchParams.get('lesson')
  const lessonTab = searchParams.get('tab')
  const { settings } = useSettings()
  const { saveScore } = useAuth()

  const [mode, setMode]       = useState('words')
  const [time, setTime]       = useState(30)
  const [text, setText]       = useState(() => rand(WORD_BANKS.english))
  const [typed, setTyped]     = useState('')
  const [focused, setFocused] = useState(false)
  const [started, setStarted] = useState(false)
  const [done, setDone]       = useState(false)
  const [left, setLeft]       = useState(30)
  const [wpm, setWpm]         = useState(0)
  const [acc, setAcc]         = useState(100)
  const [errors, setErrors]   = useState(0)

  const inputRef         = useRef(null)
  const timerRef         = useRef(null)
  const textRef          = useRef(text)
  const typedRef         = useRef('')
  const wpmPerSecRef     = useRef([])
  const rawPerSecRef     = useRef([])
  const errAtSecRef      = useRef([])
  const prevTypedLenRef  = useRef(0)
  const elapsedRef       = useRef(0)
  const clickSoundRef    = useRef(null)

  // Initialise sound engine lazily on first user gesture
  useEffect(() => {
    function init() {
      if (!clickSoundRef.current) clickSoundRef.current = createClickSound()
    }
    window.addEventListener('keydown', init, { once: true })
    window.addEventListener('click',   init, { once: true })
    return () => { window.removeEventListener('keydown', init); window.removeEventListener('click', init) }
  }, [])

  // Load font whenever setting changes
  useEffect(() => { ensureFontLoaded(settings.font) }, [settings.font])

  useEffect(() => { textRef.current = text }, [text])

  // Lesson text
  useEffect(() => {
    if (!lessonId || !lessonTab) return
    const tabKey = lessonTab.startsWith('prog') ? 'prog' : lessonTab.startsWith('num') ? 'num' : 'basic'
    const key = `${tabKey}-${lessonId}`
    if (LESSON_TEXTS[key]) setText(LESSON_TEXTS[key])
  }, [lessonId, lessonTab])

  const reset = useCallback(() => {
    let newText
    if (lessonId && lessonTab) {
      const tabKey = lessonTab.startsWith('prog') ? 'prog' : lessonTab.startsWith('num') ? 'num' : 'basic'
      newText = LESSON_TEXTS[`${tabKey}-${lessonId}`] || getTextForMode(mode, settings.language)
    } else {
      newText = getTextForMode(mode, settings.language)
    }
    setTyped(''); setFocused(false); setStarted(false); setDone(false)
    setLeft(time); setWpm(0); setAcc(100); setErrors(0)
    setText(newText)
    wpmPerSecRef.current = []; rawPerSecRef.current = []; errAtSecRef.current = []
    prevTypedLenRef.current = 0; elapsedRef.current = 0; typedRef.current = ''
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [time, mode, lessonId, lessonTab, settings.language])

  // Reset when mode, time, OR language changes
  useEffect(() => { reset() }, [time, mode, settings.language])

  // Tab to reset
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Tab') { e.preventDefault(); reset() } }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [reset])

  // Timer
  useEffect(() => {
    if (started && !done) {
      timerRef.current = setInterval(() => {
        const curTyped = typedRef.current
        const curText  = textRef.current
        const charsThisSec = Math.max(0, curTyped.length - prevTypedLenRef.current)
        let correctThisSec = 0
        for (let i = prevTypedLenRef.current; i < Math.min(curTyped.length, curText.length); i++) {
          if (curTyped[i] === curText[i]) correctThisSec++
        }
        let totalErrors = 0
        for (let i = 0; i < Math.min(curTyped.length, curText.length); i++) {
          if (curTyped[i] !== curText[i]) totalErrors++
        }
        wpmPerSecRef.current.push(Math.round((correctThisSec / 5) * 60))
        rawPerSecRef.current.push(Math.round((charsThisSec / 5) * 60))
        errAtSecRef.current.push(totalErrors)
        prevTypedLenRef.current = curTyped.length
        elapsedRef.current++

        if (mode !== 'zen' && !lessonId) {
          setLeft(l => {
            if (l <= 1) { clearInterval(timerRef.current); setDone(true); return 0 }
            return l - 1
          })
        }
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started, done, mode, lessonId])

  // Live stats
  useEffect(() => {
    if (!started || typed.length === 0) return
    if (mode === 'zen') {
      setWpm(Math.round((typed.length / 5) / (Math.max(1, elapsedRef.current) / 60)))
      return
    }
    const elapsed = Math.max(1, elapsedRef.current)
    let correct = 0, errs = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === text[i]) correct++
      else errs++
    }
    setWpm(Math.round((correct / 5) / (elapsed / 60)))
    setErrors(errs)
    setAcc(Math.round((correct / Math.max(1, typed.length)) * 100))
  }, [typed, left, started, text, mode])

  // Navigate to results when done — INCLUDING zen
  useEffect(() => {
    if (!done || !started) return
    const finalTyped = typedRef.current
    const finalText  = textRef.current
    const elapsed    = Math.max(1, elapsedRef.current)

    let correct = 0, incorrect = 0, missed = 0
    if (mode === 'zen') {
      correct = finalTyped.length
    } else {
      for (let i = 0; i < finalText.length; i++) {
        if (i < finalTyped.length) { if (finalTyped[i] === finalText[i]) correct++; else incorrect++ }
        else missed++
      }
    }
    const extra    = Math.max(0, finalTyped.length - (mode === 'zen' ? 0 : finalText.length))
    const finalWpm = Math.round((correct / 5) / (elapsed / 60))
    const finalAcc = finalTyped.length > 0 ? Math.round((correct / finalTyped.length) * 100) : 100
    const rawWpm   = Math.round((finalTyped.length / 5) / (elapsed / 60))
    const wpmArr   = wpmPerSecRef.current.filter(v => v >= 0)
    const avg      = wpmArr.length > 0 ? wpmArr.reduce((a,b) => a+b, 0) / wpmArr.length : 0
    const variance = wpmArr.length > 1 ? wpmArr.reduce((a,b) => a + Math.pow(b-avg,2), 0) / wpmArr.length : 0
    const consistency = avg > 0 ? Math.round(Math.max(0, 100 - (Math.sqrt(variance)/avg)*100)) : 100

    const result = {
      wpm: finalWpm, rawWpm, acc: finalAcc, consistency,
      errors: incorrect, correct, incorrect, extra, missed,
      dur: elapsed, mode,
      wpmData: wpmPerSecRef.current, rawData: rawPerSecRef.current, errData: errAtSecRef.current,
      // lesson context so ResultsPage can mark done + go to next
      lessonId:  lessonId  ? Number(lessonId) : null,
      lessonTab: lessonTab || null,
    }
    try { sessionStorage.setItem('tc_result', JSON.stringify(result)) } catch {}
    saveScore(result)
    navigate('/results')
  }, [done, started])   // removed mode from deps — runs for ALL modes now

  function onInput(e) {
    const val = e.target.value
    if (done) return

    // Play sound
    if (settings.sound && clickSoundRef.current) {
      if (mode !== 'zen' && val.length > 0 && val.length <= text.length) {
        const correct = val[val.length - 1] === text[val.length - 1]
        clickSoundRef.current(correct)
      } else if (mode === 'zen' && val.length > typed.length) {
        clickSoundRef.current(true)
      }
    }

    if (mode === 'zen') {
      if (!started && val.length > 0) setStarted(true)
      typedRef.current = val
      setTyped(val)
      return
    }

    if (val.length > text.length) return
    if (!started && val.trim() === '') return
    if (!started && val.length > 0) setStarted(true)
    typedRef.current = val
    setTyped(val)
    if (val.length === text.length) {
      if (timerRef.current) clearInterval(timerRef.current)
      setDone(true)
    }
  }

  function handleFinishZen(e) {
    e.stopPropagation()
    if (timerRef.current) clearInterval(timerRef.current)
    setDone(true)
  }

  function handleAreaClick() {
    inputRef.current?.focus()
    setFocused(true)
  }

  const progress   = mode === 'zen' ? 0 : text.length > 0 ? (typed.length / text.length) * 100 : 0
  const isBlurred  = !focused && !started && mode !== 'zen'
  const typingFont = settings.font || 'JetBrains Mono'
  const typingSize = settings.fontSize || 20
  const nextChar   = mode !== 'zen' && typed.length < text.length ? text[typed.length] : ''

  return (
    <div
      style={{ minHeight: '100vh', paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleAreaClick}
    >
      <div style={{ width: '100%', maxWidth: 820, padding: '40px 24px' }}>

        {lessonId && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#57ffd8', padding: '5px 14px', border: '1px solid rgba(87,255,216,0.2)', borderRadius: 100, background: 'rgba(87,255,216,0.05)' }}>
              Lesson {lessonId} — {lessonTab}
            </span>
          </div>
        )}

        {!lessonId && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 48, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 2, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 }}>
              {MODES.map(m => (
                <button key={m} onClick={e => { e.stopPropagation(); setMode(m) }} style={{
                  padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                  background: mode === m ? 'rgba(232,255,87,0.1)' : 'transparent',
                  color: mode === m ? '#e8ff57' : '#55556a',
                }}>{m}</button>
              ))}
            </div>
            {mode !== 'zen' && (
              <div style={{ display: 'flex', gap: 2, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 }}>
                {TIMES.map(t => (
                  <button key={t} onClick={e => { e.stopPropagation(); setTime(t) }} style={{
                    padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                    background: time === t ? 'rgba(87,255,216,0.1)' : 'transparent',
                    color: time === t ? '#57ffd8' : '#55556a',
                  }}>{t}s</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats bar */}
        {mode !== 'zen' && (
          <div style={{ display: 'flex', gap: 48, marginBottom: 32, justifyContent: 'center' }}>
            {[
              ...(!lessonId ? [{ val: left, label: 'seconds', color: started && left < 10 ? '#ff6b6b' : '#57ffd8' }] : []),
              ...(settings.showLiveWpm ? [{ val: wpm, label: 'wpm', color: '#e8ff57' }] : []),
              { val: `${acc}%`, label: 'acc', color: acc < 90 ? '#ff6b6b' : '#f0f0f8' },
              { val: errors, label: 'errors', color: errors > 0 ? '#ff6b6b' : '#55556a' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', color: s.color, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Zen live WPM */}
        {mode === 'zen' && started && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 28, color: '#e8ff57' }}>{wpm}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#55556a', marginLeft: 8 }}>wpm</span>
          </div>
        )}

        {/* Progress bar */}
        {mode !== 'zen' && (
          <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#e8ff57', borderRadius: 2, width: `${progress}%`, transition: 'width 0.1s', boxShadow: '0 0 8px rgba(232,255,87,0.4)' }} />
          </div>
        )}

        {/* Typing area */}
        <div
          style={{ position: 'relative', background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '36px 40px', cursor: 'text', minHeight: 160 }}
          onClick={handleAreaClick}
        >
          {isBlurred && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, background: 'rgba(12,12,16,0.6)', backdropFilter: 'blur(4px)', zIndex: 5, cursor: 'text' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#55556a', fontSize: 16 }}>click here and start typing…</p>
            </div>
          )}

          {mode === 'zen' ? (
            <div style={{ position: 'relative' }}>
              {!started && typed.length === 0 && (
                <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', fontFamily: `'${typingFont}', monospace`, fontSize: typingSize, color: '#55556a', lineHeight: 1.9 }}>
                  {ZEN_PLACEHOLDER}
                </div>
              )}
              <div style={{ fontFamily: `'${typingFont}', monospace`, fontSize: typingSize, lineHeight: 1.9, color: '#57ffd8', minHeight: 120, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {typed}
                <span style={{ display: 'inline-block', width: 2, height: '1.1em', background: '#e8ff57', verticalAlign: 'text-bottom', animation: 'blink 1.1s step-end infinite' }} />
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: `'${typingFont}', monospace`, fontSize: typingSize, lineHeight: 1.9, letterSpacing: '0.01em', userSelect: 'none', position: 'relative', zIndex: 1 }}>
              {text.split('').map((ch, i) => {
                let color = '#55556a', bg = 'transparent'
                if (i < typed.length) {
                  color = typed[i] === ch ? '#57ffd8' : '#ff6b6b'
                  if (typed[i] !== ch) bg = 'rgba(255,107,107,0.08)'
                } else if (i === typed.length) {
                  color = '#f0f0f8'
                }
                return (
                  <span key={i} style={{ color, background: bg, borderRadius: 2, position: 'relative' }}>
                    {i === typed.length && (
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        bottom: settings.caretStyle === 'under' ? 0 : 'auto',
                        top: settings.caretStyle === 'under' ? 'auto' : 0,
                        width: settings.caretStyle === 'line' ? 2 : '100%',
                        height: settings.caretStyle === 'under' ? 2 : '100%',
                        background: '#e8ff57',
                        boxShadow: '0 0 8px rgba(232,255,87,0.6)',
                        animation: 'blink 1.1s step-end infinite',
                        opacity: settings.caretStyle === 'block' ? 0.25 : 1,
                      }} />
                    )}
                    {ch}
                  </span>
                )
              })}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={typed}
            onChange={onInput}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'text', zIndex: 10, fontSize: 1 }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoFocus autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button onClick={e => { e.stopPropagation(); reset() }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8', cursor: 'pointer',
          }}>
            ↻ reset <span style={{ fontSize: 11, color: '#55556a', padding: '2px 6px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>tab</span>
          </button>
          {mode === 'zen' && started && (
            <button onClick={handleFinishZen} style={{
              padding: '10px 24px', borderRadius: 10, border: 'none',
              background: '#e8ff57', color: '#0c0c10',
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>Finish →</button>
          )}
        </div>

        {/* Virtual keyboard */}
        {settings.showKbd && mode !== 'zen' && (
          <VirtualKeyboard nextChar={nextChar} />
        )}
      </div>
    </div>
  )
}
