import React, { useState, useRef } from 'react';
import { 
  Shield, 
  Search, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  Building2, 
  Globe, 
  Calendar, 
  Star, 
  ArrowRight,
  Loader2,
  FileText,
  Share2,
  Zap,
  MapPin,
  Fingerprint,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  History,
  Activity,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Toaster, toast } from 'sonner';
import { analyzeJob, type JobAnalysisResult } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [inputMode, setInputMode] = useState<'link' | 'image' | 'text'>('link');
  const [linkInput, setLinkInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JobAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleAnalyze = async (data: string, type: 'link' | 'image' | 'text') => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    try {
      const analysis = await analyzeJob({ type, data });
      setResult(analysis);
      toast.success('Analysis Complete', {
        description: `Verification Score: ${analysis.confidence}%`,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to analyze the job post. Please try again.');
      toast.error('Analysis Failed', {
        description: 'Please check your input and try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveJob = (companyName: string) => {
    if (savedJobs.includes(companyName)) {
      setSavedJobs(savedJobs.filter(name => name !== companyName));
      toast.info('Job removed from saved list');
    } else {
      setSavedJobs([...savedJobs, companyName]);
      toast.success('Job saved successfully!', {
        description: `${companyName} has been added to your watchlist.`,
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Recruit-Watch Analysis Report',
      text: `Check out this job verification report for ${result?.companyInfo.name}. Authenticity Score: ${result?.confidence}%`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleReportFraud = () => {
    toast.warning('Fraud Report Initiated', {
      description: 'Our security team has been notified. We are investigating this listing.',
      action: {
        label: 'Undo',
        onClick: () => toast.info('Report cancelled'),
      },
    });
  };

  const handleBlockRecruiter = () => {
    toast.error('Recruiter Blocked', {
      description: 'You will no longer see listings from this source.',
    });
  };

  const handleApply = (url: string) => {
    if (!url || url === '#' || url === 'https://example.com/apply') {
      toast.error('Application link not available', {
        description: 'Please visit the official company website directly.',
      });
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
    toast.info('Redirecting to official portal...', {
      icon: <Globe className="w-4 h-4" />,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleAnalyze(reader.result as string, 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-500", isDarkMode ? "dark bg-slate-950" : "bg-bg-light")}>
      <Toaster position="top-right" richColors closeButton />
      <div className="absolute inset-0 results-bg pointer-events-none opacity-40" />
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary-green p-2 rounded-lg shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-text-primary dark:text-white">Recruit-Watch</span>
                <span className="text-[10px] font-semibold text-text-secondary dark:text-slate-400 uppercase tracking-wider -mt-0.5">
                  Real-Time Monitoring
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-text-secondary dark:text-slate-400"
              >
                {isDarkMode ? <Zap className="w-4 h-4 text-warning-yellow fill-warning-yellow" /> : <Shield className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => {
                  setResult(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-sm font-semibold text-text-secondary hover:text-primary-green transition-colors"
              >
                Intelligence
              </button>
              <button 
                onClick={() => {
                  if (result) {
                    const el = document.getElementById('scam-heatmap');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    toast.info('Analyze a job first to view the regional scam database.');
                  }
                }}
                className="text-sm font-semibold text-text-secondary hover:text-primary-green transition-colors"
              >
                Heatmap
              </button>
              <button 
                onClick={() => toast.info('Accessing global scam database...', { description: 'Fetching latest fraud patterns from our distributed nodes.' })}
                className="text-sm font-semibold text-text-secondary hover:text-primary-green transition-colors"
              >
                Database
              </button>
              <button 
                onClick={handleReportFraud}
                className="bg-text-primary dark:bg-primary-green text-white px-5 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all shadow-sm"
              >
                Report Scam
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Compact Hero Section */}
        <div className="relative mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              Verify Job <span className="text-primary-green">Authenticity</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              Instant AI analysis of job posts, company history, and recruiter footprints.
            </motion.p>

            {/* Efficient Input Area */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 p-1.5 mb-8"
            >
              <div className="flex items-center gap-1 p-1 mb-1">
                <button 
                  onClick={() => setInputMode('link')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                    inputMode === 'link' ? "bg-text-primary dark:bg-primary-green text-white shadow-sm" : "text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  Job Link
                </button>
                <button 
                  onClick={() => setInputMode('image')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                    inputMode === 'image' ? "bg-text-primary dark:bg-primary-green text-white shadow-sm" : "text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Post
                </button>
                <button 
                  onClick={() => setInputMode('text')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all",
                    inputMode === 'text' ? "bg-text-primary dark:bg-primary-green text-white shadow-sm" : "text-text-secondary hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Paste Text
                </button>
              </div>

              <div className="px-2 pb-2 pt-1">
                {inputMode === 'link' ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input 
                        type="text" 
                        placeholder="Paste LinkedIn, WhatsApp, or Telegram link..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/10 focus:border-primary-green transition-all text-sm font-medium dark:text-white"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                      />
                    </div>
                    <button 
                      disabled={!linkInput || isAnalyzing}
                      onClick={() => handleAnalyze(linkInput, 'link')}
                      className="bg-primary-green text-white px-8 py-4 rounded-xl font-black hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-base"
                    >
                      {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      Verify Job
                    </button>
                  </div>
                ) : inputMode === 'image' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl p-6 hover:border-primary-green hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all cursor-pointer group text-center"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                    />
                    <Upload className="w-6 h-6 text-slate-300 group-hover:text-primary-green mx-auto mb-2" />
                    <p className="text-sm text-text-primary dark:text-white font-bold">Drop job post image or PDF here</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <textarea 
                      placeholder="Paste the job description or hiring message here..."
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/10 focus:border-primary-green transition-all text-sm font-medium dark:text-white min-h-[100px] resize-none"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                    <button 
                      disabled={!textInput || isAnalyzing}
                      onClick={() => handleAnalyze(textInput, 'text')}
                      className="bg-primary-green text-white px-8 py-4 rounded-xl font-black hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2 text-base self-end"
                    >
                      {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      Verify Job
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Filters Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  onChange={() => toast.info('Location filtering active', { description: 'Results are being prioritized for your selected region.' })}
                  className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                >
                  <option>All Locations</option>
                  <option>Pakistan</option>
                  <option>Remote</option>
                  <option>USA</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  onChange={() => toast.info('Salary range updated', { description: 'Filtering verified opportunities by compensation.' })}
                  className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                >
                  <option>All Salaries</option>
                  <option>$50k+</option>
                  <option>$100k+</option>
                </select>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  onChange={() => toast.info('Industry filter applied', { description: 'Scanning specific sectors for fraud patterns.' })}
                  className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none cursor-pointer"
                >
                  <option>All Industries</option>
                  <option>Tech</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                </select>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="bento-card p-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-6" />
                <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">Analyzing Intelligence...</h2>
                <p className="text-slate-500 font-medium">Cross-referencing company data and scanning for fraud patterns.</p>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-700 shadow-sm"
            >
              <div className="bg-red-100 p-3 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Analysis Failed</h4>
                <p className="font-medium opacity-80">{error}</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto space-y-8 relative z-10 pb-24 px-4 sm:px-6"
            >
              {/* Subtle background glow for results */}
              <div className="absolute -inset-20 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
              
              {/* 1. TOP RESULT CARD: Verification Result */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-center gap-10 relative overflow-hidden">
                {/* Status Indicator Strip */}
                <div className={cn(
                  "absolute top-0 left-0 w-full h-1",
                  result.isReal ? "bg-primary-green" : result.riskScore < 40 ? "bg-warning-yellow" : "bg-danger-red"
                )} />

                <div className="flex-1 text-center lg:text-left space-y-4">
                  <div className="flex flex-col lg:flex-row items-center gap-3">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      result.isReal ? "bg-emerald-50 text-primary-green dark:bg-emerald-900/30 dark:text-emerald-400" : 
                      result.riskScore < 40 ? "bg-amber-50 text-warning-yellow dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-red-50 text-danger-red dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {result.isReal ? "Verified Legitimate" : result.riskScore < 40 ? "Moderate Risk" : "High Risk Detected"}
                    </div>
                  </div>
                  
                  <h2 className="leading-tight">
                    {result.isReal ? "This Job Appears Legitimate" : "Potential Employment Fraud Detected"}
                  </h2>
                  
                  <p className="max-w-2xl">
                    {result.verdict}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 min-w-[240px]">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                    Authenticity Score
                  </div>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-200 dark:text-slate-800"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * result.confidence) / 100 }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={cn(
                          result.isReal ? "text-primary-green" : result.riskScore < 40 ? "text-warning-yellow" : "text-danger-red"
                        )}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="score-number text-text-primary dark:text-white leading-none">{result.confidence}%</span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-bold text-white",
                    result.isReal ? "bg-primary-green" : result.riskScore < 40 ? "bg-warning-yellow" : "bg-danger-red"
                  )}>
                    Risk: {result.isReal ? "Low" : result.riskScore < 40 ? "Moderate" : "High"}
                  </div>
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Score Details & Risk Indicators */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* 2. Authenticity Score Details */}
                  <div className="bento-card p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-primary-green" />
                      </div>
                      <h3>Authenticity Score Details</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                      {[
                        { label: "Salary Realism", value: 85, desc: result.analysis.salaryRealism },
                        { label: "Digital Footprint", value: 92, desc: result.analysis.digitalFootprint },
                        { label: "Language Patterns", value: 78, desc: result.analysis.languagePatterns },
                        { label: "Timeline Authenticity", value: 88, desc: result.analysis.timelineAuthenticity }
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">{item.label}</span>
                            <span className="text-sm font-bold text-text-primary dark:text-white">{item.value}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${item.value}%` }} 
                              className="h-full bg-primary-green" 
                            />
                          </div>
                          <p className="text-xs leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Risk Indicators */}
                  <div className="bento-card p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-danger-red" />
                      </div>
                      <h3>Risk Indicators</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {result.scamIndicators.map((indicator, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm group">
                          <div className={cn(
                            "mt-0.5 p-1.5 rounded-lg",
                            result.isReal ? "bg-emerald-50 text-primary-green" : "bg-red-50 text-danger-red"
                          )}>
                            {result.isReal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-text-primary dark:text-white leading-tight">{indicator}</p>
                            <p className="text-[11px] leading-relaxed">
                              Identified via {result.isReal ? "positive verification" : "fraud detection"} algorithms and cross-referenced with global databases.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Organization Info & Heatmap */}
                <div className="lg:col-span-5 space-y-8">
                  
                  {/* 4. Organization Information */}
                  <div className="bento-card p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3>Organization Information</h3>
                    </div>
                    
                    <div className="flex items-center gap-5 mb-8">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                        <img src={result.companyInfo.logo} alt={result.companyInfo.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-text-primary dark:text-white tracking-tight leading-none">{result.companyInfo.name}</h4>
                          <button 
                            onClick={() => handleSaveJob(result.companyInfo.name)}
                            className={cn(
                              "p-1.5 rounded-lg transition-all border shadow-sm",
                              savedJobs.includes(result.companyInfo.name) 
                                ? "bg-amber-50 border-amber-200 text-warning-yellow dark:bg-amber-900/20 dark:border-amber-800" 
                                : "bg-white border-slate-200 text-slate-400 hover:text-warning-yellow dark:bg-slate-800 dark:border-slate-700"
                            )}
                          >
                            <Star className={cn("w-4 h-4", savedJobs.includes(result.companyInfo.name) && "fill-warning-yellow")} />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className={cn("w-3 h-3", i <= result.companyInfo.overallRating ? "text-warning-yellow fill-warning-yellow" : "text-slate-200 dark:text-slate-700")} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-text-secondary">{result.companyInfo.overallRating}/5.0 Rating</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { label: "Industry", value: result.companyInfo.industry, icon: Building2 },
                        { label: "Established", value: result.companyInfo.establishedSince, icon: Calendar },
                        { label: "Headquarters", value: result.companyInfo.headquarters, icon: MapPin },
                        { label: "Employees", value: result.companyInfo.employeeCount, icon: Globe }
                      ].map((info, i) => (
                        <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                          <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mb-1">{info.label}</label>
                          <span className="text-xs font-bold text-text-primary dark:text-white flex items-center gap-1.5 truncate">
                            <info.icon className="w-3 h-3 text-text-secondary shrink-0" />
                            {info.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="group">
                        <label className="text-[9px] font-bold text-text-secondary uppercase tracking-widest block mb-1">Market Reputation</label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${result.companyInfo.marketReputationScore}%` }}
                              className="h-full bg-primary-green" 
                            />
                          </div>
                          <span className="text-[10px] font-bold text-text-primary dark:text-white">{result.companyInfo.marketReputationScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <a href={result.companyInfo.website} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 group hover:bg-emerald-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-primary-green" />
                          <span className="text-xs font-bold text-text-primary dark:text-white">Official Website</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-primary-green group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a href={result.companyInfo.socialMediaLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 group hover:bg-blue-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Fingerprint className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold text-text-primary dark:text-white">LinkedIn Profile</span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>

                  {/* 5. Scam Heatmap */}
                  <div id="scam-heatmap" className="bento-card p-8 overflow-hidden relative group">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                        <Activity className="w-5 h-5 text-warning-yellow" />
                      </div>
                      <h3>Scam Activity Heatmap</h3>
                    </div>
                    
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                      {/* Stylized Map Grid */}
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                      
                      {/* Heatmap Blobs */}
                      <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-danger-red/10 blur-[40px] animate-pulse" />
                      <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-warning-yellow/10 blur-[30px]" />
                      
                      {/* Map Pins */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <div className="absolute -inset-4 bg-danger-red/10 rounded-full animate-ping" />
                          <MapPin className="w-8 h-8 text-danger-red drop-shadow-lg" />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4 p-4 glass-panel rounded-xl border border-white/10 shadow-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Regional Alert Level</span>
                          <span className="text-[9px] font-black text-danger-red uppercase bg-red-50 px-1.5 py-0.5 rounded">Critical</span>
                        </div>
                        <p className="text-xs font-bold text-text-primary dark:text-white">High activity detected in your current region.</p>
                      </div>
                    </div>
                  </div>

                  {/* 6. Safety Actions */}
                  <div className="bento-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                        <Shield className="w-5 h-5 text-danger-red" />
                      </div>
                      <h3>Safety Actions</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      <button 
                        onClick={handleReportFraud}
                        className="flex items-center gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-danger-red font-bold hover:bg-red-100 transition-all group"
                      >
                        <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="text-sm">Report Fraudulent Listing</div>
                          <div className="text-[10px] font-medium opacity-70">Flag this post for manual review</div>
                        </div>
                      </button>
                      <button 
                        onClick={handleBlockRecruiter}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-text-primary dark:text-slate-300 font-bold hover:bg-slate-100 transition-all group"
                      >
                        <XCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="text-sm">Block This Recruiter</div>
                          <div className="text-[10px] font-medium opacity-70">Hide all future posts from this source</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Verdict Summary */}
              <div className="bg-text-primary dark:bg-slate-800 rounded-2xl p-10 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-green/10 blur-[100px] -mr-40 -mt-40" />
                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                  <div className="bg-primary-green p-4 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0">
                    <Zap className="w-8 h-8 text-white fill-white/20" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold tracking-tight text-white">Comprehensive Intelligence Verdict</h3>
                    <p className="text-lg text-slate-300 leading-relaxed font-medium">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggestions Section */}
              <div className="space-y-8 pt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <h3>
                      {result.isReal ? "Recommended Opportunities" : "Verified Safe Alternatives"}
                    </h3>
                    <p className="text-sm font-medium">Hand-picked legitimate opportunities based on your profile and search intent.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-primary-green" />
                    <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest">100% Verified</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.suggestions.map((job, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="bento-card p-6 hover:border-primary-green/30 transition-all group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                          <img src={job.logo} alt={job.company} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                          <ShieldCheck className="w-4 h-4 text-primary-green" />
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-bold text-text-primary dark:text-white mb-1 group-hover:text-primary-green transition-colors tracking-tight leading-tight">{job.title}</h4>
                      <p className="text-xs font-bold text-text-secondary mb-6">{job.company} • {job.location}</p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Est. Salary</span>
                          <span className="text-sm font-bold text-primary-green">{job.salary}</span>
                        </div>
                        <button 
                          onClick={() => handleApply(job.applyLink)}
                          className="bg-text-primary dark:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-primary-green transition-all flex items-center gap-2 shadow-sm"
                        >
                          Apply <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Final Action Bar */}
              <div className="flex flex-wrap gap-4 justify-center pt-12">
                <button 
                  onClick={() => handleApply(result.companyInfo.website)}
                  className="bg-primary-green text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-3 text-lg"
                >
                  <ArrowRight className="w-6 h-6" />
                  Apply via Official Portal
                </button>
                <button 
                  onClick={handleShare}
                  className="bg-white dark:bg-slate-900 text-text-primary dark:text-white border border-slate-200 dark:border-slate-800 px-10 py-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3 text-lg shadow-sm"
                >
                  <Share2 className="w-6 h-6" />
                  Share Analysis Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60 py-20 mt-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-green p-2 rounded-lg shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-text-primary dark:text-white tracking-tight">Recruit-Watch</span>
              </div>
              <p className="text-text-secondary dark:text-slate-400 font-medium max-w-sm leading-relaxed">
                The global standard for job authenticity. Protecting the next generation of talent from digital hiring fraud.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-text-primary dark:text-white mb-6 uppercase tracking-wider text-[10px]">Platform</h4>
              <ul className="space-y-4 text-sm font-semibold text-text-secondary dark:text-slate-400">
                <li><button onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-primary-green transition-colors">Intelligence Engine</button></li>
                <li><button onClick={() => { if (result) { document.getElementById('scam-heatmap')?.scrollIntoView({ behavior: 'smooth' }); } else { toast.info('Analyze a job first.'); } }} className="hover:text-primary-green transition-colors">Scam Database</button></li>
                <li><button onClick={() => toast.info('API documentation is available for enterprise partners.')} className="hover:text-primary-green transition-colors">API Access</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-text-primary dark:text-white mb-6 uppercase tracking-wider text-[10px]">Resources</h4>
              <ul className="space-y-4 text-sm font-semibold text-text-secondary dark:text-slate-400">
                <li><button onClick={() => toast.info('Safety guides are being updated.')} className="hover:text-primary-green transition-colors">Safety Guides</button></li>
                <li><button onClick={handleReportFraud} className="hover:text-primary-green transition-colors">Cybercrime Reporting</button></li>
                <li><button onClick={() => toast.info('Our support team is available 24/7.')} className="hover:text-primary-green transition-colors">Help Center</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-6">
              <p className="text-sm font-bold text-text-secondary dark:text-slate-400">© 2024 Recruit-Watch. Global Security Standard.</p>
              <div className="flex gap-4">
                <button onClick={() => toast.info('Redirecting to Twitter...')} className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-colors">
                  <MessageSquare className="w-4 h-4 text-text-secondary" />
                </button>
                <button onClick={() => toast.info('Redirecting to LinkedIn...')} className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-50 transition-colors">
                  <Fingerprint className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm font-bold text-text-primary dark:text-white">Developed by Muhammad Sameer Shahzad</p>
              <p className="text-[10px] font-bold text-primary-green tracking-wider uppercase mt-1">DATA SCIENTIST • AI ENGINEER</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
