"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '../lib/api';
import { Mail, Lock, Eye, EyeOff, Check, TrendingUp, Sparkles, UploadCloud, Shield, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await loginUser({ email, password });
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full bg-white text-slate-900 font-sans">
            {/* Left Panel */}
            <div className="w-full lg:w-[45%] flex flex-col mb-15 justify-center p-8 lg:p-8 xl:p-20 border-r border-slate-100">
                {/* Header */}
                <div className="w-full max-w-md mx-auto lg:mx-0">
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm tracking-tighter">
                            RP
                        </div>
                        <div>
                            <div className="font-bold text-lg leading-tight flex items-center gap-1">
                                ReviewPilot <span className="text-blue-600">AI</span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono ml-1">AUTH</span>
                            </div>
                            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">
                                Autonomous Reputation Engine
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-slate-900">Welcome back</h1>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        Sign in to manage your multi-location reviews and accelerate your business reputation.
                    </p>

                    {/* Form */}
                    <button className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-lg py-2.5 font-medium hover:bg-slate-50 transition-colors mb-6 text-sm text-slate-700 shadow-sm">
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
                        <span className="text-xs text-slate-400 font-medium">or sign in with email</span>
                        <div className="h-px bg-slate-100 flex-1"></div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-slate-700">Business Email</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="marcus.vance@thegrandbistro.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder:text-slate-400 font-medium text-slate-800"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-semibold text-slate-700">Password</label>
                                <Link href="/forgot-password" className="text-xs text-blue-600 font-medium hover:underline">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm tracking-widest text-slate-800 font-bold"
                                    required
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 mb-8">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-blue-600 bg-blue-600 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm text-slate-600 font-medium">Remember me for 30 days</span>
                            </label>
                            <span className="text-[10px] font-bold bg-emerald-100/50 text-emerald-700 px-2 py-1 rounded flex items-center gap-1.5 border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                Workspace Active
                            </span>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-70"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>Sign in <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6 font-medium">
                        Don't have an account? <Link href="/register" className="text-blue-600 font-semibold hover:underline">Create an account</Link>
                    </p>
                </div>

                {/* Footer Security/Certifications */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium border-t border-slate-100 pt-6 mt-12 w-full max-w-md mx-auto lg:mx-0">
                    <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>SOC-2 Type II Certified</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-500" />
                        <span>256-bit TLS Encryption</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div>99.98% SLA</div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="hidden lg:flex w-[55%] flex-col bg-blue-100  relative  overflow-hidden">
                

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col justify-center items-center p-12 z-10 relative w-full">
                    {/* Telemetry pipeline */}
                    <div className="w-full max-w-[640px] flex justify-between items-center mb-8">
                        <div className="bg-white rounded-full px-4 py-1.5 text-[10px] font-bold text-slate-600 tracking-widest flex items-center gap-2 shadow-sm border border-slate-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                            LIVE TELEMETRY PIPELINE • 1,420 LOCATIONS SYNCED
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <UploadCloud className="w-4 h-4" />
                            Synced 4m ago
                        </div>
                    </div>
                    
                    {/* Cards Container */}
                    <div className="w-full max-w-[640px] space-y-4">

                        {/* Top Cards row */}
                        <div className="flex gap-4">
                            {/* Review Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 border border-slate-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                                            SP
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-sm text-slate-900">Sarah Jenkins</h4>
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">Local Guide</span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">The Grand Bistro • Downtown Flagship</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-blue-50/50 px-2.5 py-1.5 rounded-md border border-blue-100 text-xs font-medium text-slate-600">
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4285F4" />
                                        </svg>
                                        Google Maps
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mb-3">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="text-[11px] text-slate-400 ml-2 font-mono font-medium">42 mins ago</span>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                    "Incredible atmosphere and the truffle pasta was phenomenal! Staff went above and beyond when our..."
                                </p>
                            </div>

                            {/* Stats Card */}
                            <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-[220px] shrink-0 border border-slate-100 flex flex-col justify-between">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs text-slate-500 font-semibold leading-tight">Reputation<br />Velocity</div>
                                    <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-sm">+28% YoY</div>
                                </div>
                                <div>
                                    <div className="flex items-baseline gap-1.5 mb-1">
                                        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">4.8</span>
                                        <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium mb-3">342 verified reviews (+0.4 this month)</div>
                                </div>

                                {/* Simple sparkline chart using SVG */}
                                <div className="w-full h-10 relative mt-auto">
                                    <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                        <path d="M0 30 Q 30 25, 50 18 T 100 5" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                                        <circle cx="100" cy="5" r="3.5" fill="#2563eb" className="drop-shadow-md" />
                                    </svg>
                                    <div className="absolute inset-0 bg-gradient-to-t from-blue-50/80 to-transparent"></div>
                                </div>
                            </div>
                        </div>

                        {/* Pill row */}
                        <div className="bg-white rounded-xl px-5 py-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-center gap-4 text-xs font-semibold border border-white">
                            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                Positive 98.4%
                            </div>
                            <div className="text-slate-500 flex items-center gap-2">
                                Key Topics:
                                <span className="bg-slate-100 px-2 py-1.5 rounded text-slate-600 font-medium">Food Quality (4.9)</span>
                                <span className="bg-slate-100 px-2 py-1.5 rounded text-slate-600 font-medium">Hospitality (5.0)</span>
                            </div>
                            <div className="text-slate-600 flex items-center gap-1.5 ml-auto font-medium">
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                Impact: +14% Local Map 3-Pack Rank
                            </div>
                        </div>

                        {/* Copilot Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-slate-100 relative z-10">
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 text-white p-1.5 rounded-md shadow-sm">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-slate-900 text-[15px]">ReviewPilot Copilot</span>
                                    <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded font-mono font-bold">Generated in 1.4s</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Shield className="w-4 h-4" /> Tone: Warm & Executive
                                </div>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 text-sm text-slate-700 leading-relaxed font-medium mb-5">
                                "Thank you so much, Sarah! Chef Marco and the entire dining room crew are thrilled that you had a phenomenal evening and loved the black truffle pasta. We look forward to welcoming you and your executive colleagues back soon!"
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold leading-tight">
                                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                    Brand Voice Safety Check: 100%<br />Passed
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">Regenerate</button>
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
                                        <UploadCloud className="w-4 h-4" /> Approve & Publish to Google
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial */}
                    <div className="mt-12 bg-white/60 backdrop-blur-md rounded-2xl p-5 flex items-start gap-4 w-full max-w-[640px] relative z-10 border border-white shadow-sm">
                        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-800 flex flex-col items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-blue-50">
                            MV
                        </div>
                        <div>
                            <p className="text-[15px] font-semibold text-slate-800 leading-snug mb-1.5">
                                "ReviewPilot turned our Google reviews into our #1 customer acquisition channel."
                            </p>
                            <p className="text-xs text-slate-500 font-medium">
                                — <span className="font-bold text-slate-700">Marcus Vance</span>, Owner & Operator, The Grand Bistro Group
                            </p>
                        </div>
                    </div>

                    {/* Decorative background shapes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-200/20 rounded-full blur-3xl z-0 pointer-events-none"></div>
                    <div className="absolute top-[30%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-3xl z-0 pointer-events-none"></div>

                </div>
            </div>
        </div>
    );
}
