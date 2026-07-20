import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Download, X } from 'lucide-react';

interface QRCodeModalProps {
  show: boolean;
  onClose: () => void;
  data: string;
  title: string;
  settings: any;
  t: any;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  show,
  onClose,
  data,
  title,
  settings,
  t
}) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `QR_${title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            className={`p-12 rounded-[4rem] max-w-sm w-full text-center shadow-premium border relative ${
              settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"
            }`}
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-20"
            >
              <X size={20} className={settings.darkMode ? "text-white" : "text-brand-dark"} />
            </button>

            <div className="w-24 h-24 bg-brand-emerald/10 rounded-[2.5rem] flex items-center justify-center text-brand-emerald mx-auto mb-10 shadow-lg shadow-brand-emerald/20">
              <QrCode size={48} />
            </div>

            <h3 className={`text-3xl font-black mb-4 tracking-tight ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
               {t('admin.qr_product_title')}
            </h3>
            <p className="text-gray-500 font-bold mb-10 text-sm uppercase tracking-widest">{title}</p>

            <div className={`p-8 rounded-[3rem] border mb-10 mx-auto w-fit ${settings.darkMode ? "bg-white border-white/10" : "bg-gray-50 border-gray-100 shadow-inner"}`}>
               <img src={qrUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-5 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
            >
              <Download size={16} />
              {t('admin.qr_download_label')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRCodeModal;
