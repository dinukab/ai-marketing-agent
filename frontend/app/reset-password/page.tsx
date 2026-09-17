"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, ArrowRight, ShieldAlert, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';
import { resetPassword } from '../lib/api';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        setIsLoading(true);
        
        try {
            await resetPassword({ token, new_password: password });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
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

                    <h1 className="text-3xl lg:text-4xl font-bold mb-3 tracking-tight text-slate-900">Set new password</h1>
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        Your new password must be different from previous used passwords and at least 8 characters long.
                    </p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {isSuccess ? (
                        <div className="mb-8 p-6 bg-emerald-50 rounded-xl border border-emerald-100 text-center space-y-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-emerald-900 mb-1">Password reset</h3>
                                <p className="text-sm text-emerald-700 leading-relaxed mb-6">
                                    Your password has been successfully reset. Click below to log in magically.
                                </p>
                                <Link 
                                    href="/login"
                                    className="inline-flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium transition-colors gap-2 text-sm shadow-sm"
                                >
                                    Continue to Login <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-slate-700">New Password</label>
                                <div className="relative">
                                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder:text-slate-400 font-medium text-slate-800"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Confirm Password</label>
                                <div className="relative">
                                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder:text-slate-400 font-medium text-slate-800"
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isLoading || !password || !confirmPassword}
                                className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm shadow-md mt-6 disabled:opacity-70"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Reset Password <Lock className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    )}

                    {!isSuccess && (
                        <div className="mt-8">
                            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to login
                            </Link>
                        </div>
                    )}
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
            <div className="hidden lg:flex w-[55%] flex-col relative overflow-hidden bg-slate-900">
                <Image 
                    src="/forgot-password.jpg" 
                    alt="Digital Security Illustration" 
                    fill 
                    className="object-cover opacity-90"
                    priority
                />
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/80 via-blue-900/40 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-16 z-10">
                    <div className="max-w-xl">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 text-white">
                            <h2 className="text-2xl font-bold mb-3 tracking-tight">Enterprise-Grade Security</h2>
                            <p className="text-slate-200 text-sm leading-relaxed mb-6 font-medium">
                                Your account is protected by industry-leading security protocols. We employ advanced encryption and continuous monitoring to ensure your data remains safe.
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <ShieldAlert className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-200">Zero Trust Architecture</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}
