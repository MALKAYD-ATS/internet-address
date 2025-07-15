import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Plane, Shield, Award } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white transform transition-all duration-500 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="space-y-4 transform transition-all duration-500 hover:scale-105 sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-semibold text-blue-400">Aboriginal Training Services</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Keepers of the land, keepers of the data, and keepers of the environment. 
              Professional RPAS training with Indigenous excellence and land and environmental stewardship.
            </p>
            <div className="flex items-center space-x-3">
              <Plane className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">Professional RPAS Training</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 transform transition-all duration-500 hover:scale-105">
            <h3 className="text-lg font-semibold text-blue-400">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/training" className="text-gray-300 hover:text-white text-sm transition-colors duration-200 block py-1">Training Courses</Link></li>
              <li><Link to="/indigenous-relations" className="text-gray-300 hover:text-white text-sm transition-colors duration-200 block py-1">Indigenous Relations</Link></li>
              <li><Link to="/dashboard" className="text-gray-300 hover:text-white text-sm transition-colors duration-200 block py-1">Student Portal</Link></li>
              <li><a href="/#contact" className="text-gray-300 hover:text-white text-sm transition-colors duration-200 block py-1">Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4 transform transition-all duration-500 hover:scale-105">
            <h3 className="text-lg font-semibold text-blue-400">Our Focus</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <Award className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">RPAS Certification</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Environmental Protection</span>
              </li>
              <li className="flex items-start space-x-2">
                <Plane className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Land Stewardship</span>
              </li>
              <li className="flex items-start space-x-2">
                <Award className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Professional RPAS Regulations and Applications Training</span>
              </li>
              <li className="flex items-start space-x-2">
                <Shield className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">Customized Training</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 transform transition-all duration-500 hover:scale-105">
            <h3 className="text-lg font-semibold text-blue-400">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+1 (587) 524-0275</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm break-all">darcy@abtraining.ca</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-gray-300 text-sm">
                  <div className="flex items-start mb-1">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                    <span>Edmonton, Alberta, Canada</span>
                  </div>
                  <div className="flex items-start mb-1">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                    <span>Chicago, Illinois, USA</span>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                    <span>Karachi, Sindh, Pakistan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-gray-400 text-sm text-center sm:text-left">
              © 2025 Aboriginal Training Services. All rights reserved.
            </div>
            <div className="text-gray-400 text-sm text-center sm:text-right">
              Mapping the lands and protecting the environment
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;