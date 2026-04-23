import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Video, AlertCircle } from 'lucide-react';

export default function UploadScreen({ setVideoFile }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError("Please upload a valid video file.");
      return;
    }
    // Set max size 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError("Video file is too large. Max size is 50MB.");
      return;
    }
    
    setVideoFile(file);
    navigate('/analyze');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">AI Powered <span className="text-primary">VAR Integrity</span></h1>
        <p className="text-slate-400 text-lg">Upload sports footage to instantly detect anomalies, physics violations, and deepfakes.</p>
      </div>

      <div 
        className={`glass rounded-2xl p-12 text-center transition-all duration-200 border-2 border-dashed ${dragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-white/20 hover:border-primary/50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          accept="video/*" 
          onChange={handleChange} 
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-6">
          <div className="p-4 bg-primary/20 rounded-full text-primary">
            <UploadCloud size={48} />
          </div>
          <div>
            <p className="text-xl font-medium mb-2">Drag and drop your video here</p>
            <p className="text-slate-400 text-sm">MP4, MOV, AVI up to 50MB</p>
          </div>
          <div className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center gap-2">
            <Video size={20} />
            Browse Files
          </div>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-3 text-danger bg-danger/10 border border-danger/20 p-4 rounded-xl">
          <AlertCircle size={24} />
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
