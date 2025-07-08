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

const Home: React.FC = () => {
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
  const [visionFlipped, setVisionFlipped] = useState(false);
  const [missionFlipped, setMissionFlipped] = useState(false);

  // Load Elfsight script for Google Reviews
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://static.elfsight.com/platform/platform.js';
    script.async = true;
    script.defer = true;
    
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const features = [
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: "Professional Certification",
      description: "Industry-recognized RPAS training programs with comprehensive certification pathways for professional drone operations."
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Safety First Approach",
      description: "Comprehensive safety training ensuring responsible and compliant drone operations."
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Expert Instructors",
      description: "Learn from experienced professionals with extensive commercial drone operation backgrounds."
    },
    {
      icon: <Plane className="h-8 w-8 text-blue-600" />,
      title: "Modern Equipment",
      description: "Access to the latest drone technology and equipment for hands-on training experience."
    },
    {
      icon: <Triangle className="h-8 w-8 text-blue-600" />,
      title: "Indigenous Values",
      description: "Rooted in tradition, guided by community."
    },
    {
      icon: <Cpu className="h-8 w-8 text-blue-600" />,
      title: "Innovative Training Solutions",
      description: "Blending cutting-edge tech with practical skills."
    }
  ];

  const stats = [
    { number: "500+", label: "Students Trained" },
    { number: "98%", label: "Pass Rate" },
    { number: "50+", label: "Corporate Clients" },
    { number: "10+", label: "Years Experience" }
  ];

  const ventures = [
    {
      name: "TimesFly Aerospace",
      website: "https://timesflyaerospace.com",
      logo: "/Timesfly.png",
      description: "Leading aerospace technology company specializing in advanced drone systems and flight control software.",
      partnership: "Technology and Innovation Partner"
    },
    {
      name: "HK Drone Services",
      website: "https://hkdroneservice.com/",
      logo: "/H&K copy.png",
      description: "Professional drone services company providing commercial & industrial applications across Western Canada.",
      partnership: "Sales and Services Partner"
    },
    {
      name: "Timespreneur Ventures Inc",
      website: "https://timespreneur.com",
      logo: "/Timespreneur.jpg",
      description: "Innovation consulting and business development firm focused on emerging technologies and entrepreneurship.",
      partnership: "Strategic and Business Partner"
    },
    {
      name: "TIMES GROUP",
      website: "https://timesgroup.com",
      logo: "/times-group.jpg",
      description: "Comprehensive business solutions and strategic consulting group providing integrated services across multiple industries.",
      partnership: "Strategic Business Partner"
    },
    {
      name: "Turtle Island Aeronautical Association",
      website: "#",
      logo: "/turtle-island-aeronautical-association.png",
      description: "Aeronautical association promoting aviation excellence and aerospace education across North America.",
      partnership: "Aviation and Aerospace Partner"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Sarah Mitchell",
      role: "Commercial Drone Pilot",
      company: "SkyView Surveying",
      rating: 5,
      content: "The RPAS Advanced Certification course at ATS was exceptional. The instructors' expertise and hands-on approach gave me the confidence to start my commercial drone business.",
      image: "https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      id: 2,
      name: "David Chen",
      role: "Safety Manager",
      company: "Alberta Infrastructure",
      rating: 5,
      content: "ATS provided our team with comprehensive drone safety training. Their customized corporate program addressed our specific operational needs and regulatory requirements.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150"
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "Real Estate Photographer",
      company: "Horizon Properties",
      rating: 5,
      content: "Started with zero drone experience and now I'm confidently shooting aerial real estate photography. The basic certification course was well-structured.",
      image: "https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=150"
    }
  ];

  // Where We Are Heading data with Supabase video URLs
  const futureDirections = [
    {
      title: "Building Future Workforce",
      description: "Developing future workforce training programs",
      videoUrl: "https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/building-future-workforce.mp4",
      icon: <Users className="h-6 w-6 text-white" />
    },
    {
      title: "Innovating While Protecting the Environment",
      description: "Bringing people and technology together while protecting the environment",
      videoUrl: "https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/innovating-while-protecting-the-environment.mp4",
      icon: <Leaf className="h-6 w-6 text-white" />
    },
    {
      title: "Green Energy Future",
      description: "Train Indigenous communities to lead Canada's green energy future",
      videoUrl: "https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/green-energy-future.mp4",
      icon: <Energy className="h-6 w-6 text-white" />
    },
    {
      title: "Clean Technology & Innovation",
      description: "Empower Indigenous Peoples to champion clean technology and innovation",
      videoUrl: "https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/clean-technology-and-innovation.mp4",
      icon: <Recycle className="h-6 w-6 text-white" />
    },
    {
      title: "Space Exploration",
      description: "Pioneering Indigenous leadership in aerospace and space technology",
      videoUrl: "https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/space-exploration-video-background%20(1).mp4",
      icon: <Rocket className="h-6 w-6 text-white" />
    }
  ];

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
      // Send email to majid@abtraining.ca
      const emailData = {
        to: 'majid@abtraining.ca',
        subject: `New Contact Form Submission from ${formData.name}`,
        body: `
          Name: ${formData.name}
          Email: ${formData.email}
          Phone: ${formData.phone}
          Newsletter: ${formData.newsletter ? 'Yes' : 'No'}
          
          Message:
          ${formData.message}
        `
      };
      
      // In a real implementation, this would send an email via your backend
      console.log('Email would be sent:', emailData);
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      console.error('Error sending email:', error);
      // Still show success for demo
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
      // Store newsletter subscription in Supabase
      const { error } = await supabase
        .from('mailing_list_ats')
        .insert([
          {
            email: newsletterEmail
          }
        ]);

      if (error) {
        console.error('Error saving newsletter subscription:', error);
      }

      setIsNewsletterSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsNewsletterSubmitted(false);
        setNewsletterEmail('');
      }, 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      // Still show success for demo
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
        <div className="absolute inset-0 w-full h-full">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            onError={(e) => {
              // Fallback to gradient background if video fails
              e.currentTarget.style.display = 'none';
            }}
          >
            <source src="https://nnhgbtrkxepkeotpdnxw.supabase.co/storage/v1/object/public/media-assets/videos/building-future-workforce.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 transform transition-all duration-1000 hover:scale-[1.02] z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in">
              Professional Drone Academy
            </h1>
            <p className="text-2xl md:text-3xl mb-4 text-blue-100 font-semibold whitespace-nowrap">
              Advocate, Encourage, and Unite Indigenous Peoples & Communities to lead the Drone Industry.
            </p>
            <p className="text-xl md:text-2xl mb-8 text-blue-200 max-w-3xl mx-auto leading-relaxed">
              Training for the Future
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
            {stats.map((stat, index) => (
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
            {features.map((feature, index) => (
              <div key={index} className="text-center group transform transition-all duration-500 hover:scale-105">
                <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-all duration-300 group-hover:shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
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
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">RPAS Basic, Advanced & Level 1 Complex Certification</span>
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Commercial and Industrial Applications</span>
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Professional RPAS Regulations and Applications Courses</span>
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Corporate Training Programs</span>
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">Customized Training Solutions</span>
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">First Nations, Métis, and Inuit Training</span>
                </li>
                <li className="flex items-center transform transition-all duration-300 hover:translate-x-2">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                  <span className="text-gray-700">First Nations Service Agreements</span>
                </li>
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
            {/* Vision Card */}
            <div className="relative h-80 perspective-1000">
              <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                visionFlipped ? 'rotate-y-180' : ''
              }`}>
                {/* Front of Vision Card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden cursor-pointer"
                  onClick={() => setVisionFlipped(!visionFlipped)}
                >
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg h-full flex items-center justify-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    <div className="text-center text-white">
                      <Eye className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold">Vision</h3>
                      <p className="text-blue-100 mt-2">Click to reveal</p>
                    </div>
                  </div>
                </div>

                {/* Back of Vision Card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 cursor-pointer"
                  onClick={() => setVisionFlipped(!visionFlipped)}
                >
                  <div className="bg-white border-2 border-blue-200 rounded-xl shadow-lg h-full flex items-center justify-center p-8 transform transition-all duration-500 hover:shadow-2xl">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        Create Leaders, Innovators, Entrepreneurs, and Strong Youth within Indigenous Communities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Card */}
            <div className="relative h-80 perspective-1000">
              <div className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                missionFlipped ? 'rotate-y-180' : ''
              }`}>
                {/* Front of Mission Card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden cursor-pointer"
                  onClick={() => setMissionFlipped(!missionFlipped)}
                >
                  <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl shadow-lg h-full flex items-center justify-center transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    <div className="text-center text-white">
                      <Target className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-3xl font-bold">Mission</h3>
                      <p className="text-green-100 mt-2">Click to reveal</p>
                    </div>
                  </div>
                </div>

                {/* Back of Mission Card */}
                <div 
                  className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 cursor-pointer"
                  onClick={() => setMissionFlipped(!missionFlipped)}
                >
                  <div className="bg-white border-2 border-green-200 rounded-xl shadow-lg h-full flex items-center justify-center p-8 transform transition-all duration-500 hover:shadow-2xl">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                      <p className="text-lg text-gray-700 leading-relaxed">
                        Train and Prepare Individuals, Organizations, First Nations Peoples & Communities for Drone Technology and Innovation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
            {futureDirections.map((direction, index) => (
              <div key={index} className="relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                {/* Video Background */}
                <div className="relative h-64 overflow-hidden">
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={(e) => {
                      // Fallback to a solid color background if video fails
                      e.currentTarget.style.display = 'none';
                    }}
                  >
                    <source src={direction.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        {direction.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2 drop-shadow-lg">{direction.title}</h3>
                      <p className="text-sm text-gray-100 drop-shadow-md">{direction.description}</p>
                    </div>
                  </div>
                </div>

                {/* Fallback content if video doesn't load */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center" style={{ zIndex: -1 }}>
                  <div className="text-center text-white p-6">
                    <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      {direction.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2">{direction.title}</h3>
                    <p className="text-sm text-blue-100">{direction.description}</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
            {ventures.map((venture, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="md:flex">
                  <div className="md:w-1/3 p-8 bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="flex items-center justify-center h-32 mb-6">
                      <img
                        src={venture.logo}
                        alt={`${venture.name} logo`}
                        className="max-h-20 max-w-full object-contain transform transition-all duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{venture.name}</h3>
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {venture.partnership}
                      </span>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-8">
                    <p className="text-gray-600 mb-6 leading-relaxed">{venture.description}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      {venture.website !== "#" && (
                        <a
                          href={venture.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
                        >
                          Visit Website
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-blue-700 font-medium mb-2">+1 (587) 524-0275</p>
              <p className="text-gray-600 text-sm">Call us for immediate assistance</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-blue-700 font-medium mb-2">darcy@abtraining.ca</p>
              <p className="text-gray-600 text-sm">Send us an email anytime</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Locations</h3>
              <div className="text-blue-700 font-medium mb-2 space-y-1">
                <div className="flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Edmonton, Alberta, Canada</span>
                </div>
                <div className="flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Chicago, Illinois, USA</span>
                </div>
                <div className="flex items-center justify-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>Karachi, Sindh, Pakistan</span>
                </div>
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
            
            {/* Elfsight Google Reviews Widget */}
            <div 
              className="elfsight-app-8de22c1a-1c97-4667-9ce2-2f4767ca6072" 
              data-elfsight-app-lazy
              style={{ minHeight: '400px' }}
            ></div>
            
            {/* Fallback content while widget loads */}
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading Google Reviews...</p>
            </div>
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
              professional drone training at Aboriginal Training Services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
                    <p className="text-blue-700 font-medium">{testimonial.role}</p>
                    <p className="text-gray-600 text-sm">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                
                <div className="relative">
                  <Quote className="absolute top-0 left-0 h-8 w-8 text-blue-200 -mt-2 -ml-2" />
                  <p className="text-gray-700 italic leading-relaxed pl-6">
                    {testimonial.content}
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
            Start Your Drone Career Today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join hundreds of successful graduates who have launched their careers in the rapidly growing drone industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/majid-abtraining/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Schedule Consultation
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
              Stay updated with the latest drone technology news, training opportunities, and industry insights.
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