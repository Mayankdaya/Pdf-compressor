import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Freelance Designer",
    image: "https://picsum.photos/60/60?random=1",
    content: "The compression quality is insane. I reduced a 50MB portfolio to 5MB without losing image clarity. Best dollar I ever spent."
  },
  {
    name: "Marcus Rodriguez",
    role: "Student",
    image: "https://picsum.photos/60/60?random=2",
    content: "Finally, a tool that doesn't force a monthly subscription for a simple task. Green PDF is a lifesaver for submitting assignments."
  },
  {
    name: "Emily Watson",
    role: "HR Manager",
    image: "https://picsum.photos/60/60?random=3",
    content: "We use this daily for archiving contracts. It's fast, secure, and the 'Balanced' mode is perfect for text documents."
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-emerald-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl mb-4">Loved by thousands</h2>
          <div className="flex justify-center gap-1 text-yellow-400 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <p className="text-slate-600 dark:text-slate-400">4.9/5 average rating from happy users</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-emerald-100 dark:border-slate-700 transition-colors duration-300">
              <p className="text-slate-700 dark:text-slate-300 italic mb-6">"{t.content}"</p>
              <div className="flex items-center gap-4">
                <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;