import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle, Home, ArrowRight } from 'lucide-react';
import { authService } from '../services/api';
import { useTranslation } from 'react-i18next';
import loginBg from '../assets/login_bg.png';
import logoMbc from '../assets/logo_mbc.jpg';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP + New Pass
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === 'SUPER_ADMIN') {
        navigate('/sa/dashboard', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authService.login({ email, password });
      if (data.user.role === 'SUPER_ADMIN') {
        navigate('/sa/dashboard', { replace: true });
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      await authService.forgotPassword(forgotEmail);
      setForgotStep(2);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || t('login.error'));
    } finally {
      setForgotLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      await authService.resetPassword({
        email: forgotEmail,
        otp: forgotOtp,
        newPassword
      });
      setForgotSuccess(t('login.reset_success'));
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
        setForgotSuccess('');
      }, 3000);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || t('login.error'));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-brand-darkEmerald">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginBg}
          alt="Agricultural background"
          className="w-full h-full object-cover opacity-40 scale-105 transition-transform duration-[10s]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-darkEmerald via-transparent to-brand-emerald/30" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-brand-emerald/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[15%] right-[10%] w-64 h-64 bg-brand-gold/10 rounded-full blur-[100px] animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-[440px] p-10 m-4 rounded-[2.5rem] glass relative z-10 border-t border-l border-white/50"
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand-gold/20 rounded-full blur-2xl z-0" />

        {/* Home link */}
        <div className="absolute top-6 left-6 z-20">
          <Link
            to="/"
            className="text-white/70 hover:text-white flex items-center space-x-1.5 text-xs font-black tracking-widest uppercase transition-all bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-white/30 hover:bg-black/40"
          >
            <Home size={14} />
            <span>{t('login.home_link')}</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col items-center mb-10 relative z-10">
          <motion.img
            src={logoMbc}
            alt="MBC Logo"
            whileHover={{ scale: 1.05 }}
            className="w-32 h-auto mb-8 shadow-sm"
          />
          <h2 className="text-4xl font-black text-brand-dark tracking-tighter leading-none mb-2">
            {t('login.title')}
          </h2>
          <p className="text-gray-500 font-medium text-sm">
            {t('login.subtitle')} <span className="text-brand-emerald font-black">MBC</span>
          </p>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-red-500/10 text-red-500 p-4 rounded-2xl flex items-start text-xs font-bold border border-red-500/20 shadow-lg shadow-red-500/5 overflow-hidden"
            >
              <AlertCircle className="w-4 h-4 mr-3 flex-shrink-0 mt-0.5" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleLogin} noValidate className="space-y-6 relative z-10">
          <div className="group">
            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1 group-focus-within:text-brand-emerald transition-colors">
              {t('login.email_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className={`h-5 w-5 ${email ? 'text-brand-emerald' : 'text-gray-400'} transition-all`} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none transition-all font-bold text-brand-dark placeholder-gray-300 placeholder:font-medium bg-white/80 shadow-sm"
                placeholder={t('login.email_placeholder')}
              />
            </div>
          </div>

          <div className="group">
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-400 group-focus-within:text-brand-emerald transition-colors">
                {t('login.password_label')}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[10px] font-black uppercase tracking-widest text-brand-emerald hover:text-brand-darkEmerald transition-colors bg-transparent border-none outline-none"
              >
                {t('login.forgot_password')}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className={`h-5 w-5 ${password ? 'text-brand-emerald' : 'text-gray-400'} transition-all`} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-6 py-4 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-brand-emerald/10 focus:border-brand-emerald outline-none transition-all font-bold text-brand-dark placeholder-gray-300 placeholder:font-medium bg-white/80 shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full premium-emerald-gradient text-white font-black py-7 rounded-2xl tracking-[0.4em] uppercase text-sm shadow-xl hover:brightness-110 transition-all flex items-center justify-center group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {t('login.submit')}
                <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer link */}
        <div className="mt-10 pt-8 border-t border-gray-100/30 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            {t('login.new_here')}{' '}
            <Link
              to="/register"
              className="ml-1 text-brand-emerald hover:text-brand-darkEmerald transition-colors border-b-2 border-brand-emerald/20 hover:border-brand-emerald"
            >
              {t('login.join_us')}
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!forgotLoading) setShowForgotModal(false);
              }}
              className="absolute inset-0 bg-brand-darkEmerald/80 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-[400px] bg-brand-darkEmerald/95 backdrop-blur-2xl p-8 rounded-[2.5rem] relative z-10 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Lock className="text-brand-gold" size={24} />
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter">
                  {t('login.forgot_password_title')}
                </h3>
                <p className="text-white/70 text-xs font-bold mt-4 leading-relaxed uppercase tracking-widest text-center px-4">
                  {forgotStep === 1 ? t('login.forgot_password_desc') : t('login.forgot_otp_desc')}
                </p>
              </div>

              {forgotError && (
                <div className="mb-6 bg-red-500/20 text-red-200 p-4 rounded-xl text-[11px] font-black uppercase tracking-widest border border-red-500/30 flex items-center gap-3">
                  <AlertCircle size={16} className="shrink-0" />
                  {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div className="mb-6 bg-brand-emerald/40 text-white p-4 rounded-xl text-[11px] font-black uppercase tracking-widest border border-brand-emerald/30 text-center">
                  {forgotSuccess}
                </div>
              )}

              <form onSubmit={forgotStep === 1 ? handleForgotRequest : handlePasswordReset} className="space-y-6" noValidate>
                {forgotStep === 1 ? (
                  <div className="space-y-5">
                    <label className="text-[11px] font-black text-white/50 uppercase tracking-[0.4em] ml-1">
                       {t('login.email_label')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-white/30" size={26} />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-3xl pl-20 pr-10 py-8 text-white font-bold text-base outline-none focus:border-brand-gold focus:bg-white/10 transition-all placeholder:text-white/20 shadow-inner"
                        placeholder={t('login.email_placeholder')}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-5">
                       <label className="text-[11px] font-black text-white/50 uppercase tracking-[0.4em] ml-1">
                          {t('login.otp_label')}
                       </label>
                       <input
                         type="text"
                         required
                         maxLength={6}
                         value={forgotOtp}
                         onChange={(e) => setForgotOtp(e.target.value.replace(/[^0-9]/g, ''))}
                         className="w-full bg-white/5 border border-white/10 rounded-3xl px-10 py-8 text-white text-center font-black text-4xl tracking-[0.7em] outline-none focus:border-brand-gold focus:bg-white/10 transition-all shadow-inner"
                         placeholder={t('login.otp_placeholder')}
                       />
                    </div>
                    <div className="space-y-5">
                       <label className="text-[11px] font-black text-white/50 uppercase tracking-[0.4em] ml-1">
                          {t('login.new_password_label')}
                       </label>
                       <div className="relative">
                        <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-white/30" size={26} />
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-3xl pl-20 pr-10 py-8 text-white font-bold text-base outline-none focus:border-brand-gold focus:bg-white/10 transition-all placeholder:text-white/20 shadow-inner"
                          placeholder={t('login.new_password_placeholder')}
                        />
                       </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-5 bg-brand-gold text-brand-darkEmerald font-black rounded-2xl uppercase text-[14px] tracking-[0.35em] shadow-xl shadow-brand-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-5"
                >
                  {forgotLoading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <>
                      {forgotStep === 1 ? t('login.send_code') : t('login.reset_submit')}
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStep(1);
                    setForgotError('');
                  }}
                  className="w-full text-white/50 hover:text-white text-xs font-black uppercase tracking-[0.45em] transition-all py-5 flex items-center justify-center gap-2 border-t border-white/5 mt-4"
                >
                  <Home size={15} />
                  {t('login.back_to_login')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decorative copyright */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/20 uppercase tracking-[0.5em] z-10 pointer-events-none">
        {t('login.copyright')}
      </div>
    </div>
  );
};

export default Login;
