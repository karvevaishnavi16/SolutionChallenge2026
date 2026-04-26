import React from 'react';
import { Award, CheckCircle, Hash } from 'lucide-react';

export default function Certificate({ hash, date, qrCode, manifest }) {
  const verdict = manifest?.verdict || 'AUTHENTIC';
  const isAuthentic = verdict === 'AUTHENTIC';

  return (
    <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-1 overflow-hidden shadow-2xl">
      {/* Decorative border gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-success/40 via-primary/20 to-transparent opacity-50"></div>
      
      {/* Inner Content */}
      <div className="relative bg-slate-900 rounded-xl p-10 border border-white/10 h-full flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Award size={28} />
              <span className="text-xl font-bold tracking-widest uppercase">AuthentiKit</span>
            </div>
            <h3 className="text-2xl font-serif text-white">Certificate of Authenticity</h3>
          </div>
          <div className="text-success flex flex-col items-center">
            <CheckCircle size={40} className="mb-1" />
            <span className="text-xs font-bold uppercase tracking-widest">{isAuthentic ? 'Verified' : verdict}</span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 flex-grow">
          <p className="text-slate-300 leading-relaxed">
            This digital certificate records the analysis result for the uploaded video using multimodal AI and forensic review. The certificate reflects the actual backend verdict and metadata for this file.
          </p>

          <div className="bg-surface p-4 rounded-lg border border-white/5 space-y-3">
            <div>
              <p className="text-xs text-slate-500 font-mono uppercase">Cryptographic Video Hash (SHA-256)</p>
              <div className="flex items-center gap-2 mt-1">
                <Hash size={16} className="text-primary" />
                <p className="font-mono text-sm text-slate-300 break-all">{hash}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div>
                <p className="text-xs text-slate-500 font-mono uppercase">Verification Date</p>
                <p className="font-mono text-sm text-white">{manifest?.timestamp ? new Date(manifest.timestamp).toLocaleDateString() : date}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-mono uppercase">Verification Standard</p>
                <p className="font-mono text-sm text-white">C2PA / AI Solution</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
          <div>
             {qrCode ? (
               <img src={qrCode} alt="Verification QR Code" className="w-24 h-24 rounded-lg border-2 border-white/10" />
             ) : (
                <div className="w-24 h-24 bg-white/5 rounded flex items-center justify-center font-serif text-slate-500 italic text-xs text-center p-2">
                  QR Code Unavailable
                </div>
             )}
          </div>
          <div className="text-right flex flex-col justify-end">
             <div className="mb-2">
                <p className="text-xs text-slate-500 uppercase tracking-widest">Issuer</p>
                <p className="font-bold text-white">{manifest?.issuer || "Ctrl+AI+Win"}</p>
             </div>
             <div>
                <span className="text-[10px] text-slate-600 uppercase tracking-widest block">Google Solution Challenge</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
