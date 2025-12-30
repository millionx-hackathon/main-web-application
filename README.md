# Shikkha AI 📚🎓

An AI-powered learning platform designed specifically for Bangladeshi students, featuring personalized education tools, voice AI assistance, and comprehensive study resources—all optimized for Bangla language support.

![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

## 🌟 Features

### 🎯 Core Learning Tools

- **🎤 Voice AI Call** - Learn through natural voice conversations in Bangla. Perfect for students in rural areas with limited internet connectivity. Practice with interactive mock quizzes through voice interaction.

- **🎧 Shikkha Bhai (Audio Tutor)** - An AI-powered audio tutoring system that:
  - Converts textbook content into engaging, easy-to-understand audio explanations
  - Uses the **"Shikkha Bhai"** persona - a friendly "Big Brother" mentor
  - Features high-quality Bengali neural voice (Microsoft Edge TTS)
  - Provides word-by-word highlighting synchronized with audio playback
  - Integrates directly with the Book Reader for seamless learning

- **🧮 Smart Math Solver** - Upload photos of math problems and receive detailed step-by-step solutions with AI-generated explanations and alternative solving methods. Includes:
  - Concept explanations with visual learning aids
  - Related concept pages (Quadratic Formula, Parabolas, Factorization)
  - Multiple solving methods side-by-side

- **📝 Adaptive Practice** - AI-generated practice modules that adapt to your skill level. Choose from various subjects, chapters, and difficulty levels (Easy, Medium, Hard) for personalized question sets.

- **📖 Interactive Book Reader** - Read NCTB (National Curriculum and Textbook Board) books and upload your own PDFs. Features include:
  - AI chatbot assistance for questions and explanations (powered by Gemini)
  - Text highlighting and selection for instant queries
  - Custom quiz generation from reading material
  - Flashcard creation
  - Smart page summaries
  - Progress insights and reading analytics
  - **One-click audio tutoring** - Select text and get an audio explanation from Shikkha Bhai

- **📊 Mock Quiz System** - Comprehensive quiz and test preparation with performance tracking and analytics.

- **📈 Progress Tracking** - Detailed analytics dashboard showing:
  - Study time tracking
  - Practice completion statistics
  - Achievement badges
  - Average scores
  - Recent activity timeline
  - Upcoming tasks and deadlines

### 🎓 Additional Features

- **Personalized Onboarding** - Multi-step onboarding process including:
  - Class selection (9-12)
  - Group selection (Science/Arts/Commerce)
  - Initial assessment quiz
  - AI-powered learning recommendations

- **Study Plan & Routines** - AI-generated personalized study schedules based on performance and goals.

- **Resource Library** - Access to educational resources and materials.

- **Search Functionality** - Quick search across topics and content.

- **Profile Management** - User profile and settings customization.

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.0** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library

### Backend & Services
- **Clerk** - Authentication and user management
- **MongoDB** - Database for user data and progress tracking
- **Redux Toolkit** - State management
- **Redux Persist** - Persistent state storage

### AI & TTS
- **Gemini API** - AI-powered responses and explanations
- **GLM API (ZhipuAI)** - Script generation for Shikkha Bhai
- **Edge TTS Universal** - High-quality Bengali neural voice synthesis
- **Google TTS** - Fallback text-to-speech service

### Libraries & Tools
- **PDF.js** - PDF rendering and viewing
- **React PDF** - React components for PDF display
- **Noto Sans Bengali** - Bengali/Bangla font support
- **Geist Font** - Modern typography

## 📁 Project Structure

```
shikkha-ai/
├── app/
│   ├── api/
│   │   ├── audio-tutor/     # Shikkha Bhai TTS API
│   │   ├── audio-script/    # Script generation API
│   │   ├── math-solver/     # Math problem solver API
│   │   └── reader-ai/       # Book reader AI chat API
│   ├── dashboard/
│   │   ├── analytics/       # Analytics and reports
│   │   ├── audio-tutor/     # Shikkha Bhai audio tutor page
│   │   ├── book-reader/     # PDF reader with AI features
│   │   ├── math-solver/     # Math problem solver
│   │   ├── practice/        # Adaptive practice modules
│   │   ├── voice-ai/        # Voice AI call interface
│   │   ├── progress/        # Progress tracking
│   │   └── ...
│   ├── onboarding/          # User onboarding flow
│   └── page.tsx             # Landing page
├── components/              # Reusable components
├── lib/                     # Utilities and configurations
│   ├── mongodb.ts           # MongoDB connection
│   └── store/               # Redux store configuration
└── public/                  # Static assets
    └── Class9-10Phy/        # Sample PDF books
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- MongoDB database (local or cloud)
- Clerk account for authentication
- API keys for AI services

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/shikkha-ai

# Google Gemini API (for AI chat and explanations)
GEMINI_KEY=your_gemini_api_key

# ZhipuAI GLM API (for Shikkha Bhai script generation)
GLM_KEY=your_glm_api_key
```

### API Keys Setup

| Service | Purpose | Get Key |
|---------|---------|---------|
| **Clerk** | User authentication | [clerk.com](https://clerk.com) |
| **Google Gemini** | AI responses, book reader chat | [ai.google.dev](https://ai.google.dev) |
| **ZhipuAI GLM** | Shikkha Bhai script generation | [open.bigmodel.cn](https://open.bigmodel.cn) |

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shikkha-ai
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Building for Production

```bash
pnpm build
pnpm start
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## 🌐 Language Support

Shikkha AI is optimized for **Bangla (Bengali)** language:
- Full Bangla UI support
- Bangla font rendering (Noto Sans Bengali)
- Voice AI conversations in Bangla
- Bangla content and explanations
- High-quality Bengali TTS (PradeepNeural voice)

## 🎯 Target Audience

- Bangladeshi students (Class 9-12)
- Students preparing for board exams (SSC/HSC)
- Learners in rural areas with limited internet
- Students seeking personalized learning paths

## 🔐 Authentication

The application uses Clerk for authentication. Users can:
- Sign up with email
- Sign in securely
- Access protected dashboard routes
- Manage their profiles

## 📊 State Management

Redux Toolkit is used for global state management with:
- Book reader state (reading progress, bookmarks)
- Practice state (scores, progress)
- Persistent storage via Redux Persist

## 📚 Key Modules

### Shikkha Bhai (Audio Tutor)
- AI-generated educational scripts in Bangla
- High-quality neural TTS with Edge TTS Universal
- Word-level synchronization for follow-along reading
- Fallback to Google TTS for reliability
- Seamless integration with Book Reader

### Book Reader
- PDF viewing with PDF.js
- Resizable panels for reading and chat
- Text selection and popup queries
- Streaming AI responses (Gemini)
- Quiz and flashcard generation
- One-click audio tutoring

### Math Solver
- Image upload and AI analysis
- Multiple solving methods
- Step-by-step explanations
- Concept learning pages

### Practice System
- Subject-wise practice (Physics, Chemistry, etc.)
- Chapter-based questions
- Adaptive difficulty adjustment
- Performance tracking

## 🤝 Contributing

This is a hackathon project. Contributions and feedback are welcome!

## 📄 License

Private project - All rights reserved.

## 🙏 Acknowledgments

Built for the Bangladeshi education system with a focus on accessibility and AI-powered learning.

---

**Made with ❤️ for Bangladeshi students**
