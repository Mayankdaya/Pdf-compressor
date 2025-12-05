import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: "Is my file safe?",
    answer: "Absolutely. We process files directly in your browser whenever possible. If server processing is needed, files are deleted immediately after download. We never share your documents."
  },
  {
    question: "Is it really a one-time payment?",
    answer: "Yes! We believe in owning your tools. For the price of a coffee ($1), you get lifetime access to all Pro features with no recurring fees."
  },
  {
    question: "What is the file size limit?",
    answer: "Free users can upload files up to 10MB. Pro users can upload files up to 200MB. If you need more, check out our Team plan."
  },
  {
    question: "Does it work on Mac and Windows?",
    answer: "Yes, Green PDF works in any modern web browser (Chrome, Safari, Firefox, Edge) on any operating system, including mobile devices."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-colors duration-300">
              <button
                className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-slate-900 dark:text-white">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                )}
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;