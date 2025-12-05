import React from 'react';
import { Leaf, Twitter, Github, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const handleScroll = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const handlePlaceholderClick = (e: React.MouseEvent<HTMLAnchorElement>, name: string) => {
    e.preventDefault();
    // In a real app, this would route to a page. For now, we simulate working links.
    console.log(`Navigating to ${name}...`);
    alert(`The ${name} page is currently under maintenance. Please check back later!`);
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 border-t border-slate-800 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4 text-white">
              <Leaf className="w-6 h-6 text-emerald-500" />
              <span className="font-bold text-xl">GreenPDF</span>
            </div>
            <p className="max-w-xs mb-6">
              The ethical, eco-friendly way to compress your documents. Built for speed, privacy, and longevity.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors p-2 hover:bg-white/5 rounded-full"><Twitter className="w-5 h-5" /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors p-2 hover:bg-white/5 rounded-full"><Github className="w-5 h-5" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors p-2 hover:bg-white/5 rounded-full"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-emerald-400 transition-colors cursor-pointer block py-1">Features</a></li>
              <li><a href="#pricing" onClick={(e) => handleScroll(e, 'pricing')} className="hover:text-emerald-400 transition-colors cursor-pointer block py-1">Pricing</a></li>
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, "API Access")} className="hover:text-emerald-400 transition-colors cursor-pointer block py-1">API</a></li>
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, "Roadmap")} className="hover:text-emerald-400 transition-colors cursor-pointer block py-1">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, "Privacy Policy")} className="hover:text-emerald-400 transition-colors cursor-pointer block py-1">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, "Terms of Service")} className="hover:text-emerald-400 transition-colors cursor-pointer block py-1">Terms of Service</a></li>
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, "Cookie Policy")} className="hover:text-emerald-400 transition-colors cursor-pointer block py-1">Cookie Policy</a></li>
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, "Contact Support")} className="hover:text-emerald-400 transition-colors cursor-pointer block py-1">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Green PDF Compressor. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;