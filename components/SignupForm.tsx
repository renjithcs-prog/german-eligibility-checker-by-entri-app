import React, { useState } from 'react';
import { User, Phone, ArrowRight, ShieldCheck, Languages } from 'lucide-react';

interface SignupFormProps {
  onSubmit: (name: string, phone: string, language: string) => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('English');
  const [errors, setErrors] = useState<{name?: string, phone?: string}>({});

  const validatePhone = (input: string): string | undefined => {
    // 1. Allow Only Digits + Optional Special Characters
    if (!/^[0-9+\s\-()]*$/.test(input)) {
       return 'Phone number contains invalid characters. Only digits, spaces, +, -, and () are allowed.';
    }

    // 2. Normalize
    const cleanNumber = input.replace(/[^0-9]/g, '');

    if (!cleanNumber) {
      return 'Phone number is required.';
    }

    // 3. Global E.164 Length Check (7-15 digits)
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
       return 'Phone number must be between 7 and 15 digits.';
    }

    // 4. Anti-Spam / Fake Number Detection
    if (/^(\d)\1+$/.test(cleanNumber)) {
       return 'Invalid phone number (repeating digits).';
    }

    const sequences = ["0123456789", "1234567890", "9876543210"];
    if (sequences.some(seq => cleanNumber.includes(seq))) {
       return 'Invalid phone number (sequential pattern).';
    }

    // 5. Smart Indian Validation
    // Detects Indian intent (starts with +91, 91 (12 digits), or 6-9 (10 digits))
    const isIndianIntent = 
      input.trim().startsWith('+91') || 
      (cleanNumber.startsWith('91') && cleanNumber.length === 12) || 
      (cleanNumber.length === 10 && /^[6-9]/.test(cleanNumber));

    if (isIndianIntent) {
      let core = cleanNumber;
      
      // If it starts with 91 and is 12 digits, remove 91 country code
      if (core.length === 12 && core.startsWith('91')) {
        core = core.substring(2);
      }
      
      // Strict Indian Validation Rule: ^[6-9]\d{9}$
      if (!/^[6-9]\d{9}$/.test(core)) {
         return 'Invalid Indian number. Must be 10 digits starting with 6, 7, 8, or 9.';
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

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        newErrors.phone = phoneError;
      }
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
                onChange={(e) => setName(e.target.value)}
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
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-100 focus:border-indigo-500'} outline-none transition-all`}
                placeholder="e.g. +91 98765 43210"
             />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1 font-medium">{errors.phone}</p>}
          <p className="text-slate-400 text-[10px] mt-1 ml-1">
            Format: Country Code + Number (e.g., +91.., +49.., +971..)
          </p>
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
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Tamil">Tamil</option>
                <option value="Kannada">Kannada</option>
                <option value="Telugu">Telugu</option>
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