import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, Loader2, AlertCircle, ZoomIn, ZoomOut } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker to use static file from public directory
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFSlideViewerProps {
  pdfUrl: string;
  lessonTitle: string;
  onClose: () => void;
}

const PDFSlideViewer: React.FC<PDFSlideViewerProps> = ({ pdfUrl, lessonTitle, onClose }) => {
  const [pdf, setPdf] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [pageLoading, setPageLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfUrl) {
        setError('No PDF URL provided.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading PDF from URL:', pdfUrl);
        
        // Clear any existing timeout
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        // Set a timeout to prevent infinite loading
        loadingTimeoutRef.current = setTimeout(() => {
          setError('PDF loading timed out. Please check your connection and try again.');
          setLoading(false);
        }, 30000); // 30 second timeout for better reliability

        // Configure PDF loading with proper options
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          withCredentials: false,
          // Disable streaming for better compatibility
          disableStream: true,
          // Disable auto-fetch for better control
          disableAutoFetch: true,
          // Set reasonable timeout
          httpHeaders: {},
        });

        // Add progress tracking
        loadingTask.onProgress = (progress) => {
          console.log('PDF loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
        };
        
        const pdfDocument = await loadingTask.promise;
        
        // Clear timeout on successful load
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        
        setPdf(pdfDocument);
        setTotalPages(pdfDocument.numPages);
        setCurrentPage(1);
        
        console.log('PDF loaded successfully. Total pages:', pdfDocument.numPages);
      } catch (err) {
        console.error('Error loading PDF:', err);
        
        // Clear timeout on error
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
          loadingTimeoutRef.current = null;
        }
        
        // Provide specific error messages based on error type
        if (err instanceof Error) {
          const errorMessage = err.message.toLowerCase();
          
          if (errorMessage.includes('404') || errorMessage.includes('not found')) {
            setError('PDF file not found. Please contact support.');
          } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('cors')) {
            setError('Network error loading PDF. Please check your connection and try again.');
          } else if (errorMessage.includes('invalidpdf') || errorMessage.includes('invalid pdf')) {
            setError('Invalid PDF file format. Please contact support.');
          } else if (errorMessage.includes('timeout')) {
            setError('PDF loading timed out. Please try again.');
          } else {
            setError(`Failed to load PDF: ${err.message}`);
          }
        } else {
          setError('This material could not be loaded. Please contact support.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadPDF();
    
    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      // Also cleanup any active render task
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfUrl, retryCount]);

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
        
        // Calculate base scale to fit container (fresh calculation each time)
        const baseScale = Math.min(
          (containerWidth - 40) / viewport.width,
          containerHeight / viewport.height
        );
        
        // Apply user zoom factor to base scale
        const finalScale = baseScale * scale;
        
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
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
          setError('Failed to render page. Please try again.');
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

  // Handle responsive scale adjustment
  useEffect(() => {
    const handleResize = () => {
      // Debounce resize events to avoid excessive re-renders
      const timer = setTimeout(() => {
        if (pdf && currentPage) {
          // Force re-render by updating a state that triggers the render effect
          setPageLoading(false); // This will trigger a re-render
        }
      }, 150);
      
      return () => clearTimeout(timer);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdf, currentPage]);

  // Cleanup render task on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, []);

  // Navigation functions with debouncing
  const [navigationDisabled, setNavigationDisabled] = useState(false);

  const goToPreviousPage = () => {
    if (navigationDisabled || currentPage <= 1) return;
    
    setNavigationDisabled(true);
    setCurrentPage(currentPage - 1);
    
    // Re-enable navigation after a short delay
    setTimeout(() => setNavigationDisabled(false), 300);
  };

  const goToNextPage = () => {
    if (navigationDisabled || currentPage >= totalPages) return;
    
    setNavigationDisabled(true);
    setCurrentPage(currentPage + 1);
    
    // Re-enable navigation after a short delay
    setTimeout(() => setNavigationDisabled(false), 300);
  };</parameter>

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
  }, [currentPage, totalPages]);</parameter>


  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  // Retry function
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading PDF</h3>
          <p className="text-gray-600 mb-4">Please wait while we load your lesson materials...</p>
          <div className="text-sm text-gray-500">
            This should complete within 30 seconds
          </div>
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col z-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
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
          className="relative max-w-full max-h-full flex items-center justify-center"
        >
          {/* Navigation Arrows */}
          <button
            onClick={goToPreviousPage}
            disabled={currentPage <= 1 || navigationDisabled}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
              currentPage <= 1 || navigationDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-xl'
            }`}
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || navigationDisabled}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all duration-200 ${
              currentPage >= totalPages || navigationDisabled
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
              className="block"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '100vw',
                maxHeight: 'calc(100vh - 200px)',
              }}
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
              disabled={currentPage <= 1 || navigationDisabled}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentPage <= 1 || navigationDisabled
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
              disabled={currentPage >= totalPages || navigationDisabled}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentPage >= totalPages || navigationDisabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </button>
          </div>

          <div className="text-sm text-gray-500">
            Use arrow keys to navigate • ESC to close
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFSlideViewer;