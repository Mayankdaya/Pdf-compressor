import React from 'react';
import CompressorApp from './CompressorApp';
import { ShieldCheck, Zap, Leaf } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-40 dark:opacity-20 pointer-events-none transition-opacity duration-300">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-200 dark:bg-emerald-700 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-200 dark:bg-green-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/2 w-[500px] h-[500px] bg-teal-200 dark:bg-teal-800 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6 border border-emerald-100 dark:border-emerald-800 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            New: Pro Lifetime Access Now Available
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
            Compress your PDFs in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">seconds</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Reduce file size while maintaining quality. Fast, secure, and eco-friendly. 
            Pay <span className="font-bold text-slate-900 dark:text-white">$1 / ₹90 once</span> and use it forever.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>Eco Friendly</span>
            </div>
          </div>
        </div>

        {/* The Mock App UI */}
        <div className="relative z-10">
          <CompressorApp />
        </div>
      </div>
    </section>
  );
};

export default Hero;