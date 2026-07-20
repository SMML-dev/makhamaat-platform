import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, AlertTriangle } from "lucide-react";

interface RotationConfirmModalProps {
  t: any;
  settings: any;
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

const RotationConfirmModal: React.FC<RotationConfirmModalProps> = ({
  t,
  settings,
  show,
  onClose,
  onConfirm,
  isProcessing,
}) => {
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
            className={`p-12 rounded-[4rem] max-w-sm w-full text-center shadow-premium border ${
              settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"
            }`}
          >
            <div className="w-24 h-24 bg-brand-emerald/10 rounded-[2.5rem] flex items-center justify-center text-brand-emerald mx-auto mb-10 shadow-lg shadow-brand-emerald/20 animate-spin-slow">
              <RefreshCcw size={48} />
            </div>

            <h3 className={`text-3xl font-black mb-4 tracking-tight ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
               {t('admin.security_rotation', 'Rotation de Sécurité')}
            </h3>

            <p className="text-gray-500 font-bold mb-8 leading-relaxed">
              {t('admin.rotation_warning', 'Cette action va régénérer toutes les clés de sécurité. TOUS les utilisateurs seront instantanément déconnectés. Continuer ?')}
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex items-center gap-4 mb-10 text-amber-500 text-sm font-bold text-left">
                <AlertTriangle size={24} className="shrink-0" />
                <p>{t('admin.rotation_impact', 'L\'application redémarrera pour appliquer les nouvelles clés.')}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                  settings.darkMode
                    ? "bg-white/5 border border-white/10 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={onConfirm}
                disabled={isProcessing}
                className="flex-1 py-5 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                   <div className="w-4 h-4 border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin" />
                ) : (
                  t("admin.confirm_btn")
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RotationConfirmModal;
