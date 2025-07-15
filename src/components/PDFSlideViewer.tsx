import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2, AlertCircle, ZoomIn, ZoomOut, CheckCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure PDF.js worker to use local build instead of CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PDFSlideViewerProps {
  pdfUrl: string;
  lessonTitle: string;
  onClose: () => void;
  onComplete?: () => void;
  showCompleteButton?: boolean;
}

const PDFSlideViewer: React.FC<PDFSlideViewerProps> = ({ 
  pdfUrl, 
  lessonTitle, 
  onClose, 
  onComplete,
  showCompleteButton = false 
}) => {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [pageLoading, setPageLoading] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading PDF from URL:', pdfUrl);

        // Add CORS headers for Supabase Storage
        const loadingTaskOptions: any = {
          url: pdfUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          enableXfa: true,
        };
        
        // Add credentials for Supabase Storage if needed
        if (pdfUrl.includes('supabase.co')) {
          loadingTaskOptions.withCredentials = false;
          loadingTaskOptions.httpHeaders = {
            'Access-Control-Allow-Origin': '*',
          };
        }

        // Create loading task with proper configuration
        const loadingTask = pdfjsLib.getDocument(loadingTaskOptions);
        
        const pdfDocument = await loadingTask.promise;
        
        console.log('PDF loaded successfully, pages:', pdfDocument.numPages);
        
        setPdf(pdfDocument);
        setTotalPages(pdfDocument.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error loading PDF:', err);
        
        // Provide more specific error messages
        if (err instanceof Error) {
          if (err.message.includes('404') || err.message.includes('Not Found')) {
            setError('PDF file not found. Please check if the file exists in Supabase Storage.');
          } else if (err.message.includes('CORS')) {
            setError('Unable to load PDF due to CORS restrictions. Please check Supabase Storage permissions.');
          } else if (err.message.includes('Unauthorized') || err.message.includes('403')) {
            setError('Access denied to PDF file. Please check file permissions in Supabase Storage.');
          } else {
            setError(`Failed to load PDF: ${err.message}`);
          }
        } else {
          setError('PDF material could not be loaded. Please check the file path and permissions.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  // Render current page with proper scaling
  useEffect(() => {
    let renderTask: pdfjsLib.PDFRenderTask | null = null;

    const renderPage = async () => {
      if (!pdf || !canvasRef.current) return;

      try {
        setPageLoading(true);
        const page = await pdf.getPage(currentPage);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Cancel previous render task if it exists
        if (renderTask) {
          renderTask.cancel();
        }

        // Get the base viewport at scale 1.0
        const viewport = page.getViewport({ scale: 1.0 });
        
        // Calculate container dimensions
        const containerWidth = containerRef.current?.clientWidth || window.innerWidth - 100;
        const containerHeight = window.innerHeight - 200; // Leave room for header/footer
        
      // Determine whether we are in landscape (wider than tall)
      const isLandscape = containerWidth > containerHeight;
      
      // In landscape, scale to fit width; in portrait, scale to fit height
      const baseScale = isLandscape
        ? Math.min((containerWidth - 40) / viewport.width, 3.0) // Bigger scale for landscape
        : Math.min((containerHeight - 40) / viewport.height, 2.0);
        
        // Apply user zoom factor to base scale
        const finalScale = baseScale * scale;
        
        console.log('Rendering page', currentPage, 'with scale:', finalScale);
        
        // Get final viewport with calculated scale
        const scaledViewport = page.getViewport({ scale: finalScale });

        // Set canvas dimensions
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;

        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Create render task
        renderTask = page.render({
          canvasContext: context,
          viewport: scaledViewport,
        });

        await renderTask.promise;
        console.log('Page rendered successfully');
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
          setError(`Failed to render page ${currentPage}. Please try again.`);
        }
      } finally {
        setPageLoading(false);
      }
    };

    renderPage();

    return () => {
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, currentPage, scale]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          goToPreviousPage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          goToNextPage();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Navigation functions
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 4.0)); // Increased max zoom
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25)); // Decreased min zoom for better overview
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const handleComplete = async () => {
    if (!onComplete) return;
    
    setIsCompleting(true);
    try {
      await onComplete();
      // Close viewer after successful completion
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle responsive scale adjustment
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render on window resize
      if (pdf && currentPage) {
        const timer = setTimeout(() => {
          setCurrentPage(prev => prev); // Trigger re-render
        }, 100);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdf, currentPage]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading PDF</h3>
          <p className="text-gray-600">Please wait while we load your lesson materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Material</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Header */}
<div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900 truncate mr-4">
            {lessonTitle}
          </h2>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 mr-4">
            <button
              onClick={zoomOut}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <button
              onClick={resetZoom}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors duration-200"
              title="Reset Zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={zoomIn}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Close Viewer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* PDF Viewer Content */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div 
          ref={containerRef}
          className="pdf-container relative w-full h-full flex items-center justify-center"
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
              currentPage <= 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl'
            }`}
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
              currentPage >= totalPages
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl'
            }`}
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* PDF Canvas */}
          <div className="relative bg-white shadow-2xl rounded-lg overflow-hidden">
            {pageLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="pdf-canvas block"
            />
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentPage <= 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentPage >= totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Mark as Complete Button in Footer */}
            {showCompleteButton && currentPage === totalPages && (
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isCompleting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </button>
            )}
            
            <div className="text-sm text-gray-500">
              Use arrow keys to navigate • ESC to close
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for PDF viewer */}
      <style jsx>{`
        .pdf-container {
          width: 100%;
          height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
        }
        
        .pdf-canvas {
          display: block;
          margin: 0 auto;
        }
        
        /* Responsive canvas sizing */
        @media (max-width: 768px) {
          .pdf-container {
            height: calc(100vh - 180px);
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default PDFSlideViewer;