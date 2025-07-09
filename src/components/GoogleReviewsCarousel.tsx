import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, User, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface GoogleReview {
  id: string;
  name: string;
  image_url: string | null;
  rating: number;
  review_date: string;
  text: string;
  review_count: number;
  company: string;
  is_new: boolean;
}

const GoogleReviewsCarousel: React.FC = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  // Responsive slides per view
  const [slidesPerView, setSlidesPerView] = useState(3);

  // Fetch reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('google_reviews')
          .select('*')
          .eq('is_new', false) // Only published reviews
          .order('review_date', { ascending: false }); // Most recent first

        if (error) {
          console.error('Error fetching reviews:', error);
          setError('Failed to load reviews');
          return;
        }

        setReviews(data || []);
      } catch (err) {
        console.error('Reviews fetch error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  // Handle responsive slides per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSlidesPerView(3); // Desktop: 3 reviews
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(2); // Tablet: 2 reviews
      } else {
        setSlidesPerView(1); // Mobile: 1 review
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoSliding || reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, reviews.length - slidesPerView);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 6000); // Auto-slide every 6 seconds

    return () => clearInterval(interval);
  }, [isAutoSliding, reviews.length, slidesPerView]);

  // Navigation functions
  const goToPrevious = () => {
    setIsAutoSliding(false);
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, reviews.length - slidesPerView);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
    // Resume auto-sliding after 10 seconds
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const goToNext = () => {
    setIsAutoSliding(false);
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, reviews.length - slidesPerView);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
    // Resume auto-sliding after 10 seconds
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const reviewDate = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInYears > 0) {
      return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
    } else if (diffInMonths > 0) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return 'Today';
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Get default avatar
  const getDefaultAvatar = (name: string) => {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return (
      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
        {initials}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading Google Reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reviews</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Available</h3>
        <p className="text-gray-600">Reviews will appear here once they are published.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center items-center mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-8 w-8 text-yellow-400 fill-current" />
            ))}
          </div>
          <span className="ml-3 text-2xl font-bold text-gray-900">5.0</span>
        </div>
        <p className="text-gray-600">Based on Google Reviews</p>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Navigation Arrows */}
        {reviews.length > slidesPerView && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous reviews"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next reviews"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </>
        )}

        {/* Reviews Container */}
        <div className="px-12">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
            }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / slidesPerView}%` }}
              >
                <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-lg transition-shadow duration-200 border border-gray-100">
                  {/* Reviewer Info */}
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 mr-3">
                      {review.image_url ? (
                        <img
                          src={review.image_url}
                          alt={`${review.name}'s avatar`}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            // Replace with default avatar on error
                            const target = e.currentTarget;
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '';
                              parent.appendChild(getDefaultAvatar(review.name).props.children);
                            }
                          }}
                        />
                      ) : (
                        getDefaultAvatar(review.name)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {review.name}
                      </h4>
                      {review.review_count > 1 && (
                        <p className="text-sm text-gray-500">
                          {review.review_count} reviews
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center mb-2">
                    {renderStars(review.rating)}
                  </div>

                  {/* Date */}
                  <p className="text-sm text-gray-500 mb-3">
                    {formatRelativeTime(review.review_date)}
                  </p>

                  {/* Review Text */}
                  <p className="text-gray-700 leading-relaxed mb-4 line-clamp-4">
                    {review.text}
                  </p>

                  {/* Company Name */}
                  <p className="text-xs text-gray-500 border-t pt-3">
                    Review for {review.company || 'Aboriginal Training Services'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {reviews.length > slidesPerView && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: Math.ceil(reviews.length / slidesPerView) }, (_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setIsAutoSliding(false);
                setTimeout(() => setIsAutoSliding(true), 10000);
              }}
              className={`w-3 h-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                Math.floor(currentIndex / slidesPerView) === i
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default GoogleReviewsCarousel;