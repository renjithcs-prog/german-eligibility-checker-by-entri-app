import React, { useState, useCallback, useEffect } from 'react';
import { Question, Option, UserAnswer, AssessmentResult } from './types';
import QuestionCard from './components/QuestionCard';
import ResultView from './components/ResultView';
import ProgressBar from './components/ProgressBar';
import SignupForm from './components/SignupForm';
import { analyzeEligibility } from './services/gemini';
import { saveLeadToSheet, UtmParams } from './services/sheet';
import { GraduationCap, School, Euro, Languages, Award, Loader2, ArrowRight, BookOpen } from 'lucide-react';

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is your highest academic qualification?",
    description: "This helps determine your HZB (Higher Education Entrance Qualification).",
    options: [
      { id: 'h_school', label: 'High School Diploma (12th Grade)', value: 'high_school', icon: <School /> },
      { id: 'bachelor', label: 'Bachelor’s Degree', value: 'bachelor', icon: <GraduationCap /> },
      { id: 'master', label: 'Master’s Degree', value: 'master', icon: <Award /> },
    ]
  },
  {
    id: 2,
    text: "What is your approximate Grade/GPA?",
    options: [
      { id: 'excellent', label: 'Excellent (Top 10% / >90% / GPA 3.7+)', value: 'excellent', icon: <Award /> },
      { id: 'good', label: 'Good (Top 25% / 75-90% / GPA 3.0+)', value: 'good', icon: <Award /> },
      { id: 'average', label: 'Average (60-75% / GPA 2.5+)', value: 'average', icon: <School /> },
      { id: 'low', label: 'Below Average (<60% / GPA <2.5)', value: 'low', icon: <School /> },
    ]
  },
  {
    id: 3,
    text: "What is your current German language proficiency?",
    description: "Language skills are crucial for admission and daily life.",
    options: [
      { id: 'none', label: 'None / Absolute Beginner', value: 'none', icon: <Languages /> },
      { id: 'a1_a2', label: 'Beginner (A1 - A2)', value: 'A1/A2', icon: <Languages /> },
      { id: 'b1_b2', label: 'Intermediate (B1 - B2)', value: 'B1/B2', icon: <Languages /> },
      { id: 'c1_c2', label: 'Advanced (C1 - C2)', value: 'C1/C2', icon: <Languages /> },
    ]
  },
  {
    id: 4,
    text: "What is your intended field of study?",
    description: "Admission criteria vary significantly by faculty.",
    options: [
      { id: 'stem', label: 'Engineering / IT / Math', value: 'STEM', icon: <GraduationCap /> },
      { id: 'med', label: 'Medicine / Health', value: 'Medicine', icon: <School /> },
      { id: 'business', label: 'Business / Economics', value: 'Business', icon: <Euro /> },
      { id: 'arts', label: 'Arts / Humanities / Social Sciences', value: 'Arts', icon: <School /> },
      { id: 'other', label: 'Other Programs', value: 'Other', icon: <BookOpen /> },
    ]
  },
  {
    id: 5,
    text: "What is your estimated yearly budget for living expenses?",
    description: "A 'Blocked Account' (~€11,208) is often required for visas.",
    options: [
      { id: 'secure', label: '€12,000+ (Fully Secured)', value: 'high_budget', icon: <Euro /> },
      { id: 'part_secure', label: '€8,000 - €12,000 (Tight)', value: 'mid_budget', icon: <Euro /> },
      { id: 'rely_work', label: '< €8,000 (Relying on Part-time Work)', value: 'low_budget', icon: <Euro /> },
    ]
  }
];

const EntriLogo = () => (
  <svg width="140" height="70" viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-20 w-auto">
    <title>Entri German</title>
    <rect x="50" y="0" width="40" height="40" rx="8" fill="#2563EB" />
    <path d="M60 10H74V14H64V18H72V22H64V26H74V30H60V10Z" fill="white" />
    <path d="M78 15L86 20L78 25V15Z" fill="white" />
    <text x="70" y="60" fontFamily="'Inter', sans-serif" fontWeight="700" fontSize="18" fill="#2563EB" textAnchor="middle" letterSpacing="-0.5">german</text>
  </svg>
);

