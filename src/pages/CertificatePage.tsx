import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CertificateDisplay from '../components/CertificateDisplay';

const CertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();

  if (!certificateId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Certificate Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-2 rounded-lg transition-all"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <CertificateDisplay certificateId={certificateId} />;
};

export default CertificatePage;
