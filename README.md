# Hunch

> A social sports prediction platform built for university residential college students.
> Predict game outcomes, compete on leaderboards, and play minigames - all with virtual coins, no real money.

Built with **React 19**, **Supabase**, and **Tailwind CSS v4**.

## Features

### Betting
- Dynamic fixed odds that shift as bets come in - lock in your odds at bet time
- Multiple market types: match winner (incl. draw), margin range, over/under
- Re-bet on the same market at updated odds - your new odds are locked in separately
- Automatic coin deduction and payout via atomic PostgreSQL functions with no double-spend risk

### Social
- Friend system with search, send, accept, and decline requests
- Private friend lobbies for a single game or the whole season
- Real-time lobby chat powered by Supabase Realtime
- Shareable invite codes to bring friends into a lobby

### Leaderboard
- Overall leaderboard ranked by coins
- College leaderboard ranked by average win rate (population-neutral, not raw totals)
- Win streak fire badge for players on 3+ consecutive wins
- Your personal rank and your college's rank highlighted on every tab

### Minigames
- **Coin Flip** - 50/50 shot, 1.9x payout
- **Number Guess** - pick any 2-digit number, win 15x if the secret lands within +-2
- **Season Draft** - pick 3 colleges, earn passive bonus coins every time they win

### Profile
- Custom emoji avatars chosen from a themed picker
- Season stats: total wagered, net P&L, best single win, worst loss, win streak
- Prediction poll on each game (free, no coins) with live community breakdown
- Head-to-head rivalry record shown on every game page

### Platform
- Interactive first-time onboarding tutorial with a live fake bet simulation
- 100 coins awarded to every user every Monday via pg_cron
- Bailout button for users who hit 0 coins
- Admin panel to create games, manage markets, and enter final scores
- Installable as a PWA on iOS and Android
- Inactivity auto-logout for security

---

## Admin Guide

The admin panel is accessible at `/admin` and is only visible in the nav for users with `is_admin = true` in the `users` table. Set this directly in Supabase.

### 1. Create a Game

1. Go to **Admin > Games tab**
2. Fill in: Home College, Away College, Sport, Game Type, and Date & Time
3. Click **+ Create Game**. The game appears in the list below with status `upcoming`

### 2. Add Bet Markets to a Game

Markets are the individual things users can bet on (e.g. "Who will win?").

1. Click any game in the list to select it
2. Click **Manage Markets**
3. Choose a template from the quick-select buttons:
   - **winner**: home / draw / away, default 1.9x / 3.2x / 1.9x odds
   - **margin_range**: 1-2 / 3-5 / 6+ goals
   - **total_points_over_under**: over / under 2.5
   - **first_to_score**: home first / away first
4. Edit the description and options JSON if needed (each option needs `key`, `label`, `odds`)
5. Set **Locks at** (when the market closes to new bets, usually game start time)
6. Click **+ Add Market**

Markets open immediately after creation. Users can bet until the `locks_at` time passes.

### 3. Close Bets (Lock a Market)

Bets lock automatically when the `locks_at` timestamp is reached. You can also lock markets manually:

- Go to **Enter Scores & Resolve** for the game
- The resolve step locks all open markets before settling, so no action is needed beforehand
- If you need to lock early (e.g. game starts ahead of schedule), update `locks_at` directly in Supabase or call the resolve step early

### 4. Resolve a Game and Settle Bets

1. Select the game -> **Enter Scores & Resolve**
2. Enter the final score for home and away
3. Click **Resolve & Settle Bets**

This calls the `resolve_game` Postgres function which:
- Sets game `status` to `completed` and records the winner
- Locks any remaining open markets
- Determines the correct option per market based on the score
- Pays out winning bets at their locked-in odds
- Marks losing bets as `lost`

The response shows how many bets were resolved.

### 5. Cancel a Game

If a game is cancelled or postponed, use **Cancel game & refund all bets** on the score entry screen. This calls `cancel_game` which refunds all stakes to every bettor.

### Market Option Format (JSON)

```json
[
  { "key": "home", "label": "St Paul's to win", "odds": 1.9 },
  { "key": "draw", "label": "Draw",              "odds": 3.2 },
  { "key": "away", "label": "Wesley to win",     "odds": 1.9 }
]
```

For over/under markets, add `"line": 2.5` to each option. The `key` field is what gets matched against `correct_option_key` when resolving.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Scheduled Jobs | pg_cron (weekly coin distribution) |
| Hosting | Vercel |

---

## Getting Started

```bash
git clone https://github.com/your-username/hunch.git
cd hunch
npm install
npm run dev
```

Add a `.env.local` file with your Supabase project credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Project Structure

```
src/
├── components/
│   ├── admin/          # AdminPanel, GameManager, MarketManager, ScoreEntry
│   ├── auth/           # LoginScreen, AuthSplash, SignupScreen
│   ├── bets/           # MyBets
│   ├── friends/        # FriendsPage, AddFriendButton
│   ├── game/           # GameDetail, MarketCard, BetSlip
│   ├── home/           # HomeScreen, GamesScreen, GameCard, UserInfoCard, LandingPage
│   ├── leaderboard/    # Leaderboard
│   ├── lobbies/        # LobbiesPage, LobbyChat
│   ├── minigames/      # MinigamesPage (CoinFlip, NumberGuess, DraftPick)
│   ├── profile/        # ProfilePage
│   └── shared/         # TopNav, BottomNav, HunchLogo, Avatar, TutorialModal
├── context/            # AuthContext, TutorialContext
├── hooks/              # useUser, useGames, useBets, useCountdown
└── lib/                # supabase, auth, betting, lobbies, friends, messages, minigames, utils
```
