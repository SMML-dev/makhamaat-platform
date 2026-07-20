import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Smartphone, CheckCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '../services/api';

const PaymentSimulator = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const orderIds = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency') || 'FCFA';
  
  const [step, setStep] = useState(1); // 1: Overview, 2: Processing

  const handlePay = () => {
    setStep(2);

    // Simulate real network delay, then call backend verify endpoint
    setTimeout(() => {
      // Use the same base URL as the rest of the app (from api.ts)
      const apiBase = (api.defaults.baseURL || 'http://localhost:3005').replace(/\/$/, '');
      // Pass return_url so backend redirects to the correct frontend port
      const returnUrl = encodeURIComponent(window.location.origin);
      window.location.href = `${apiBase}/payment/verify?session_id=${sessionId}&order_ids=${orderIds}&return_url=${returnUrl}`;
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-brand-dark p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 rounded-bl-full transform translate-x-10 -translate-y-10"></div>
          <div className="relative z-10">
            <p className="text-brand-green font-black text-[10px] uppercase tracking-[0.3em] mb-2">Passerelle de Paiement</p>
            <h1 className="text-white text-2xl font-black tracking-tight">Makhamaat Pay</h1>
          </div>
        </div>

        <div className="p-10">
          {step === 1 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-10">
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Montant à régler</p>
                <h2 className="text-5xl font-black text-brand-dark">
                  {Number(amount).toLocaleString()} <span className="text-xl text-brand-green">{currency}</span>
                </h2>
              </div>

              <div className="space-y-4 mb-10">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-green">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-brand-dark uppercase tracking-tight">Paiement Sécurisé</p>
                    <p className="text-[10px] text-gray-400 font-bold">Cryptage SSL 256-bit actif</p>
                  </div>
                </div>

                <div className="p-6 bg-brand-green/5 rounded-[2rem] border-2 border-brand-green/20 relative group overflow-hidden">
                   <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center text-white">
                          <CheckCircle size={20} />
                        </div>
                        <p className="font-bold text-brand-dark">Validation Immédiate</p>
                      </div>
                      <ArrowRight className="text-brand-green group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              </div>

              <button
                onClick={handlePay}
                className="w-full py-5 premium-gradient text-white font-black text-lg rounded-2xl shadow-2xl shadow-brand-green/30 hover:shadow-brand-green/50 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                Confirmer le Paiement
              </button>

              <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8">
                Propulsé par le simulateur FedaPay / Flutterwave
              </p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center py-10"
            >
              <div className="relative w-24 h-24 mx-auto mb-8">
                <motion.div 
                  className="absolute inset-0 border-4 border-brand-green/20 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={48} className="text-brand-green animate-spin" strokeWidth={3} />
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-brand-dark mb-4 tracking-tight">Traitement de la transaction...</h2>
              <p className="text-gray-500 font-medium px-4">
                Veuillez patienter pendant que nous communiquons avec votre établissement bancaire.
              </p>
              
              <div className="mt-12 space-y-4">
                 <div className="flex justify-center gap-3 opacity-30">
                    <CreditCard size={20} />
                    <Smartphone size={20} />
                 </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSimulator;
