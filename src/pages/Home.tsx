import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, 
  Award, 
  Users, 
  Shield, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Phone,
  Mail,
  MapPin,
  Send,
  ExternalLink,
  Quote,
  Globe,
  Building,
  Zap,
  Mountain,
  Cpu,
  Eye,
  Target,
  Lightbulb,
  Leaf,
  Zap as Energy,
  Recycle,
  Rocket,
  Triangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import GoogleReviewsCarousel from '../components/GoogleReviewsCarousel';

// Icon mapping for dynamic icon rendering
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Award,
  Shield,
  Users,
  Plane,
  Triangle,
  Cpu,
  CheckCircle,
  Eye,
  Target,
  Leaf,
  Zap: Energy,
  Recycle,
  Rocket,
  Globe,
  Heart: Users, // fallback
  Mountain,
  Lightbulb
};

// Interface definitions for database tables
interface HomeTitleSection {
  name: string;
  text: string;
  slogan: string;
  video: string | null;
}

interface HomeNumber {
  number: string;
  label: string;
}

interface ChooseATS {
  symbol: string;
  name: string;
  text: string;
}

interface DroneSolution {
  symbol: string;
  text: string;
}

interface Principle {
  symbol: string;
  title: string;
  text: string;
  color: string;
}

interface HeadingCard {
  symbol: string;
  title: string;
  text: string;
  video: string | null;
}

interface Venture {
  logo_url: string;
  name: string;
  relationship: string;
  text: string;
  video_url: string | null;
}

interface ContactInfo {
  phone: string;
  email: string;
}

interface ContactLocation {
  location_name: string;
  address: string;
}

interface StudentStory {
  photo_url: string;
  name: string;
  position: string;
  company: string;
  rating: number;
  text: string;
}

