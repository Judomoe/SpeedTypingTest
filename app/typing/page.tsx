'use client'
import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { saveTestResult } from '@/lib/auth-client'

// ── Lesson texts ──────────────────────────────────────────────────────────────
const LESSON_TEXTS: Record<string, string> = {
  'basic-1':  'fj fj dk dk fd jk fj dk fd jk dfkj jkfd fdjk kjdf fjdk dkfj jfkd kdfj fjdk dkjf kfjd jdkf dfkj fjkd',
  'basic-2':  'fg jh fgh jhg gfj hjf fghj jhgf fhgj gjhf hfjg fjhg ghjf jhfg ghfj hjfg fghj jfgh hgfj gfhj jghf',
  'basic-3':  'sal las alls fall lass slab fad fads dad adds lads salsa flask falls slabs falls jabs labs labs flasks',
  'basic-4':  'die side like life idea ride diet file lies idle fled edit tile site line mile ride hide tide file',
  'basic-5':  'slide filed ideas fades liked kills deals leads asked faked jails sales fails alike slide field ideal sides filed',
  'basic-6':  'Ask Sale Faded Files Ideas Slide Fades Deals Liked Kills Deals Leads Asked Filed Jake Sake Dial Aisle',
  'basic-7':  'rule fury rude urge blur four pure sure lure dour urge rule true blur guru lure pure sure ruse fuel',
  'basic-8':  'the quick brown fox jumps over a lazy dog every good job requires vital key experience with simple tricks',
  'basic-9':  'the and for you are not that have with this from they will be at but we by its he on are or as at',
  'basic-10': 'the and for you are not that have with this from they will be at but we by its he on are one which had',
  'prog-1':   '() [] {} (()) [[]] {{}} ([]){} {[()]} ()[]{} ([{}]) {()}[] ()[]{} ()[] {}{} []() (){}',
  'prog-2':   '= + - * / == != <= >= && || ++ -- += -= *= /= % ** >>> & | ^ ~ << >> >>> %= **= &&= ||= ??=',
  'prog-3':   '@ # $ % ^ & * ! ~ \' " \\ | < > ? / : ; , . @email #tag $var %format ^xor &ref *ptr !flag ~bit',
  'prog-4':   'const fetch = async (url) => { const res = await fetch(url); return res.json(); }; export default fetch;',
  'prog-5':   'def greet(name="world"): print(f"Hello, {name}!") return len(name) if __name__ == "__main__": greet()',
  'num-1':    '1 2 3 4 5 6 7 8 9 0 12 34 56 78 90 123 456 789 1234 5678 9012 12345 67890',
  'num-2':    '3.14 2.71 1.41 0.99 42.0 100.5 3.14159 2.71828 1.41421 0.99999 1000.00 3.14',
  'num-3':    '10% 25% 50% 75% 100% $9.99 $19.99 $99.00 $100.00 €50 £30 ¥1000 #42 @speed +100 -50',
}

const WORD_TEXTS = [
  "the quick brown fox jumps over the lazy dog and then runs away into the misty forest where ancient trees stand tall and silent",
  "programming is the art of telling another human what one wants the computer to do in the most elegant and efficient way possible",
  "every great developer got there by solving problems they were unqualified to solve until they actually did it and learned something new",
  "in the beginning was the command line and from it came order structure beauty and the infinite possibility of creation through pure thought",
  "the only way to learn a new programming language is by writing programs in it and the best programs solve real world problems",
  "practice does not make perfect only perfect practice makes perfect so slow down think about accuracy before you chase raw speed",
  "consistency beats intensity every time ten minutes of focused practice each day will improve your typing far more than one long session",
  "touch typing is the skill of typing without looking at the keyboard using muscle memory to find each key by feel alone",
  "the home row keys are your anchor always return your fingers to asdf and jkl semicolon after reaching for other keys",
  "accuracy matters more than speed in the long run because fast but inaccurate typing produces more errors than careful steady typing",
]

const QUOTE_TEXTS = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "In the middle of every difficulty lies opportunity. The measure of intelligence is the ability to change.",
  "It does not matter how slowly you go as long as you do not stop. Choose a job you love and you will never work a day.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The secret of getting ahead is getting started. The real test is not whether you avoid this failure because you won't.",
  "Whether you think you can or you think you can't, you are right. Believe you can and you're halfway there.",
  "Life is what happens when you're busy making other plans. The future belongs to those who believe in the beauty of their dreams.",
]

const CODE_TEXTS = [
  "function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }",
  "const quickSort = arr => arr.length <= 1 ? arr : [...quickSort(arr.slice(1).filter(x => x <= arr[0])), arr[0], ...quickSort(arr.slice(1).filter(x => x > arr[0]))];",
  "async function fetchData(url) { try { const res = await fetch(url); if (!res.ok) throw new Error(res.status); return await res.json(); } catch (e) { console.error(e); } }",
  "class EventEmitter { constructor() { this.events = {}; } on(e, fn) { (this.events[e] = this.events[e] || []).push(fn); } emit(e, ...a) { (this.events[e] || []).forEach(fn => fn(...a)); } }",
]

