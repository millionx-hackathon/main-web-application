'use client';
import { useState, useEffect } from 'react';
import { FileText, RefreshCw, Calendar, MessageSquare, Hash, Settings, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Summary {
    id: number;
    callerNumber: string;
    summary: string;
    topicsDiscussed: string;
    createdAt: string;
}

export default function SummariesPage() {
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [baseUrl, setBaseUrl] = useState('http://localhost:8080');
    const [showSettings, setShowSettings] = useState(false);

    const fetchSummaries = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${baseUrl}/api/summaries`);

            if (!res.ok) {
                throw new Error(`Failed to fetch: ${res.statusText}`);
            }

            const data = await res.json();
            setSummaries(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'Failed to load summaries');
            setSummaries([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSummaries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseUrl]);

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center space-y-3 mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl shadow-purple-200 mb-4">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Conversation Summaries</h1>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        View all past conversation summaries and topics discussed
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-center gap-3 flex-wrap">
                    <Link
                        href="/dashboard/voice-agent"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-all shadow-sm"
                    >
                        🎤 Voice Call
                    </Link>
                    <Link
                        href="/dashboard/voice-agent/upload"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all shadow-sm"
                    >
                        📄 Upload
                    </Link>
                    <Link
                        href="/dashboard/voice-agent/summaries"
                        className="flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-200 rounded-xl text-purple-700 font-medium shadow-sm"
                    >
                        📋 Summaries (Current)
                    </Link>
                </div>

                {/* Settings Panel */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Settings className="w-5 h-5 text-gray-500" />
                            <span className="font-medium text-gray-700">Configuration</span>
                        </div>
                        <span className="text-sm text-gray-500">{showSettings ? '▲' : '▼'}</span>
                    </button>

                    {showSettings && (
                        <div className="p-4 pt-0 border-t border-gray-100">
                            <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-2 block">Backend Base URL</span>
                                <input
                                    type="text"
                                    value={baseUrl}
                                    onChange={(e) => setBaseUrl(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none font-mono text-sm"
                                    placeholder="http://localhost:8080"
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Refresh Button */}
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {summaries.length > 0 && `${summaries.length} conversation${summaries.length > 1 ? 's' : ''}`}
                    </div>
                    <button
                        onClick={fetchSummaries}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-700 font-medium">Failed to load summaries</p>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-12 text-center">
                        <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Loading summaries...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && summaries.length === 0 && (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageSquare className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Summaries Yet</h2>
                        <p className="text-gray-600 mb-6">
                            Start a voice conversation to generate your first summary
                        </p>
                        <Link
                            href="/dashboard/voice-agent"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                        >
                            Start Voice Call
                        </Link>
                    </div>
                )}

                {/* Summaries List */}
                {!loading && !error && summaries.length > 0 && (
                    <div className="space-y-4">
                        {summaries.map((summary) => (
                            <div
                                key={summary.id}
                                className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-shadow"
                            >
                                {/* Header */}
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                            <Hash className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {summary.callerNumber || 'Web Call'}
                                            </p>
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(summary.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                                        ID: {summary.id}
                                    </span>
                                </div>

                                {/* Topics */}
                                {summary.topicsDiscussed && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-indigo-600 mb-2">Topics Discussed:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {summary.topicsDiscussed.split(',').map((topic, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                                                >
                                                    {topic.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Summary Content */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Summary:</p>
                                    <p className="text-gray-600 leading-relaxed">{summary.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Help Text */}
                <div className="text-center text-sm text-gray-500">
                    <p>Summaries are generated automatically after each voice conversation.</p>
                </div>
            </div>
        </div>
    );
}
