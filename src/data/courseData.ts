export interface CoursePrerequisites {
  age: string;
  experience: string;
  equipment: string;
  other: string[];
}

export interface CourseRequirements {
  documents: string[];
  equipment: string[];
  preparation: string[];
}

export interface CourseData {
  id: number;
  title: string;
  level: string;
  duration: string;
  capacity: string;
  description: string;
  features: string[];
  nextDate: string;
  prerequisites: CoursePrerequisites;
  requirements: CourseRequirements;
  isOnline?: boolean;
  price?: string;
  minimumAge: number;
}

export const getNextCourseDate = (courseTitle: string, isOnline: boolean = false): string => {
  const today = new Date();
  
  if (isOnline) {
    return `Available ${today.toLocaleDateString()}`;
  }
  
  // For in-person courses
  const duration = courseTitle.toLowerCase();
  let targetDay: number;
  
  if (duration.includes('5') || duration.includes('6') || duration.includes('advanced') || duration.includes('complex')) {
    // 5-6 day courses start on Monday (1)
    targetDay = 1;
  } else {
    // 2-3 day courses start on Monday (1) or Wednesday (3)
    const weekNumber = Math.floor(today.getTime() / (7 * 24 * 60 * 60 * 1000));
    targetDay = weekNumber % 2 === 0 ? 1 : 3; // Alternate between Monday and Wednesday
  }
  
  const daysUntilTarget = (targetDay + 7 - today.getDay()) % 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
  
  return nextDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export const regulationCourses: CourseData[] = [
  {
    id: 1,
    title: "Drone Pilot Certificate – Basic Operations (Online)",
    level: "Beginner",
    duration: "Self-paced",
    capacity: "20 students",
    description: "Essential online regulation training covering professional RPAS regulations, safety protocols, and basic compliance requirements.",
    features: [
      "Transport Canada RPAS Basic Certificate preparation",
      "Comprehensive online learning modules",
      "Aviation regulations and airspace knowledge",
      "Safety protocols and risk management",
      "Weather interpretation for drone operations",
      "Emergency procedures and incident reporting",
      "Final examination and certification support"
    ],
    nextDate: getNextCourseDate("Basic Operations (Online)", true),
    isOnline: true,
    price: "USD $99",
    minimumAge: 14,
    prerequisites: {
      age: "14 years minimum",
      experience: "No prior experience required",
      equipment: "Computer with internet access",
      other: ["Valid government ID", "Basic English proficiency"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Proof of age"],
      equipment: ["Computer or tablet", "Reliable internet connection", "Headphones recommended"],
      preparation: ["Create online account", "Review course materials", "Prepare quiet study space"]
    }
  },
  {
    id: 2,
    title: "Drone Pilot Certificate – Basic Operations (In-Person)",
    level: "Beginner",
    duration: "1 Day",
    capacity: "15 students",
    description: "In-person regulation training with hands-on instruction covering professional RPAS regulations and safety protocols.",
    features: [
      "Transport Canada RPAS Basic Certificate preparation",
      "Face-to-face expert instruction",
      "Interactive learning and group discussions",
      "Aviation regulations and airspace knowledge",
      "Safety protocols and risk management procedures",
      "Weather interpretation and flight planning",
      "Written examination with instructor support"
    ],
    nextDate: getNextCourseDate("Basic Operations (In-Person)"),
    minimumAge: 14,
    prerequisites: {
      age: "14 years minimum",
      experience: "No prior experience required",
      equipment: "All equipment provided",
      other: ["Valid government ID", "Basic English proficiency"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Proof of age"],
      equipment: ["Notepad and pen", "Weather-appropriate clothing"],
      preparation: ["Arrive 15 minutes early", "Bring lunch or meal money", "Review pre-course materials"]
    }
  },
  {
    id: 3,
    title: "Drone Pilot Certificate – Advanced Operations (Online)",
    level: "Advanced",
    duration: "Self-paced",
    capacity: "15 students",
    description: "Comprehensive online regulation training for advanced VLOS operations including complex airspace and night operations.",
    features: [
      "Transport Canada RPAS Advanced Certificate preparation",
      "Complex airspace operations and controlled airspace procedures",
      "Night flight operations and lighting requirements",
      "Advanced risk assessment and mitigation strategies",
      "Commercial operations planning and documentation",
      "Advanced weather interpretation and decision making",
      "Comprehensive examination and certification support"
    ],
    nextDate: getNextCourseDate("Advanced Operations (Online)", true),
    isOnline: true,
    price: "USD $249",
    minimumAge: 16,
    prerequisites: {
      age: "16 years minimum",
      experience: "Basic RPAS certificate required",
      equipment: "Computer with internet access",
      other: ["Valid government ID", "Basic RPAS certification"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Basic RPAS certificate", "Flight log (if applicable)"],
      equipment: ["Computer or tablet", "Reliable internet connection", "Calculator"],
      preparation: ["Review basic regulations", "Complete prerequisite modules", "Prepare study schedule"]
    }
  },
  {
    id: 4,
    title: "Drone Pilot Certificate – Advanced Operations (In-Person)",
    level: "Advanced",
    duration: "3 Days",
    capacity: "12 students",
    description: "In-person advanced regulation training for VLOS operations with expert instruction and interactive learning.",
    features: [
      "Transport Canada RPAS Advanced Certificate preparation",
      "Complex airspace operations and controlled airspace procedures",
      "Night flight operations and lighting requirements",
      "Advanced risk assessment and mitigation strategies",
      "Commercial operations planning and documentation",
      "Interactive workshops and case study analysis",
      "Comprehensive examination with instructor guidance"
    ],
    nextDate: getNextCourseDate("Advanced Operations (In-Person)"),
    minimumAge: 16,
    prerequisites: {
      age: "16 years minimum",
      experience: "Basic RPAS certificate required",
      equipment: "All equipment provided",
      other: ["Valid government ID", "Basic RPAS certification"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Basic RPAS certificate", "Flight log"],
      equipment: ["Notepad and pen", "Calculator", "Weather-appropriate outdoor clothing"],
      preparation: ["Review basic regulations", "Bring flight log", "Prepare for practical exercises"]
    }
  },
  {
    id: 5,
    title: "Flight Review – Advanced Operations",
    level: "Review",
    duration: "2 Hours",
    capacity: "8 students",
    description: "Refresher course for advanced pilots to maintain skills and stay current with regulations.",
    features: [
      "Regulation updates and changes review",
      "Skills assessment and performance evaluation",
      "Advanced maneuvers and procedures review",
      "Safety protocol refresh and best practices",
      "Current industry standards and compliance",
      "Certification renewal documentation",
      "Personalized feedback and recommendations"
    ],
    nextDate: "Ongoing - Contact for scheduling",
    minimumAge: 16,
    prerequisites: {
      age: "16 years minimum",
      experience: "Advanced RPAS certificate required",
      equipment: "Personal drone recommended",
      other: ["Valid government ID", "Advanced RPAS certification"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Current flight log"],
      equipment: ["Personal drone (if available)", "Flight log", "Weather-appropriate clothing"],
      preparation: ["Review recent flight experience", "Update flight log", "Prepare questions"]
    }
  },
  {
    id: 6,
    title: "Drone Pilot Certificate – Level 1 Complex Operations",
    level: "Expert",
    duration: "5 Days",
    capacity: "8 students",
    description: "Expert-level regulation training for complex commercial operations and specialized applications.",
    features: [
      "Transport Canada Level 1 Complex Operations certification",
      "BVLOS (Beyond Visual Line of Sight) operations procedures",
      "Complex risk assessment and safety management systems",
      "Advanced commercial operation compliance and documentation",
      "Specialized application regulations and requirements",
      "Expert-level examination and practical assessments",
      "Professional certification and industry recognition"
    ],
    nextDate: getNextCourseDate("Level 1 Complex Operations"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Advanced RPAS certificate + 100 flight hours",
      equipment: "Professional-grade drone required",
      other: ["Valid government ID", "Advanced RPAS certification", "Commercial insurance"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Detailed flight log", "Insurance documentation"],
      equipment: ["Professional drone", "Comprehensive flight log", "Weather monitoring equipment"],
      preparation: ["Complete pre-course assessment", "Review complex airspace regulations", "Prepare portfolio"]
    }
  },
  {
    id: 7,
    title: "Basic (Application)",
    level: "Beginner",
    duration: "2 Days",
    capacity: "12 students",
    description: "Hands-on application training covering basic flight operations, equipment handling, and practical drone applications.",
    features: [
      "Hands-on flight training",
      "Equipment familiarization",
      "Basic photography and videography",
      "Flight planning and execution",
      "Practical examinations",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Basic (Application)"),
    minimumAge: 14,
    prerequisites: {
      age: "14 years minimum",
      experience: "Basic RPAS certificate recommended",
      equipment: "All equipment provided",
      other: ["Valid government ID", "Physical fitness for outdoor activities"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "RPAS certificate (if available)"],
      equipment: ["Weather-appropriate outdoor clothing", "Closed-toe shoes", "Sun protection"],
      preparation: ["Review basic flight principles", "Prepare for outdoor activities", "Bring lunch"]
    }
  },
  {
    id: 8,
    title: "Advanced + Hands-On",
    level: "Advanced",
    duration: "5 Days",
    capacity: "10 students",
    description: "Comprehensive hands-on training combining advanced flight techniques with practical commercial applications.",
    features: [
      "Advanced flight maneuvers",
      "Commercial application training",
      "Equipment maintenance",
      "Mission planning",
      "Real-world project execution",
      "Portfolio development",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Advanced + Hands-On"),
    minimumAge: 16,
    prerequisites: {
      age: "16 years minimum",
      experience: "Advanced RPAS certificate required",
      equipment: "Personal drone recommended",
      other: ["Valid government ID", "Advanced RPAS certification"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Flight log"],
      equipment: ["Personal drone (optional)", "Weather-appropriate clothing", "Laptop/tablet"],
      preparation: ["Review advanced flight techniques", "Prepare project ideas", "Update flight log"]
    }
  },
  {
    id: 9,
    title: "Complex Hands-On",
    level: "Expert",
    duration: "6 Days",
    capacity: "8 students",
    description: "Expert-level hands-on training for complex operations including specialized equipment and advanced applications.",
    features: [
      "Complex mission execution",
      "Specialized equipment operation",
      "Advanced data collection",
      "Multi-platform operations",
      "Emergency procedures",
      "Professional certification",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Complex Hands-On"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Advanced RPAS + 50 flight hours",
      equipment: "Professional-grade drone required",
      other: ["Valid government ID", "Advanced certification", "Commercial experience"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Detailed flight log", "Portfolio"],
      equipment: ["Professional drone", "Specialized sensors", "Data processing laptop"],
      preparation: ["Complete pre-assessment", "Prepare equipment", "Review complex procedures"]
    }
  }
];

export const applicationCourses: CourseData[] = [
  {
    id: 10,
    title: "Mapping & Surveying (Beginners)",
    level: "Beginner",
    duration: "2 Days",
    capacity: "10 students",
    description: "Introduction to drone mapping and surveying applications for beginners with no prior experience.",
    features: [
      "Basic mapping principles",
      "Survey planning basics",
      "Data collection fundamentals",
      "Software introduction",
      "Basic analysis techniques",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Mapping & Surveying (Beginners)"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Basic RPAS certificate required",
      equipment: "All equipment provided",
      other: ["Valid government ID", "Basic computer skills"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "RPAS certificate"],
      equipment: ["Laptop (recommended)", "Weather-appropriate clothing", "Notepad"],
      preparation: ["Review basic mapping concepts", "Install recommended software", "Prepare for field work"]
    }
  },
  {
    id: 11,
    title: "LIDAR",
    level: "Professional",
    duration: "2 Days",
    capacity: "8 students",
    description: "Specialized training in LIDAR technology for advanced surveying and mapping applications.",
    features: [
      "LIDAR technology overview",
      "Point cloud data collection",
      "Advanced processing techniques",
      "3D modeling applications",
      "Professional software training",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("LIDAR"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Advanced RPAS + mapping experience",
      equipment: "LIDAR-equipped drone access",
      other: ["Valid government ID", "Advanced certification", "Mapping background"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Mapping portfolio"],
      equipment: ["High-performance laptop", "LIDAR processing software", "External storage"],
      preparation: ["Review LIDAR principles", "Install processing software", "Prepare data samples"]
    }
  },
  {
    id: 12,
    title: "Photogrammetry",
    level: "Professional",
    duration: "2 Days",
    capacity: "10 students",
    description: "Advanced photogrammetry techniques for creating accurate 3D models and maps from aerial imagery.",
    features: [
      "Photogrammetry principles",
      "Image acquisition techniques",
      "3D reconstruction methods",
      "Accuracy assessment",
      "Professional workflow",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Photogrammetry"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Advanced RPAS + photography experience",
      equipment: "High-resolution camera drone",
      other: ["Valid government ID", "Advanced certification", "Photography skills"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Photography portfolio"],
      equipment: ["High-resolution camera drone", "Processing laptop", "Memory cards"],
      preparation: ["Review photogrammetry basics", "Prepare camera settings", "Install software"]
    }
  },
  {
    id: 13,
    title: "Thermal Inspection",
    level: "Professional",
    duration: "2 Days",
    capacity: "8 students",
    description: "Specialized thermal imaging applications for infrastructure inspection and analysis.",
    features: [
      "Thermal imaging principles",
      "Equipment operation",
      "Inspection techniques",
      "Data analysis methods",
      "Report generation",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Thermal Inspection"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Advanced RPAS + inspection experience",
      equipment: "Thermal camera drone access",
      other: ["Valid government ID", "Advanced certification", "Technical background"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Technical qualifications"],
      equipment: ["Thermal imaging drone", "Analysis software", "Calibration equipment"],
      preparation: ["Review thermal principles", "Study inspection standards", "Prepare case studies"]
    }
  },
  {
    id: 14,
    title: "Real Estate",
    level: "Professional",
    duration: "2 Days",
    capacity: "12 students",
    description: "Specialized training for real estate photography and marketing applications.",
    features: [
      "Real estate photography techniques",
      "Marketing video production",
      "Client consultation skills",
      "Legal considerations",
      "Business development",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Real Estate"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Basic RPAS + photography interest",
      equipment: "Camera-equipped drone",
      other: ["Valid government ID", "RPAS certification", "Photography interest"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "RPAS certificate", "Business license (if applicable)"],
      equipment: ["Camera drone", "Editing software", "Portfolio materials"],
      preparation: ["Review real estate photography", "Prepare sample work", "Study market rates"]
    }
  },
  {
    id: 15,
    title: "Construction",
    level: "Professional",
    duration: "2 Days",
    capacity: "10 students",
    description: "Construction industry applications including progress monitoring and site surveying.",
    features: [
      "Construction monitoring techniques",
      "Progress documentation",
      "Site surveying methods",
      "Safety compliance",
      "Stakeholder reporting",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Construction"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Advanced RPAS + construction background",
      equipment: "Professional survey drone",
      other: ["Valid government ID", "Advanced certification", "Construction experience"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Construction credentials"],
      equipment: ["Survey-grade drone", "Safety equipment", "Reporting software"],
      preparation: ["Review construction standards", "Study safety protocols", "Prepare site plans"]
    }
  },
  {
    id: 16,
    title: "Photo/Video",
    level: "Professional",
    duration: "2 Days",
    capacity: "12 students",
    description: "Professional aerial photography and videography for commercial and artistic applications.",
    features: [
      "Advanced camera techniques",
      "Cinematic video production",
      "Post-processing workflows",
      "Creative composition",
      "Client delivery methods",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Photo/Video"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Basic RPAS + photography/video interest",
      equipment: "High-quality camera drone",
      other: ["Valid government ID", "RPAS certification", "Creative portfolio"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "RPAS certificate", "Creative portfolio"],
      equipment: ["Professional camera drone", "Editing software", "Storage devices"],
      preparation: ["Review cinematography basics", "Prepare creative samples", "Install editing software"]
    }
  },
  {
    id: 17,
    title: "Apprenticeship Program Advanced",
    level: "Expert",
    duration: "5 Days",
    capacity: "6 students",
    description: "Advanced apprenticeship program for specialized application training. This is essentially an advanced program for any of the application courses, with only one application taught per program.",
    features: [
      "Specialized single-application focus",
      "Advanced project management",
      "Professional mentorship",
      "Industry networking",
      "Career development",
      "Certification pathway",
      "Certificate of Completion"
    ],
    nextDate: getNextCourseDate("Apprenticeship Program Advanced"),
    minimumAge: 18,
    prerequisites: {
      age: "18 years minimum",
      experience: "Advanced RPAS + 200 flight hours",
      equipment: "Professional equipment suite",
      other: ["Valid government ID", "Advanced certification", "Professional references"]
    },
    requirements: {
      documents: ["Government-issued photo ID", "Advanced RPAS certificate", "Comprehensive flight log", "Professional references"],
      equipment: ["Professional drone suite", "Specialized sensors", "Processing workstation"],
      preparation: ["Complete comprehensive assessment", "Prepare professional portfolio", "Submit career goals"]
    }
  }
];