import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Search, Inbox, Send, Trash2, Loader2, Mail 
} from 'lucide-react';

interface MessagingSystemProps {
  t: any;
  messageSearchQuery: string;
  setMessageSearchQuery: (val: string) => void;
  messageFolder: 'INBOX' | 'SENT' | 'TRASH' | 'BROADCASTS';
  setMessageFolder: (folder: 'INBOX' | 'SENT' | 'TRASH' | 'BROADCASTS') => void;
  messages: any[];
  broadcasts: any[];
  unreadInbox: number;
  unreadBroadcasts: number;
  isLoadingMessages: boolean;
  isLoadingBroadcasts: boolean;
  setViewingMessage: (msg: any) => void;
  handleUpdateMessageStatus: (id: string, status: string, folder?: string) => void;
}

const MessagingSystem: React.FC<MessagingSystemProps> = ({
  t,
  messageSearchQuery,
  setMessageSearchQuery,
  messageFolder,
  setMessageFolder,
  messages,
  broadcasts,
  unreadInbox,
  unreadBroadcasts,
  isLoadingMessages,
  isLoadingBroadcasts,
  setViewingMessage,
  handleUpdateMessageStatus
}) => {
  return (
    <motion.div
      key="messages"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 flex flex-col h-[calc(100vh-8rem)]"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-white/50 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
        <div>
          <h2 className="text-3xl font-extrabold text-brand-dark flex items-center tracking-tight">
            <MessageSquare className="mr-3 text-blue-500" size={32} strokeWidth={2.5} />
            {t('admin.messages', 'Messages')}
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-11 font-medium">{t('admin.messages_desc', 'Gérez les communications avec vos partenaires.')}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-blue-500" />
            </div>
            <input
              type="text"
              value={messageSearchQuery}
              onChange={(e) => setMessageSearchQuery(e.target.value)}
              className="pl-11 pr-4 py-3 border border-gray-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/20 bg-white hover:bg-gray-50/50 transition-all shadow-sm outline-none text-sm w-64 text-brand-dark placeholder-gray-400"
              placeholder={t('admin.search_message', 'Rechercher un message...')}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 pb-6">
        {/* Sidebar Folders */}
        <div className="w-full md:w-64 space-y-2 shrink-0">
          <button
            onClick={() => setMessageFolder('INBOX')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${messageFolder === 'INBOX' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center"><Inbox size={18} className="mr-3" /> {t('admin.inbox', 'Boîte de réception')}</div>
            {unreadInbox > 0 && messageFolder !== 'INBOX' && (
              <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{unreadInbox}</span>
            )}
          </button>
          <button
            onClick={() => setMessageFolder('SENT')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${messageFolder === 'SENT' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center"><Send size={18} className="mr-3" /> {t('admin.sent_messages', 'Messages envoyés')}</div>
          </button>
          <button
            onClick={() => setMessageFolder('TRASH')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${messageFolder === 'TRASH' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'}`}
          >
            <div className="flex items-center"><Trash2 size={18} className="mr-3" /> {t('admin.trash', 'Corbeille')}</div>
          </button>
          {/* Broadcasts from Super Admin */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t('admin.super_admin_label')}</p>
            <button
              onClick={() => setMessageFolder('BROADCASTS')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${
                messageFolder === 'BROADCASTS'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100'
              }`}
            >
              <div className="flex items-center"><MessageSquare size={18} className="mr-3" /> {t('admin.broadcasts_label')}</div>
              {unreadBroadcasts > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${messageFolder === 'BROADCASTS' ? 'bg-white/20 text-white' : 'bg-purple-500 text-white'}`}>
                  {unreadBroadcasts}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Message List or Broadcasts */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messageFolder === 'BROADCASTS' ? (
            isLoadingBroadcasts ? (
              <div className="flex justify-center flex-col items-center py-20 bg-white rounded-3xl border border-gray-100">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-500 font-bold">{t('admin.loading_broadcasts')}</p>
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 text-center px-4">
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="text-purple-300" size={32} />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">{t('admin.no_broadcast_received')}</h3>
                <p className="text-gray-500 text-sm">Les messages du Super Admin apparaîtront ici.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center shrink-0">
                    <MessageSquare size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-purple-900">{t('admin.official_comms')}</p>
                    <p className="text-xs text-purple-600">{broadcasts.length} message{broadcasts.length > 1 ? 's' : ''} du Super Admin</p>
                  </div>
                </div>
                {broadcasts.map((broadcast: any) => (
                  <div
                    key={broadcast._id}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md ${
                      broadcast.status === 'UNREAD'
                        ? 'bg-gradient-to-r from-purple-50 to-white border-purple-200 border-l-4 border-l-purple-500'
                        : 'bg-gray-50/50 border-gray-100'
                    }`}
                    onClick={() => {
                      setViewingMessage(broadcast);
                      if (broadcast.status === 'UNREAD') {
                        handleUpdateMessageStatus(broadcast._id, 'READ');
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-md uppercase tracking-wider">
                            → {broadcast.targetRole === 'ALL' ? t('common.all') : broadcast.targetRole}
                          </span>
                          <span className="text-xs text-gray-400">{new Date(broadcast.createdAt).toLocaleString()}</span>
                        </div>
                        <p className={`font-extrabold truncate ${broadcast.status === 'UNREAD' ? 'text-purple-900' : 'text-gray-600'}`}>
                          {broadcast.subject}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 truncate">{broadcast.content}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        <span className="text-xs font-bold text-purple-600">{broadcast.sender}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
          <>
          {isLoadingMessages ? (
            <div className="flex justify-center flex-col items-center py-20 bg-white rounded-3xl border border-gray-100">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-500 font-bold">{t('common.loading', 'Chargement des messages...')}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 text-center px-4">
              <Mail className="w-16 h-16 text-gray-200 mb-4" />
              <h3 className="text-xl font-bold text-brand-dark mb-2">{t('admin.no_message', 'Aucun message')}</h3>
              <p className="text-gray-500 text-sm">
                {messageFolder === 'INBOX' ? t('admin.empty_inbox', 'Votre boîte de réception est vide.') :
                  messageFolder === 'SENT' ? t('admin.empty_sent', "Votre dossier d'envoi est vide.") :
                    t('admin.empty_trash', 'Votre corbeille est vide.')}
              </p>
            </div>
          ) : (
            messages.filter((m: any) =>
              m.subject.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
              m.sender.toLowerCase().includes(messageSearchQuery.toLowerCase())
            ).map((msg: any) => (
              <div
                key={msg._id}
                onClick={() => {
                  setViewingMessage(msg);
                  if (msg.status === 'UNREAD') {
                    handleUpdateMessageStatus(msg._id, 'READ');
                  }
                }}
                className={`p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md flex items-center justify-between ${msg.status === 'UNREAD' ? 'bg-white border-blue-200 border-l-4 border-l-blue-500' : 'bg-gray-50/50 border-gray-100'}`}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className={`font-extrabold truncate ${msg.status === 'UNREAD' ? 'text-brand-dark' : 'text-gray-600'}`}>
                      {messageFolder === 'INBOX' ? msg.sender : (msg.receiverId ? msg.receiverId.name : t('common.admin', 'Administrateur'))}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p className={`text-sm truncate ${msg.status === 'UNREAD' ? 'font-bold text-gray-800' : 'text-gray-500 font-medium'}`}>{msg.subject}</p>
                </div>
                <div className="flex space-x-2 shrink-0">
                  {messageFolder !== 'TRASH' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpdateMessageStatus(msg._id, msg.status, 'TRASH'); }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title={t('common.delete', 'Supprimer')}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))
           )}
           </>
           )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessagingSystem;
