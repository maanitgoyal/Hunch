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
      <span>🪙</span>
      <span className="text-amber-600">{formatCoins(amount)}</span>
    </span>
  )
}
