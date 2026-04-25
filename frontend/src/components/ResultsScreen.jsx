import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertOctagon, RefreshCw, FileText, Download } from 'lucide-react';
import Certificate from './Certificate';

export default function ResultsScreen({ result }) {
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="text-center space-y-4">
        <p>No analysis data found.</p>
        <button onClick={() => navigate('/')} className="text-primary hover:underline">Go back home</button>
      </div>
    );
  }

  const { hash, results } = result;
  const isFake = results.verdict === 'MANIPULATED';
  const themeColor = isFake ? 'text-danger' : 'text-success';
  const ThemeIcon = isFake ? AlertOctagon : ShieldCheck;

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      
      {/* Left Column: Verdict & XAI Report */}
      <div className="space-y-6">
        <div className={`glass rounded-2xl p-8 border-t-4 ${isFake ? 'border-danger' : 'border-success'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-full ${isFake ? 'bg-danger/10' : 'bg-success/10'} ${themeColor}`}>
              <ThemeIcon size={48} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-mono tracking-wider">VERDICT</p>
              <h2 className={`text-4xl font-extrabold ${themeColor}`}>{results.verdict}</h2>
            </div>
          </div>
          
          <div className="bg-surface/50 rounded-xl p-6 border border-white/5 space-y-2">
             <div className="flex justify-between items-center mb-2">
               <span className="text-slate-300">Confidence Score</span>
               <span className="text-2xl font-bold">{results.confidenceScore}%</span>
             </div>
             <div className="w-full bg-slate-800 rounded-full h-2.5">
               <div className={`h-2.5 rounded-full ${isFake ? 'bg-danger' : 'bg-success'}`} style={{ width: `${results.confidenceScore}%` }}></div>
             </div>
          </div>
        </div>

        {/* Explainable AI Report */}
        <div className="glass rounded-2xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-primary" /> 
              XAI Analysis Report
            </h3>
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-mono">GEMINI + VISION</span>
          </div>
          
          <p className="text-slate-300 text-lg">{results.xaiReport.summary}</p>
          
          <div className="space-y-4 mt-6">
            {results.xaiReport.details.map((detail, idx) => (
              <div key={idx} className="bg-surface/50 p-4 rounded-xl border border-white/5 border-l-4 border-l-primary flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-white">{detail.type}</span>
                  <span className={`text-xs px-2 py-1 rounded font-mono ${detail.severity === 'Pass' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                    {detail.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{detail.description}</p>
                <div className="text-xs text-slate-500 font-mono">Timestamp: {detail.timestamp}</div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full glass hover:bg-white/5 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw size={20} /> Analyze Another Video
        </button>
      </div>

      {/* Right Column: Certificate (Only show if authentic) */}
      <div className="space-y-6">
        {!isFake ? (
          <>
            <Certificate hash={hash} date={new Date().toLocaleDateString()} />
            <button className="w-full bg-success hover:bg-success/90 text-slate-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-success/20">
              <Download size={20} /> Download C2PA Certificate
            </button>
          </>
        ) : (
          <div className="h-full glass rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 border border-danger/20 bg-danger/5">
            <AlertOctagon size={64} className="text-danger/50" />
            <h3 className="text-xl font-bold text-danger">Certification Denied</h3>
            <p className="text-slate-400">This footage has been flagged as manipulated. A cryptographic certificate of authenticity cannot be issued.</p>
          </div>
        )}
      </div>

    </div>
  );
}
