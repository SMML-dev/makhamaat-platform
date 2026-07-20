import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, LogOut, PackageSearch } from 'lucide-react';

interface DeleteConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  t: any;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  show,
  onClose,
  onConfirm,
  title,
  itemName,
  t
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative text-center"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-black text-brand-dark mb-2">{title}</h3>
          <p className="text-gray-500 text-sm mb-8">
            {t('admin.confirm_delete_desc', 'Êtes-vous sûr de vouloir supprimer')} <span className="font-black text-red-500">{itemName}</span> ? {t('admin.action_irreversible', 'Cette action est irréversible.')}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95">
              {t('common.cancel', 'Annuler')}
            </button>
            <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95">
              {t('common.delete', 'Supprimer')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface LogoutConfirmModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  t: any;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  show,
  onClose,
  onConfirm,
  t
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[3rem] -mr-10 -mt-10"></div>
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner relative z-10">
            <LogOut size={32} strokeWidth={2.5} />
          </div>
          <h3 className="text-2xl font-black text-brand-dark mb-3 tracking-tight relative z-10">{t('admin.confirm_logout', 'Se Déconnecter ?')}</h3>
          <p className="text-gray-500 text-sm mb-8 font-medium relative z-10">{t('admin.logout_msg', 'Souhaitez-vous fermer votre session sécurisée sur ce terminal ?')}</p>
          <div className="flex gap-4 relative z-10">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
            >
              {t('common.cancel', 'Annuler')}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 bg-brand-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center justify-center"
            >
              <LogOut size={16} className="mr-2" />
              {t('common.logout', 'Confirmer')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

interface StockAdjustmentModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  form: any;
  setForm: (form: any) => void;
  t: any;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  show,
  onClose,
  onConfirm,
  form,
  setForm,
  t
}) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <PackageSearch size={32} />
          </div>
          <h3 className="text-xl font-black text-brand-dark mb-2">{t('admin.adjust_stock_title', 'Ajustement de Stock')}</h3>
          <div className="space-y-4 mb-8">
            <div className="relative">
              <input
                type="number"
                step="0.01"
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-center text-2xl text-brand-dark"
                placeholder={t('admin.placeholder_volume')}
                value={form.adjustment}
                onChange={(e) => setForm({ ...form, adjustment: e.target.value })}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 uppercase">KG</span>
            </div>
            <p className="text-xs text-gray-400 font-medium">{t('admin.adjust_help', 'Entrez une valeur positive pour ajouter, négative pour retirer.')}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200 transition-all">
              {t('common.cancel', 'Annuler')}
            </button>
            <button onClick={onConfirm} className="flex-1 py-3.5 bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition-all">
              {t('common.confirm', 'Confirmer')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
