import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Send, X, AlertCircle } from 'lucide-react';

interface BroadcastModalProps {
  show: boolean;
  onClose: () => void;
  onSend: (payload: any) => void;
  settings: any;
  t: any;
  isSending: boolean;
}

const BroadcastModal: React.FC<BroadcastModalProps> = ({
  show,
  onClose,
  onSend,
  settings,
  t,
  isSending
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;
    onSend({ subject, content, targetRole });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-3xl ${
            settings.darkMode ? "bg-black/95" : "bg-black/40"
          }`}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`p-10 rounded-[4rem] max-w-2xl w-full shadow-premium border relative flex flex-col ${
              settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"
            }`}
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-20"
            >
              <X size={20} className={settings.darkMode ? "text-white" : "text-brand-dark"} />
            </button>

            <div className="flex items-center gap-6 mb-12">
              <div className="w-20 h-20 bg-brand-emerald/10 rounded-3xl flex items-center justify-center text-brand-emerald shadow-inner">
                <Globe size={36} />
              </div>
              <div>
                <h3 className={`text-4xl font-black tracking-tighter ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{t('admin.broadcast_modal_title')}</h3>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">{t('admin.broadcast_modal_subtitle')}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="px-4 py-2 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t('admin.broadcast_subject_label')}</p>
                  </div>
                  <input 
                    type="text" 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={`w-full bg-transparent px-4 py-2 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`} 
                    placeholder={t('admin.broadcast_subject_placeholder')}
                    required
                  />
                </div>

                <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="px-4 py-2 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t('admin.broadcast_target_label')}</p>
                  </div>
                  <select 
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value as any)}
                    className={`w-full bg-transparent px-4 py-2 text-sm outline-none font-black uppercase tracking-widest ${settings.darkMode ? "text-brand-emerald" : "text-brand-dark"}`}
                  >
                    <option value="ALL">{t('admin.broadcast_target_all')}</option>
                    <option value="ADMIN">{t('admin.broadcast_target_admin')}</option>
                    <option value="USER">{t('admin.broadcast_target_user')}</option>
                  </select>
                </div>
              </div>

              <div className={`p-1.5 rounded-[2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                <div className="px-4 py-2 border-b border-white/5 mb-2">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t('admin.broadcast_content_label')}</p>
                </div>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full min-h-[150px] bg-transparent px-4 py-3 text-sm outline-none font-bold resize-none ${settings.darkMode ? "text-white" : "text-brand-dark"}`} 
                  placeholder={t('admin.broadcast_content_placeholder')}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-6">
                <div className="flex items-center gap-3 text-amber-500">
                  <AlertCircle size={16} />
                  <span className="text-[9px] font-black uppercase tracking-widest">{t('admin.broadcast_irreversible')}</span>
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className={`px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {t('common.cancel')}
                  </button>
                  <button 
                    type="submit"
                    disabled={isSending}
                    className="px-10 py-5 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 flex items-center gap-3 hover:scale-[1.05] transition-transform"
                  >
                    {isSending ? <div className="w-4 h-4 border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin" /> : <Send size={16} />}
                    {t('admin.broadcast_send_btn')}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BroadcastModal;
