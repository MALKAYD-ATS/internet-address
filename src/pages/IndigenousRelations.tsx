import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Leaf, 
  Users, 
  Heart, 
  Mountain, 
  Wind, 
  Sun, 
  TreePine,
  ArrowRight,
  Shield,
  Eye,
  Compass,
  Star,
  AlertTriangle
} from 'lucide-react';

const IndigenousRelations: React.FC = () => {
  // Animation state for floating symbols
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Restart animations periodically for continuous flow
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 30000); // Restart every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const coreValues = [
    {
      icon: <Leaf className="h-6 sm:h-8 w-6 sm:w-8 text-green-600" />,
      title: "Land Stewardship",
      description: "Our responsibility to protect and preserve the land for future generations through sustainable technology practices.",
      principle: "We are the keepers of the land, using drone technology to monitor, protect, and understand our environment."
    },
    {
      icon: <Eye className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />,
      title: "Data Guardianship",
      description: "Protecting and responsibly managing the information we gather, ensuring it serves the community's best interests.",
      principle: "We are the keepers of the data, maintaining accuracy, privacy, and ethical use of all collected information."
    },
    {
      icon: <Shield className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600" />,
      title: "Environmental Protection",
      description: "Using technology as a tool to safeguard our natural world and monitor environmental changes.",
      principle: "We are the keepers of the environment, utilizing drones to protect ecosystems and wildlife habitats."
    },
    {
      icon: <Users className="h-6 sm:h-8 w-6 sm:w-8 text-orange-600" />,
      title: "Community Service",
      description: "Ensuring our technological capabilities serve the broader community and Indigenous nations.",
      principle: "Technology should strengthen communities and preserve cultural connections to the land."
    }
  ];

  const culturalIntegration = [
    {
      title: "Traditional Knowledge Meets Modern Technology",
      description: "Combining centuries of Indigenous land knowledge with cutting-edge drone technology to create comprehensive environmental monitoring solutions.",
      image: "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Respectful Data Collection",
      description: "Implementing protocols that honor Indigenous data sovereignty and ensure community consent in all data gathering activities.",
      image: "https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Environmental Monitoring",
      description: "Using drone technology to monitor traditional territories, track environmental changes, and support conservation efforts.",
      image: "https://images.pexels.com/photos/1624438/pexels-photo-1624438.jpeg?auto=compress&cs=tinysrgb&w=600"
    },
    {
      title: "Space & Indigenous Knowledge",
      description: "Exploring the ancestral understanding of space, celestial bodies, and the deep relationship between Indigenous teachings and the cosmos, inspiring innovative pathways in aerospace technologies.",
      image: "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=600"
    }
  ];

  const heritageElements = [
    {
      icon: <Mountain className="h-5 sm:h-6 w-5 sm:w-6 text-amber-700" />,
      title: "Connection to Land",
      description: "Deep spiritual and practical connection to the territories we serve and protect."
    },
    {
      icon: <Wind className="h-5 sm:h-6 w-5 sm:w-6 text-blue-500" />,
      title: "Respect for Nature",
      description: "Understanding that technology must work in harmony with natural systems."
    },
    {
      icon: <Sun className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-500" />,
      title: "Wisdom of Elders",
      description: "Incorporating traditional knowledge and guidance in our technological applications."
    },
    {
      icon: <TreePine className="h-5 sm:h-6 w-5 sm:w-6 text-green-600" />,
      title: "Sustainable Practices",
      description: "Ensuring our operations support long-term environmental and community health."
    },
    {
      icon: <Heart className="h-5 sm:h-6 w-5 sm:w-6 text-red-500" />,
      title: "Community First",
      description: "Prioritizing community needs and cultural values in all our services."
    },
    {
      icon: <Compass className="h-5 sm:h-6 w-5 sm:w-6 text-purple-600" />,
      title: "Guided Purpose",
      description: "Using technology with clear intention and respect for its impact on communities."
    }
  ];

  const applications = [
    {
      title: "Traditional Territory Mapping",
      description: "Creating detailed maps of traditional territories to support land claims, resource management, and cultural preservation.",
      benefits: [
        "Accurate boundary documentation",
        "Historical site preservation",
        "Resource management planning",
        "Cultural education support"
      ]
    },
    {
      title: "Environmental Monitoring",
      description: "Monitoring ecosystem health, wildlife populations, and environmental changes to support conservation efforts.",
      benefits: [
        "Wildlife habitat assessment",
        "Water quality monitoring",
        "Forest health evaluation",
        "Climate change documentation"
      ]
    },
    {
      title: "Cultural Site Documentation",
      description: "Preserving and documenting important cultural and historical sites for future generations.",
      benefits: [
        "3D site reconstruction",
        "Historical preservation",
        "Educational resource creation",
        "Cultural heritage protection"
      ]
    },
    {
      title: "Community Development",
      description: "Supporting infrastructure development and community planning while respecting cultural values.",
      benefits: [
        "Sustainable development planning",
        "Infrastructure assessment",
        "Community consultation support",
        "Cultural impact evaluation"
      ]
    }
  ];

  return (
    <div 
      className="min-h-screen overflow-hidden relative"
    >
      {/* Flowing River Background with Indigenous Symbols */}
      <div className="fixed inset-0 overflow-hidden">
        {/* River Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
          {/* Flowing water effect */}
          <div className="absolute inset-0 opacity-30">
            <div className="river-flow-1"></div>
            <div className="river-flow-2"></div>
            <div className="river-flow-3"></div>
          </div>
          
          {/* Water ripples */}
          <div className="absolute inset-0 opacity-20">
            <div className="ripple ripple-1"></div>
            <div className="ripple ripple-2"></div>
            <div className="ripple ripple-3"></div>
          </div>
        </div>

        {/* Floating Indigenous Symbols */}
        <div key={animationKey} className="absolute inset-0 pointer-events-none">
          {/* Tipi symbols */}
          <div className="floating-symbol tipi-1">
            <svg width="40" height="40" viewBox="0 0 100 100" className="text-amber-200 opacity-60">
              <path d="M50 10 L20 80 L80 80 Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 10 L50 80" stroke="currentColor" strokeWidth="1"/>
              <circle cx="35" cy="65" r="3" fill="currentColor"/>
              <circle cx="65" cy="65" r="3" fill="currentColor"/>
            </svg>
          </div>
          
          <div className="floating-symbol tipi-2">
            <svg width="35" height="35" viewBox="0 0 100 100" className="text-yellow-200 opacity-50">
              <path d="M50 15 L25 75 L75 75 Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 15 L50 75" stroke="currentColor" strokeWidth="1"/>
              <circle cx="40" cy="60" r="2" fill="currentColor"/>
              <circle cx="60" cy="60" r="2" fill="currentColor"/>
            </svg>
          </div>

          <div className="floating-symbol tipi-3">
            <svg width="30" height="30" viewBox="0 0 100 100" className="text-orange-200 opacity-40">
              <path d="M50 20 L30 70 L70 70 Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 20 L50 70" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>

          {/* Feather symbols */}
          <div className="floating-symbol feather-1">
            <svg width="25" height="45" viewBox="0 0 50 90" className="text-white opacity-40">
              <path d="M25 5 Q15 20 20 35 Q30 25 25 45 Q35 35 30 55 Q20 45 25 65 Q35 55 30 75 L25 85" 
                    fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M25 15 Q20 20 15 25" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M25 25 Q30 30 35 35" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M25 35 Q20 40 15 45" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M25 45 Q30 50 35 55" fill="none" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>

          <div className="floating-symbol feather-2">
            <svg width="20" height="35" viewBox="0 0 50 90" className="text-blue-200 opacity-30">
              <path d="M25 10 Q18 25 22 40 Q28 30 25 50 Q32 40 28 60 Q22 50 25 70 L25 80" 
                    fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M25 20 Q22 25 18 30" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M25 40 Q28 45 32 50" fill="none" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>

          {/* Dreamcatcher symbols */}
          <div className="floating-symbol dreamcatcher-1">
            <svg width="35" height="35" viewBox="0 0 100 100" className="text-purple-200 opacity-50">
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 20 L50 80 M20 50 L80 50 M35 35 L65 65 M65 35 L35 65" 
                    stroke="currentColor" strokeWidth="1" opacity="0.7"/>
              <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
              <path d="M50 80 L45 90 L50 85 L55 90 Z" fill="currentColor"/>
              <path d="M35 75 L30 85 L35 80 L40 85 Z" fill="currentColor"/>
            </svg>
          </div>

          <div className="floating-symbol dreamcatcher-2">
            <svg width="25" height="25" viewBox="0 0 100 100" className="text-pink-200 opacity-40">
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2"/>
              <path d="M50 25 L50 75 M25 50 L75 50" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
              <circle cx="50" cy="50" r="6" fill="none" stroke="currentColor" strokeWidth="1"/>
            </svg>
          </div>

          {/* Arrow symbols */}
          <div className="floating-symbol arrow-1">
            <svg width="40" height="15" viewBox="0 0 100 40" className="text-green-200 opacity-45">
              <path d="M10 20 L80 20 M70 10 L80 20 L70 30" 
                    fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <path d="M15 15 L25 20 L15 25" fill="none" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>

          <div className="floating-symbol arrow-2">
            <svg width="30" height="12" viewBox="0 0 100 40" className="text-teal-200 opacity-35">
              <path d="M15 20 L75 20 M65 12 L75 20 L65 28" 
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Sun symbols */}
          <div className="floating-symbol sun-1">
            <svg width="40" height="40" viewBox="0 0 100 100" className="text-yellow-300 opacity-60">
              <circle cx="50" cy="50" r="20" fill="currentColor"/>
              <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50"/>
                <path d="M25 25 L32 32 M68 68 L75 75 M75 25 L68 32 M32 68 L25 75"/>
              </g>
            </svg>
          </div>

          <div className="floating-symbol sun-2">
            <svg width="30" height="30" viewBox="0 0 100 100" className="text-orange-300 opacity-45">
              <circle cx="50" cy="50" r="15" fill="currentColor"/>
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M50 15 L50 25 M50 75 L50 85 M15 50 L25 50 M75 50 L85 50"/>
              </g>
            </svg>
          </div>

          {/* Mountain symbols */}
          <div className="floating-symbol mountain-1">
            <svg width="45" height="25" viewBox="0 0 100 50" className="text-gray-300 opacity-50">
              <path d="M10 40 L30 15 L50 25 L70 10 L90 40 Z" fill="currentColor"/>
              <path d="M25 20 L35 30 M60 15 L75 35" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
            </svg>
          </div>

          <div className="floating-symbol mountain-2">
            <svg width="35" height="20" viewBox="0 0 100 50" className="text-slate-300 opacity-40">
              <path d="M15 35 L35 20 L55 30 L75 15 L85 35 Z" fill="currentColor"/>
            </svg>
          </div>

          {/* Bear paw symbols */}
          <div className="floating-symbol paw-1">
            <svg width="25" height="25" viewBox="0 0 100 100" className="text-brown-200 opacity-45">
              <circle cx="30" cy="25" r="8" fill="currentColor"/>
              <circle cx="70" cy="25" r="8" fill="currentColor"/>
              <circle cx="25" cy="50" r="6" fill="currentColor"/>
              <circle cx="75" cy="50" r="6" fill="currentColor"/>
              <ellipse cx="50" cy="65" rx="15" ry="20" fill="currentColor"/>
            </svg>
          </div>

          <div className="floating-symbol paw-2">
            <svg width="20" height="20" viewBox="0 0 100 100" className="text-amber-300 opacity-35">
              <circle cx="35" cy="30" r="6" fill="currentColor"/>
              <circle cx="65" cy="30" r="6" fill="currentColor"/>
              <circle cx="30" cy="55" r="5" fill="currentColor"/>
              <circle cx="70" cy="55" r="5" fill="currentColor"/>
              <ellipse cx="50" cy="70" rx="12" ry="15" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]"></div>
      </div>

      {/* All content positioned above the background */}
      <div className="relative min-h-screen" style={{ zIndex: 10 }}>
        {/* Hero Section */}
        <section className="relative py-20 sm:py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transform transition-all duration-1000 hover:scale-[1.02] z-10">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-white drop-shadow-2xl">
                Indigenous Relations
                <span className="block text-green-300">& Modern Technology</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 text-blue-200 font-semibold drop-shadow-xl">
                Keepers of the land, keepers of the data, and keepers of the environment
              </p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 text-white max-w-4xl mx-auto leading-relaxed bg-black/50 backdrop-blur-md rounded-lg p-4 sm:p-6 shadow-2xl border border-white/20">
                Honoring Indigenous values while advancing drone technology for environmental protection, 
                community service, and cultural preservation.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl">
                Our Core Values
              </h2>
              <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto leading-relaxed bg-black/50 backdrop-blur-md rounded-lg p-4 shadow-2xl border border-white/20">
                Indigenous principles that guide our approach to drone technology and environmental stewardship.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {coreValues.map((value, index) => (
                <div key={index} className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border-2 border-white/50">
                  <div className="flex items-start mb-4 sm:mb-6">
                    <div className="bg-white rounded-full w-12 sm:w-16 h-12 sm:h-16 flex items-center justify-center mr-4 sm:mr-6 transform transition-all duration-300 hover:scale-110 shadow-xl">
                      {value.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{value.title}</h3>
                      <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{value.description}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-2 border-blue-200">
                    <p className="text-blue-800 italic font-medium text-sm sm:text-base">{value.principle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cultural Integration Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl">
                Cultural Integration in Technology
              </h2>
              <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto leading-relaxed bg-black/50 backdrop-blur-md rounded-lg p-4 shadow-2xl border border-white/20">
                How we blend traditional Indigenous knowledge with modern drone technology 
                to create respectful and effective solutions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {culturalIntegration.map((item, index) => (
                <div key={index} className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border-2 border-white/50">
                  <div className="h-32 sm:h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transform transition-all duration-500 hover:scale-110"
                    />
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Heritage Elements Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl">
                Indigenous Heritage Elements
              </h2>
              <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto leading-relaxed bg-black/50 backdrop-blur-md rounded-lg p-4 shadow-2xl border border-white/20">
                The foundational principles that guide our work and shape our approach to technology.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {heritageElements.map((element, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl p-4 sm:p-6 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-3xl border-2 border-white/50">
                  <div className="bg-white rounded-full w-10 sm:w-12 h-10 sm:h-12 flex items-center justify-center mx-auto mb-3 sm:mb-4 transform transition-all duration-300 hover:scale-110 shadow-xl">
                    {element.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">{element.title}</h3>
                  <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{element.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Applications Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-2xl">
                Indigenous-Focused Applications
              </h2>
              <p className="text-lg sm:text-xl text-white max-w-3xl mx-auto leading-relaxed bg-black/50 backdrop-blur-md rounded-lg p-4 shadow-2xl border border-white/20">
                Specific ways we apply drone technology to serve Indigenous communities 
                and support cultural and environmental objectives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {applications.map((app, index) => (
                <div key={index} className="bg-white/95 backdrop-blur-xl border-2 border-white/50 rounded-xl shadow-2xl p-6 sm:p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{app.title}</h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{app.description}</p>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Key Benefits:</h4>
                    <ul className="space-y-1 sm:space-y-2">
                      {app.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center text-xs sm:text-sm transform transition-all duration-300 hover:translate-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white drop-shadow-2xl">
                Our Commitment to Indigenous Communities
              </h2>
              <p className="text-lg sm:text-xl text-white max-w-4xl mx-auto leading-relaxed bg-black/50 backdrop-blur-md rounded-lg p-4 shadow-2xl border border-white/20">
                We pledge to operate with respect, transparency, and genuine partnership 
                with Indigenous communities in all our technological endeavors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center transform transition-all duration-500 hover:scale-105 bg-white/95 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-2xl border-2 border-white/50">
                <Globe className="h-12 sm:h-16 w-12 sm:w-16 text-green-600 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">Global Perspective</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Connecting Indigenous communities worldwide through shared knowledge and technology.
                </p>
              </div>
              
              <div className="text-center transform transition-all duration-500 hover:scale-105 bg-white/95 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-2xl border-2 border-white/50">
                <Users className="h-12 sm:h-16 w-12 sm:w-16 text-blue-600 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">Community Partnership</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Working alongside communities as partners, not just service providers.
                </p>
              </div>
              
              <div className="text-center transform transition-all duration-500 hover:scale-105 bg-white/95 backdrop-blur-xl rounded-xl p-6 sm:p-8 shadow-2xl border-2 border-white/50">
                <Heart className="h-12 sm:h-16 w-12 sm:w-16 text-red-500 mx-auto mb-4 sm:mb-6" />
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900">Cultural Respect</h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Honoring traditions while embracing innovation for community benefit.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-3xl p-8 sm:p-12 border-2 border-white/50">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Join Us in Protecting Our Heritage
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto">
                Learn how drone technology can serve your community while honoring Indigenous values 
                and protecting the environment for future generations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href="/#contact"
                  className="bg-blue-700 hover:bg-blue-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center shadow-xl"
                >
                  Start a Conversation
                  <ArrowRight className="ml-2 h-4 sm:h-5 w-4 sm:w-5" />
                </a>
                <a
                  href="/training"
                  className="border-2 border-blue-700 text-blue-700 hover:bg-blue-700 hover:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Explore Training
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CSS Styles for River and Symbol Animations */}
      <style jsx>{`
        /* River flowing animation */
        .river-flow-1, .river-flow-2, .river-flow-3 {
          position: absolute;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(59, 130, 246, 0.3) 25%, 
            rgba(34, 197, 94, 0.2) 50%, 
            rgba(59, 130, 246, 0.3) 75%, 
            transparent 100%
          );
          animation: flow 20s linear infinite;
        }
        
        .river-flow-2 {
          animation-delay: -7s;
          animation-duration: 25s;
        }
        
        .river-flow-3 {
          animation-delay: -14s;
          animation-duration: 30s;
        }
        
        @keyframes flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
        
        /* Water ripples */
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: ripple 4s ease-out infinite;
        }
        
        .ripple-1 {
          width: 100px;
          height: 100px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .ripple-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          left: 70%;
          animation-delay: 2s;
        }
        
        .ripple-3 {
          width: 80px;
          height: 80px;
          top: 40%;
          left: 40%;
          animation-delay: 1s;
        }
        
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
        
        /* Floating symbols animations */
        .floating-symbol {
          position: absolute;
          animation: float 15s ease-in-out infinite;
        }
        
        /* Tipi positions and animations */
        .tipi-1 {
          top: 15%;
          left: -5%;
          animation: floatAcross 25s linear infinite;
          animation-delay: 0s;
        }
        
        .tipi-2 {
          top: 70%;
          left: -5%;
          animation: floatAcross 30s linear infinite;
          animation-delay: 8s;
        }
        
        .tipi-3 {
          top: 45%;
          left: -5%;
          animation: floatAcross 35s linear infinite;
          animation-delay: 15s;
        }
        
        /* Feather positions */
        .feather-1 {
          top: 25%;
          left: -3%;
          animation: floatAcross 28s linear infinite;
          animation-delay: 5s;
        }
        
        .feather-2 {
          top: 80%;
          left: -3%;
          animation: floatAcross 32s linear infinite;
          animation-delay: 12s;
        }
        
        /* Dreamcatcher positions */
        .dreamcatcher-1 {
          top: 35%;
          left: -4%;
          animation: floatAcross 26s linear infinite;
          animation-delay: 3s;
        }
        
        .dreamcatcher-2 {
          top: 60%;
          left: -4%;
          animation: floatAcross 29s linear infinite;
          animation-delay: 18s;
        }
        
        /* Arrow positions */
        .arrow-1 {
          top: 10%;
          left: -4%;
          animation: floatAcross 22s linear infinite;
          animation-delay: 7s;
        }
        
        .arrow-2 {
          top: 85%;
          left: -3%;
          animation: floatAcross 27s linear infinite;
          animation-delay: 14s;
        }
        
        /* Sun positions */
        .sun-1 {
          top: 5%;
          left: -4%;
          animation: floatAcross 24s linear infinite;
          animation-delay: 2s;
        }
        
        .sun-2 {
          top: 55%;
          left: -3%;
          animation: floatAcross 31s linear infinite;
          animation-delay: 16s;
        }
        
        /* Mountain positions */
        .mountain-1 {
          top: 20%;
          left: -5%;
          animation: floatAcross 33s linear infinite;
          animation-delay: 6s;
        }
        
        .mountain-2 {
          top: 75%;
          left: -4%;
          animation: floatAcross 28s linear infinite;
          animation-delay: 20s;
        }
        
        /* Bear paw positions */
        .paw-1 {
          top: 40%;
          left: -3%;
          animation: floatAcross 26s linear infinite;
          animation-delay: 9s;
        }
        
        .paw-2 {
          top: 65%;
          left: -3%;
          animation: floatAcross 29s linear infinite;
          animation-delay: 22s;
        }
        
        @keyframes floatAcross {
          0% {
            transform: translateX(0) translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100px)) translateY(-20px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(5deg);
          }
          50% {
            transform: translateY(-5px) rotate(-3deg);
          }
          75% {
            transform: translateY(-15px) rotate(7deg);
          }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .floating-symbol {
            transform: scale(0.8);
          }
          
          .river-flow-1, .river-flow-2, .river-flow-3 {
            animation-duration: 15s;
          }
        }
      `}</style>
    </div>
  );
};

export default IndigenousRelations;