// ─── Shared domain types ────────────────────────────────────

export interface College {
  id: string
  name: string
  abbreviation: string
  logo_url?: string | null
  primary_color?: string | null
  secondary_color?: string | null
}

export interface MarketOption {
  key: string
  label: string
  odds?: number
  line?: number
}

export interface BetMarket {
  id: string
  game_id: string
  market_type: string
  description: string
  options: MarketOption[]
  correct_option_key?: string | null
  status: 'open' | 'locked' | 'resolved'
  option_stakes?: Record<string, number>
  locks_at?: string | null
}

export interface Game {
  id: string
  sport: string
  status: 'upcoming' | 'live' | 'completed' | 'cancelled'
  scheduled_at: string
  home_college_id: string
  away_college_id: string
  winning_college_id?: string | null
  home_score?: number | null
  away_score?: number | null
  game_type?: string | null
  home_college?: College | null
  away_college?: College | null
  winning_college?: College | null
  bet_markets?: BetMarket[]
}

export interface Bet {
  id: string
  user_id: string
  market_id: string
  game_id: string
  selected_option_key: string
  stake: number
  payout?: number | null
  potential_payout?: number | null
  status: 'pending' | 'won' | 'lost' | 'refunded'
  created_at: string
  bet_markets?: BetMarket | null
  games?: Game | null
}

export interface Profile {
  id: string
  display_name: string
  college_id?: string | null
  colleges?: College | null
  coins: number
  is_admin?: boolean
  avatar_emoji?: string | null
  created_at?: string
}

export interface LobbyMember {
  user_id: string
  users: Profile & { colleges?: College | null }
}

export interface Lobby {
  id: string
  name: string
  invite_code: string
  created_by: string
  game_id?: string | null
  created_at: string
  games?: Pick<Game, 'id' | 'status' | 'sport' | 'home_college' | 'away_college'> | null
  lobby_members?: LobbyMember[]
}

export interface Message {
  id: string
  lobby_id: string
  user_id: string
  content: string
  created_at: string
  users?: {
    display_name: string
    colleges?: Pick<College, 'primary_color' | 'abbreviation'> | null
  } | null
}

export interface Friendship {
  id: string
  sender_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  sender?: Profile | null
  receiver?: Profile | null
}

export type FriendUser = Profile & {
  friendshipId: string
  colleges?: College | null
}
