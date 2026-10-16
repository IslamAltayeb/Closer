# Closer ❤️

**Different places, same desire.**

Closer is a private two-player card game designed for couples in long-distance relationships. It helps partners connect, communicate, have fun, and create meaningful moments together, no matter how far apart they are.

## ✨ Features

- **Multiple Card Categories:** Explore different decks, including Deep Knowledge, Dreams & Plans, Romantic & Emotional, Intimate, Sexual, Dares, Strip Quiz, and Pose Cards.
- **Five Difficulty Levels:** Choose the level that fits your mood and comfort.
- **Interactive Cards:** Reveal cards, navigate between prompts, and discover new challenges.
- **Pose Cards with Images:** Visual prompts designed for couples to recreate individually on their own cameras.
- **Random Card Mode:** Let the game choose a surprise card for you.
- **Shared Rooms:** Join a room using a shared room code.
- **Real-Time Synchronization:** Uses Supabase Realtime to help synchronize game activity between players.
- **Responsive Design:** Designed to work on desktop, laptop, tablet, and mobile screens.
- **Elegant UI:** A romantic dark theme featuring burgundy, black, and gold.
- **Privacy and Consent:** Participation is optional, and either player can skip a card or choose another.

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Build Tool:** Vite
- **Styling:** CSS
- **Backend Services:** Supabase
- **Real-Time Communication:** Supabase Realtime
- **Version Control:** Git and GitHub

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. Navigate to the project directory:

   ```bash
   cd closer-app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and configure your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL shown in your terminal.

## 🔑 Supabase Configuration

Closer uses Supabase for room-based real-time communication.

To configure the project:

1. Create a project in Supabase.
2. Copy your Project URL.
3. Copy your publishable key or legacy anon key.
4. Add both values to your local `.env` file.

**Security note:** Never put your Supabase service-role key or secret key in frontend code or commit it to GitHub. Configure appropriate database policies if you add database-backed features.

## 📁 Project Structure

```text
closer-app/
├── public/
├── src/
│   ├── data/
│   │   └── cards.js
│   ├── lib/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── vite.config.js
```

## 🌐 Deployment

Closer can be deployed to a static hosting platform such as Vercel.

After deployment, configure the required Supabase environment variables in the hosting platform and redeploy the application. Share the public application URL with your partner to access it from another device.

## 🎮 How to Play

1. Open Closer.
2. Create or join a shared room using the room code.
3. Choose a card category.
4. Select a difficulty level.
5. Reveal a card and follow its prompt.
6. Use the navigation controls to move to the next or previous card.
7. Skip any prompt that either partner is uncomfortable with.

For the best experience, both players should open the same deployed application and use the same room code.

## 🔮 Future Improvements

- Enhanced real-time game-state synchronization.
- Persistent game progress.
- Improved room management and privacy.
- More unique card prompts and visual assets.
- Additional customization options.

## ❤️ Project Goal

Closer was created to make long-distance relationships feel a little closer through meaningful questions, playful challenges, and shared experiences.

**Made for two, wherever you are.**
