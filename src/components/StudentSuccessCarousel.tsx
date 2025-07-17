import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote, User } from 'lucide-react';

interface StudentStory {
  photo_url: string;
  name: string;
  title?: string;
  position?: string;
  company: string;
  rating: number;
  text: string;
  course_name?: string;
  graduation_date?: string;
}

interface StudentSuccessCarouselProps {
  studentStories: StudentStory[];
}

const StudentSuccessCarousel: React.FC<StudentSuccessCarouselProps> = ({ studentStories }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [avatarFallback, setAvatarFallback] = useState<{ [key: number]: boolean }>({});


  // Handle responsive slides per view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSlidesPerView(3); // Desktop: 3 stories
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(2); // Tablet: 2 stories
      } else {
        setSlidesPerView(1); // Mobile: 1 story
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoSliding || studentStories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, studentStories.length - slidesPerView);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 6000); // Auto-slide every 6 seconds

    return () => clearInterval(interval);
  }, [isAutoSliding, studentStories.length, slidesPerView]);

  // Navigation functions
  const goToPrevious = () => {
    setIsAutoSliding(false);
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, studentStories.length - slidesPerView);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
    // Resume auto-sliding after 10 seconds
    setTimeout(() => setIsAutoSliding(true), 10000);
  };

  const goToNext = () => {
    setIsAutoSliding(false);
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, studentStories.length - slidesPerView);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
    // Resume auto-sliding after 10 seconds
    setTimeout(() => setIsAutoSliding(true), 10000);
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
      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
        {initials}
      </div>
    );
  };

  // Format graduation date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (studentStories.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Success Stories Available</h3>
        <p className="text-gray-600">Student success stories will appear here once they are published.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        {/* Navigation Arrows */}
        {studentStories.length > slidesPerView && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous success stories"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next success stories"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </>
        )}

        {/* Stories Container */}
        <div className="px-12">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
            }}
          >
            {studentStories.map((story, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / slidesPerView}%` }}
              >
                <div className="bg-white rounded-xl shadow-lg p-8 h-full hover:shadow-2xl transition-shadow duration-200 border border-gray-100 transform hover:scale-105">
                  {/* Student Info */}
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 mr-4">
{!avatarFallback[index] && story.photo_url ? (
  <img
    src={story.photo_url}
    alt={`${story.name}'s photo`}
    className="w-16 h-16 rounded-full object-cover"
    onError={() => setAvatarFallback(prev => ({ ...prev, [index]: true }))}
  />
) : (
  getDefaultAvatar(story.name)
)}

                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">
                        {story.name}
                      </h3>
                      {story.position && (
                        <p className="text-blue-700 font-medium text-sm">
                          {story.position}
                        </p>
                      )}
                      {story.company && (
                        <p className="text-gray-600 text-sm">
                          {story.company}
                        </p>
                      )}
                      {story.course_name && (
                        <p className="text-green-600 text-xs font-medium mt-1">
                          {story.course_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center mb-4">
                    {renderStars(story.rating)}
                  </div>

                  {/* Graduation Date */}
                  {story.graduation_date && (
                    <p className="text-sm text-gray-500 mb-4">
                      Graduated: {formatDate(story.graduation_date)}
                    </p>
                  )}

                  {/* Success Story Text */}
                  <div className="relative">
                    <Quote className="absolute top-0 left-0 h-8 w-8 text-blue-200 -mt-2 -ml-2" />
                    <p className="text-gray-700 italic leading-relaxed pl-6 line-clamp-6">
                      {story.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      {studentStories.length > slidesPerView && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(studentStories.length / slidesPerView) }, (_, i) => (
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
        .line-clamp-6 {
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default StudentSuccessCarousel;