const Home: React.FC = () => {
  // State for all dynamic content
  const [titleSection, setTitleSection] = useState<HomeTitleSection | null>(null);
  const [homeNumbers, setHomeNumbers] = useState<HomeNumber[]>([]);
  const [chooseATSItems, setChooseATSItems] = useState<ChooseATS[]>([]);
  const [droneSolutions, setDroneSolutions] = useState<DroneSolution[]>([]);
  const [principles, setPrinciples] = useState<Principle[]>([]);
  const [headingCards, setHeadingCards] = useState<HeadingCard[]>([]);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [contactLocations, setContactLocations] = useState<ContactLocation[]>([]);
  const [studentStories, setStudentStories] = useState<StudentStory[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    newsletter: false
  });

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false);
  const [isNewsletterSubmitted, setIsNewsletterSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Vision and Mission flip states
  const [flippedPrinciples, setFlippedPrinciples] = useState<Set<string>>(new Set());

  // Load Elfsight script for Google Reviews
  useEffect(() => {
    // Elfsight script removed - now using custom database-driven carousel
  }, []);

  // Fetch all dynamic content from Supabase
  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        // Fetch title section
        const { data: titleData } = await supabase
          .from('home_page_title_section')
          .select('*')
          .single();
        if (titleData) setTitleSection(titleData);

        // Fetch home numbers
        const { data: numbersData } = await supabase
          .from('home_numbers')
          .select('*')
          .order('order_index', { ascending: true });
        if (numbersData) {
          // Map to expected interface format
          const formattedNumbers = numbersData.map(item => ({
            number: item.number,
            label: item.description || item.label // Use description field as label, fallback to label
          }));
          setHomeNumbers(formattedNumbers);
        }

        // Fetch choose ATS items
        const { data: chooseData } = await supabase
          .from('choose_ats')
          .select('*')
          .order('order_index', { ascending: true });
        if (chooseData) setChooseATSItems(chooseData);

        // Fetch drone solutions
        const { data: solutionsData } = await supabase
          .from('drone_solutions')
          .select('*')
          .order('order_index', { ascending: true });
        if (solutionsData) setDroneSolutions(solutionsData);

        // Fetch principles
        const { data: principlesData } = await supabase
          .from('principles')
          .select('*')
          .order('order_index', { ascending: true });
        if (principlesData) setPrinciples(principlesData);

        // Fetch heading cards
        const { data: headingData } = await supabase
          .from('heading')
          .select('*')
          .order('order_index', { ascending: true });
        if (headingData) setHeadingCards(headingData);

        // Fetch ventures
        const { data: venturesData } = await supabase
          .from('ventures')
          .select('*')
          .order('order_index', { ascending: true });
        if (venturesData && venturesData.length > 0) {
          console.log('Ventures data loaded:', venturesData);
          setVentures(venturesData);
        } else {
          console.log('No ventures data found');
        }

        // Fetch contact information
        const { data: contactData } = await supabase
          .from('contact_information')
          .select('*')
          .single();
        if (contactData) setContactInfo(contactData);

        // Fetch contact locations
        const { data: locationsData } = await supabase
          .from('contact_locations')
          .select('*')
          .order('order_index', { ascending: true });
        if (locationsData) setContactLocations(locationsData);

        // Fetch student success stories
        const { data: storiesData } = await supabase
          .from('student_success_stories')
          .select('*')
          .order('order_index', { ascending: true });
        if (storiesData) setStudentStories(storiesData);

      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchAllContent();
  }, []);

  // Helper function to render icons dynamically
  const renderIcon = (iconName: string, className: string = "h-8 w-8") => {
    const IconComponent = iconMap[iconName] || Award; // fallback to Award icon
    return <IconComponent className={className} />;
  };

  // Helper function to toggle principle flip state
  const togglePrincipleFlip = (title: string) => {
    const newFlipped = new Set(flippedPrinciples);
    if (newFlipped.has(title)) {
      newFlipped.delete(title);
    } else {
      newFlipped.add(title);
    }
    setFlippedPrinciples(newFlipped);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const { error } = await supabase.from("contact_messages").insert([
      {
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone || null,
        subscribe_to_newsletter: formData.newsletter,
        message: formData.message
      }
    ]);

    if (error) {
      throw error;
    }

    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        newsletter: false
      });
    }, 3000);
  } catch (error) {
    console.error('Error saving contact message:', error);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
        newsletter: false
      });
    }, 3000);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNewsletterSubmitting(true);

    try {
      const { error } = await supabase
        .from('newsletter')
        .insert([{ email: newsletterEmail }]);

      if (error) {
        console.error('Error saving newsletter subscription:', error);
      }

      setIsNewsletterSubmitted(true);
      
      setTimeout(() => {
        setIsNewsletterSubmitted(false);
        setNewsletterEmail('');
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setIsNewsletterSubmitted(true);
      setTimeout(() => {
        setIsNewsletterSubmitted(false);
        setNewsletterEmail('');
      }, 3000);
    } finally {
      setIsNewsletterSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white overflow-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-200 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-blue-300 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-blue-400 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-blue-200 rounded-full opacity-30 animate-pulse"></div>
      </div>

      {/* Hero Section with Background Video */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white overflow-hidden">
        {/* Background Video */}
        {titleSection?.video_url && (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <video
              className="absolute inset-0 w-full h-full object-cover min-w-full min-h-full"
              autoPlay
              muted
              loop
              playsInline
              onError={(e) => {
                // Hide video on error, fallback to gradient background
                const target = e.currentTarget;
                target.style.display = 'none';
              }}
            >
              <source src={titleSection.video_url} type="video/mp4" />
            </video>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 transform transition-all duration-1000 hover:scale-[1.02] z-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight animate-fade-in">
              {titleSection?.name || 'Professional Drone Academy'}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 text-blue-100 font-semibold">
              {titleSection?.text || 'Advocate, Encourage, and Unite Indigenous Peoples & Communities to lead the Drone Industry.'}
            </p>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 text-blue-200 max-w-3xl mx-auto leading-relaxed">
              {titleSection?.slogan || 'Training for the Future'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/training"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center"
              >
                View Training
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/indigenous-relations"
                className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Our Heritage
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 transform transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {homeNumbers.map((stat, index) => (
              <div key={index} className="text-center transform transition-all duration-500 hover:scale-110 hover:shadow-lg bg-white rounded-xl p-6">
                <div className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 transform transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Aboriginal Training Services?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine cutting-edge drone technology training with Indigenous values of respect, 
              responsibility, and excellence in education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chooseATSItems.map((feature, index) => (
              <div key={index} className="text-center group transform transition-all duration-500 hover:scale-105">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-all duration-300 group-hover:shadow-lg">
                  {renderIcon(feature.symbol, "h-8 w-8 text-blue-600")}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.name}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-gray-50 transform transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="transform transition-all duration-500 hover:scale-105">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Comprehensive Drone Solutions
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                From beginner training to advanced commercial and industrial operations, we provide complete drone solutions 
                for individuals, businesses, government organizations, and Indigenous communities across Canada.
              </p>
              
              <ul className="space-y-4 mb-8">
                {droneSolutions.map((solution, index) => (
                  <li key={index} className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                    {renderIcon(solution.symbol, "h-6 w-6 text-green-500 mr-3")}
                    <span className="text-gray-700">{solution.text}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                to="/training"
                className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg inline-flex items-center"
              >
                Explore Training
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
              <div className="space-y-4">
                <Link
                  to="/training"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Browse Training Courses
                </Link>
                <Link
                  to="/indigenous-relations"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Learn Our Story
                </Link>
                <a
                  href="#contact"
                  className="block w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-center py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Vision and Mission Section */}
<section className="py-20 bg-white transform transition-all duration-500">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Our Vision & Mission
      </h2>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Guiding principles that drive our commitment to Indigenous excellence in drone technology, innovation and education.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {principles.map((principle, index) => {
        const isFlipped = flippedPrinciples.has(principle.title);
        
        // Ensure we have a valid symbol
        const symbolToRender = principle.symbol || 'Award';

        return (
          <div key={index} className="relative h-80 perspective-1000">
            <div
              className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of Card */}
              <div
                className="absolute inset-0 w-full h-full backface-hidden cursor-pointer"
                onClick={() => togglePrincipleFlip(principle.title)}
              >
                <div
                  className="rounded-xl shadow-lg h-full flex items-center justify-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl"
                  style={{ 
                    background: principle.color 
                      ? `linear-gradient(135deg, ${principle.color}, ${principle.color}dd)` 
                      : 'linear-gradient(135deg, #2563eb, #1d4ed8)' // fallback blue gradient
                  }}
                >
                  <div className="text-center text-white">
                    {renderIcon(symbolToRender, 'h-16 w-16 mx-auto mb-4')}
                    <h3 className="text-3xl font-bold">{principle.title || 'Principle'}</h3>
                    <p className="text-blue-100 mt-2">Click to reveal</p>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div
                className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 cursor-pointer"
                onClick={() => togglePrincipleFlip(principle.title)}
              >
                <div
                  className="bg-white border-2 rounded-xl shadow-lg h-full flex items-center justify-center p-8 transform transition-all duration-500 hover:shadow-2xl"
                  style={{ 
                    borderColor: principle.color || '#3b82f6' // use the color for border, fallback to blue
                  }}
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Our {principle.title || 'Principle'}
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      {principle.text || 'Description coming soon.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>

      {/* Where We Are Heading Section */}
      <section className="py-20 bg-gray-50 transform transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Where We Are Heading
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our commitment to building a sustainable future through Indigenous leadership in technology, land & environmental stewardship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {headingCards.map((direction, index) => (
              <div key={index} className="relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                {/* Video Background - Responsive Container */}
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  {direction.video_url ? (
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={(e) => {
                        // Hide video and show fallback background
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.classList.add('bg-gradient-to-br', 'from-blue-600', 'to-blue-800');
                        }
                      }}
                    >
                      <source src={direction.video_url} type="video/mp4" />
                    </video>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-4 sm:p-6">
                      <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        {renderIcon(direction.symbol, "h-6 w-6 text-white")}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2 drop-shadow-lg">{direction.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-100 drop-shadow-md leading-tight">{direction.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Group of Ventures Section */}
      <section className="py-20 bg-white transform transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Group of Ventures
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Strategic partnerships with industry leaders to provide comprehensive drone solutions, 
              advanced training programs, and innovative technology development.
            </p>
          </div>

          {ventures.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading ventures...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
            {ventures.map((venture, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="md:flex">
                  <div className="md:w-1/3 p-8 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-center h-32 mb-6">
                      {venture.logo_url ? (
                        <img
                          src={venture.logo_url}
                          alt={`${venture.name} logo`}
                          className="max-h-20 max-w-full object-contain transform transition-all duration-300 hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">{venture.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{venture.name}</h3>
                      {venture.relationship && (
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {venture.relationship}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-8">
                    {venture.text && (
                      <p className="text-gray-600 mb-6 leading-relaxed">{venture.text}</p>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a
                        href={`https://${venture.name.toLowerCase().replace(/\s+/g, '')}.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                      >
                        Visit Website
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Information Section */}
      <section id="contact" className="py-20 bg-gray-50 transform transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get in touch with our team for course information, training enrollment, 
              or any questions about drone technology and certification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {contactInfo && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                  <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
                  <p className="text-blue-700 font-medium mb-2">{contactInfo.phone}</p>
                  <p className="text-gray-600 text-sm">Call us for immediate assistance</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
                  <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
                  <p className="text-blue-700 font-medium mb-2">{contactInfo.email}</p>
                  <p className="text-gray-600 text-sm">Send us an email anytime</p>
                </div>
              </>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Locations</h3>
              <div className="text-blue-700 font-medium mb-2 space-y-1">
                {contactLocations.map((location, index) => (
                  <div key={index} className="flex items-center justify-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{location.location_name}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 text-sm">Global training presence</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Send Us a Message</h3>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h4>
                <p className="text-gray-600">Thank you for contacting us. We'll respond within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.newsletter}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Subscribe to newsletter</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Tell us about your inquiry or training needs..."
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-700 hover:bg-blue-800 text-white hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Google Reviews Widget Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Students Say on Google
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Read authentic reviews from our training program graduates and see why we maintain 
              a 5-star rating on Google Reviews.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500 hover:shadow-2xl">
            <GoogleReviewsCarousel />
          </div>
        </div>
      </section>

      {/* Reviews/Testimonials Section */}
      <section className="py-20 bg-gray-50 transform transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Real testimonials from graduates who have advanced their careers through 
              professional RPAS training at Aboriginal Training Services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {studentStories.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.photo_url}
                    alt={testimonial.name}
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                    <p className="text-blue-700 font-medium">{testimonial.position}</p>
                    <p className="text-gray-600 text-sm">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                <div className="relative">
                  <Quote className="absolute top-0 left-0 h-8 w-8 text-blue-200 -mt-2 -ml-2" />
                  <p className="text-gray-700 italic leading-relaxed pl-6">
                    {testimonial.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900 text-white transform transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your RPAS Career Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of successful graduates who have launched their careers in the rapidly growing RPAS industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendar.google.com/calendar/appointments/schedules/AcZssZ2bz2nYWBjGWvZBrsOogdaD5_c4M5O0tPpz_Rt9nhc8WM5TvyzpLQY2cdvQaUiQHHko4HW6gjON?gv=true"
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Book An Appointment
            </a>
            <Link
              to="/training"
              className="border-2 border-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              View Course Catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600 mb-6">
              Stay updated with the latest RPAS technology news, training opportunities, and industry insights.
            </p>
            
            {isNewsletterSubmitted ? (
              <div className="py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Successfully Subscribed!</h3>
                <p className="text-gray-600">Thank you for subscribing to our newsletter.</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isNewsletterSubmitting}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isNewsletterSubmitting
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-700 hover:bg-blue-800 text-white transform hover:scale-105'
                  }`}
                >
                  {isNewsletterSubmitting ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
            )}
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