import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertOctagon, RefreshCw, FileText, Download } from 'lucide-react';
import Certificate from './Certificate';
import html2canvas from 'html2canvas';

function normalizeResults(results) {
  const xaiReport = results?.xaiReport || {};
  const raw = results?.rawGeminiData || {};
  const rawDetection = raw?.detection || raw;
  const rawMatchDetails = raw?.matchDetails || raw?.matchDetailsRaw || raw?.varCheck || null;

  const summaryFromReasons = Array.isArray(rawDetection.reasons) ? rawDetection.reasons.join('. ') : '';
  const summary =
    xaiReport.summary ||
    results?.summary ||
    summaryFromReasons ||
    'Detailed analysis summary is unavailable for this run.';

  let details = Array.isArray(xaiReport.details) ? xaiReport.details : [];
  if (!details.length && Array.isArray(rawDetection.reasons)) {
    details = rawDetection.reasons.map((reason, index) => ({
      type: rawDetection.isFake ? 'Physics Anomaly (Gemini)' : 'Physics Check (Gemini)',
      description: reason,
      timestamp: Array.isArray(rawDetection.flaggedFrames) && rawDetection.flaggedFrames.length ? `Frames: ${rawDetection.flaggedFrames.join(',')}` : 'overall',
      severity: rawDetection.isFake ? 'Critical' : 'Pass',
      key: `reason-${index}`
    }));
  }

  const varDetails =
    results?.varCheck?.details ||
    rawMatchDetails ||
    null;

  return {
    verdict: results?.verdict || 'AUTHENTIC',
    confidenceScore: Number.isFinite(Number(results?.confidenceScore)) ? Number(results.confidenceScore) : 0,
    summary,
    details,
    manipulationType: xaiReport.manipulationType || rawDetection.manipulationType || 'Unknown',
    varCheck: {
      verified: Boolean(results?.varCheck?.verified),
      details: varDetails
    }
  };
}

