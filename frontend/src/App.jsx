import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import UploadScreen from './components/UploadScreen';
import AnalysisScreen from './components/AnalysisScreen';
import ResultsScreen from './components/ResultsScreen';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck size={32} />
          <span className="text-2xl font-bold text-white tracking-tight">Authenti<span className="text-primary">Kit</span></span>
        </div>
        <div className="text-sm text-slate-400">Ctrl+AI+Win</div>
      </header>
      <main className="flex-grow flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<UploadScreen setVideoFile={setVideoFile} />} />
          <Route path="/analyze" element={<AnalysisScreen videoFile={videoFile} setAnalysisResult={setAnalysisResult} />} />
          <Route path="/results" element={<ResultsScreen result={analysisResult} />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
