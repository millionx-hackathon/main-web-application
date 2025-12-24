"use client";

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileText } from 'lucide-react';
import { getBookById } from '../_data/books';

export default function BookChaptersPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const book = getBookById(bookId);

  if (!book) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">বই খুঁজে পাওয়া যায়নি</h1>
        <Link href="/dashboard/book-reader" className="text-indigo-600 hover:underline">
          বই নির্বাচনে ফিরুন
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard/book-reader"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
          <p className="text-gray-600">শ্রেণী {book.class}</p>
        </div>
      </div>

      {/* Chapters */}
      <div className="grid md:grid-cols-2 gap-4">
        {book.chapters.map((chapter, index) => (
          <Link
            key={chapter.id}
            href={`/dashboard/book-reader/${bookId}/${chapter.id}`}
            className="group p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-indigo-500 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {chapter.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span>PDF</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}


