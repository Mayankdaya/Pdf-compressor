import React from 'react';
import { Zap, Lock, Leaf, Droplets, Infinity, Smartphone } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Blazing Fast",
    description: "Compress standard documents in milliseconds. No waiting in queues."
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: "Private & Secure",
    description: "Files are processed locally in your browser when possible. We don't store your data."
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: "Eco-Friendly",
    description: "Smaller files mean less energy to transfer and store, reducing carbon footprint."
  },
  {
    icon: <Droplets className="w-6 h-6" />,
    title: "No Watermarks",
    description: "Clean, professional documents. We never add watermarks to your files."
  },
  {
    icon: <Infinity className="w-6 h-6" />,
    title: "Unlimited Use",
    description: "No daily limits or hourly caps. Compress as many files as you need."
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Works Everywhere",
    description: "Fully responsive. Use it on your phone, tablet, or desktop computer."
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl mb-4">Why choose Green PDF?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Everything you need to manage your PDF sizes effectively without the subscription bloat.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform group-hover:bg-emerald-600 group-hover:text-white">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;