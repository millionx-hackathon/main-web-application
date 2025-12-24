import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question } from '@/app/dashboard/practice/_data/physics-questions';
import { PerformanceMetrics, AdaptiveRecommendation } from '@/app/dashboard/practice/_utils/adaptiveLogic';

export interface PracticeSession {
  id: string;
  subject: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  startTime: number;
  endTime?: number;
  questions: Array<{
    questionId: string;
    answer: number | string | boolean;
    isCorrect: boolean;
    timeSpent: number;
    topic: string;
  }>;
  metrics: PerformanceMetrics;
  recommendation?: AdaptiveRecommendation;
  completed: boolean;
}

export interface PracticeState {
  currentSession: PracticeSession | null;
  sessionHistory: PracticeSession[];
  overallStats: {
    totalSessions: number;
    totalQuestions: number;
    totalCorrect: number;
    averageScore: number;
    currentStreak: number;
    longestStreak: number;
    totalTimeSpent: number; // in seconds
    topicMastery: Record<string, {
      correct: number;
      total: number;
      lastPracticed: number;
    }>;
    difficultyStats: {
      easy: { sessions: number; averageScore: number };
      medium: { sessions: number; averageScore: number };
      hard: { sessions: number; averageScore: number };
    };
  };
}

const initialState: PracticeState = {
  currentSession: null,
  sessionHistory: [],
  overallStats: {
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    averageScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTimeSpent: 0,
    topicMastery: {},
    difficultyStats: {
      easy: { sessions: 0, averageScore: 0 },
      medium: { sessions: 0, averageScore: 0 },
      hard: { sessions: 0, averageScore: 0 },
    },
  },
};

const practiceSlice = createSlice({
  name: 'practice',
  initialState,
  reducers: {
    startSession: (
      state,
      action: PayloadAction<{
        subject: string;
        chapter: string;
        difficulty: 'easy' | 'medium' | 'hard';
      }>
    ) => {
      const sessionId = `session-${Date.now()}`;
      state.currentSession = {
        id: sessionId,
        subject: action.payload.subject,
        chapter: action.payload.chapter,
        difficulty: action.payload.difficulty,
        startTime: Date.now(),
        questions: [],
        metrics: {
          totalQuestions: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          topicPerformance: {},
          difficultyPerformance: {
            easy: { correct: 0, total: 0 },
            medium: { correct: 0, total: 0 },
            hard: { correct: 0, total: 0 },
          },
          averageTimePerQuestion: 0,
          currentStreak: 0,
        },
        completed: false,
      };
    },

    answerQuestion: (
      state,
      action: PayloadAction<{
        questionId: string;
        question: Question;
        answer: number | string | boolean;
        isCorrect: boolean;
        timeSpent: number;
      }>
    ) => {
      if (!state.currentSession) return;

      const { questionId, question, answer, isCorrect, timeSpent } = action.payload;

      // Add to session questions
      state.currentSession.questions.push({
        questionId,
        answer,
        isCorrect,
        timeSpent,
        topic: question.topic,
      });

      // Update metrics
      const metrics = state.currentSession.metrics;
      metrics.totalQuestions += 1;

      if (isCorrect) {
        metrics.correctAnswers += 1;
        metrics.currentStreak += 1;
      } else {
        metrics.incorrectAnswers += 1;
        metrics.currentStreak = 0;
      }

      // Update topic performance
      const topic = question.topic;
      if (!metrics.topicPerformance[topic]) {
        metrics.topicPerformance[topic] = { correct: 0, total: 0 };
      }
      metrics.topicPerformance[topic].total += 1;
      if (isCorrect) {
        metrics.topicPerformance[topic].correct += 1;
      }

      // Update difficulty performance
      const diff = question.difficulty;
      metrics.difficultyPerformance[diff].total += 1;
      if (isCorrect) {
        metrics.difficultyPerformance[diff].correct += 1;
      }

      // Update average time
      metrics.averageTimePerQuestion =
        (metrics.averageTimePerQuestion * (metrics.totalQuestions - 1) + timeSpent) /
        metrics.totalQuestions;

      // Update overall stats
      const stats = state.overallStats;
      stats.totalQuestions += 1;
      if (isCorrect) {
        stats.totalCorrect += 1;
      }

      // Update topic mastery
      if (!stats.topicMastery[topic]) {
        stats.topicMastery[topic] = {
          correct: 0,
          total: 0,
          lastPracticed: Date.now(),
        };
      }
      stats.topicMastery[topic].total += 1;
      if (isCorrect) {
        stats.topicMastery[topic].correct += 1;
      }
      stats.topicMastery[topic].lastPracticed = Date.now();

      // Update average score
      stats.averageScore = Math.round(
        (stats.totalCorrect / stats.totalQuestions) * 100
      );
    },

    setRecommendation: (
      state,
      action: PayloadAction<AdaptiveRecommendation>
    ) => {
      if (state.currentSession) {
        state.currentSession.recommendation = action.payload;
      }
    },

    completeSession: (state) => {
      if (!state.currentSession) return;

      const session = state.currentSession;
      session.endTime = Date.now();
      session.completed = true;

      // Update overall stats
      const stats = state.overallStats;
      stats.totalSessions += 1;
      stats.totalTimeSpent +=
        (session.endTime - session.startTime) / 1000;

      // Update streak
      const sessionScore =
        (session.metrics.correctAnswers / session.metrics.totalQuestions) * 100;
      if (sessionScore >= 70) {
        stats.currentStreak += 1;
        if (stats.currentStreak > stats.longestStreak) {
          stats.longestStreak = stats.currentStreak;
        }
      } else {
        stats.currentStreak = 0;
      }

      // Update difficulty stats
      const diffStats = stats.difficultyStats[session.difficulty];
      const sessionScoreForDiff =
        (session.metrics.correctAnswers / session.metrics.totalQuestions) * 100;
      diffStats.sessions += 1;
      diffStats.averageScore = Math.round(
        (diffStats.averageScore * (diffStats.sessions - 1) + sessionScoreForDiff) /
          diffStats.sessions
      );

      // Move to history
      state.sessionHistory.unshift({
        ...session,
      });

      // Keep only last 50 sessions
      if (state.sessionHistory.length > 50) {
        state.sessionHistory = state.sessionHistory.slice(0, 50);
      }

      // Clear current session
      state.currentSession = null;
    },

    restoreSession: (state, action: PayloadAction<PracticeSession>) => {
      state.currentSession = action.payload;
    },

    clearCurrentSession: (state) => {
      state.currentSession = null;
    },
  },
});

export const {
  startSession,
  answerQuestion,
  setRecommendation,
  completeSession,
  restoreSession,
  clearCurrentSession,
} = practiceSlice.actions;

export default practiceSlice.reducer;


