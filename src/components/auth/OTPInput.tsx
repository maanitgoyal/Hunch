import { useRef, useState } from 'react'

interface OTPInputProps {
  length?: number
  onComplete: (code: string) => void
  disabled?: boolean
}

export default function OTPInput({ length = 6, onComplete, disabled = false }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  function handleChange(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '')
    if (!val) return
    const char = val[val.length - 1]
    const next = [...values]
    next[idx] = char
    setValues(next)
    if (idx < length - 1) inputs.current[idx + 1]?.focus()
    const code = next.join('')
    if (code.length === length) onComplete(code)
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      const next = [...values]
      if (next[idx]) {
        next[idx] = ''
        setValues(next)
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus()
        next[idx - 1] = ''
        setValues(next)
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!text) return
    const next = Array(length).fill('')
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setValues(next)
    inputs.current[Math.min(text.length, length - 1)]?.focus()
    if (text.length === length) onComplete(text)
  }

  return (
    <div className="flex gap-2.5 justify-center">
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={(el) => { inputs.current[idx] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          disabled={disabled}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="
            w-11 h-14 text-center text-xl font-bold rounded-xl
            bg-white/8 border-2 border-white/15 text-white
            focus:border-yellow-400 focus:outline-none focus:bg-white/12
            disabled:opacity-40
            transition-all duration-200
          "
        />
      ))}
    </div>
  )
}
