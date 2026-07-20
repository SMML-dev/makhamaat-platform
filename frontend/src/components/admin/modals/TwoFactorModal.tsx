import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface TwoFactorModalProps {
  t: any;
  settings: any;
  show2FAModal: boolean;
  setShow2FAModal: (show: boolean) => void;
  twoFactorStep: "CONFIRM" | "SETUP";
  setTwoFactorStep: (step: "CONFIRM" | "SETUP") => void;
  qrCodeData: { qrCodeUrl: string; secret: string } | null;
  verificationToken: string;
  setVerificationToken: (token: string) => void;
  handleToggle2FA: () => Promise<void>;
  handleConfirm2FAActivation: () => Promise<void>;
  currentUser: any;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  t,
  settings,
  show2FAModal,
  setShow2FAModal,
  twoFactorStep,
  setTwoFactorStep,
  qrCodeData,
  verificationToken,
  setVerificationToken,
  handleToggle2FA,
  handleConfirm2FAActivation,
  currentUser,
}) => {
  return (
    <AnimatePresence>
      {show2FAModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl ${
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
            <div className="w-24 h-24 bg-brand-emerald/10 rounded-[2.5rem] flex items-center justify-center text-brand-emerald mx-auto mb-10 shadow-lg shadow-brand-emerald/20">
              <ShieldCheck size={48} />
            </div>

            <h3
              className={`text-3xl font-black mb-4 tracking-tight ${
                settings.darkMode ? "text-white" : "text-brand-dark"
              }`}
            >
              {currentUser?.isTwoFactorEnabled
                ? t("admin.safe_off")
                : t("admin.finalize_2fa")}
            </h3>

            {twoFactorStep === "SETUP" && qrCodeData?.qrCodeUrl ? (
              <div className="bg-white p-4 rounded-2xl mb-6 inline-block shadow-xl">
                <img 
                  src={qrCodeData.qrCodeUrl} 
                  alt="2FA QR Code"
                  className="w-[150px] h-[150px]"
                />
              </div>
            ) : twoFactorStep === "SETUP" ? (
              <div className="py-10 text-gray-500 font-bold animate-pulse">
                {t("common.loading", "Chargement...")}
              </div>
            ) : null}

            {twoFactorStep === "SETUP" && (
              <input
                type="text"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                className={`w-full rounded-2xl p-5 text-center text-xl font-bold mb-6 border outline-none transition-all focus:border-brand-emerald/50 ${
                  settings.darkMode
                    ? "bg-white/5 border-white/10 text-white"
                    : "bg-gray-50 border-gray-200 text-brand-dark"
                }`}
                placeholder={t("admin.token_placeholder")}
                maxLength={6}
              />
            )}

            <div className="flex gap-4">
              <button
                onClick={() => {
                   setShow2FAModal(false);
                   setTwoFactorStep("CONFIRM");
                }}
                className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${
                  settings.darkMode
                    ? "bg-white/5 border border-white/10 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {t("common.back")}
              </button>
              <button
                onClick={
                  twoFactorStep === "SETUP"
                    ? handleConfirm2FAActivation
                    : handleToggle2FA
                }
                className="flex-1 py-5 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                disabled={twoFactorStep === "SETUP" && verificationToken.length !== 6}
              >
                {t("admin.confirm_btn")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TwoFactorModal;
