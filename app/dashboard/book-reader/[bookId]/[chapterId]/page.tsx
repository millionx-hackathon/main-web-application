"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, X, FileText, Layers, BarChart3, Star } from 'lucide-react';
import { getBookById, getChapterById, getDirectPdfUrl } from '../../_data/books';
import PDFViewer from '../../_components/PDFViewer';
import ChatSidebar from '../../_components/ChatSidebar';
import TextSelectionPopup from '../../_components/TextSelectionPopup';
import ResizablePanels from '../../_components/ResizablePanels';
import SmartPageSummary from '../../_components/SmartPageSummary';
import FlashcardGenerator from '../../_components/FlashcardGenerator';
import ProgressInsights from '../../_components/ProgressInsights';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setLastReadPage, updateReadingTime, toggleHighlight, addTextHighlight, TextHighlight } from '@/lib/store/slices/bookReaderSlice';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const chapterId = params.chapterId as string;
  const dispatch = useAppDispatch();

  const book = getBookById(bookId);
  const chapter = getChapterById(bookId, chapterId);

  // Convert Google Drive URLs to direct PDF links if needed
  const pdfUrl = chapter
    ? (chapter.isExternal && chapter.pdfPath.includes('drive.google.com')
        ? getDirectPdfUrl(chapter.pdfPath)
        : chapter.pdfPath.startsWith('http')
        ? chapter.pdfPath
        : chapter.pdfPath)
    : '';

  // Get last read page from Redux
  const lastReadPage = useAppSelector(
    (state) => state.bookReader?.lastReadPages?.[`${bookId}/${chapterId}`]
  );

  const [chatOpen, setChatOpen] = useState(true);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(lastReadPage || 1);
  const [viewMode, setViewMode] = useState<'page' | 'scroll'>('page');
  const [contextItems, setContextItems] = useState<Array<{ text: string; page: number }>>([]);
  const [pdfScale, setPdfScale] = useState(1.2);
  const [totalPages, setTotalPages] = useState(100); // Default, will be updated from PDF
  const [currentPageText, setCurrentPageText] = useState<string>(''); // Extracted text from current PDF page
  const [now] = useState(() => Date.now());
  const readingStartTime = useRef<number>(now);
  const lastPageChangeTime = useRef<number>(now);

  // New feature states
  const [showSummary, setShowSummary] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  // Get highlight state
  const highlightedPages = useAppSelector(
    (state) => state.bookReader?.readingSessions?.[`${bookId}/${chapterId}`]?.highlightedPages || []
  );
  const isCurrentPageHighlighted = highlightedPages.includes(currentPage);

  // Get text highlights for current page
  const textHighlights = useAppSelector(
    (state) => state.bookReader?.textHighlights?.[`${bookId}/${chapterId}`]?.filter(h => h.page === currentPage) || []
  );

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim().length === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Check if the selection is within a PDF text layer element
    let element: Node | null = container.nodeType === Node.TEXT_NODE
      ? container.parentElement
      : container as Element;

    let isPDFText = false;
    while (element && element !== document.body) {
      if (element instanceof Element) {
        // Check if it's within react-pdf text content
        if (element.classList?.contains('react-pdf__Page__textContent') ||
            element.closest('.react-pdf__Page__textContent')) {
          isPDFText = true;
          break;
        }
        // If we find react-pdf classes, continue checking
        if (element.closest('[class*="react-pdf"]')) {
          element = element.parentElement;
          continue;
        }
        // If we're outside PDF viewer entirely, stop
        break;
      }
      element = element.parentElement;
    }

    // Only show popup if selection is from PDF text layer
    if (isPDFText) {
      let text = selection.toString().trim();

      // Clean the text - fix Bengali character spacing issues
      text = text
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/([^\u0980-\u09FF])\s+([\u0980-\u09FF])/g, '$1 $2') // Fix spacing before Bengali chars
        .replace(/([\u0980-\u09FF])\s+([^\u0980-\u09FF])/g, '$1 $2') // Fix spacing after Bengali chars
        .replace(/undefined/g, '') // Remove undefined strings
        .trim();

      if (text.length > 0 && text !== 'undefined') {
        const rect = range.getBoundingClientRect();

        setSelectedText(text);
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        setShowTextPopup(true);
      }
    } else {
      // Don't clear selection, just don't show popup
      // This allows normal text selection elsewhere
    }
  }, [currentPage]);

  const handleAddToContext = () => {
    if (selectedText) {
      // Clean and normalize the selected text
      const cleanedText = selectedText
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim()
        .replace(/[^\u0980-\u09FF\u0020-\u007E\n\r\t.,;:!?।]/g, ''); // Keep only Bengali, English, and basic punctuation

      if (cleanedText.length > 0) {
        setContextItems(prev => [...prev, { text: cleanedText, page: currentPage }]);
        setShowTextPopup(false);
        setSelectedText('');
        if (!chatOpen) {
          setChatOpen(true);
        }
      }
    }
  };

  const handleAskAI = () => {
    if (selectedText) {
      setContextItems(prev => [...prev, { text: selectedText, page: currentPage }]);
      setShowTextPopup(false);
      const textToAsk = selectedText;
      setSelectedText('');
      setChatOpen(true);
      // Trigger question in chat sidebar
      setTimeout(() => {
        const event = new CustomEvent('askAI', { detail: { text: textToAsk } });
        window.dispatchEvent(event);
      }, 300);
    }
  };

  const handleHighlight = () => {
    if (selectedText) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rects: Array<{ x: number; y: number; width: number; height: number }> = [];

        // Get all bounding rectangles for the selection
        for (let i = 0; i < range.getClientRects().length; i++) {
          const rect = range.getClientRects()[i];
          const pageElement = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentElement?.closest('.react-pdf__Page')
            : (range.commonAncestorContainer as Element).closest('.react-pdf__Page');

          if (pageElement) {
            const pageRect = pageElement.getBoundingClientRect();
            rects.push({
              x: rect.left - pageRect.left,
              y: rect.top - pageRect.top,
              width: rect.width,
              height: rect.height,
            });
          }
        }

        if (rects.length > 0) {
          const highlight: TextHighlight = {
            id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: selectedText.trim(),
            page: currentPage,
            rects,
            createdAt: Date.now(),
            color: '#fef08a', // Yellow highlight
          };

          dispatch(addTextHighlight({ bookId, chapterId, highlight }));
        }
      }

      setShowTextPopup(false);
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    }
  };

  // Load last read page on mount
  useEffect(() => {
    if (lastReadPage && lastReadPage > 0) {
      setTimeout(() => setCurrentPage(lastReadPage), 0);
    }
  }, [bookId, chapterId, lastReadPage]);

  // Save current page whenever it changes
  useEffect(() => {
    if (currentPage > 0 && book && chapter) {
      dispatch(setLastReadPage({ bookId, chapterId, page: currentPage }));

      // Track reading time (time spent on previous page)
      const timeSpent = (Date.now() - lastPageChangeTime.current) / 1000;
      if (timeSpent > 0 && timeSpent < 300) { // Only track if less than 5 minutes (to avoid counting idle time)
        dispatch(updateReadingTime({ bookId, chapterId, timeSpent }));
      }
      lastPageChangeTime.current = Date.now();
    }
  }, [currentPage, bookId, chapterId, dispatch, book, chapter]);

  // Track reading time on unmount
  useEffect(() => {
    return () => {
      if (book && chapter) {
        const totalTimeSpent = (Date.now() - readingStartTime.current) / 1000;
        if (totalTimeSpent > 0 && totalTimeSpent < 3600) { // Only track if less than 1 hour
          dispatch(updateReadingTime({ bookId, chapterId, timeSpent: totalTimeSpent }));
        }
      }
    };
  }, [bookId, chapterId, dispatch, book, chapter]);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [currentPage, handleTextSelection]);

  if (!book || !chapter) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">অধ্যায় খুঁজে পাওয়া যায়নি</h1>
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:underline"
        >
          ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50" lang="bn">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900">{chapter.title}</h1>
            <p className="text-sm text-gray-500">{book.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* AI Features */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSummary(true)}
              className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
              title="পৃষ্ঠা সারাংশ"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden md:inline">সারাংশ</span>
            </button>

            <button
              onClick={() => setShowFlashcards(true)}
              className="px-3 py-2 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-2 text-sm font-medium"
              title="ফ্ল্যাশকার্ড"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden md:inline">ফ্ল্যাশকার্ড</span>
            </button>

            <button
              onClick={() => setShowProgress(true)}
              className="px-3 py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors flex items-center gap-2 text-sm font-medium"
              title="পঠন বিশ্লেষণ"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden md:inline">বিশ্লেষণ</span>
            </button>

            <button
              onClick={() => dispatch(toggleHighlight({ bookId, chapterId, page: currentPage }))}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium ${
                isCurrentPageHighlighted
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="পৃষ্ঠা হাইলাইট করুন"
            >
              <Star className={`w-4 h-4 ${isCurrentPageHighlighted ? 'fill-yellow-500' : ''}`} />
              <span className="hidden md:inline">হাইলাইট</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('page')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'page'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              পৃষ্ঠা
            </button>
            <button
              onClick={() => setViewMode('scroll')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'scroll'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              স্ক্রল
            </button>
          </div>

          {/* Chat Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`relative px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              chatOpen
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>চ্যাট</span>
            {contextItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {contextItems.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        <ResizablePanels
          leftPanel={
            <PDFViewer
              pdfPath={pdfUrl}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              viewMode={viewMode}
              onScaleChange={setPdfScale}
              isHighlighted={isCurrentPageHighlighted}
              onTotalPagesChange={setTotalPages}
              textHighlights={textHighlights}
              onPageTextExtracted={(pageNum, text) => {
                if (pageNum === currentPage) {
                  setCurrentPageText(text);
                }
              }}
            />
          }
          rightPanel={
            <ChatSidebar
              isOpen={true}
              onClose={() => setChatOpen(false)}
              contextItems={contextItems}
              currentPage={currentPage}
              chapterTitle={chapter.title}
              chapterId={chapterId}
              bookId={bookId}
              pdfScale={pdfScale}
              pageText={currentPageText}
              onClearContext={() => setContextItems([])}
              onAddContext={(text, page) => {
                setContextItems(prev => [...prev, { text, page }]);
              }}
            />
          }
          defaultLeftWidth={60}
          minLeftWidth={40}
          minRightWidth={25}
          rightPanelVisible={chatOpen}
        />

        {/* Text Selection Popup */}
        {showTextPopup && (
          <TextSelectionPopup
            text={selectedText}
            position={popupPosition}
            page={currentPage}
            onAddToContext={handleAddToContext}
            onAskAI={handleAskAI}
            onHighlight={handleHighlight}
            onClose={() => {
              setShowTextPopup(false);
              setSelectedText('');
              window.getSelection()?.removeAllRanges();
            }}
          />
        )}

        {/* Smart Page Summary Modal */}
        {showSummary && (
          <SmartPageSummary
            bookId={bookId}
            chapterId={chapterId}
            currentPage={currentPage}
            chapterTitle={chapter.title}
            onClose={() => setShowSummary(false)}
          />
        )}

        {/* Flashcard Generator Modal */}
        {showFlashcards && (
          <FlashcardGenerator
            bookId={bookId}
            chapterId={chapterId}
            currentPage={currentPage}
            chapterTitle={chapter.title}
            onClose={() => setShowFlashcards(false)}
          />
        )}

        {/* Progress Insights Modal */}
        {showProgress && (
          <ProgressInsights
            bookId={bookId}
            chapterId={chapterId}
            totalPages={totalPages}
            chapterTitle={chapter.title}
            onClose={() => setShowProgress(false)}
          />
        )}
      </div>
    </div>
  );
}

