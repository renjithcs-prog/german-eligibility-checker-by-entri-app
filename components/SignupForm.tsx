import React, { useState } from 'react';
import { User, Phone, ArrowRight, ShieldCheck, Languages } from 'lucide-react';

interface SignupFormProps {
  onSubmit: (name: string, phone: string, language: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('Malayalam');
  const [errors, setErrors] = useState<{name?: string, phone?: string}>({});

  const validatePhone = (input: string): string | undefined => {
    const trimmed = input.trim();
    const cleanNumber = trimmed.replace(/[^0-9]/g, '');

    // 1. Basic Character & Presence Check
    if (!trimmed) return 'Phone number is required.';
    if (!/^[0-9+\s\-()]*$/.test(trimmed)) return 'Invalid characters in phone number.';
    if (cleanNumber.length < 7) return 'Phone number is too short.';
    if (cleanNumber.length > 15) return 'Phone number is too long.';

    // 2. Prevent Repeating Digits (e.g., 99999999)
    if (/^(\d)\1{5,}$/.test(cleanNumber)) return 'Invalid phone number pattern.';

    // 3. Prevent Sequential Patterns (e.g., 12345678, 98765432)
    const isSequential = (str: string) => {
      if (str.length < 6) return false;
      let asc = true;
      let desc = true;
      for (let i = 0; i < str.length - 1; i++) {
        const current = parseInt(str[i]);
        const next = parseInt(str[i+1]);
        if (next !== (current + 1) % 10) asc = false;
        if (next !== (current - 1 + 10) % 10) desc = false;
      }
      return asc || desc;
    };

    for (let i = 0; i <= cleanNumber.length - 6; i++) {
      if (isSequential(cleanNumber.substring(i, i + 6))) {
        return 'Please enter a valid phone number.';
      }
    }

    // 4. Country Specific & Leading Zero Validation
    if (trimmed.startsWith('+')) {
      // Logic for + prefix
      if (trimmed.startsWith('+91')) {
        // India: Must be exactly 10 digits after +91
        const after91 = trimmed.substring(3).replace(/[^0-9]/g, '');
        if (after91.length !== 10) return 'Indian numbers must have exactly 10 digits after +91.';
        if (after91.startsWith('0')) return 'Indian numbers cannot start with 0.';
        if (!/^[6-9]/.test(after91)) return 'Invalid Indian mobile number prefix.';
      } else {
        // Other Countries
        const parts = trimmed.split(/[\s\-()]+/);
        if (parts.length > 1) {
          // If they used separators: +CC 0123...
          const subscriber = parts.slice(1).join('').replace(/[^0-9]/g, '');
          if (subscriber.startsWith('0')) return 'Number cannot start with 0 after country code.';
          if (subscriber.length < 6) return 'Subscriber number is too short.';
        } else {
          // No separators: +490123...
          // Heuristic: check digit after common CC lengths (1, 2, 3)
          const ccLen = cleanNumber.startsWith('1') ? 1 : (cleanNumber.length > 10 ? 2 : 3);
          if (cleanNumber[ccLen] === '0') return 'Number cannot start with 0 after country code.';
        }
      }
    } else {
      // No '+' prefix provided
      if (cleanNumber.startsWith('0')) return 'Phone number cannot start with 0.';
      
      // If 10 digits, assume India intent and validate
      if (cleanNumber.length === 10) {
        if (!/^[6-9]/.test(cleanNumber)) return 'Invalid 10-digit number prefix.';
      } else if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
        // India with CC but no +
        const subscriber = cleanNumber.substring(2);
        if (subscriber.startsWith('0')) return 'Indian numbers cannot start with 0.';
        if (!/^[6-9]/.test(subscriber)) return 'Invalid Indian mobile number.';
      }
    }

    return undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {name?: string, phone?: string} = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(name, phone, language);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12 w-full max-w-md mx-auto animate-fade-in-up">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Complete!</h2>
        <p className="text-slate-500">Please enter your details to unlock your personalized eligibility report.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          <div className="relative">
             <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
             <input 
                type="text" 
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'} outline-none transition-all`}
                placeholder="e.g. Alex Schmidt"
             />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
          <div className="relative">
             <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
             <input 
                type="tel" 
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'} outline-none transition-all`}
                placeholder="e.g. +91 98765 43210"
             />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Language</label>
          <div className="relative">
             <Languages className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
             <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-white appearance-none cursor-pointer"
             >
                <option value="Malayalam">Malayalam</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
                <option value="Hindi">Hindi</option>
                <option value="Other">Other</option>
             </select>
             <div className="absolute right-4 top-4 pointer-events-none">
                 <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
             </div>
          </div>
        </div>

        <div className="pt-2">
            <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
            >
                View My Report
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
            <ShieldCheck className="w-3 h-3" />
            <span>Your data is secure and private</span>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;