function renderVarCheck(details) {
  if (!details) {
    return null;
  }

  const players = Array.isArray(details.playersIdentified) && details.playersIdentified.length
    ? details.playersIdentified.join(', ')
    : 'None identified';
  const suspicious = Array.isArray(details.suspiciousElements) && details.suspiciousElements.length
    ? details.suspiciousElements.join(' | ')
    : 'None noted';

  if (details.videoType === 'Match') {
    return (
      <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-xs">
        <div>Video Type: {details.videoType}</div>
        <div>Sport: {details.sport || 'Unknown'}</div>
        <div>Team 1: {details.team1 || 'Unknown'}</div>
        <div>Team 2: {details.team2 || 'Unknown'}</div>
        <div>Score: {details.score || 'Unknown'}</div>
        <div>Date: {details.date || 'Unknown'}</div>
        <div>Stadium: {details.stadium || 'Unknown'}</div>
        <div>Tournament: {details.tournament || 'Unknown'}</div>
        <div className="col-span-2">Players: {players}</div>
      </div>
    );
  }

  if (details.videoType === 'Training' || details.videoType === 'Celebration' || details.videoType === 'Highlight') {
    return (
      <div className="space-y-2 text-slate-300 font-mono text-xs">
        <div>Video Type: {details.videoType}</div>
        <div>Sport: {details.sport || 'Unknown'}</div>
        <div>Setting: {details.stadium || details.tournament || 'Unknown'}</div>
        <div>Players: {players}</div>
      </div>
    );
  }

  if (details.videoType === 'PressConference' || details.videoType === 'NonSportsContext') {
    return (
      <div className="space-y-2 text-slate-300 font-mono text-xs">
        <div>Video Type: {details.videoType}</div>
        <div>Sport: {details.sport || 'Unknown'}</div>
        <div>Context: {details.tournament || details.stadium || details.date || 'Unknown'}</div>
        <div>Suspicious Elements: {suspicious}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-slate-300 font-mono text-xs">
      <div>Video Type: {details.videoType || 'Unknown'}</div>
      <div>Suspicious Elements: {suspicious}</div>
    </div>
  );
}

export default function ResultsScreen({ result }) {
  const navigate = useNavigate();
  const dashboardRef = useRef(null);
  const certificateRef = useRef(null);

  if (!result) {
    return (
      <div className="text-center space-y-4">
        <p>No analysis data found.</p>
        <button onClick={() => navigate('/')} className="text-primary hover:underline">Go back home</button>
      </div>
    );
  }

  const { hash, results } = result;
  const normalized = normalizeResults(results);
  const isFake = normalized.verdict === 'MANIPULATED';
  const themeColor = isFake ? 'text-danger' : 'text-success';
  const ThemeIcon = isFake ? AlertOctagon : ShieldCheck;

  const handleDownloadCert = async () => {
      if(certificateRef.current) {
          // Capture the certificate as a high-res PNG
          const canvas = await html2canvas(certificateRef.current, { backgroundColor: '#0f172a', scale: 2 });
          const link = document.createElement("a");
          link.download = `AuthentiKit_Certificate_${hash}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
      }
  }

  const handleDownloadEvidence = async () => {
      if(dashboardRef.current) {
          // Capture the entire dashboard view as a high-res PNG evidence snapshot
          const canvas = await html2canvas(dashboardRef.current, { backgroundColor: '#0f172a', scale: 2 });
          const link = document.createElement("a");
          link.download = `AuthentiKit_Evidence_Report_${hash}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
      }
  }

  return (
    <div ref={dashboardRef} className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start p-4">
      
      {/* Left Column: Verdict & XAI Report */}
      <div className="space-y-6">
        <div className={`glass rounded-2xl p-8 border-t-4 ${isFake ? 'border-danger' : 'border-success'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-4 rounded-full ${isFake ? 'bg-danger/10' : 'bg-success/10'} ${themeColor}`}>
              <ThemeIcon size={48} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-mono tracking-wider">VERDICT</p>
              <h2 className={`text-4xl font-extrabold ${themeColor}`}>{normalized.verdict}</h2>
            </div>
          </div>
          
          <div className="bg-surface/50 rounded-xl p-6 border border-white/5 space-y-2">
             <div className="flex justify-between items-center mb-2">
               <span className="text-slate-300">Confidence Score</span>
               <span className="text-2xl font-bold">{normalized.confidenceScore}%</span>
             </div>
             <div className="w-full bg-slate-800 rounded-full h-2.5">
               <div className={`h-2.5 rounded-full ${isFake ? 'bg-danger' : 'bg-success'}`} style={{ width: `${normalized.confidenceScore}%` }}></div>
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
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-mono">GEMINI FLASH</span>
          </div>
          
          <p className="text-slate-300 text-sm leading-relaxed">{normalized.summary}</p>
          <div className="text-xs text-slate-500 font-mono">Manipulation Type: {normalized.manipulationType}</div>
          
          {/* VAR Details Box if present */}
          {normalized.varCheck && normalized.varCheck.details && (
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-xl text-sm mt-4">
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                     <ShieldCheck size={16} /> VAR Check
                  </h4>
                  {renderVarCheck(normalized.varCheck.details)}
                  <div className="mt-3 pt-3 border-t border-primary/20 space-y-1 text-slate-300 font-mono text-xs">
                    <div>Setting Looks Real: {normalized.varCheck.details.settingLooksReal ? 'Yes' : 'No'}</div>
                    <div>Context Matches Sport: {normalized.varCheck.details.contextMatchesSport ? 'Yes' : 'No'}</div>
                  </div>
              </div>
          )}

          <div className="space-y-4 mt-6 max-h-[360px] overflow-y-auto pr-2">
            {normalized.details.map((detail, idx) => (
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
            {!normalized.details.length && (
              <div className="bg-surface/50 p-4 rounded-xl border border-white/5 border-l-4 border-l-primary">
                <span className="font-semibold text-white">Physics Check</span>
                <p className="text-sm text-slate-400 mt-2">No detailed checkpoints were returned for this analysis run.</p>
                <div className="text-xs text-slate-500 font-mono mt-2">Timestamp: overall</div>
              </div>
            )}
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
      <div className="space-y-6 sticky top-8">
        {!isFake ? (
          <>
            <div ref={certificateRef}>
              <Certificate hash={hash} date={new Date().toLocaleDateString()} qrCode={results.certificate?.qrCode} manifest={results.certificate?.manifest} />
            </div>
            <button onClick={handleDownloadCert} className="w-full bg-success hover:bg-success/90 text-slate-900 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-success/20">
              <Download size={20} /> Download C2PA Certificate
            </button>
          </>
        ) : (
          <div className="min-h-[420px] glass rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-6 border border-danger/20 bg-danger/5">
            <div className="bg-danger/10 p-6 rounded-full">
              <AlertOctagon size={80} className="text-danger" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-danger mb-2">Certification Denied</h3>
              <p className="text-slate-400 leading-relaxed max-w-sm">This footage has been flagged as manipulated. A cryptographic certificate of authenticity cannot be issued.</p>
            </div>
            <button onClick={handleDownloadEvidence} className="mt-6 w-full max-w-xs glass hover:bg-danger/20 text-danger py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-danger/30">
               <Download size={18} /> Download Evidence Report
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
