import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, User, Type, FileText, Send } from 'lucide-react';

interface ContactModalProps {
  t: any;
  show: boolean;
  onClose: () => void;
  actor: any;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ContactModal: React.FC<ContactModalProps> = ({
  t,
  show,
  onClose,
  actor,
  form,
  setForm,
  onSubmit
}) => {
  if (!actor) return null;

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
            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-bl-[3rem] -mr-10 -mt-10"></div>
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              <X size={20} />
            </button>

            <div className="flex items-center mb-8 relative z-10">
              <div className="w-12 h-12 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow mr-4 shadow-inner">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-brand-dark tracking-tight">{t('common.contact', 'Contacter')}</h3>
                <p className="text-gray-500 text-sm font-medium">{t('admin.contact_desc', 'Envoyer un message direct à')} <span className="font-black text-brand-dark">{actor.name}</span></p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.receiver', 'Destinataire')}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    disabled
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-gray-500 cursor-not-allowed"
                    value={actor.name}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.subject', 'Objet du message')}</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-yellow" size={18} />
                  <input
                    required
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-yellow/10 outline-none font-bold text-brand-dark transition-all placeholder-gray-300"
                    placeholder={t('admin.placeholder_invoice_subject')}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.message', 'Votre message')}</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-brand-yellow" size={18} />
                  <textarea
                    required
                    rows={4}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-yellow/10 outline-none font-bold text-brand-dark placeholder-gray-300 resize-none"
                    placeholder={t('admin.placeholder_contact_message')}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
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
                  className="flex-[2] py-4 bg-brand-yellow text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-yellow/20 hover:bg-yellow-400 transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Send size={18} className="mr-1" />
                  <span>{t('admin.send_message_btn', 'Envoyer le message')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ContactModal;
