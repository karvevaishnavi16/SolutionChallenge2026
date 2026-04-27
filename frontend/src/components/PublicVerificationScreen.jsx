import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, AlertOctagon, Loader2, PlayCircle, ExternalLink } from 'lucide-react';

export default function PublicVerificationScreen() {
  const { hash } = useParams();
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const API_BASE = isLocalhost ? 'http://localhost:5000' : 'https://authentikit-backend-705987336498.us-central1.run.app';
        
        const response = await axios.get(`${API_BASE}/api/verify/${hash}`);
        setRecord(response.data.record);
      } catch (err) {
        console.error('Failed to fetch record:', err);
        setError('Verification record not found or invalid hash.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [hash]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-300">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p>Loading verification record...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="bg-slate-800/50 border border-red-500/30 rounded-2xl p-8 max-w-lg w-full text-center">
        <AlertOctagon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Record Not Found</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <Link to="/" className="text-primary hover:text-primary-light transition-colors">
          Return to AuthentiKit Home
        </Link>
      </div>
    );
  }

  const isAuthentic = record.results.verdict === 'AUTHENTIC';

  return (
    <div className="max-w-2xl w-full">
      <div className={`glass rounded-3xl overflow-hidden border-2 ${isAuthentic ? 'border-green-500/30' : 'border-red-500/30'}`}>
        
        {/* Header */}
        <div className={`p-8 text-center border-b ${isAuthentic ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          {isAuthentic ? (
            <ShieldCheck className="w-20 h-20 text-green-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
          ) : (
            <AlertOctagon className="w-20 h-20 text-red-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {isAuthentic ? 'Verified Authentic Video' : 'Manipulated Video Detected'}
          </h1>
          <p className="text-slate-300 font-mono text-sm bg-slate-900/50 py-1 px-3 rounded-full inline-block">
            {record.hash}
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
          {/* Video Preview */}
          {record.videoUrl && (
            <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700/50 aspect-video relative flex items-center justify-center">
               <video src={record.videoUrl} controls className="w-full h-full object-contain bg-black" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">Original Filename</p>
              <p className="font-semibold text-slate-200 truncate">{record.fileName}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">Verification Date</p>
              <p className="font-semibold text-slate-200">
                {record.createdAt ? new Date(record.createdAt._seconds * 1000).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-4">AI Analysis Summary</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              {record.results.xaiReport.summary}
            </p>
            
            <div className="space-y-2 mt-4">
              {record.results.xaiReport.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${detail.severity === 'Critical' ? 'bg-red-500' : detail.severity === 'Warning' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{detail.type}</p>
                    <p className="text-sm text-slate-400">{detail.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
