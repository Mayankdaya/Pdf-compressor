import React from 'react';
import { Upload, Sliders, Download } from 'lucide-react';

const steps = [
  {
    icon: <Upload className="w-8 h-8" />,
    title: "Upload PDF",
    description: "Drag & drop your file or select it from your device."
  },
  {
    icon: <Sliders className="w-8 h-8" />,
    title: "Choose Settings",
    description: "Select your desired compression level and quality preset."
  },
  {
    icon: <Download className="w-8 h-8" />,
    title: "Download",
    description: "Get your compressed file instantly. No email required."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">How it works</h2>
        </div>

        <div className="relative grid md:grid-cols-3 gap-12">
            {/* Connector Line for Desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>

          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 border-4 border-slate-50 dark:border-slate-950 z-10 relative transition-colors duration-300">
                {step.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white dark:border-slate-800">
                    {index + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-xs">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;