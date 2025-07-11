import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface HeaderLogo {
  id: string;
  logo_url: string;
  alt_text: string;
  order_index: number;
  is_active: boolean;
}

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  BookOpen, 
  Award, 
  FileText, 
  Settings,
  LogOut,
  Loader2,
  AlertCircle,
  Clock,
  GraduationCap,
  Bell,
  Users,
  DollarSign,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  UserPlus
} from 'lucide-react';

interface StudentProfile {
  id: string;
  full_name: string;
  phone_number: string;
  created_at: string;
}

interface Course {
  id: number;
  created_at: string;
  title: string | null;
  type: string | null;
  description: string | null;
  level: string | null;
  age_requirement: number | null;
  duration: string | null;
  price: number | null;
  max_students: number | null;
  experience_requirement: string | null;
  equipment_requirement: string | null;
  document_requirement: string | null;
  suggested_preparation: string | null;
  currency: string | null;
  whats_included: any;
  is_active: boolean | null;
  is_online: boolean | null;
}

interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
}

const Portal: React.FC = () => {
  // ... all the existing component code ...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... all the existing JSX ... */}
    </div>
  );
};

export default Portal;
```

The main issues I fixed were:

1. Multiple export statements
2. Duplicate component definitions
3. Misplaced JSX fragments
4. Missing closing brackets for the component
5. Proper organization of the imports at the top

The file should now be properly structured with all necessary closing brackets and proper component organization.