import { formatCoins } from '../../lib/utils'

interface CoinDisplayProps {
  amount: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function CoinDisplay({ amount, size = 'md', className = '' }: CoinDisplayProps) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  }

  return (
    <span className={`inline-flex items-center gap-1 font-bold ${sizes[size]} ${className}`}>
      <span className="text-yellow-400">🪙</span>
      <span className="text-yellow-400">{formatCoins(amount)}</span>
    </span>
  )
}
