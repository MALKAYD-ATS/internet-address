import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronRight, Award, Users, Target, Eye } from 'lucide-react';

interface HomePageTitleSection {
  id: string;
  name: string;
  text: string;
  slogan: string;
  video_url?: string;
}

interface HomeNumber {
  id: string;
  number: string;
  description: string;
  order_index: number;
}

interface ChooseATS {
  id: string;
  name: string;
  text: string;
  symbol: string;
  order_index: number;
}

interface DroneSolution {
  id: string;
  symbol: string;
  text: string;
  order_index: number;
}

interface StudentSuccessStory {
  id: string;
  photo_url?: string;
  name?: string;
  position?: string;
  company?: string;
  rating?: number;
  text?: string;
  order_index: number;
}

interface Venture {
  id: string;
  logo_url?: string;
  name: string;
  relationship?: string;
  text?: string;
  video_url?: string;
  order_index: number;
}

interface Principle {
  id: string;
  symbol: string;
  title: string;
  text: string;
  order_index: number;
  color?: string;
  color_from?: string;
  color_to?: string;
}

const Home: React.FC = () => {
  const [titleSection, setTitleSection] = useState<HomePageTitleSection | null>(null);
  const [homeNumbers, setHomeNumbers] = useState<HomeNumber[]>([]);
  const [chooseATSItems, setChooseATSItems] = useState<ChooseATS[]>([]);
  const [droneSolutions, setDroneSolutions] = useState<DroneSolution[]>([]);
  const [studentStories, setStudentStories] = useState<StudentSuccessStory[]>([]);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch all data in parallel
      const [
        titleResponse,
        numbersResponse,
        chooseResponse,
        solutionsResponse,
        storiesResponse,
        venturesResponse,
        principlesResponse
      ] = await Promise.all([
        supabase.from('home_page_title_section').select('*').single(),
        supabase.from('home_numbers').select('*').order('order_index'),
        supabase.from('choose_ats').select('*').order('order_index'),
        supabase.from('drone_solutions').select('*').order('order_index'),
        supabase.from('student_success_stories').select('*').order('order_index'),
        supabase.from('ventures').select('*').order('order_index'),
        supabase.from('principles').select('*').order('order_index')
      ]);

      if (titleResponse.data) setTitleSection(titleResponse.data);
      if (numbersResponse.data) setHomeNumbers(numbersResponse.data);
      if (chooseResponse.data) setChooseATSItems(chooseResponse.data);
      if (solutionsResponse.data) setDroneSolutions(solutionsResponse.data);
      if (storiesResponse.data) setStudentStories(storiesResponse.data);
      if (venturesResponse.data) setVentures(venturesResponse.data);
      if (principlesResponse.data) setPrinciples(principlesResponse.data);

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getCardStyle = (principle: Principle) => {
    if (principle.color_from && principle.color_to) {
      return {
        background: `linear-gradient(135deg, ${principle.color_from}, ${principle.color_to})`
      };
    } else if (principle.color) {
      return {
        background: principle.color
      };
    }
    return {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    };
  };

  const getBorderColor = (principle: Principle) => {
    const color = principle.color_from || principle.color || '#3b82f6';
    return { borderColor: color };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {titleSection?.name || 'Aboriginal Training Services'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
              {titleSection?.text || 'Leading provider of drone training and certification programs'}
            </p>
            <p className="text-lg md:text-xl mb-12 text-blue-200">
              {titleSection?.slogan || 'Excellence in Aviation Training'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Explore Courses
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      {homeNumbers.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {homeNumbers.map((item) => (
                <div key={item.id} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                    {item.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose ATS Section */}
      {chooseATSItems.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Aboriginal Training Services?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover what sets us apart in drone training and certification
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {chooseATSItems.map((item) => (
                <div key={item.id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">{item.symbol}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.name}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Drone Solutions Section */}
      {droneSolutions.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Drone Solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From training to certification, we provide complete drone solutions
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {droneSolutions.map((solution) => (
                <div key={solution.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl mb-4">{solution.symbol}</div>
                  <p className="text-gray-600 leading-relaxed">{solution.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Our Vision & Mission Section */}
      {principles.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Vision & Mission
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Guiding principles that drive our commitment to Indigenous excellence in drone technology, innovation and education.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {principles.map((principle) => (
                <div key={principle.id} className="relative h-80 perspective-1000">
                  <div 
                    className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                      flippedCards[principle.id] ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => handleCardFlip(principle.id)}
                  >
                    {/* Front of card */}
                    <div 
                      className="absolute inset-0 w-full h-full rounded-xl shadow-lg backface-hidden flex flex-col items-center justify-center text-white p-6"
                      style={getCardStyle(principle)}
                    >
                      <div className="text-4xl mb-4">{principle.symbol}</div>
                      <h3 className="text-2xl font-bold mb-2">{principle.title}</h3>
                      <p className="text-sm opacity-90">Click to reveal</p>
                    </div>
                    
                    {/* Back of card */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-lg backface-hidden rotate-y-180 p-6 flex flex-col justify-center border-2"
                      style={getBorderColor(principle)}
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{principle.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{principle.text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Student Success Stories */}
      {studentStories.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Student Success Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Hear from our graduates who have achieved their goals
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studentStories.map((story) => (
                <div key={story.id} className="bg-white p-6 rounded-xl shadow-lg">
                  {story.photo_url && (
                    <img 
                      src={story.photo_url} 
                      alt={story.name || 'Student'} 
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                  )}
                  <div className="text-center mb-4">
                    {story.rating && (
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={`text-lg ${i < story.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900">{story.name}</h3>
                    {story.position && (
                      <p className="text-sm text-gray-600">{story.position}</p>
                    )}
                    {story.company && (
                      <p className="text-sm text-gray-500">{story.company}</p>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm italic">"{story.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ventures Section */}
      {ventures.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Our Ventures & Partnerships
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Collaborating with industry leaders to advance drone technology
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ventures.map((venture) => (
                <div key={venture.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  {venture.logo_url && (
                    <img 
                      src={venture.logo_url} 
                      alt={venture.name} 
                      className="h-12 mb-4 object-contain"
                    />
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{venture.name}</h3>
                  {venture.relationship && (
                    <p className="text-sm text-blue-600 font-medium mb-2">{venture.relationship}</p>
                  )}
                  {venture.text && (
                    <p className="text-gray-600 text-sm leading-relaxed">{venture.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;