"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Set up PDF.js worker at module level - must be done before any PDF rendering
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
}

interface PDFViewerProps {
  pdfPath: string;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  viewMode: 'page' | 'scroll';
  onScaleChange?: (scale: number) => void;
}

export default function PDFViewer({
  pdfPath,
  currentPage,
  setCurrentPage,
  viewMode,
  onScaleChange,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [isTurning, setIsTurning] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    setError('PDF লোড করতে সমস্যা হয়েছে');
    setLoading(false);
    console.error('PDF load error:', error);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isTurning) {
      setIsTurning(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsTurning(false);
      }, 150);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages && !isTurning) {
      setIsTurning(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsTurning(false);
      }, 150);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => {
      const newScale = Math.min(prev + 0.2, 3);
      onScaleChange?.(newScale);
      return newScale;
    });
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.2, 0.5);
      onScaleChange?.(newScale);
      return newScale;
    });
  };

  // Notify parent when scale changes
  useEffect(() => {
    onScaleChange?.(scale);
  }, [scale, onScaleChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePreviousPage();
      if (e.key === 'ArrowRight') handleNextPage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, numPages]);

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">PDF ফাইলটি লোড করতে সমস্যা হয়েছে</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-100 flex flex-col">
      {/* Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage <= 1 || isTurning}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <span className="text-sm font-semibold text-gray-900 min-w-[80px] text-center px-2">
              {currentPage} / {numPages || '...'}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages || isTurning}
              className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm font-semibold text-gray-900 min-w-[70px] text-center px-3 py-1 bg-white rounded border border-gray-200">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto flex justify-center p-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">PDF লোড হচ্ছে...</p>
            </div>
          </div>
        )}

        {viewMode === 'page' ? (
          <div
            ref={pageRef}
            className={`transition-all duration-300 ${
              isTurning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}
            style={{ userSelect: 'text' }}
          >
            <Document
              file={pdfPath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              }
            >
              <Page
                pageNumber={currentPage}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-2xl"
              />
            </Document>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-4">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div key={pageNum} className="shadow-lg" style={{ userSelect: 'text' }}>
                <Document
                  file={pdfPath}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                >
                  <Page
                    pageNumber={pageNum}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </Document>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

