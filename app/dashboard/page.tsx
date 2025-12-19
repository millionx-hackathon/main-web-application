import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Phone,
  Calculator,
  Target,
  FileText,
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to Shikkha AI
        </h1>
        <p className="text-gray-600">
          Your personalized AI-powered learning dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">24h</h3>
          <p className="text-sm text-gray-600">Study Time This Week</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">156</h3>
          <p className="text-sm text-gray-600">Questions Solved</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
          <p className="text-sm text-gray-600">Achievements Unlocked</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">85%</h3>
          <p className="text-sm text-gray-600">Average Score</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            href="/dashboard/voice-ai"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Phone className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Start Voice AI Session
            </h3>
            <p className="text-sm text-gray-600">
              Practice with voice conversations in Bangla
            </p>
          </a>

          <a
            href="/dashboard/math-solver"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Calculator className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Solve Math Problem
            </h3>
            <p className="text-sm text-gray-600">
              Upload a photo and get instant solutions
            </p>
          </a>

          <a
            href="/dashboard/practice"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Practice Questions
            </h3>
            <p className="text-sm text-gray-600">
              Get AI-generated practice sets
            </p>
          </a>

          <a
            href="/dashboard/book-reader"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Read Books
            </h3>
            <p className="text-sm text-gray-600">
              Access NCTB books with AI assistance
            </p>
          </a>

          <a
            href="/dashboard/mock-quiz"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Take Mock Quiz
            </h3>
            <p className="text-sm text-gray-600">
              Test your knowledge with timed quizzes
            </p>
          </a>

          <a
            href="/dashboard/analytics"
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all group"
          >
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              View Analytics
            </h3>
            <p className="text-sm text-gray-600">
              Track your progress and performance
            </p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Solved 5 math problems in Algebra
              </p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Completed practice set in Physics
              </p>
              <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Read Chapter 3 in Biology textbook
              </p>
              <p className="text-xs text-gray-500 mt-1">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
