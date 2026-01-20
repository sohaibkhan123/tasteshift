
import React, { useState } from 'react';
import { ChefHat, Mail, Lock, User, Eye, EyeOff, Github, Chrome } from 'lucide-react';
import { apiService } from '../services/apiService';
import { User as UserType } from '../types';

interface AuthProps {
  onLogin: (user: UserType) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        let response;
        if (isLogin) {
            response = await apiService.login({ email, password });
        } else {
            response = await apiService.register({ fullName, username, email, password });
        }
        
        if (response && response.user) {
            onLogin(response.user);
        } else {
            throw new Error("Authentication failed");
        }
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Authentication failed. Please check your connection or credentials.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-brand-dark">
      {/* Dynamic Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070" 
          className="w-full h-full object-cover opacity-40 scale-105 blur-sm"
          alt="Food background"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/80 via-transparent to-brand-dark/80"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 border border-white/20 animate-in fade-in zoom-in duration-500">
          
          {/* Brand Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 mb-4 rotate-3 transform transition hover:rotate-0">
              <ChefHat size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-brand-dark tracking-tight">Taste Shift</h1>
            <p className="text-gray-500 text-sm font-medium mt-1">Culinary excellence, socialized.</p>
          </div>

          {/* View Toggle */}
          <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8 relative">
            <div 
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-xl shadow-sm transition-transform duration-300 ease-out ${!isLogin ? 'translate-x-[calc(100%+0.1rem)]' : 'translate-x-0'}`}
            />
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-black transition-colors relative z-10 ${isLogin ? 'text-brand-orange' : 'text-gray-400'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-black transition-colors relative z-10 ${!isLogin ? 'text-brand-orange' : 'text-gray-400'}`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center border border-red-100">
                    {error}
                </div>
            )}
            {!isLogin && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    required
                    placeholder="Full Name" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
                  <input 
                    type="text" 
                    required
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                required
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all placeholder:text-gray-400 text-sm font-medium"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-orange transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-[11px] font-bold text-gray-400 hover:text-brand-orange transition-colors">
                  Forgot Password?
                </button>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-orange hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Social Auth */}
          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black text-gray-300">
                <span className="bg-white/95 px-4">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                <Chrome size={18} className="text-gray-600" />
                <span className="text-xs font-bold text-gray-600">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                <Github size={18} className="text-gray-600" />
                <span className="text-xs font-bold text-gray-600">GitHub</span>
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 font-medium">
              By continuing, you agree to our 
              <button className="text-brand-dark font-bold ml-1 hover:underline">Terms of Service</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
