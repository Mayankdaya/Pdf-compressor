import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, Users, CreditCard, Activity, ArrowUpRight, FileText, Bot, ExternalLink, Send, Terminal } from 'lucide-react';

// ... existing code ...
const revenueData = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 5000 },
  { name: 'Mar', revenue: 6500 },
  { name: 'Apr', revenue: 8000 },
  { name: 'May', revenue: 11000 },
  { name: 'Jun', revenue: 14500 },
  { name: 'Jul', revenue: 18200 },
];

const trafficData = [
  { name: 'Mon', visitors: 1200 },
  { name: 'Tue', visitors: 1300 },
  { name: 'Wed', visitors: 1500 },
  { name: 'Thu', visitors: 1800 },
  { name: 'Fri', visitors: 1700 },
  { name: 'Sat', visitors: 2200 },
  { name: 'Sun', visitors: 2500 },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 67200,
    activeUsers: 14350,
    premiumSubscriptions: 1204,
    pagesGenerated: 0,
    aiLogs: [] as {time: string, message: string, link: string}[],
    recentTransactions: [] as {id: string, date: string, amount: number, status: string}[]
  });

  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'jarvis', text: string}[]>([
    { role: 'jarvis', text: 'J.A.R.V.I.S. online. Hello Boss, saara automation system mere control mein hai. Aap aaram kijiye, main sab kuch sambhal lunga!' }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendJarvisMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);

    try {
      const response = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: 'jarvis', text: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'jarvis', text: 'Connection lost with main brain, Boss.' }]);
    }
  };

  useEffect(() => {
    // Fetch live stats every 2 seconds
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Autopilot AI Empire Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">24/7 Web Page Generation & Monetization</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full font-medium">
          <Bot className="w-5 h-5 animate-bounce" />
          AI Worker Active
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, change: '+Live', icon: DollarSign },
          { title: 'Pages Generated', value: stats.pagesGenerated.toLocaleString(), change: 'Auto-SEO', icon: FileText, highlight: true },
          { title: 'Traffic Received', value: stats.activeUsers.toLocaleString(), change: '+Active', icon: Users },
          { title: 'Uptime', value: '100%', change: '24/7', icon: Activity },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border ${stat.highlight ? 'border-emerald-500 shadow-emerald-500/20 shadow-lg' : 'border-slate-200 dark:border-slate-700 shadow-sm'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stat.value}</h3>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl">
                  <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowUpRight className="w-4 h-4 text-emerald-500 mr-1" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* JARVIS Chat Terminal */}
        <div className="bg-slate-900 p-0 rounded-2xl border border-indigo-500/50 shadow-lg shadow-indigo-500/10 flex flex-col h-96 overflow-hidden">
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">J.A.R.V.I.S. Command Center</h3>
            <div className="ml-auto flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex-grow p-4 overflow-y-auto space-y-4 font-mono text-sm">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-emerald-400 border border-slate-700 rounded-bl-none'}`}>
                  {msg.role === 'jarvis' && <span className="text-xs text-slate-500 block mb-1">JARVIS</span>}
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendJarvisMessage()}
                placeholder="Message JARVIS..."
                className="flex-grow bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={sendJarvisMessage}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* AI Action Logs */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-96">
          <div className="flex items-center gap-2 mb-6">
            <Bot className="w-6 h-6 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live AI Page Generation Log</h3>
          </div>
          <div className="flex-grow bg-slate-900 rounded-xl p-4 overflow-y-auto space-y-3 font-mono text-sm shadow-inner" style={{ maxHeight: '300px' }}>
            {stats.aiLogs.length === 0 ? (
              <p className="text-slate-500 text-center mt-10">AI is thinking...</p>
            ) : (
              stats.aiLogs.map((log, i) => (
                <div key={i} className="animate-in slide-in-from-left-2 fade-in flex flex-col border-b border-slate-800 pb-2">
                  <div className="flex justify-between">
                    <span className="text-emerald-400">[{log.time}]</span>
                  </div>
                  <span className="text-slate-300 mt-1">{log.message}</span>
                  <a href={log.link} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-1 w-max">
                    <ExternalLink className="w-3 h-3" /> View Page
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Live Income Stream
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm">
                  <th className="px-6 py-3 font-medium">Source ID</th>
                  <th className="px-6 py-3 font-medium">Time</th>
                  <th className="px-6 py-3 font-medium">Earnings</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {stats.recentTransactions.map((txn, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800/80 transition-colors animate-in fade-in">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-300 font-mono">{txn.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{txn.date}</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-bold">\${txn.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${txn.status === 'Ad Revenue' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;