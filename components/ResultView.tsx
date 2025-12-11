import React from 'react';
import { AssessmentResult } from '../types';
import { RefreshCcw, CheckCircle, AlertTriangle, XCircle, User } from 'lucide-react';

interface ResultViewProps {
  result: AssessmentResult;
  userName?: string;
  onReset: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, userName, onReset }) => {
  const isHigh = result.eligibility.status === 'High';
  const isLow = result.eligibility.status === 'Low';
  
  // Simple status logic
  const statusIcon = isHigh ? <CheckCircle className="w-14 h-14 text-green-600" /> : 
                     isLow ? <XCircle className="w-14 h-14 text-red-600" /> : 
                     <AlertTriangle className="w-14 h-14 text-yellow-600" />;
                     
  const statusColor = isHigh ? 'text-green-700' : isLow ? 'text-red-700' : 'text-yellow-700';

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100 animate-fade-in">
      
      {/* Header */}
      <div className="text-center mb-10 border-b border-slate-100 pb-8">
        {userName && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 mb-6">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Report for {userName}</span>
            </div>
        )}
        <div className="flex justify-center mb-6">
            {statusIcon}
        </div>
        <h2 className={`text-3xl font-bold ${statusColor} mb-4`}>
            {result.eligibility.title}
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed">
            {result.eligibility.description}
        </p>
      </div>

      {/* Main Recommendation */}
      <div className="mb-10">
         <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider mb-3">Our Recommendation</h3>
         <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-lg font-medium text-slate-800 leading-relaxed italic">
                "{result.ability.recommendation}"
            </p>
         </div>
      </div>

      {/* Quick Summary - Simplified */}
      <div className="space-y-6">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Key Analysis</h3>
          
          <ul className="space-y-4">
              <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2.5 shrink-0"></div>
                  <p className="text-slate-600 text-sm leading-relaxed"><span className="font-semibold text-slate-900">Academics:</span> {result.ability.academicAnalysis}</p>
              </li>
              <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2.5 shrink-0"></div>
                  <p className="text-slate-600 text-sm leading-relaxed"><span className="font-semibold text-slate-900">Language:</span> {result.ability.languageAnalysis}</p>
              </li>
              <li className="flex gap-4">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2.5 shrink-0"></div>
                  <p className="text-slate-600 text-sm leading-relaxed"><span className="font-semibold text-slate-900">Finances:</span> {result.ability.financialAnalysis}</p>
              </li>
          </ul>
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={onReset}
          className="flex items-center px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Check Another Profile
        </button>
      </div>
    </div>
  );
};

export default ResultView;