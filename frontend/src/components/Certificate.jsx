import React from 'react';
import { Award, CheckCircle, Hash } from 'lucide-react';

export default function Certificate({ hash, date }) {
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
            <span className="text-xs font-bold uppercase tracking-widest">Verified</span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 flex-grow">
          <p className="text-slate-300 leading-relaxed">
            This digital certificate attests that the uploaded video footage has undergone rigorous analysis using multimodal AI and physics-based validation models. No signatures of digital manipulation, deepfake generation, or physics anomalies were detected.
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
                <p className="font-mono text-sm text-white">{date}</p>
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
            <div className="w-32 h-12 bg-white/5 rounded flex items-center justify-center font-serif text-slate-500 italic">
              Google AI Challenge
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Issuer</p>
            <p className="font-bold text-white">Team TriCoders</p>
          </div>
        </div>

      </div>
    </div>
  );
}
