import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fingerprint, Lock, Mail, ArrowRight, ScanFace } from 'lucide-react';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        setTimeout(() => {
            if (email === 'd' && password === '1234') {
                navigate('/dashboard');
            } else {
                setError('Invalid credentials. Try User: "d", Pass: "1234"');
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#020617] text-white flex items-center justify-center font-sans selection:bg-emerald-500/30">

            {/* --- Ambient Background Effects --- */}
            <div className="absolute inset-0 z-0">
                {/* Deep Navy/Emerald Gradient Blobs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-blue-900/40 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -30, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-emerald-900/30 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] bg-indigo-900/30 rounded-full blur-[100px]"
                />

                {/* Subtle Grid Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay"></div>
            </div>

            {/* --- Login Card --- */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md p-8 mx-4"
            >
                {/* Glass Container */}
                <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl shadow-2xl shadow-black/50">

                    {/* Top Glow Line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50"></div>

                    <div className="p-8 flex flex-col items-center">

                        {/* Logo area */}
                        <div className="mb-6 flex flex-col items-center gap-3">
                            <img src="/logo.jpg" alt="Taranga Logo" className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                            <div className="tracking-[0.3em] text-sm font-bold text-emerald-400 uppercase bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                                TARANGA INTELLIGENCE
                            </div>
                        </div>
                        <h1 className="mb-8 text-2xl font-light tracking-wide text-white/90">
                            Welcome Back
                        </h1>

                        {/* Biometric Icon */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLogin({} as any)}
                            className="group relative mb-8 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-white/5 to-white/0 border border-white/10 shadow-lg cursor-pointer transition-all hover:border-emerald-500/30 hover:shadow-emerald-500/20"
                        >
                            <Fingerprint className="w-10 h-10 text-emerald-100/70 group-hover:text-emerald-400 transition-colors duration-500" />
                            <div className="absolute inset-0 rounded-full ring-1 ring-white/5 group-hover:ring-emerald-500/20 animate-pulse"></div>
                        </motion.button>

                        <p className="mb-8 text-xs text-white/40 tracking-widest uppercase">
                            Use Biometrics or Enter Credentials
                        </p>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 w-full bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-200 text-xs text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="w-full space-y-4">

                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Username or Email"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-light tracking-wide"
                                />
                            </div>

                            <div className="group relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-light tracking-wide"
                                />
                            </div>

                            <div className="flex items-center justify-between mt-2 mb-6">
                                <label className="flex items-center space-x-2 cursor-pointer group">
                                    <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                                        {/* Checkbox imitation */}
                                        <div className="w-2 h-2 bg-emerald-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors">Remember me</span>
                                </label>
                                <a href="#" className="text-xs text-white/40 hover:text-emerald-400 transition-colors">Forgot Password?</a>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-[1px] group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <div className="relative bg-black/10 backdrop-blur-sm rounded-xl py-3.5 px-4 flex items-center justify-center group-hover:bg-opacity-0 transition-all duration-300">
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <span className="font-medium tracking-wide text-sm mr-2">LOG IN</span>
                                            <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </motion.button>

                        </form>
                    </div>

                    {/* Bottom frosted accent */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-white/20">
                        Secured by <span className="text-white/40 font-medium">QuantumGuard™</span> Encryption
                    </p>
                </div>

            </motion.div>
        </div>
    );
};
