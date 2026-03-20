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
