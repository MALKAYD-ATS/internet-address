import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Award, Users, Target, Heart, ChevronRight, Star, Play, MapPin, Phone, Mail } from 'lucide-react';

interface HomePageData {
  title: string;
  text: string;
  slogan: string;
  video_url?: string;
}

interface HomeNumber {
  number: string;
  description: string;
  order_index: number;
}

interface ChooseATS {
  name: string;
  text: string;
  symbol: string;
  order_index: number;
}

interface DroneSolution {
  symbol: string;
  text: string;
  order_index: number;
}

interface StudentStory {
  photo_url?: string;
  name?: string;
  position?: string;
  company?: string;
  rating?: number;
  text?: string;
  order_index: number;
}

interface Venture {
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
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [homeNumbers, setHomeNumbers] = useState<HomeNumber[]>([]);
  const [chooseATS, setChooseATS] = useState<ChooseATS[]>([]);
  const [droneSolutions, setDroneSolutions] = useState<DroneSolution[]>([]);
  const [studentStories, setStudentStories] = useState<StudentStory[]>([]);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Fetch home page title section
      const { data: homePageData } = await supabase
        .from('home_page_title_section')
        .select('*')
        .single();

      if (homePageData) {
        setHomeData({
          title: homePageData.name,
          text: homePageData.text,
          slogan: homePageData.slogan,
          video_url: homePageData.video_url
        });
      }

      // Fetch home numbers
      const { data: numbersData } = await supabase
        .from('home_numbers')
        .select('*')
        .order('order_index');

      if (numbersData) {
        setHomeNumbers(numbersData);
      }

      // Fetch choose ATS data
      const { data: chooseData } = await supabase
        .from('choose_ats')
        .select('*')
        .order('order_index');

      if (chooseData) {
        setChooseATS(chooseData);
      }

      // Fetch drone solutions
      const { data: solutionsData } = await supabase
        .from('drone_solutions')
        .select('*')
        .order('order_index');

      if (solutionsData) {
        setDroneSolutions(solutionsData);
      }

      // Fetch student success stories
      const { data: storiesData } = await supabase
        .from('student_success_stories')
        .select('*')
        .order('order_index');

      if (storiesData) {
        setStudentStories(storiesData);
      }

      // Fetch ventures
      const { data: venturesData } = await supabase
        .from('ventures')
        .select('*')
        .order('order_index');

      if (venturesData) {
        setVentures(venturesData);
      }

      // Fetch principles
      const { data: principlesData } = await supabase
        .from('principles')
        .select('*')
        .order('order_index');

      if (principlesData) {
        setPrinciples(principlesData);
      }

    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getCardBackground = (principle: Principle) => {
    if (principle.color_from && principle.color_to) {
      return `linear-gradient(135deg, ${principle.color_from}, ${principle.color_to})`;
    } else if (principle.color) {
      return principle.color;
    }
    return 'linear-gradient(135deg, #4F46E5, #7C3AED)'; // Default gradient
  };

  const getCardBorderColor = (principle: Principle) => {
    const color = principle.color_from || principle.color || '#4F46E5';
    return `${color}33`; // Add transparency
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  {homeData?.title || 'Aboriginal Training Services'}
                </h1>
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed">
                  {homeData?.slogan || 'Excellence in Indigenous drone technology training and education'}
                </p>
              </div>
              
              <p className="text-lg text-blue-50 leading-relaxed max-w-2xl">
                {homeData?.text || 'Empowering Indigenous communities through cutting-edge drone technology education, combining traditional knowledge with modern innovation.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Start Your Journey
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300 flex items-center justify-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Our Story
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-6">
                  {homeNumbers.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                        {item.number}
                      </div>
                      <div className="text-blue-100 text-sm lg:text-base">
                        {item.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose ATS Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Aboriginal Training Services?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine Indigenous wisdom with cutting-edge technology to deliver world-class drone training programs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {chooseATS.map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">{item.symbol}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.name}</h3>
                <p className="text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Drone Solutions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Drone Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From basic operations to advanced applications, we provide complete training solutions for every skill level.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {droneSolutions.map((solution, index) => (
              <div key={index} className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 hover:shadow-xl transition-all duration-300">
                <div className="text-4xl mb-4">{solution.symbol}</div>
                <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                  {solution.text}
                </p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Vision & Mission Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Vision & Mission
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Guiding principles that drive our commitment to Indigenous excellence in drone technology, innovation and education.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {principles.map((principle) => (
              <div key={principle.id} className="perspective-1000">
                <div 
                  className={`relative w-full h-64 transform-style-preserve-3d transition-transform duration-700 cursor-pointer ${
                    flippedCards[principle.id] ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => toggleCard(principle.id)}
                >
                  {/* Front of card */}
                  <div 
                    className="absolute inset-0 backface-hidden rounded-xl p-6 text-white flex flex-col items-center justify-center text-center shadow-lg"
                    style={{ background: getCardBackground(principle) }}
                  >
                    <div className="text-4xl mb-4">{principle.symbol}</div>
                    <h3 className="text-xl font-bold mb-2">{principle.title}</h3>
                    <p className="text-sm opacity-90">Click to reveal</p>
                  </div>

                  {/* Back of card */}
                  <div 
                    className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl p-6 flex flex-col justify-center text-center shadow-lg border-2"
                    style={{ borderColor: getCardBorderColor(principle) }}
                  >
                    <div className="text-2xl mb-3" style={{ color: principle.color_from || principle.color || '#4F46E5' }}>
                      {principle.symbol}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{principle.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{principle.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from our graduates who are making a difference in their communities and careers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentStories.map((story, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-4">
                  {story.photo_url && (
                    <img 
                      src={story.photo_url} 
                      alt={story.name || 'Student'} 
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{story.name}</h4>
                    <p className="text-sm text-gray-600">{story.position} {story.company && `at ${story.company}`}</p>
                  </div>
                </div>
                
                {story.rating && (
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < story.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                )}
                
                <p className="text-gray-700 leading-relaxed italic">"{story.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ventures & Partnerships */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Ventures & Partnerships
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Collaborating with industry leaders to provide the best training and opportunities for our students.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ventures.map((venture, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {venture.logo_url && (
                  <div className="mb-4">
                    <img 
                      src={venture.logo_url} 
                      alt={venture.name} 
                      className="h-12 object-contain"
                    />
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{venture.name}</h3>
                {venture.relationship && (
                  <p className="text-blue-600 font-medium mb-3">{venture.relationship}</p>
                )}
                {venture.text && (
                  <p className="text-gray-600 leading-relaxed mb-4">{venture.text}</p>
                )}
                {venture.video_url && (
                  <button className="flex items-center text-blue-600 hover:text-blue-700 transition-colors duration-300">
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom CSS for flip animations */}
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
      `}</style>
    </div>
  );
};

export default Home;