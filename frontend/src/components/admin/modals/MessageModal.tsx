import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, User, MessageSquare, Send, Reply, Clock, Trash2, Archive, RotateCcw } from 'lucide-react';

interface MessageModalProps {
  t: any;
  show: boolean;
  onClose: () => void;
  message: any;
  onReply: () => void;
  handleUpdateMessageStatus: (id: string, status: string, folder: string) => void;
  messageFolder: string;
}

const MessageModal: React.FC<MessageModalProps> = ({
  t,
  show,
  onClose,
  message,
  onReply,
  handleUpdateMessageStatus,
  messageFolder
}) => {
  if (!message) return null;

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
            className="bg-white rounded-[3rem] p-0 max-w-2xl w-full shadow-2xl relative overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-full bg-white/10 rounded-l-full blur-3xl pointer-events-none"></div>
              <button 
                onClick={onClose} 
                className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-sm z-20"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
                  <Mail size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{message.subject}</h3>
                  <p className="text-white/70 text-sm font-medium mt-0.5">{t('admin.message_details', 'Détails de la communication')}</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Meta information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-inner">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 border border-gray-100">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{t('common.sender', 'Expéditeur')}</p>
                    <p className="text-sm font-black text-brand-dark tracking-tight">{message.sender}</p>
                  </div>
                </div>

                {message.receiverId && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-inner">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600 border border-gray-100">
                      <Send size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{t('common.receiver', 'Destinataire')}</p>
                      <p className="text-sm font-black text-brand-dark tracking-tight">{message.receiverId.name}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center space-x-4 shadow-inner">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-brand-gold border border-gray-100">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">{t('admin.timestamp', 'Horodatage')}</p>
                    <p className="text-sm font-black text-brand-dark tracking-tight">{new Date(message.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="relative p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner group">
                <MessageSquare size={120} className="absolute -bottom-6 -right-6 text-gray-200/50 -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />
                <p className="text-gray-800 font-medium leading-relaxed whitespace-pre-wrap relative z-10 text-lg">
                  {message.content}
                </p>
              </div>

              {/* Actions Section */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  {messageFolder !== 'TRASH' ? (
                    <button 
                      onClick={() => { handleUpdateMessageStatus(message._id, 'READ', 'TRASH'); onClose(); }}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95 border border-red-100 flex items-center space-x-2"
                      title={t('common.delete', 'Supprimer')}
                    >
                      <Trash2 size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('common.delete', 'Supprimer')}</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => { handleUpdateMessageStatus(message._id, 'READ', 'INBOX'); onClose(); }}
                      className="p-3 bg-brand-green/10 text-brand-green rounded-xl hover:bg-brand-green/20 transition-all active:scale-95 border border-brand-green/20 flex items-center space-x-2"
                      title={t('admin.restore_message')}
                    >
                      <RotateCcw size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('admin.restore_message')}</span>
                    </button>
                  )}
                  {messageFolder === 'INBOX' && (
                    <button 
                      className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all active:scale-95 border border-gray-200 flex items-center space-x-2"
                      title={t('admin.archive_message')}
                    >
                      <Archive size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">{t('admin.archive_message')}</span>
                    </button>
                  )}
                </div>

                {messageFolder === 'INBOX' && (
                  <button 
                    onClick={onReply}
                    className="flex-1 md:flex-none flex items-center justify-center space-x-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 w-full md:w-auto"
                  >
                    <Reply size={20} className="mr-1" />
                    <span>{t('admin.reply_btn', 'Répondre au message')}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MessageModal;
