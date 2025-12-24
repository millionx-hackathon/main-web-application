"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, X, Send, Loader2, Sparkles, FileQuestion } from 'lucide-react';
import { getBookById, getChapterById } from '../../_data/books';
import PDFViewer from '../../_components/PDFViewer';
import ChatSidebar from '../../_components/ChatSidebar';
import TextSelectionPopup from '../../_components/TextSelectionPopup';
import ResizablePanels from '../../_components/ResizablePanels';

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const chapterId = params.chapterId as string;

  const book = getBookById(bookId);
  const chapter = getChapterById(bookId, chapterId);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<string>('');
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'page' | 'scroll'>('page');
  const [contextItems, setContextItems] = useState<Array<{ text: string; page: number }>>([]);
  const [pdfScale, setPdfScale] = useState(1.2);

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

  const handleTextSelection = () => {
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
  };

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

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [currentPage]);

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

        <div className="flex items-center gap-3">
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
              pdfPath={chapter.pdfPath}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              viewMode={viewMode}
              onScaleChange={setPdfScale}
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
              pdfScale={pdfScale}
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
            onAddToContext={handleAddToContext}
            onAskAI={handleAskAI}
            onClose={() => {
              setShowTextPopup(false);
              setSelectedText('');
              window.getSelection()?.removeAllRanges();
            }}
          />
        )}
      </div>
    </div>
  );
}

