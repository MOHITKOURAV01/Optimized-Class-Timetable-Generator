
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="min-h-screen bg-slate-50 overflow-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 glass">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <img src="/schedulify-logo.png" alt="Schedulify" className="h-8 w-8 rounded-lg object-cover" />
                            <span className="ml-2 text-xl font-bold text-slate-900">Schedulify</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                                Login
                            </Link>
                            <Link to="/signup" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-6">
                                New Generation Scheduling
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                                Create Perfect <span className="text-gradient">Timetables</span> in Seconds
                            </h1>
                            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                                Stop wrestling with spreadsheets. Our AI-powered algorithm generates conflict-free schedules for your entire institution instantly.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2">
                                    Start Generating <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-700 font-bold text-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center">
                                    View Demo
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Hero Image / Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mt-20 relative"
                    >
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white">
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent pointer-events-none" />
                            {/* Placeholder for a dashboard screenshot - using a constructed UI for now */}
                            <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 min-h-[400px]">
                                <div className="col-span-1 space-y-4">
                                    <div className="h-32 rounded-xl bg-white shadow-sm p-4 animate-pulse">
                                        <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                                        <div className="h-3 w-3/4 bg-slate-100 rounded" />
                                    </div>
                                    <div className="h-32 rounded-xl bg-white shadow-sm p-4 animate-pulse delay-75">
                                        <div className="h-4 w-1/2 bg-slate-200 rounded mb-2" />
                                        <div className="h-3 w-3/4 bg-slate-100 rounded" />
                                    </div>
                                </div>
                                <div className="col-span-2 rounded-xl bg-white shadow-sm p-6">
                                    <div className="flex justify-between mb-6">
                                        <div className="h-8 w-1/3 bg-slate-200 rounded" />
                                        <div className="h-8 w-24 bg-blue-100 rounded" />
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className="h-12 w-20 bg-slate-100 rounded" />
                                                <div className="h-12 flex-1 bg-blue-50/50 rounded border border-blue-100" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Us?</h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            We combine advanced algorithms with intuitive design to make scheduling a breeze.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="w-6 h-6 text-amber-500" />,
                                title: "Lightning Fast",
                                description: "Generate complete schedules for hundreds of classes in seconds, not days."
                            },
                            {
                                icon: <Shield className="w-6 h-6 text-blue-500" />,
                                title: "Conflict Free",
                                description: "Our algorithm guarantees zero overlaps for teachers, students, and classrooms."
                            },
                            {
                                icon: <Clock className="w-6 h-6 text-green-500" />,
                                title: "Real-time Updates",
                                description: "Make changes on the fly and instantly notify all affected parties."
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -5 }}
                                className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8">Ready to transform your scheduling?</h2>
                    <p className="text-xl text-slate-300 mb-10">
                        Join hundreds of institutions that have switched to smart, automated timetable generation.
                    </p>
                    <Link to="/signup" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-blue-600 bg-white rounded-xl hover:bg-blue-50 transition-all shadow-2xl">
                        Get Started for Free <CheckCircle className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <img src="/schedulify-logo.png" alt="Schedulify" className="h-6 w-6 rounded-lg object-cover" />
                        <span className="ml-2 text-lg font-bold text-slate-900">Schedulify</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                        © {new Date().getFullYear()} Schedulify. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