const App: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);
  const [userData, setUserData] = useState<{name: string, phone: string} | null>(null);
  const [utmParams, setUtmParams] = useState<UtmParams>({});

  // Capture UTM parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const capturedUtms: UtmParams = {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
    };
    setUtmParams(capturedUtms);
  }, []);

  const handleOptionSelect = useCallback((option: Option) => {
    const currentQ = QUESTIONS[currentStep];
    const newAnswer: UserAnswer = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      selectedOption: option
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 250); 
    } else {
      setTimeout(() => setShowSignup(true), 250);
    }
  }, [currentStep, answers]);

  const handleSignupSubmit = async (name: string, phone: string, language: string) => {
    setUserData({ name, phone });
    setShowSignup(false);
    setLoading(true);
    setError(null);

    try {
      // Save to Google Sheet including captured UTM parameters
      await saveLeadToSheet(name, phone, language, answers, utmParams);

      const analysis = await analyzeEligibility(answers, name);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError("Unable to generate assessment. Please verify your API key or try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setAnswers([]);
    setCurrentStep(0);
    setStarted(false);
    setShowSignup(false);
    setUserData(null);
    setError(null);
  };

  if (!started) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 overflow-hidden font-sans">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50 via-white to-slate-100">
            <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(0deg,transparent,black)]"></div>
        </div>
        <div className="relative z-10 text-center max-w-3xl">
          <div className="flex flex-col items-center mb-10">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Powered by</span>
              <EntriLogo />
          </div>
          <div className="inline-flex items-center justify-center p-2 bg-white/80 backdrop-blur rounded-2xl shadow-lg mb-8 animate-bounce ring-1 ring-slate-200">
             <div className="flex items-center space-x-2 px-3 py-1">
               <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
               <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Updated for 2026 Intake</span>
             </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 mb-8 tracking-tight serif leading-none drop-shadow-sm">
            Will You Get <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-600 to-black">Accepted?</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-800 mb-10 leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-sm bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20">
            <span className="font-bold text-slate-900">Avoid the 40% rejection trap.</span> Don't let simple errors ruin your dream. Instantly check your admission and visa eligibility for the 2026 intake.
          </p>
          <div className="flex flex-col items-center space-y-4">
            <button
              onClick={() => setStarted(true)}
              className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white transition-all duration-200 bg-slate-900 font-pj rounded-full focus:outline-none focus:ring-4 focus:ring-slate-200 focus:ring-offset-2 hover:bg-slate-800 hover:scale-105 shadow-xl active:scale-95"
            >
              <span className="relative flex items-center">
                Check My Eligibility Now
                <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <p className="text-sm font-medium text-slate-600 italic">Takes less than 1 minute</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1507842217121-9e93c230bf42?auto=format&fit=crop&q=80" alt="Library" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md"></div>
        </div>
        <div className="relative z-10 bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-2xl text-center max-w-md w-full border border-slate-100">
          <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Profile...</h2>
          <p className="text-slate-500">Our AI is evaluating {userData?.name ? userData.name + "'s" : "your"} profile against current German regulations.</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen relative py-12 px-4 sm:px-6">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80" alt="University Hall" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm"></div>
        </div>
         <div className="relative z-10 max-w-5xl mx-auto mb-6">
             <button onClick={handleReset} className="text-sm font-medium text-slate-700 hover:text-slate-900 flex items-center bg-white/80 px-3 py-1 rounded-full backdrop-blur-md transition-colors shadow-sm">
                 &larr; Back to Home
             </button>
         </div>
         <div className="relative z-10">
            <ResultView result={result} userName={userData?.name} onReset={handleReset} />
         </div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="min-h-screen relative flex flex-col items-center justify-center p-6">
        <div className="absolute inset-0 z-0 bg-slate-100"></div>
        <div className="relative z-10 bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <span className="text-2xl text-red-600 font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Assessment Failed</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button onClick={handleReset} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  if (showSignup) {
      return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
             <div className="absolute inset-0 z-0">
                <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80" alt="Study Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm"></div>
            </div>
            <div className="relative z-10 w-full">
                 <SignupForm onSubmit={handleSignupSubmit} />
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center pt-12 md:pt-20 pb-10 px-4">
        <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80" alt="Study Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-sm"></div>
        </div>
      <div className="w-full max-w-2xl relative z-10">
        <div className="mb-10 text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-white/60 backdrop-blur-sm text-xl font-semibold text-slate-800 shadow-sm">
                Step {currentStep + 1} of 5
            </span>
        </div>
        <ProgressBar currentStep={currentStep + 1} totalSteps={QUESTIONS.length} />
        <QuestionCard question={QUESTIONS[currentStep]} onSelect={handleOptionSelect} />
      </div>
    </div>
  );
};

export default App;