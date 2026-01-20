
import React, { useState, useEffect } from 'react';
import { ChefHat, ArrowRight, Bot, Bookmark, Users, Sparkles, Star, ChevronDown, Zap, Heart, Search, MessageCircle } from 'lucide-react';

interface LandingPageProps {
    onEnterApp: () => void;
}

const IMAGES = [
    "https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2070",
    "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=2070"
];

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % IMAGES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans overflow-x-hidden selection:bg-brand-orange selection:text-white">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 transform hover:rotate-6 transition-transform">
                        <ChefHat className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-black text-white tracking-tight drop-shadow-sm">Taste Shift</span>
                </div>
                <button
                    onClick={onEnterApp}
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-white hover:text-brand-dark transition-all shadow-lg active:scale-95"
                >
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
                {IMAGES.map((img, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${index === currentImage ? 'opacity-60 scale-100' : 'opacity-0 scale-110'}`}
                    >
                        <img src={img} alt="Background" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80"></div>
                    </div>
                ))}

                <div className="relative z-10 text-center px-4 max-w-6xl mx-auto space-y-8 mt-16">
                    <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-white text-xs font-bold uppercase tracking-widest animate-fade-up shadow-2xl">
                        <Sparkles size={14} className="text-brand-orange animate-pulse" />
                        <span>Reinventing the Home Kitchen</span>
                    </div>

                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.9] animate-fade-up drop-shadow-2xl" style={{ animationDelay: '0.2s' }}>
                        Cook Like <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-yellow-400 to-brand-orange bg-300% animate-gradient">Never Before</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-up drop-shadow-md" style={{ animationDelay: '0.4s' }}>
                        The ultimate social platform for foodies. Organize recipes, cook with AI, and share your flavors with the world.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up" style={{ animationDelay: '0.6s' }}>
                        <button
                            onClick={onEnterApp}
                            className="px-10 py-5 bg-brand-orange text-white rounded-2xl font-black text-lg hover:bg-orange-600 transition-all shadow-2xl shadow-orange-500/30 w-full sm:w-auto flex items-center justify-center gap-2 group active:scale-95 hover:-translate-y-1"
                        >
                            Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={onEnterApp}
                            className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg hover:bg-white hover:text-black transition-all w-full sm:w-auto active:scale-95 flex items-center justify-center gap-2 hover:-translate-y-1"
                        >
                            Register Now
                        </button>
                    </div>
                </div>

                {/* Floating Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
                    <ChevronDown size={32} />
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-black py-10 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24">
                    {[
                        { label: "Active Chefs", value: "10k+" },
                        { label: "Recipes Shared", value: "50k+" },
                        { label: "AI Interactions", value: "1M+" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center group">
                            <p className="text-3xl md:text-4xl font-black text-white group-hover:text-brand-orange transition-colors">{stat.value}</p>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 bg-gray-50 relative overflow-hidden">
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20 max-w-3xl mx-auto">
                        <h2 className="text-sm font-black text-brand-orange uppercase tracking-widest mb-3">Core Features</h2>
                        <h3 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">Everything you need to <br />master the kitchen.</h3>
                        <p className="text-gray-500 text-xl">We combine social networking with advanced AI to create a cooking experience like no other.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Bot size={32} className="text-white" />}
                            title="AI Chef Assistant"
                            description="Powered by Gemini. Get instant recipe ideas, ingredient substitutions, and step-by-step guidance whenever you get stuck."
                            color="bg-purple-600"
                            delay="0"
                        />
                        <FeatureCard
                            icon={<Bookmark size={32} className="text-white" />}
                            title="Smart Collections"
                            description="Organize your culinary life. Save recipes from the feed into custom collections for easy access during meal prep."
                            color="bg-brand-orange"
                            delay="100"
                        />
                        <FeatureCard
                            icon={<Users size={32} className="text-white" />}
                            title="Vibrant Community"
                            description="Follow top home chefs, share your own creations, and join the conversation with real-time comments and reactions."
                            color="bg-blue-600"
                            delay="200"
                        />
                    </div>
                </div>
            </section>

            {/* App Showcase 1: Feed */}
            <section className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
                    <div className="flex-1 space-y-8 animate-fade-up">
                        <div className="inline-flex items-center gap-2 bg-orange-50 text-brand-orange px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <Search size={14} /> Infinite Discovery
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                            A Feed That Feeds <br /> Your Soul.
                        </h2>
                        <p className="text-xl text-gray-500 leading-relaxed font-medium">
                            Scroll through a visually stunning feed of recipes tailored to your taste. From quick weeknight dinners to gourmet weekend projects, inspiration is just a tap away.
                        </p>
                        <div className="flex flex-col gap-4">
                            {['Trending Recipes Ticker', 'Video & Image Support', 'Instant "Cook Now" Mode'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <Zap size={14} fill="currentColor" />
                                    </div>
                                    <span className="font-bold text-gray-800">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 relative group perspective-1000">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/20 to-purple-500/20 rounded-[2.5rem] blur-2xl transform rotate-6 scale-95 opacity-70 group-hover:rotate-12 transition-transform duration-700"></div>
                        <img
                            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=1000"
                            alt="Feed Interface"
                            className="relative z-10 rounded-[2.5rem] shadow-2xl border-8 border-white transform transition-transform duration-500 group-hover:-rotate-3 group-hover:scale-105 object-cover h-[600px] w-full"
                        />
                        {/* Floating Badge */}
                        <div className="absolute -bottom-10 -left-10 z-20 bg-white p-6 rounded-3xl shadow-xl animate-float-slow hidden md:block">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                                    <Heart fill="currentColor" size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-2xl">5.8k</p>
                                    <p className="text-gray-400 text-xs font-bold uppercase">Likes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* App Showcase 2: AI Chef */}
            <section className="py-24 px-6 bg-gray-50 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row-reverse items-center gap-16 md:gap-24">
                    <div className="flex-1 space-y-8 animate-fade-up">
                        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <Bot size={14} /> AI Powered
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                            Your Personal <br /> Sous-Chef.
                        </h2>
                        <p className="text-xl text-gray-500 leading-relaxed font-medium">
                            Stuck on a step? Missing an ingredient? Just ask Chef AI. Our integrated chat assistant understands context and helps you cook with confidence.
                        </p>
                        <button onClick={onEnterApp} className="text-brand-orange font-black text-lg flex items-center gap-2 hover:gap-4 transition-all">
                            Try AI Chef Now <ArrowRight size={20} />
                        </button>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-black/5 rounded-[2.5rem] transform -rotate-6 scale-95"></div>
                        {/* UPDATED IMAGE */}
                        <img
                            src="https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&q=80&w=1000"
                            alt="AI Chat Interface"
                            className="relative z-10 rounded-[2.5rem] shadow-2xl border-8 border-white transform transition-transform duration-500 hover:rotate-2 object-cover h-[500px] w-full"
                        />
                        <div className="absolute top-10 -right-10 z-20 bg-white p-4 rounded-2xl shadow-xl max-w-xs animate-float-medium hidden md:block">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white shrink-0">
                                    <Bot size={20} />
                                </div>
                                <div className="text-sm font-medium text-gray-600">
                                    <p className="bg-gray-100 p-2 rounded-xl rounded-tl-none mb-1">Try substituting Greek yogurt for sour cream!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* App Showcase 3: Community Interaction (NEW) */}
            <section className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">
                    <div className="flex-1 space-y-8 animate-fade-up">
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                            <Users size={14} /> Global Community
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tighter">
                            Connect Through <br /> Culinary Arts.
                        </h2>
                        <p className="text-xl text-gray-500 leading-relaxed font-medium">
                            Join a vibrant community of food lovers. Share your creations, follow your favorite chefs, and exchange tips, likes, and recipes in real-time.
                        </p>
                        <div className="flex gap-4 pt-2">
                            {/* Avatars */}
                            <div className="flex -space-x-4">
                                {[11, 12, 13, 14].map(i => (
                                    <img key={i} src={`https://i.pravatar.cc/100?img=${i}`} className="w-12 h-12 rounded-full border-4 border-white shadow-sm" alt="User" />
                                ))}
                                <div className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 shadow-sm">+2k</div>
                            </div>
                            <div className="flex flex-col justify-center pl-2">
                                <p className="font-bold text-gray-900 text-sm leading-tight">Join 10,000+ Chefs</p>
                                <p className="text-xs text-brand-orange font-bold uppercase">Start Sharing Today</p>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                                <Heart className="text-red-500 fill-red-500" size={18} /> Like Recipes
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                                <MessageCircle className="text-blue-500 fill-blue-500" size={18} /> Comment & Chat
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 font-bold text-sm">
                                <Users className="text-green-500 fill-green-500" size={18} /> Follow Chefs
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative group">
                        <div className="absolute inset-0 bg-blue-500/10 rounded-[2.5rem] transform rotate-3 scale-95 transition-transform group-hover:rotate-6"></div>
                        <img
                            src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1000"
                            alt="Community Interaction"
                            className="relative z-10 rounded-[2.5rem] shadow-2xl border-8 border-white object-cover h-[500px] w-full transform transition-transform duration-500 group-hover:scale-[1.02]"
                        />

                        {/* Floating Comment Card */}
                        <div className="absolute top-1/3 -left-8 bg-white p-4 rounded-2xl shadow-xl max-w-[200px] hidden md:block animate-float-slow">
                            <div className="flex items-center gap-2 mb-2">
                                <img src="https://i.pravatar.cc/100?img=5" className="w-6 h-6 rounded-full" alt="User" />
                                <span className="font-bold text-xs">@chef_anna</span>
                            </div>
                            <p className="text-xs text-gray-600">This pasta recipe is incredible! My family loved it. 😍🍝</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="py-32 px-6 bg-black text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-brand-orange/10"></div>

                <div className="max-w-4xl mx-auto space-y-10 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Ready to get cooking?</h2>
                    <p className="text-xl text-gray-400 font-medium max-w-2xl mx-auto">Join a community where taste meets technology. Sign up today and transform your kitchen experience.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onEnterApp}
                            className="px-12 py-5 bg-white text-black rounded-full font-black text-xl hover:bg-gray-200 transition-all shadow-xl hover:scale-105 transform duration-200"
                        >
                            Register Now
                        </button>
                        <button
                            onClick={onEnterApp}
                            className="px-12 py-5 bg-transparent border-2 border-white/20 text-white rounded-full font-bold text-xl hover:bg-white/10 transition-all hover:scale-105 transform duration-200"
                        >
                            Log In
                        </button>
                    </div>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="bg-black py-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                            <ChefHat className="text-white" size={18} />
                        </div>
                        <span className="font-black text-white text-lg">Taste Shift</span>
                    </div>
                    <div className="flex gap-8 text-sm text-gray-500 font-bold">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Support</a>
                    </div>
                    <p className="text-gray-600 text-sm font-medium">&copy; {new Date().getFullYear()} Taste Shift Inc.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, color, delay }: { icon: React.ReactNode, title: string, description: string, color: string, delay: string }) => (
    <div
        className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-100 hover:-translate-y-2 transition-transform duration-500 group animate-fade-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`w-20 h-20 ${color} rounded-3xl flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-0`}>
            {icon}
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-500 leading-relaxed font-medium text-lg">{description}</p>
    </div>
);

export default LandingPage;
