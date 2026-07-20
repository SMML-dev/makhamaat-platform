import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Key, Shield, CheckCircle } from 'lucide-react';

interface PasswordModalProps {
  t: any;
  show: boolean;
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  t,
  show,
  onClose,
  form,
  setForm,
  onSubmit
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-bl-[3rem] -mr-10 -mt-10"></div>
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              <X size={20} />
            </button>

            <div className="flex items-center mb-8 relative z-10">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 mr-4 shadow-inner">
                <Lock size={24} />
              </div>
              <h3 className="text-2xl font-black text-brand-dark tracking-tight">{t('admin.change_password', 'Changer le mot de passe')}</h3>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('admin.current_password', 'Mot de passe actuel')}</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="password"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gray-100 outline-none font-bold text-brand-dark transition-all placeholder-gray-300"
                    placeholder={t('admin.placeholder_password')}
                    value={form.oldPassword}
                    onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('admin.new_password', 'Nouveau mot de passe')}</label>
                <div className="relative mb-4">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="password"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gray-100 outline-none font-bold text-brand-dark transition-all placeholder-gray-300"
                    placeholder={t('admin.placeholder_password')}
                    value={form.newPassword}
                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="password"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gray-100 outline-none font-bold text-brand-dark transition-all placeholder-gray-300"
                    placeholder={t('admin.confirm_new_pwd', 'Confirmer nouveau mot de passe')}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={18} />
                  <span>{t('admin.update_pwd_btn', 'Mettre à jour')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordModal;
