"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '../lib/api';
import { 
  Mail, Lock, Eye, EyeOff, Check, TrendingUp, Sparkles, Shield, CheckCircle2, 
  ArrowRight, Building2, User, ChevronDown, Zap, Clock, ShieldCheck, 
  Activity, MapPin, CheckCircle, ShieldAlert, Circle
} from 'lucide-react';



export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Restaurant & Hospitality');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasLength = password.length >= 8;
  const hasUpperAndNumber = /[A-Z]/.test(password) && /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const conditionsMet = [hasLength, hasUpperAndNumber, hasSpecial].filter(Boolean).length;
  
  const getStrength = () => {
    if (password.length === 0) return { label: '', color: 'text-slate-500', bars: 0, barColor: 'bg-slate-200' };
    if (conditionsMet === 0) return { label: 'Weak', color: 'text-red-500', bars: 1, barColor: 'bg-red-500' };
    if (conditionsMet === 1) return { label: 'Fair', color: 'text-yellow-500', bars: 2, barColor: 'bg-yellow-500' };
    if (conditionsMet === 2) return { label: 'Good', color: 'text-blue-500', bars: 3, barColor: 'bg-blue-500' };
    return { label: 'Strong Password', color: 'text-emerald-600', bars: 4, barColor: 'bg-blue-600' };
  };
  const strength = getStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      await registerUser({ name, email, password });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex  min-h-screen w-full bg-white text-slate-900 font-sans">
      {/* Navbar assuming it's fixed */}
      
      
      <div className="flex-1 flex w-full">
        
        {/* Left Panel: Form Card */}
        <div className="w-full lg:w-[45%] flex flex-col mb-15 justify-center p-8 lg:p-8 xl:p-20 border-r border-slate-100">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm tracking-tighter">
              RP
            </div>
            <div>
              <div className="font-bold text-lg leading-tight text-slate-900">
                ReviewPilot <span className="text-blue-600">AI</span>
              </div>
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">
                Enterprise Onboarding
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3 tracking-tight text-slate-900 leading-tight">
            Start managing your customer reputation
          </h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed font-medium">
            Create your account and let AI turn customer reviews into actionable business insights.
          </p>

          <button className="w-full flex items-center justify-center gap-3 bg-[#f0f4f8] hover:bg-[#e2e8f0] text-slate-700 rounded-xl py-3 font-semibold transition-colors mb-6 text-sm border border-slate-200/50">
           
            {/* Google SVG Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">or register with business email</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Full name</label>
                <span className="text-[10px] font-bold text-slate-400">REQUIRED</span>
              </div>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Elena Rostova"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Business Email */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Business email</label>
                <span className="text-[10px] font-bold text-blue-600 tracking-wide">DIRECT SYNC ENABLED</span>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="elena@artisancoffee.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800"
                  required
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Business category / Industry</label>
              <div className="relative">
                <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={businessCategory}
                  onChange={(e) => setBusinessCategory(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800 appearance-none"
                >
                  <option>Restaurant & Hospitality</option>
                  <option>Retail</option>
                  <option>Services</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <span className={`text-[10px] font-bold ${strength.color}`}>{strength.label}</span>
              </div>
              <div className="relative mb-2">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Strength bars */}
              <div className="flex gap-1.5 mb-3">
                {[1, 2, 3, 4].map((bar) => (
                  <div key={bar} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${bar <= strength.bars ? strength.barColor : 'bg-slate-100'}`}></div>
                ))}
              </div>
              
              {/* Criteria */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-3 space-y-2">
                <div className={`flex items-center gap-2 text-xs font-semibold ${hasLength ? 'text-slate-700' : 'text-slate-400'}`}>
                  {hasLength ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Circle className="w-4 h-4 text-slate-300" />} Use at least 8 characters
                </div>
                <div className={`flex items-center gap-2 text-xs font-semibold ${hasUpperAndNumber ? 'text-slate-700' : 'text-slate-400'}`}>
                  {hasUpperAndNumber ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Circle className="w-4 h-4 text-slate-300" />} At least one uppercase letter & number
                </div>
                <div className={`flex items-center gap-2 text-xs font-semibold ${hasSpecial ? 'text-slate-700' : 'text-slate-400'}`}>
                  {hasSpecial ? <CheckCircle2 className="w-4 h-4 text-blue-600" /> : <Circle className="w-4 h-4 text-slate-300" />} At least one special symbol
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Confirm password</label>
                {confirmPassword && password === confirmPassword ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </span>
                ) : confirmPassword && password !== confirmPassword ? (
                  <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                    Passwords do not match
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-[#f8fafc] rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium text-slate-800"
                  required
                />
                {password && confirmPassword && password === confirmPassword && (
                  <CheckCircle2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-600" />
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm shadow-md mt-8 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-4 text-center leading-relaxed">
            By creating an account, you agree to our <a href="#" className="font-semibold text-slate-700 underline">Terms of Service</a> and <a href="#" className="font-semibold text-slate-700 underline">Privacy Policy</a>.
          </p>

          <div className="mt-8 bg-[#f8fafc] rounded-xl py-4 flex items-center justify-center text-sm border border-slate-100">
            <span className="text-slate-500 font-medium mr-1.5">Already have an account?</span> 
            <a href="/login" className="text-blue-600 font-bold hover:underline">Sign in</a>
          </div>
        </div>

        

        {/* Right Panel: Features Showcase */}
        <div className="hidden lg:flex w-[55%] flex-col pt-8 px-12 pb-12 bg-blue-100 relative overflow-hidden gap-6">
        
          
          {/* Black Banner */}
          <div className="bg-black rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-center">
            {/* Subtle background circles */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] border border-white/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute top-0 right-0 w-[300px] h-[300px] border border-white/5 rounded-full translate-x-1/4 -translate-y-1/4"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="max-w-[400px]">
                <div className="text-[10px] text-slate-400 font-bold tracking-[0.2em] mb-4 uppercase">
                  Zero Setup Friction
                </div>
                <h2 className="text-2xl font-bold mb-3 leading-tight">
                  Automate your reputation in 2 minutes
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  Connect your business profiles and instantly deploy our AI triage engine to boost rankings and recover lost revenue.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 flex items-center gap-3">
                <Shield className="w-5 h-5 text-white/80" />
                <div>
                  <div className="text-[9px] text-white/60 font-bold uppercase tracking-widest">Official Partner</div>
                  <div className="text-xs font-bold text-white">Google Reviews API</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Cards Row */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center rounded-lg">
                  01
                </div>
                <div className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-blue-100">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  1-Click Sync
                </div>
              </div>
              <h3 className="font-bold text-[15px] text-slate-900 mb-2">Connect Google Business Profile</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6 flex-1">
                Zero API keys required. Authenticate securely with official OAuth2 endpoints for single or multi-location venues.
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-blue-500"/> AES-256 Encrypted</span>
                <span>99.9% Up-time</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center rounded-lg">
                  02
                </div>
                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 border border-emerald-100">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Deep Telemetry
                </div>
              </div>
              <h3 className="font-bold text-[15px] text-slate-900 mb-2">Automated AI Analysis</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6 flex-1">
                Ingest your last 500 reviews instantaneously. Identify food quality mentions, server praises, and hidden churn flags.
              </p>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-emerald-500"/> LLM Sentiment Score</span>
                <span>&lt; 15 sec audit</span>
              </div>
            </div>

          </div>

          {/* Benchmark Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100">
            <div className="flex justify-between items-end mb-8">
              <div>
                <div className="text-[10px] text-blue-600 font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
                  Reputation Telemetry Engine <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Benchmark vs. Local Competitors</h3>
              </div>
              <div className="bg-[#eef3fb] text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-blue-100">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> Chicago, IL • Hospitality Sector
              </div>
            </div>

            <div className="flex gap-6 mb-8 bg-[#f8fafc] p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-5 flex-1">
                <div className="text-center bg-white rounded-xl py-3 px-5 shadow-sm border border-slate-100">
                  <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1">94</div>
                  <div className="text-[10px] font-bold text-slate-400">/ 100</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-sm text-slate-900">Reputation Health Score</span>
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="text-xs text-slate-500 font-medium">Top 5% among 842 registered venues in Chicago Hospitality.</div>
                </div>
              </div>
              
              <div className="flex flex-col items-end justify-center w-[150px]">
                <div className="text-[10px] font-bold text-emerald-600 mb-2">+14.2 pts vs 90d avg</div>
                <div className="w-full h-8 relative">
                  <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <path d="M0 25 L 15 25 L 30 22 L 45 28 L 60 15 L 75 10 L 90 15 L 100 5" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M0 25 L 15 25 L 30 22 L 45 28 L 60 15 L 75 10 L 90 15 L 100 5 L 100 30 L 0 30 Z" fill="url(#blue-gradient)" opacity="0.2" />
                    <defs>
                      <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <circle cx="100" cy="5" r="3" fill="#2563eb" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#f8fafc] rounded-xl p-4 flex items-center gap-3 border border-slate-100">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">8.4 hrs</div>
                  <div className="text-[10px] font-semibold text-slate-500">Saved per week</div>
                </div>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 flex items-center gap-3 border border-slate-100">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">+38%</div>
                  <div className="text-[10px] font-semibold text-slate-500">More 5-star reviews</div>
                </div>
              </div>
              <div className="bg-[#f8fafc] rounded-xl p-4 flex items-center gap-3 border border-slate-100">
                <div className="w-8 h-8 bg-slate-200/60 rounded-lg flex items-center justify-center text-slate-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">100%</div>
                  <div className="text-[10px] font-semibold text-slate-500">Negative SLA triage</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600">
                  <Sparkles className="w-3.5 h-3.5" /> Recent Live Autonomous Action
                </div>
                <div className="text-[10px] font-bold text-slate-400">2 mins ago • Google Review</div>
              </div>
              <div className="text-sm font-medium text-slate-700 leading-relaxed mb-4">
                "Thanks for dining with us at Artisan Coffee, Marcus! Delighted you loved our Ethiopian pour-over and the cardamom croissant. We have noted your note about the terrace heating and will have extra blankets ready for your next weekend brunch!"
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <div className="text-slate-500">Tone: Warm & Attentive</div>
                <div className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Status: Published (No Human Intervention Needed)</div>
              </div>
            </div>

          </div>

          {/* Bottom Trust Section */}
          <div className="flex items-center justify-between px-2 pb-8">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-[#f8fafc] flex items-center justify-center text-[9px] font-bold text-blue-800">AR</div>
                <div className="w-8 h-8 rounded-full bg-black border-2 border-[#f8fafc] flex items-center justify-center text-[9px] font-bold text-white">MK</div>
                <div className="w-8 h-8 rounded-full bg-blue-600 border-2 border-[#f8fafc] flex items-center justify-center text-[9px] font-bold text-white">SL</div>
                <div className="w-8 h-8 rounded-full bg-blue-50 border-2 border-[#f8fafc] flex items-center justify-center text-[9px] font-bold text-blue-600">+4k</div>
              </div>
              <div className="text-[11px] font-medium text-slate-500">
                Trusted by <span className="font-bold text-slate-700">4,200+</span> local businesses, restaurants, and boutique <br/>brands worldwide.
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> SOC2 Type II Certified
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
