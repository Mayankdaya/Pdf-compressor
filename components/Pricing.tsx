import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Button from './ui/Button';

const API_BASE_URL = '';

const getOrCreateUserId = (): string => {
  const storageKey = 'greenpdf_user_id';
  if (typeof window === 'undefined') {
    return storageKey;
  }
  const existing = window.localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }
  const generated = `user_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  window.localStorage.setItem(storageKey, generated);
  return generated;
};

const Pricing: React.FC = () => {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    const userId = getOrCreateUserId();
    const fetchStatus = async () => {
      try {
        setIsCheckingStatus(true);
        const params = new URLSearchParams({ userId });
        const res = await fetch(`${API_BASE_URL}/api/usage?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setIsPro(Boolean(data.isPro));
        }
      } catch {
        // ignore usage status errors in pricing UI
      } finally {
        setIsCheckingStatus(false);
      }
    };

    fetchStatus();
  }, []);
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePurchase = async () => {
    const userId = getOrCreateUserId();
    setIsPurchasing(true);
    try {
      const orderRes = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!orderRes.ok) {
        alert('Unable to start payment. Please try again.');
        return;
      }

      const orderData = await orderRes.json();
      const RazorpayConstructor = (window as any).Razorpay;

      if (!RazorpayConstructor) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GreenPDF Pro Lifetime',
        description: 'Lifetime access to unlimited PDF compressions',
        order_id: orderData.orderId,
        theme: {
          color: '#10b981',
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              alert('Payment verification failed. Please contact support.');
              return;
            }

            const verifyData = await verifyRes.json();
            if (verifyData && verifyData.success) {
              window.localStorage.setItem('greenpdf_is_pro', 'true');
              alert('Payment successful! You now have unlimited PDF compression.');
            } else {
              alert('Payment verification failed. Please try again.');
            }
          } catch (error) {
            alert('Payment verification failed. Please try again.');
          }
        },
      };

      const rzp = new RazorpayConstructor(options);
      rzp.open();
    } catch (error) {
      alert('Unable to start payment. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleContact = () => {
    window.location.href = "mailto:sales@greenpdf.com";
  };

  return (
    <section id="pricing" className="py-20 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">No monthly subscriptions. Ever.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          
          {/* Free Plan */}
          <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Free</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">$0</span>
              <span className="text-slate-500 dark:text-slate-400">/forever</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" /> 5 Files per day
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Basic Compression
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Max size 10MB
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Ad supported
              </li>
            </ul>
            <Button variant="outline" fullWidth onClick={handleScrollToTop}>Start Free</Button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 bg-slate-900 dark:bg-slate-850 rounded-2xl shadow-xl transform scale-105 border-2 border-emerald-500 z-10 transition-transform duration-300">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
              Most Popular
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Pro Lifetime</h3>
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$1</span>
                <span className="text-emerald-400 font-medium">/ ₹90</span>
              </div>
              <span className="text-slate-400 text-sm">One-time payment</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-slate-300">
                <div className="bg-emerald-500/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <span className="font-medium text-white">Unlimited files</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <div className="bg-emerald-500/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <span className="font-medium text-white">Max Compression mode</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <div className="bg-emerald-500/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <span className="font-medium text-white">Max size 200MB</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <div className="bg-emerald-500/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <span className="font-medium text-white">No Ads</span>
              </li>
              <li className="flex items-start gap-3 text-slate-300">
                <div className="bg-emerald-500/20 p-1 rounded-full">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <span className="font-medium text-white">Priority Support</span>
              </li>
            </ul>
            {isPro ? (
              <Button variant="outline" fullWidth size="lg" disabled>
                You already have lifetime access
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handlePurchase}
                disabled={isPurchasing || isCheckingStatus}
              >
                {isCheckingStatus ? 'Checking status…' : 'Get Lifetime Access'}
              </Button>
            )}
          </div>

          {/* Team Plan */}
          <div className="p-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Team</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">$19</span>
              <span className="text-slate-500 dark:text-slate-400">one-time</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Up to 10 users
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Central billing
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" /> API Access (Beta)
              </li>
              <li className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-emerald-500 shrink-0" /> Dedicated support
              </li>
            </ul>
            <Button variant="outline" fullWidth onClick={handleContact}>Contact Sales</Button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;