const ZEN_TEXTS = [
  "breathe in breathe out let your fingers flow across the keys like water over smooth stones there is no rush here only the rhythm of thought becoming words on the screen",
  "typing is meditation when done with full attention each keystroke intentional each word a small act of creation the screen fills with the quiet voice of your focused mind",
]

const MODES = ['words', 'quotes', 'code', 'zen']
const TIMES = [15, 30, 60, 120]

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

function getTextForMode(mode: string): string {
  switch (mode) {
    case 'quotes': return rand(QUOTE_TEXTS)
    case 'code': return rand(CODE_TEXTS)
    case 'zen': return rand(ZEN_TEXTS)
    default: return rand(WORD_TEXTS)
  }
}

function TypingInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = searchParams.get('lesson')
  const lessonTab = searchParams.get('tab')

  const [mode, setMode] = useState('words')
  const [time, setTime] = useState(30)
  const [text, setText] = useState(() => rand(WORD_TEXTS))
  const [typed, setTyped] = useState('')
  const [focused, setFocused] = useState(false)
  const [started, setStarted] = useState(false)
  const [done, setDone] = useState(false)
  const [left, setLeft] = useState(30)
  const [wpm, setWpm] = useState(0)
  const [acc, setAcc] = useState(100)
  const [errors, setErrors] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Per-second tracking refs
  const textRef = useRef(text)
  const typedRef = useRef('')
  const wpmPerSecRef = useRef<number[]>([])
  const rawPerSecRef = useRef<number[]>([])
  const errAtSecRef = useRef<number[]>([])
  const prevTypedLenRef = useRef(0)
  const elapsedRef = useRef(0)

  useEffect(() => { textRef.current = text }, [text])

  // Apply lesson text if lesson param present
  useEffect(() => {
    if (!lessonId || !lessonTab) return
    const tabKey = lessonTab.startsWith('prog') ? 'prog' : lessonTab.startsWith('num') ? 'num' : 'basic'
    const key = `${tabKey}-${lessonId}`
    if (LESSON_TEXTS[key]) setText(LESSON_TEXTS[key])
  }, [lessonId, lessonTab])

  const reset = useCallback(() => {
    const newText = lessonId && lessonTab
      ? (LESSON_TEXTS[`${lessonTab.startsWith('prog') ? 'prog' : lessonTab.startsWith('num') ? 'num' : 'basic'}-${lessonId}`] || getTextForMode(mode))
      : getTextForMode(mode)
    setTyped('')
    setFocused(false)
    setStarted(false)
    setDone(false)
    setLeft(time)
    setWpm(0)
    setAcc(100)
    setErrors(0)
    setText(newText)
    wpmPerSecRef.current = []
    rawPerSecRef.current = []
    errAtSecRef.current = []
    prevTypedLenRef.current = 0
    elapsedRef.current = 0
    typedRef.current = ''
    if (timerRef.current) clearInterval(timerRef.current)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [time, mode, lessonId, lessonTab])

  // triggers a clean reset WITH the new text when changing categories.
  useEffect(() => { reset() }, [time, mode, reset])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') { e.preventDefault(); reset() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [reset])

  // Timer with per-second data recording
  useEffect(() => {
    if (started && !done) {
      timerRef.current = setInterval(() => {
        const currentTyped = typedRef.current
        const currentText = textRef.current

        const charsThisSec = Math.max(0, currentTyped.length - prevTypedLenRef.current)
        
        let correctThisSec = 0
        for (let i = prevTypedLenRef.current; i < Math.min(currentTyped.length, currentText.length); i++) {
          if (currentTyped[i] === currentText[i]) correctThisSec++
        }
        let totalErrors = 0
        for (let i = 0; i < Math.min(currentTyped.length, currentText.length); i++) {
          if (currentTyped[i] !== currentText[i]) totalErrors++
        }

        wpmPerSecRef.current.push(Math.round((correctThisSec / 5) * 60))
        rawPerSecRef.current.push(Math.round((charsThisSec / 5) * 60))
        errAtSecRef.current.push(totalErrors)
        prevTypedLenRef.current = currentTyped.length
        elapsedRef.current++

        setLeft(l => {
          if (!lessonId && l <= 1) {
            clearInterval(timerRef.current!)
            setDone(true)
            return 0
          }
          return l - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started, done, lessonId])

  // Live WPM/acc/errors update
  useEffect(() => {
    if (!started || typed.length === 0) return
    const elapsed = Math.max(1, elapsedRef.current)
    let correct = 0, errs = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === text[i]) correct++
      else errs++
    }
    setWpm(Math.round((correct / 5) / (elapsed / 60)))
    setErrors(errs)
    setAcc(Math.round((correct / Math.max(1, typed.length)) * 100))
  }, [typed, left, started, text])

  // Navigate to results when done
  useEffect(() => {
    if (!done || !started) return

    const finalTyped = typedRef.current
    const finalText = textRef.current
    const elapsed = Math.max(1, elapsedRef.current)

    let correct = 0, incorrect = 0, missed = 0
    for (let i = 0; i < finalText.length; i++) {
      if (i < finalTyped.length) {
        if (finalTyped[i] === finalText[i]) correct++
        else incorrect++
      } else {
        missed++
      }
    }
    const extra = Math.max(0, finalTyped.length - finalText.length)
    const finalWpm = Math.round((correct / 5) / (elapsed / 60))
    const finalAcc = finalTyped.length > 0 ? Math.round((correct / finalTyped.length) * 100) : 100
    const rawWpm = Math.round((finalTyped.length / 5) / (elapsed / 60))

    const wpmArr = wpmPerSecRef.current.filter(v => v >= 0)
    const avg = wpmArr.length > 0 ? wpmArr.reduce((a, b) => a + b, 0) / wpmArr.length : 0
    const variance = wpmArr.length > 1
      ? wpmArr.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / wpmArr.length
      : 0
    const consistency = avg > 0 ? Math.round(Math.max(0, 100 - (Math.sqrt(variance) / avg) * 100)) : 100

    const result = {
      wpm: finalWpm, rawWpm, acc: finalAcc, consistency,
      errors: incorrect, correct, incorrect: incorrect, extra, missed,
      dur: elapsed, mode,
      wpmData: wpmPerSecRef.current,
      rawData: rawPerSecRef.current,
      errData: errAtSecRef.current,
    }

    try { sessionStorage.setItem('tc_result', JSON.stringify(result)) } catch { /* ignore */ }
    saveTestResult(result)
    router.push('/results')
  }, [done, started, mode, router])

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (done) return
    const val = e.target.value
    
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

  const progress = (typed.length / text.length) * 100

  return (
    <div
      style={{ minHeight: '100vh', paddingTop: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div style={{ width: '100%', maxWidth: 820, padding: '40px 24px' }}>

        {/* Lesson banner */}
        {lessonId && (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#57ffd8', padding: '5px 14px', border: '1px solid rgba(87,255,216,0.2)', borderRadius: 100, background: 'rgba(87,255,216,0.05)' }}>
              Lesson {lessonId} — {lessonTab}
            </span>
          </div>
        )}

        {/* Mode + Time selectors */}
        {!lessonId && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 48 }}>
            <div style={{ display: 'flex', gap: 2, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 }}>
              {MODES.map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                  background: mode === m ? 'rgba(232,255,87,0.1)' : 'transparent',
                  color: mode === m ? '#e8ff57' : '#55556a', transition: 'all 0.15s',
                }}>{m}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 2, background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 }}>
              {TIMES.map(t => (
                <button key={t} onClick={() => setTime(t)} style={{
                  padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
                  background: time === t ? 'rgba(87,255,216,0.1)' : 'transparent',
                  color: time === t ? '#57ffd8' : '#55556a', transition: 'all 0.15s',
                }}>{t}s</button>
              ))}
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 48, marginBottom: 32, justifyContent: 'center' }}>
          {[
            ...(!lessonId ? [{ val: left, label: 'seconds', color: started && left < 10 ? '#ff6b6b' : '#57ffd8' }] : []),
            { val: wpm, label: 'wpm', color: '#e8ff57' },
            { val: `${acc}%`, label: 'acc', color: acc < 90 ? '#ff6b6b' : '#f0f0f8' },
            { val: errors, label: 'errors', color: errors > 0 ? '#ff6b6b' : '#55556a' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 40, letterSpacing: '-0.02em', color: s.color, lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#55556a', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 28, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#e8ff57', borderRadius: 2, width: `${progress}%`, transition: 'width 0.1s', boxShadow: '0 0 8px rgba(232,255,87,0.4)' }} />
        </div>

        {/* Typing area */}
        <div
          style={{ position: 'relative', background: '#131318', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '36px 40px', cursor: 'text', minHeight: 160 }}
          onClick={() => inputRef.current?.focus()}
        >
          {!started && !focused && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 16, background: 'rgba(12,12,16,0.5)', backdropFilter: 'blur(4px)', zIndex: 5,
              cursor: 'text',
            }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', color: '#55556a', fontSize: 16 }}>click here and start typing…</p>
            </div>
          )}

          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, lineHeight: 1.9, letterSpacing: '0.01em', userSelect: 'none', position: 'relative', zIndex: 1 }}>
            {text.split('').map((ch, i) => {
              let color = '#55556a'
              let bg = 'transparent'
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
                      position: 'absolute', left: 0, top: 0, width: 2, height: '100%',
                      background: '#e8ff57', boxShadow: '0 0 8px rgba(232,255,87,0.6)',
                      animation: 'blink 1.1s step-end infinite',
                    }} />
                  )}
                  {ch}
                </span>
              )
            })}
          </div>

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

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
          <button onClick={() => reset()} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#9090a8', cursor: 'pointer',
          }}>
            ↻ reset <span style={{ fontSize: 11, color: '#55556a', padding: '2px 6px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 }}>tab</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TypingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#55556a' }}>loading…</div>
      </div>
    }>
      <TypingInner />
    </Suspense>
  )
}