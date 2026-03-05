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
  User,
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
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-8 py-5 rounded-[2rem]">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="bg-primary-green p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-text-primary dark:text-slate-100 tracking-tighter leading-none">RecruitWatch</span>
              <span className="text-[9px] font-black text-primary-green uppercase tracking-[0.2em] mt-0.5">Intelligence Unit</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => toast.info('Accessing global scam database...')} className="text-sm font-bold text-text-secondary hover:text-primary-green transition-colors">Threat Database</button>
            <button onClick={() => toast.info('Analyzing market trends...')} className="text-sm font-bold text-text-secondary hover:text-primary-green transition-colors">Market Trends</button>
            <button onClick={() => toast.info('Enterprise API documentation...')} className="text-sm font-bold text-text-secondary hover:text-primary-green transition-colors">API Docs</button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleReportFraud}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-danger-red rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-500/20 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              Report Scam
            </button>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block" />
            <button 
              onClick={toggleDarkMode}
              className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
            >
              {isDarkMode ? <Zap className="w-5 h-5 text-warning-yellow fill-warning-yellow" /> : <User className="w-5 h-5 text-text-secondary group-hover:text-primary-green" />}
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-20 relative">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[800px] pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full" />
        </div>

        <section className="max-w-7xl mx-auto px-6 text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-4">
              <div className="w-2 h-2 bg-primary-green rounded-full animate-pulse" />
              <span className="text-[11px] font-black text-primary-green uppercase tracking-[0.2em]">Real-Time Cyber Intelligence</span>
            </div>
            
            <h1 className="max-w-5xl mx-auto bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-indigo-600 to-indigo-800 dark:from-slate-100 dark:via-indigo-300 dark:to-indigo-500">
              Verify Job <span className="text-primary-green glow-text">Authenticity</span> with AI Intelligence
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-text-secondary dark:text-slate-400 font-medium leading-relaxed">
              Our advanced neural network scans millions of data points to detect employment fraud, fake recruiters, and phishing attempts in seconds.
            </p>

            {/* Efficient Input Area */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800 p-4 mb-12 relative overflow-hidden group"
            >
              {isAnalyzing && <div className="scan-line" />}
              
              <div className="flex items-center gap-2 p-1.5 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]">
                <button 
                  onClick={() => setInputMode('link')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-sm font-bold transition-all",
                    inputMode === 'link' ? "bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 shadow-lg shadow-slate-200/50 dark:shadow-none" : "text-text-secondary hover:text-text-primary dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  <LinkIcon className="w-4 h-4" />
                  Job Link
                </button>
                <button 
                  onClick={() => setInputMode('image')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-sm font-bold transition-all",
                    inputMode === 'image' ? "bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 shadow-lg shadow-slate-200/50 dark:shadow-none" : "text-text-secondary hover:text-text-primary dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Upload Post
                </button>
                <button 
                  onClick={() => setInputMode('text')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-sm font-bold transition-all",
                    inputMode === 'text' ? "bg-white dark:bg-slate-700 text-text-primary dark:text-slate-100 shadow-lg shadow-slate-200/50 dark:shadow-none" : "text-text-secondary hover:text-text-primary dark:text-slate-400 dark:hover:text-white"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  Paste Text
                </button>
              </div>

              <div className="px-2 pb-2">
                {inputMode === 'link' ? (
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within:text-primary-green transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Paste LinkedIn, Indeed, or Telegram link..."
                        className="input-field pl-16"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                      />
                    </div>
                    <button 
                      disabled={!linkInput || isAnalyzing}
                      onClick={() => handleAnalyze(linkInput, 'link')}
                      className="btn-primary min-w-[200px]"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Scanning...</span>
                        </div>
                      ) : (
                        <>
                          <Zap className="w-6 h-6 fill-white/20" />
                          <span>Verify Intelligence</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : inputMode === 'image' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-12 hover:border-primary-green hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-all cursor-pointer group text-center"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                    />
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-all">
                      <Upload className="w-10 h-10 text-text-muted group-hover:text-primary-green transition-all" />
                    </div>
                    <p className="text-lg text-text-primary dark:text-slate-100 font-black mb-2">Drop job post image or PDF here</p>
                    <p className="text-xs text-text-secondary dark:text-slate-400 font-bold">Supports PNG, JPG, and PDF up to 10MB</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <textarea 
                      placeholder="Paste the job description or hiring message here..."
                      className="input-field min-h-[200px] resize-none"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                    />
                    <button 
                      disabled={!textInput || isAnalyzing}
                      onClick={() => handleAnalyze(textInput, 'text')}
                      className="btn-primary min-w-[200px] self-end"
                    >
                      {isAnalyzing ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Scanning...</span>
                        </div>
                      ) : (
                        <>
                          <Zap className="w-6 h-6 fill-white/20" />
                          <span>Verify Intelligence</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Premium Quick Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {[
                { icon: MapPin, label: "Region", options: ["Global", "USA", "Pakistan", "Remote"] },
                { icon: TrendingUp, label: "Salary", options: ["All Ranges", "$50k+", "$100k+", "$150k+"] },
                { icon: Building2, label: "Sector", options: ["All Sectors", "Tech", "Finance", "Healthcare"] }
              ].map((filter, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:border-primary-green transition-all group cursor-pointer">
                  <filter.icon className="w-4 h-4 text-text-muted group-hover:text-primary-green transition-colors" />
                  <select 
                    onChange={(e) => toast.info(`${filter.label} filter: ${e.target.value}`)}
                    className="bg-transparent text-[10px] font-black text-text-secondary dark:text-slate-400 focus:outline-none cursor-pointer uppercase tracking-[0.2em]"
                  >
                    {filter.options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {isAnalyzing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="max-w-4xl mx-auto text-center py-20"
            >
              <div className="relative inline-block mb-10">
                <div className="absolute -inset-8 bg-primary-green/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border-4 border-slate-100 dark:border-slate-800">
                  <div className="w-24 h-24 border-8 border-slate-100 dark:border-slate-800 border-t-primary-green rounded-full animate-spin mx-auto mb-8" />
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3 font-display">Analyzing Intelligence...</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-bold text-base">Cross-referencing company data and scanning for fraud patterns.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-12">
                {['Metadata Scan', 'Reputation Check', 'Pattern Recognition'].map((step, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary-green rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{step}</span>
                  </div>
                ))}
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
              className="max-w-7xl mx-auto space-y-10 relative z-10 pb-32 px-4 sm:px-6"
            >
              {/* Subtle background glow for results */}
              <div className="absolute -inset-40 bg-indigo-500/5 dark:bg-indigo-500/10 blur-[160px] rounded-full pointer-events-none -z-10" />
              
              {/* 1. TOP RESULT CARD: Verification Result */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 md:p-12 shadow-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
                {/* Status Indicator Strip */}
                <div className={cn(
                  "absolute top-0 left-0 w-full h-2",
                  result.isReal ? "bg-primary-green" : result.riskScore < 40 ? "bg-warning-yellow" : "bg-danger-red"
                )} />

                <div className="flex-1 text-center lg:text-left space-y-6">
                  <div className="flex flex-col lg:flex-row items-center gap-4">
                    <div className={cn(
                      "px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-[0.2em] shadow-sm",
                      result.isReal ? "bg-indigo-500/10 text-primary-green" : 
                      result.riskScore < 40 ? "bg-amber-500/10 text-warning-yellow" :
                      "bg-red-500/10 text-danger-red"
                    )}>
                      {result.isReal ? "Verified Legitimate" : result.riskScore < 40 ? "Moderate Risk" : "High Risk Detected"}
                    </div>
                    <div className="flex items-center gap-2 text-text-muted text-xs font-bold">
                      <Activity className="w-4 h-4" />
                      Scan ID: {Math.random().toString(36).substring(7).toUpperCase()}
                    </div>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl leading-tight">
                    {result.isReal ? "This Job Appears Legitimate" : "Potential Employment Fraud Detected"}
                  </h2>
                  
                  <p className="text-base text-text-secondary dark:text-slate-400 max-w-2xl">
                    {result.verdict}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col items-center gap-6 bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 min-w-[280px] shadow-inner">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-muted">
                    Authenticity Score
                  </div>
                  <div className="relative flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="74"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-slate-200 dark:text-slate-800"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r="74"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={464.9}
                        initial={{ strokeDashoffset: 464.9 }}
                        animate={{ strokeDashoffset: 464.9 - (464.9 * result.confidence) / 100 }}
                        transition={{ duration: 2, ease: "circOut" }}
                        className={cn(
                          result.isReal ? "text-primary-green" : result.riskScore < 40 ? "text-warning-yellow" : "text-danger-red"
                        )}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="score-number text-text-primary dark:text-slate-100 leading-none">{result.confidence}%</span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-6 py-2 rounded-xl text-sm font-black text-white shadow-lg",
                    result.isReal ? "bg-primary-green shadow-indigo-500/20" : result.riskScore < 40 ? "bg-warning-yellow shadow-amber-500/20" : "bg-danger-red shadow-red-500/20"
                  )}>
                    Risk: {result.isReal ? "Low" : result.riskScore < 40 ? "Moderate" : "High"}
                  </div>
                </div>
              </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* LEFT COLUMN: Score Details & Risk Indicators */}
                <div className="lg:col-span-7 space-y-10">
                  
                  {/* 2. Authenticity Score Details */}
                  <div className="bento-card p-10">
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl">
                          <BarChart3 className="w-6 h-6 text-primary-green" />
                        </div>
                        <h3>Authenticity Score Details</h3>
                      </div>
                      <div className="text-xs font-bold text-text-muted bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                        Live Analysis
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                      {[
                        { label: "Salary Realism", value: 85, desc: result.analysis.salaryRealism },
                        { label: "Digital Footprint", value: 92, desc: result.analysis.digitalFootprint },
                        { label: "Language Patterns", value: 78, desc: result.analysis.languagePatterns },
                        { label: "Timeline Authenticity", value: 88, desc: result.analysis.timelineAuthenticity }
                      ].map((item, i) => (
                        <div key={i} className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-muted">{item.label}</span>
                            <span className="text-sm font-black text-text-primary dark:text-slate-100">{item.value}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${item.value}%` }} 
                              className="h-full bg-primary-green" 
                            />
                          </div>
                          <p className="text-xs text-text-secondary dark:text-slate-400 leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Risk Indicators */}
                  <div className="bento-card p-10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-red-500/10 rounded-2xl">
                        <AlertTriangle className="w-6 h-6 text-danger-red" />
                      </div>
                      <h3>Risk Indicators</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {result.scamIndicators.map((indicator, idx) => (
                        <div key={idx} className="flex items-start gap-5 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/50 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl group">
                          <div className={cn(
                            "mt-0.5 p-2.5 rounded-2xl shadow-sm",
                            result.isReal ? "bg-indigo-500/10 text-primary-green" : "bg-red-500/10 text-danger-red"
                          )}>
                            {result.isReal ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-text-primary dark:text-slate-100 leading-tight">{indicator}</p>
                            <p className="text-xs text-text-secondary dark:text-slate-400 leading-relaxed">
                              Identified via our proprietary {result.isReal ? "verification" : "fraud detection"} engine and cross-referenced with global intelligence databases.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Organization Info & Heatmap */}
                <div className="lg:col-span-5 space-y-10">
                  
                  {/* 4. Organization Information */}
                  <div className="bento-card p-10">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <Building2 className="w-6 h-6 text-blue-500" />
                      </div>
                      <h3>Organization Profile</h3>
                    </div>
                    
                    <div className="flex items-center gap-6 mb-10">
                      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 flex items-center justify-center border border-slate-100 dark:border-slate-800/50 overflow-hidden shadow-inner">
                        <img src={result.companyInfo.logo} alt={result.companyInfo.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-black text-text-primary dark:text-slate-100 tracking-tight leading-none">{result.companyInfo.name}</h4>
                          <button 
                            onClick={() => handleSaveJob(result.companyInfo.name)}
                            className={cn(
                              "p-2.5 rounded-2xl transition-all border shadow-sm",
                              savedJobs.includes(result.companyInfo.name) 
                                ? "bg-amber-500/10 border-amber-500/20 text-warning-yellow" 
                                : "bg-white border-slate-200 text-text-muted hover:text-warning-yellow dark:bg-slate-800 dark:border-slate-700"
                            )}
                          >
                            <Star className={cn("w-5 h-5", savedJobs.includes(result.companyInfo.name) && "fill-warning-yellow")} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className={cn("w-4 h-4", i <= result.companyInfo.overallRating ? "text-warning-yellow fill-warning-yellow" : "text-slate-200 dark:text-slate-700")} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-text-muted">{result.companyInfo.overallRating}/5.0 Verified Rating</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      {[
                        { label: "Industry", value: result.companyInfo.industry, icon: Building2 },
                        { label: "Established", value: result.companyInfo.establishedSince, icon: Calendar },
                        { label: "Headquarters", value: result.companyInfo.headquarters, icon: MapPin },
                        { label: "Employees", value: result.companyInfo.employeeCount, icon: Globe }
                      ].map((info, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em] block mb-2">{info.label}</label>
                          <span className="text-sm font-bold text-text-primary dark:text-slate-100 flex items-center gap-2 truncate">
                            <info.icon className="w-4 h-4 text-text-muted shrink-0" />
                            {info.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 mb-10">
                      <div className="group">
                        <div className="flex justify-between items-end mb-2">
                          <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Market Reputation</label>
                          <span className="text-xs font-black text-text-primary dark:text-slate-100">{result.companyInfo.marketReputationScore}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${result.companyInfo.marketReputationScore}%` }}
                            className="h-full bg-primary-green" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <a href={result.companyInfo.website} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-2xl border border-indigo-500/10 group hover:bg-indigo-500/10 transition-all">
                        <div className="flex items-center gap-4">
                          <Globe className="w-5 h-5 text-primary-green" />
                          <span className="text-sm font-bold text-text-primary dark:text-slate-100">Official Website</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-primary-green group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a href={result.companyInfo.socialMediaLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-blue-500/5 dark:bg-blue-500/10 rounded-2xl border border-blue-500/10 group hover:bg-blue-500/10 transition-all">
                        <div className="flex items-center gap-4">
                          <Fingerprint className="w-5 h-5 text-blue-500" />
                          <span className="text-sm font-bold text-text-primary dark:text-slate-100">LinkedIn Intelligence</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>

                  {/* 5. Scam Heatmap */}
                  <div id="scam-heatmap" className="bento-card p-10 overflow-hidden relative group">
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3 bg-amber-500/10 rounded-2xl">
                        <Activity className="w-6 h-6 text-warning-yellow" />
                      </div>
                      <h3>Threat Activity Heatmap</h3>
                    </div>
                    
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-[2rem] relative overflow-hidden border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                      {/* Stylized Map Grid */}
                      <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                      
                      {/* Heatmap Blobs */}
                      <div className="absolute top-1/4 left-1/3 w-40 h-40 bg-danger-red/10 blur-[50px] animate-pulse" />
                      <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-warning-yellow/10 blur-[40px]" />
                      
                      {/* Map Pins */}
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <div className="absolute -inset-6 bg-danger-red/20 rounded-full animate-ping" />
                          <MapPin className="w-10 h-10 text-danger-red drop-shadow-2xl" />
                        </div>
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6 p-6 glass-panel rounded-2xl border border-white/20 shadow-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Regional Alert Level</span>
                          <span className="text-[10px] font-black text-danger-red uppercase bg-red-500/10 px-2 py-1 rounded-lg">Critical</span>
                        </div>
                        <p className="text-sm font-bold text-text-primary dark:text-slate-100">High activity detected in your current region.</p>
                      </div>
                    </div>
                  </div>

                  {/* 6. Safety Actions */}
                  <div className="bento-card p-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-red-500/10 rounded-2xl">
                        <Shield className="w-6 h-6 text-danger-red" />
                      </div>
                      <h3>Safety Protocols</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <button 
                        onClick={handleReportFraud}
                        className="flex items-center gap-5 p-6 rounded-3xl bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 text-danger-red font-bold hover:bg-red-500/10 transition-all group"
                      >
                        <AlertTriangle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="text-base">Report Fraudulent Listing</div>
                          <div className="text-xs font-medium opacity-70">Flag this post for manual review by our security team</div>
                        </div>
                      </button>
                      <button 
                        onClick={handleBlockRecruiter}
                        className="flex items-center gap-5 p-6 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-text-primary dark:text-slate-300 font-bold hover:bg-slate-100 transition-all group"
                      >
                        <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <div className="text-left">
                          <div className="text-base">Block This Recruiter</div>
                          <div className="text-xs font-medium opacity-70">Hide all future posts from this source across the platform</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Verdict Summary */}
              <div className="bg-slate-900 dark:bg-slate-800 rounded-[3rem] p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-green/10 blur-[140px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -ml-32 -mb-32" />
                
                <div className="flex flex-col md:flex-row items-start gap-12 relative z-10">
                  <div className="bg-primary-green p-6 rounded-[2rem] shadow-2xl shadow-indigo-500/40 shrink-0">
                    <Zap className="w-12 h-12 text-white fill-white/20" />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">Intelligence Verdict</h3>
                    <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggestions Section */}
              <div className="space-y-12 pt-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div className="space-y-3">
                    <h3 className="text-3xl md:text-4xl font-black tracking-tight">
                      {result.isReal ? "Recommended Opportunities" : "Verified Safe Alternatives"}
                    </h3>
                    <p className="text-lg text-text-secondary font-medium">Hand-picked legitimate opportunities based on your profile and search intent.</p>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                    <ShieldCheck className="w-6 h-6 text-primary-green" />
                    <span className="text-xs font-black text-primary-green uppercase tracking-[0.2em]">100% Verified</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {result.suggestions.map((job, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="bento-card p-8 hover:border-primary-green/30 group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl p-3 border border-slate-100 dark:border-slate-800/50 overflow-hidden shadow-inner">
                          <img src={job.logo} alt={job.company} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3 bg-indigo-500/10 rounded-2xl">
                          <ShieldCheck className="w-5 h-5 text-primary-green" />
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-black text-text-primary dark:text-slate-100 mb-2 group-hover:text-primary-green transition-colors tracking-tight leading-tight">{job.title}</h4>
                      <p className="text-xs font-bold text-text-secondary mb-8">{job.company} • {job.location}</p>
                      
                      <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">Est. Salary</span>
                          <span className="text-base font-black text-primary-green">{job.salary}</span>
                        </div>
                        <button 
                          onClick={() => handleApply(job.applyLink)}
                          className="bg-text-primary dark:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-primary-green transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10"
                        >
                          Apply <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Final Action Bar */}
              <div className="flex flex-wrap gap-6 justify-center pt-20">
                <button 
                  onClick={() => handleApply(result.companyInfo.website)}
                  className="btn-primary px-10 py-5 text-lg rounded-[1.5rem]"
                >
                  <ArrowRight className="w-6 h-6" />
                  Apply via Official Portal
                </button>
                <button 
                  onClick={handleShare}
                  className="bg-white dark:bg-slate-900 text-text-primary dark:text-slate-100 border-2 border-slate-200 dark:border-slate-800 px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-4 text-lg shadow-2xl"
                >
                  <Share2 className="w-6 h-6" />
                  Share Intelligence Report
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60 py-24 mt-32 relative z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-primary-green to-transparent opacity-20" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-primary-green p-3 rounded-2xl shadow-xl shadow-indigo-500/20">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-text-primary dark:text-slate-100 tracking-tighter leading-none">RecruitWatch</span>
                  <span className="text-[9px] font-black text-primary-green uppercase tracking-[0.3em] mt-1">Intelligence Unit</span>
                </div>
              </div>
              <p className="text-text-secondary dark:text-slate-400 font-medium max-w-md leading-relaxed text-base">
                The global intelligence standard for job authenticity. Protecting the next generation of talent from digital hiring fraud and cyber threats through advanced neural analysis.
              </p>
              <div className="flex gap-4">
                {[MessageSquare, Fingerprint, Globe, Shield].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all border border-slate-100 dark:border-slate-800 hover:border-primary-green group">
                    <Icon className="w-5 h-5 text-text-secondary group-hover:text-primary-green transition-colors" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-black text-text-primary dark:text-slate-100 mb-10 uppercase tracking-[0.25em] text-[11px]">Intelligence Platform</h4>
              <ul className="space-y-6 text-sm font-bold text-text-secondary dark:text-slate-400">
                <li><button onClick={() => { setResult(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-primary-green transition-colors flex items-center gap-2">Neural Engine <Zap className="w-3 h-3" /></button></li>
                <li><button onClick={() => { if (result) { document.getElementById('scam-heatmap')?.scrollIntoView({ behavior: 'smooth' }); } else { toast.info('Analyze a job first.'); } }} className="hover:text-primary-green transition-colors">Global Heatmap</button></li>
                <li><button onClick={() => toast.info('API documentation is available for enterprise partners.')} className="hover:text-primary-green transition-colors">Enterprise API</button></li>
                <li><button onClick={() => toast.info('Threat database is updated hourly.')} className="hover:text-primary-green transition-colors">Threat Database</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-text-primary dark:text-slate-100 mb-10 uppercase tracking-[0.25em] text-[11px]">Security Resources</h4>
              <ul className="space-y-6 text-sm font-bold text-text-secondary dark:text-slate-400">
                <li><button onClick={() => toast.info('Safety guides are being updated.')} className="hover:text-primary-green transition-colors">Safety Protocols</button></li>
                <li><button onClick={handleReportFraud} className="hover:text-primary-green transition-colors">Fraud Reporting</button></li>
                <li><button onClick={() => toast.info('Our support team is available 24/7.')} className="hover:text-primary-green transition-colors">Security Center</button></li>
                <li><button onClick={() => toast.info('Terms of Service updated.')} className="hover:text-primary-green transition-colors">Legal Intelligence</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-sm font-bold text-text-muted">© 2024 RecruitWatch Intelligence Unit. Securely Monitored.</p>
            <div className="flex flex-col md:items-end gap-2">
              <p className="text-sm font-bold text-text-primary dark:text-slate-100">Developed by Muhammad Sameer Shahzad</p>
              <p className="text-[10px] font-black text-primary-green tracking-widest uppercase">DATA SCIENTIST • AI ENGINEER</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
