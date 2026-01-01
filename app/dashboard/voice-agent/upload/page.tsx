'use client';
import { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Settings } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [baseUrl, setBaseUrl] = useState('http://localhost:8080');
    const [showSettings, setShowSettings] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');
        setMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${baseUrl}/api/textbooks/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Upload failed: ${res.statusText}`);
            }

            const data = await res.json();
            setStatus(data.status === 'success' ? 'success' : 'error');
            setMessage(data.message || `Document indexed: ${data.documentId}`);
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Upload failed. Please check the server connection.');
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setStatus('idle');
                setMessage('');
            } else {
                setMessage('Please upload a PDF file');
                setStatus('error');
            }
        }
    };

    const resetForm = () => {
        setFile(null);
        setStatus('idle');
        setMessage('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="text-center space-y-3 mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-200 mb-4">
                        <Upload className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Upload Textbook</h1>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        Upload PDF documents to add them to the vector database for AI-powered learning
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
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-100 border border-indigo-200 rounded-xl text-indigo-700 font-medium shadow-sm"
                    >
                        📄 Upload (Current)
                    </Link>
                    <Link
                        href="/dashboard/voice-agent/summaries"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition-all shadow-sm"
                    >
                        📋 Summaries
                    </Link>
                </div>

                {/* Settings Panel */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
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
                                    disabled={status === 'uploading'}
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

                    <div className="relative z-10">
                        {status === 'success' ? (
                            // Success State
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
                                <p className="text-gray-600 mb-6">{message}</p>
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                                >
                                    Upload Another File
                                </button>
                            </div>
                        ) : (
                            // Upload Form
                            <>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${dragActive
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : file
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {file ? (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
                                                <FileText className="w-8 h-8 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{file.name}</p>
                                                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                onClick={() => setFile(null)}
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Drop your PDF here</p>
                                                <p className="text-sm text-gray-500">or click to browse</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".pdf"
                                                onChange={(e) => {
                                                    const selectedFile = e.target.files?.[0];
                                                    if (selectedFile) {
                                                        setFile(selectedFile);
                                                        setStatus('idle');
                                                        setMessage('');
                                                    }
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Error Message */}
                                {status === 'error' && message && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-700 text-sm">{message}</p>
                                    </div>
                                )}

                                {/* Upload Button */}
                                <button
                                    onClick={handleUpload}
                                    disabled={!file || status === 'uploading'}
                                    className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 ${!file || status === 'uploading'
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02]'
                                        }`}
                                >
                                    {status === 'uploading' ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6" />
                                            Upload PDF
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center text-sm text-gray-500">
                    <p>Supported format: PDF files only</p>
                    <p className="mt-1">Documents will be processed and indexed for AI-powered conversations.</p>
                </div>
            </div>
        </div>
    );
}
