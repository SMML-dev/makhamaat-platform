import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, MapPin, Globe, MessageCircle, ExternalLink, Calendar, ShieldCheck, Activity } from 'lucide-react';

interface ProfileModalProps {
  t: any;
  show: boolean;
  onClose: () => void;
  actor: any;
  onContact: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  t,
  show,
  onClose,
  actor,
  onContact
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
            className="bg-white rounded-[3rem] p-0 max-w-2xl w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            {/* Modal Header/Banner */}
            <div className={`h-40 relative flex-shrink-0 ${actor.type === 'SUPPLIER' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' :
              actor.type === 'CLIENT_EXPORT' ? 'bg-gradient-to-r from-brand-yellow to-yellow-600' :
                'bg-gradient-to-r from-brand-dark to-gray-800'
              }`}>
              <div className="absolute top-0 right-0 w-64 h-full bg-white/10 rounded-l-full blur-3xl pointer-events-none"></div>
              <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all backdrop-blur-sm z-20">
                <X size={20} />
              </button>
            </div>

            {/* Profile Content */}
            <div className="px-10 pb-10 -mt-16 relative z-10">
              <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1.5 shadow-2xl ring-4 ring-white/50 flex-shrink-0">
                  <div className={`w-full h-full rounded-[2rem] flex items-center justify-center font-black text-4xl shadow-inner ${actor.type === 'SUPPLIER' ? 'bg-purple-50 text-purple-600' :
                    actor.type === 'CLIENT_EXPORT' ? 'bg-brand-yellow text-brand-dark' :
                      'bg-brand-dark text-white'
                    }`}>
                    {actor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                </div>
                <div className="flex-1 mb-2">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-3xl font-black text-brand-dark tracking-tight leading-none">{actor.name}</h3>
                    <div className="flex items-center px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                      {t('common.active', 'Actif')}
                    </div>
                  </div>
                  <p className="text-gray-500 font-bold flex items-center">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    {actor.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <ShieldCheck size={14} className="mr-2" />
                      {t('admin.account_info', 'Informations du compte')}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-500">{t('admin.actor_type', 'Type')}</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${actor.type === 'SUPPLIER' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          actor.type === 'CLIENT_EXPORT' ? 'bg-brand-yellow/10 text-yellow-700 border-brand-yellow/30' :
                            'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                          {actor.type === 'SUPPLIER' ? t('admin.actor_type_supplier', 'Fournisseur') : actor.type === 'CLIENT_EXPORT' ? t('admin.actor_type_export', 'Client Export') : t('admin.actor_type_b2b', 'Client B2B')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-500">{t('admin.member_since', 'Membre depuis')}</span>
                        <span className="text-xs font-black text-brand-dark flex items-center uppercase tracking-widest">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {new Date(actor.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <Globe size={14} className="mr-2" />
                      {t('common.contact', 'Coordonnées')}
                    </h4>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-sm font-black text-brand-dark tracking-tight">{actor.contact || t('admin.no_contact_info', 'Aucune information de contact')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center">
                      <ExternalLink size={14} className="mr-2" />
                      {t('admin.actions_rapides', 'Actions rapides')}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={onContact}
                        className="w-full flex items-center justify-center space-x-3 p-4 bg-brand-yellow text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-yellow/20 hover:bg-yellow-400 transition-all active:scale-95"
                      >
                        <MessageCircle size={18} />
                        <span>{t('admin.send_message', 'Envoyer un message')}</span>
                      </button>
                      <button className="w-full flex items-center justify-center space-x-3 p-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
                        <Users size={18} />
                        <span>{t('admin.view_orders', 'Historique des lots')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-brand-dark rounded-[2rem] text-white">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('admin.actor_notes', 'Note interne')}</p>
                    <p className="text-xs text-white/70 font-medium italic">
                      "{t('admin.actor_notes_placeholder', 'Partenaire stratégique pour l\'exportation de noix de cajou premium vers l\'Asie.')}"
                    </p>
                  </div>
                </div>
              </div>

              {/* TRANSACTIONS SECTION */}
              <div className="mt-10 pt-10 border-t border-gray-100">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                   <ShieldCheck size={14} className="mr-2" />
                   {t('admin.recent_transactions', 'Transactions Récentes')}
                </h4>
                <div className="space-y-3">
                  {actor.recentActivities && actor.recentActivities.length > 0 ? (
                    actor.recentActivities.map((act: any) => (
                      <div key={act._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-brand-emerald/30 transition-all">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                             act.type === 'SALE' ? 'bg-cyan-500/10 text-cyan-500' :
                             act.type === 'PURCHASE' ? 'bg-brand-emerald/10 text-brand-emerald' :
                             'bg-fuchsia-500/10 text-fuchsia-500'
                           }`}>
                             <Activity size={16} />
                           </div>
                           <div>
                             <p className="text-xs font-black text-brand-dark uppercase tracking-tight">{act.productId?.name || t('admin.global_sync')}</p>
                             <p className="text-[9px] font-bold text-gray-400">{new Date(act.createdAt).toLocaleDateString()} • {act.type}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black text-brand-dark">{(act.quantity/1000).toFixed(2)} T</p>
                           <p className="text-[8px] font-black text-brand-emerald uppercase tracking-widest">{t('admin.signed')}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center border-2 border-dashed border-gray-100 rounded-[2rem]">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('admin.no_transactions', 'Aucune transaction répertoriée')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
