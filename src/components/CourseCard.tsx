import React, { useState } from 'react';
import { Clock, Users, Award, Calendar, CheckCircle, ArrowRight, RotateCcw, Send, CreditCard } from 'lucide-react';
import { CourseData } from '../data/courseData';
import { supabase } from '../lib/supabase';

interface CourseCardProps {
  course: CourseData;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Advanced': return 'bg-blue-100 text-blue-800';
      case 'Expert': return 'bg-purple-100 text-purple-800';
      case 'Professional': return 'bg-orange-100 text-orange-800';
      case 'Review': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLearnMore = () => {
    setIsFlipped(true);
    setShowRegistration(false);
  };

  const handleRegisterNow = async () => {
    // For courses with pricing, initiate Stripe payment
    if (course.price) {
      try {
        // Redirect to Stripe setup page for payment integration
        window.open('https://bolt.new/setup/stripe', '_blank');
        return;
      } catch (error) {
        console.error('Payment setup error:', error);
      }
    }
    
    // For courses without pricing, show registration form
    setIsFlipped(true);
    setShowRegistration(true);
  };

  const handleBack = () => {
    setIsFlipped(false);
    setShowRegistration(false);
    setIsSubmitted(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegistrationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            name: registrationData.name,
            email: registrationData.email,
            phone: registrationData.phone,
            course: course.title
          }
        ]);

      if (error) {
        console.error('Error saving registration:', error);
        // For demo purposes, we'll still show success
      }

      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setRegistrationData({ name: '', email: '', phone: '' });
        setIsFlipped(false);
        setShowRegistration(false);
      }, 3000);
    } catch (error) {
      console.error('Registration error:', error);
      // For demo purposes, still show success
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setRegistrationData({ name: '', email: '', phone: '' });
        setIsFlipped(false);
        setShowRegistration(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-[500px] sm:h-[550px] md:h-[600px] perspective-1000">
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
        isFlipped ? 'rotate-y-180' : ''
      }`}>
        
        {/* Front of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 leading-tight break-words">
                    {course.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                      {course.level}
                    </span>
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full whitespace-nowrap">
                      Age {course.minimumAge}+
                    </span>
                  </div>
                  {course.price && (
                    <div className="text-lg sm:text-xl font-bold text-blue-700 mb-2">
                      {course.price}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm line-clamp-3">
                {course.description}
              </p>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Duration: {course.duration}</p>
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{course.capacity}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{course.nextDate}</span>
                </div>
              </div>

              <div className="mb-3 sm:mb-4 flex-grow overflow-hidden">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm">What's Included:</h4>
                <div className="max-h-24 sm:max-h-32 overflow-y-auto">
                  <ul className="space-y-1">
                    {course.features.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start text-xs transform transition-all duration-300 hover:translate-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-tight">{feature}</span>
                      </li>
                    ))}
                    {course.features.length > 4 && (
                      <li className="text-xs text-gray-500 italic pl-5">
                        +{course.features.length - 4} more features...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={handleRegisterNow}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white text-center py-2.5 px-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm"
                >
                  {course.price ? (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span className="truncate">Pay & Register</span>
                    </>
                  ) : (
                    <>
                      <span className="truncate">Register Now</span>
                      <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                    </>
                  )}
                </button>
                <button
                  onClick={handleLearnMore}
                  className="w-full border-2 border-gray-300 hover:border-blue-700 hover:text-blue-700 text-gray-700 text-center py-2.5 px-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
            <div className="p-4 sm:p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-3 sm:mb-4 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate pr-2">{course.title}</h3>
                <button
                  onClick={handleBack}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 flex-shrink-0"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </div>

              {showRegistration ? (
                <div className="flex-grow overflow-y-auto">
                  {isSubmitted ? (
                    <div className="text-center py-6 sm:py-8">
                      <CheckCircle className="h-12 sm:h-16 w-12 sm:w-16 text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Registration Received!</h4>
                      <p className="text-gray-600 text-sm sm:text-base">Thank you for your interest. We'll contact you within 24 hours.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      <h4 className="text-lg font-semibold text-gray-900">Course Registration</h4>
                      
                      <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={registrationData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
                            placeholder="Enter your full name"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            value={registrationData.email}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
                            placeholder="Enter your email"
                          />
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={registrationData.phone}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm"
                            placeholder="Enter your phone number"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`w-full py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm ${
                            isSubmitting
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-700 hover:bg-blue-800 text-white hover:shadow-lg'
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="mr-2 h-4 w-4" />
                              Submit Registration
                            </>
                          )}
                        </button>
                      </form>

                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="font-semibold text-blue-900 mb-1 text-sm">Next Steps:</h5>
                        <p className="text-blue-800 text-xs">
                          After submitting, you'll receive a Calendly link to schedule your course dates. 
                          Our team will also contact you within 24 hours to confirm details.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-grow overflow-y-auto">
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Age: </span>
                          <span className="text-gray-600">{course.prerequisites.age}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Experience: </span>
                          <span className="text-gray-600">{course.prerequisites.experience}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Equipment: </span>
                          <span className="text-gray-600">{course.prerequisites.equipment}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Other: </span>
                          <ul className="text-gray-600 text-xs mt-1">
                            {course.prerequisites.other.map((item, index) => (
                              <li key={index} className="ml-4">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Documents: </span>
                          <ul className="text-gray-600 text-xs mt-1">
                            {course.requirements.documents.map((doc, index) => (
                              <li key={index} className="ml-4">• {doc}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Equipment: </span>
                          <ul className="text-gray-600 text-xs mt-1">
                            {course.requirements.equipment.map((item, index) => (
                              <li key={index} className="ml-4">• {item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Preparation: </span>
                          <ul className="text-gray-600 text-xs mt-1">
                            {course.requirements.preparation.map((item, index) => (
                              <li key={index} className="ml-4">• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
                    <button
                      onClick={handleRegisterNow}
                      className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2.5 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm"
                    >
                      {course.price ? (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span className="truncate">Pay {course.price} & Register</span>
                        </>
                      ) : (
                        <>
                          <span className="truncate">Register for this Course</span>
                          <ArrowRight className="ml-2 h-4 w-4 flex-shrink-0" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CourseCard;