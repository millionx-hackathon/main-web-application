import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { BookOpen, Phone, Calculator, Target, FileText, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Shikkha AI</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Your Learning with{" "}
            <span className="text-blue-600">AI-Powered Education</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Experience personalized learning in Bangla with voice AI assistance, adaptive practice, 
            and intelligent study tools designed for Bangladeshi students.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors flex items-center space-x-2">
                  <span>Start Learning Free</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors flex items-center space-x-2">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Smarter Learning
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to excel in your studies, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Voice AI Call */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Voice AI Call</h3>
              <p className="text-gray-600 mb-4">
                Learn through voice conversations in Bangla. Perfect for rural areas with limited internet. 
                Practice with mock quizzes through natural voice interaction.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Bangla language priority</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Works with slow internet</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Interactive mock quizzes</span>
                </li>
              </ul>
            </div>

            {/* Math Solver */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Calculator className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Math Solver</h3>
              <p className="text-gray-600 mb-4">
                Take a picture of any math problem and get detailed step-by-step solutions with 
                AI-generated explanations and alternative approaches.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Photo-based problem solving</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Step-by-step explanations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Alternative solutions</span>
                </li>
              </ul>
            </div>

            {/* Adaptive Practice */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Adaptive Practice</h3>
              <p className="text-gray-600 mb-4">
                AI-generated practice modules that adapt to your skill level. Choose subject, chapter, 
                and difficulty to get personalized question sets.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Subject & chapter-wise practice</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Easy, medium & hard levels</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">AI-powered suggestions</span>
                </li>
              </ul>
            </div>

            {/* Book Reader */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Interactive Book Reader</h3>
              <p className="text-gray-600 mb-4">
                Read NCTB books and your own PDFs with an AI chatbot. Highlight text to ask questions, 
                get explanations, and generate custom quizzes.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">NCTB books included</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Upload your own PDFs</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">AI chatbot assistance</span>
                </li>
              </ul>
            </div>

            {/* Admin Panel */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Admin Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive dashboard for tracking student progress, analyzing performance, 
                and providing personalized recommendations.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">User tracking & analytics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Performance scoring</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">AI-driven suggestions</span>
                </li>
              </ul>
            </div>

            {/* Placeholder for 6th item */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Learning Path</h3>
              <p className="text-gray-600 mb-4">
                AI creates a personalized learning journey based on your performance, goals, 
                and learning style for optimal results.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Personalized curriculum</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Progress tracking</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Adaptive difficulty</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="bg-blue-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students already using Shikkha AI to achieve their academic goals.
            </p>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold text-lg transition-colors">
                  Get Started for Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-semibold text-lg transition-colors">
                  Go to Dashboard
                </button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>© 2025 Shikkha AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
