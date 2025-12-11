import React from 'react';
import { Question, Option } from '../types';
import { ChevronRight } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  onSelect: (option: Option) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-10 w-full max-w-2xl mx-auto animate-fade-in-up">
      <div className="mb-8">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold tracking-wide mb-3">
          Question {question.id} / 5
        </span>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 leading-tight">
          {question.text}
        </h2>
        {question.description && (
          <p className="text-slate-500 text-lg">{question.description}</p>
        )}
      </div>

      <div className="grid gap-4">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option)}
            className="group relative flex items-center p-4 border-2 border-slate-100 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-left focus:outline-none focus:ring-4 focus:ring-indigo-100"
          >
            {option.icon && (
              <div className="mr-4 text-slate-400 group-hover:text-indigo-600 transition-colors">
                {option.icon}
              </div>
            )}
            <div className="flex-1">
              <span className="block text-lg font-semibold text-slate-800 group-hover:text-indigo-900">
                {option.label}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
