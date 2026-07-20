import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, UserPlus, Users, MessageCircle, Loader2 
} from 'lucide-react';

interface ActorsManagementProps {
  t: any;
  actorSearchQuery: string;
  setActorSearchQuery: (val: string) => void;
  actors: any[];
  isLoadingActors: boolean;
  setShowNewActorModal: (show: boolean) => void;
  openProfile: (actor: any) => void;
  openContact: (actor: any) => void;
}

const ActorsManagement: React.FC<ActorsManagementProps> = ({
  t,
  actorSearchQuery,
  setActorSearchQuery,
  actors,
  isLoadingActors,
  setShowNewActorModal,
  openProfile,
  openContact
}) => {
  return (
    <motion.div
      key="clients"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-dark tracking-tight">{t('admin.actors', 'Partenaires & Acteurs')}</h2>
          <p className="text-gray-500 font-medium mt-1">{t('admin.actors_desc', 'Gestion du répertoire des fournisseurs et clients B2B.')}</p>
        </div>
        <button
          onClick={() => setShowNewActorModal(true)}
          className="flex items-center px-6 py-3 bg-brand-yellow text-brand-dark hover:bg-yellow-400 rounded-xl font-bold transition-all shadow-lg shadow-brand-yellow/20 group self-start md:self-auto"
        >
          <UserPlus className="mr-2 group-hover:scale-110 transition-transform" size={18} />
          {t('admin.new_actor_btn', 'Nouvel Acteur')}
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-yellow transition-colors" size={18} />
        <input
          type="text"
          placeholder={t('admin.search_actor', 'Rechercher un acteur...')}
          value={actorSearchQuery}
          onChange={(e) => setActorSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand-yellow outline-none font-bold text-brand-dark shadow-sm transition-all placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoadingActors ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-brand-yellow animate-spin mb-4" />
            <p className="text-gray-400 font-bold">{t('common.loading', 'Chargement des acteurs...')}</p>
          </div>
        ) : actors.length > 0 ? (
          actors.filter(actor =>
            actor.name.toLowerCase().includes(actorSearchQuery.toLowerCase()) ||
            actor.location.toLowerCase().includes(actorSearchQuery.toLowerCase())
          ).map((actor, idx) => (
            <motion.div
              key={actor._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 hover:shadow-2xl hover:shadow-brand-yellow/10 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-yellow/5 rounded-bl-[3rem] -mr-10 -mt-10 group-hover:bg-brand-yellow/10 group-hover:scale-110 transition-all duration-700"></div>

              <div className="flex items-center mb-6 relative z-10">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl border border-white shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ${actor.type === 'SUPPLIER' ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500' :
                  actor.type === 'CLIENT_EXPORT' ? 'bg-gradient-to-br from-brand-yellow/50 to-brand-yellow text-brand-dark' :
                    'bg-gradient-to-br from-brand-dark to-gray-800 text-white'
                  }`}>
                  {actor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div className="pr-2 ml-4">
                  <h3 className="font-black text-brand-dark text-lg leading-tight mb-1 group-hover:text-brand-yellow transition-colors">{actor.name}</h3>
                  <p className="text-gray-400 group-hover:text-brand-dark dark:group-hover:text-white text-sm font-bold transition-colors">{actor.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-6 relative z-10">
                <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition-all group-hover:shadow-sm ${actor.type === 'SUPPLIER' ? 'bg-purple-50 text-purple-700 border-purple-200 group-hover:bg-purple-100' :
                  actor.type === 'CLIENT_EXPORT' ? 'bg-brand-yellow/10 text-yellow-700 border-brand-yellow/30 group-hover:bg-brand-yellow/20' :
                    'bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-100'
                  }`}>
                  {actor.type === 'SUPPLIER' ? t('admin.actor_type_supplier', 'Fournisseur') : actor.type === 'CLIENT_EXPORT' ? t('admin.actor_type_export', 'Client Export') : t('admin.actor_type_b2b', 'Client B2B')}
                </span>
                <span className="flex items-center px-3 py-1 rounded-lg bg-green-50 border border-green-100 text-green-600 text-[10px] font-black uppercase tracking-wider group-hover:bg-green-100 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>
                  {t('common.active', 'Actif')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 border-t border-gray-50 pt-6 relative z-10">
                <button
                  onClick={() => openProfile(actor)}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-50 hover:bg-brand-dark hover:text-white text-gray-500 rounded-xl text-xs font-bold transition-all active:scale-95 border border-transparent hover:border-white/10"
                >
                  <Users size={14} />
                  <span>{t('admin.actor_profile', 'Voir Profil')}</span>
                </button>
                <button
                  onClick={() => openContact(actor)}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-yellow/10 hover:bg-brand-yellow text-brand-dark rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm hover:shadow-md"
                >
                  <MessageCircle size={14} />
                  <span>{t('common.contact', 'Contacter')}</span>
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <UserPlus className="text-gray-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-brand-dark mb-2">{t('admin.no_actor', 'Aucun acteur trouvé.')}</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-6">{t('admin.adjust_search', "Essayez d'ajuster votre recherche.")}</p>
            <button
              onClick={() => setActorSearchQuery('')}
              className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              {t('common.reset', 'Réinitialiser')}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ActorsManagement;
