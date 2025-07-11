import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Award, Download, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react';

interface Certificate {
  id: string;
  course_id: string;
  certificate_url: string;
  issued_at: string;
  course_title: string;
}

interface CertificateManagerProps {
  className?: string;
}

const CertificateManager: React.FC<CertificateManagerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('student_certificates')
        .select(`
          id,
          course_id,
          certificate_url,
          issued_at,
          courses_ats!inner(title)
        `)
        .eq('student_id', user.id)
        .eq('is_revoked', false)
        .order('issued_at', { ascending: false });

      if (error) throw error;

      const formattedCertificates = data?.map(cert => ({
        id: cert.id,
        course_id: cert.course_id,
        certificate_url: cert.certificate_url,
        issued_at: cert.issued_at,
        course_title: (cert.courses_ats as any)?.title || 'Unknown Course'
      })) || [];

      setCertificates(formattedCertificates);
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificateUrl: string, courseTitle: string) => {
    const link = document.createElement('a');
    link.href = certificateUrl;
    link.download = `${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Award className="h-6 w-6 mr-2 text-blue-600" />
          My Certificates
        </h2>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading certificates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Award className="h-6 w-6 mr-2 text-blue-600" />
          My Certificates
        </h2>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error Loading Certificates</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={fetchCertificates}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Award className="h-6 w-6 mr-2 text-blue-600" />
        My Certificates
      </h2>
      
      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
          <p className="text-gray-600 mb-4">
            Complete courses to earn your professional drone certifications.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-center">
              <Award className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Certificates are automatically issued upon course completion</span>
            </div>
            <p className="text-green-700 text-sm mt-2">
              Complete all modules and pass the final exam to receive your certificate.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {certificate.course_title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Issued: {formatDate(certificate.issued_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Award className="h-3 w-3 mr-1" />
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => window.open(certificate.certificate_url, '_blank')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => handleDownload(certificate.certificate_url, certificate.course_title)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificateManager;