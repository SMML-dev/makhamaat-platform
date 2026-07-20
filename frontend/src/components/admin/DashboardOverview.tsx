import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, PackageOpen, Download, TrendingUp, 
  AlertTriangle, Users, Clock, CheckCircle, X 
} from 'lucide-react';

interface DashboardOverviewProps {
  t: any;
  stats: any;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  setActiveTab: (tab: string) => void;
  filteredMovements: any[];
  handleMarkAsDelivered: (id: string, e?: any) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  t,
  stats,
  searchQuery,
  setSearchQuery,
  setActiveTab,
  filteredMovements,
  handleMarkAsDelivered
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-br from-brand-darkEmerald to-brand-emerald p-10 rounded-[3rem] shadow-premium mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-gold/10 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="relative z-10">
          <p className="text-brand-gold/80 text-[10px] font-black uppercase tracking-[0.4em] mb-3">{t('admin.dashboard_badge')}</p>
          <h2 className="text-5xl font-black text-white flex items-center tracking-tighter leading-none">
            {t('admin.overview', 'Vue d\'ensemble')}
          </h2>
          <p className="text-white/50 text-sm mt-4 font-medium max-w-md">{t('admin.overview_desc', 'Pilotage opérationnel des flux logistiques et des stocks.')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-8 md:mt-0 relative z-10 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white/60" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-4 border border-white/20 rounded-2xl focus:ring-4 focus:ring-white/20 bg-white/10 hover:bg-white/20 transition-all outline-none text-sm w-full md:w-80 text-white font-bold placeholder-white/40 backdrop-blur-md"
              placeholder={t('admin.search_placeholder', 'Rechercher lot, produit...')}
            />
          </div>
          <button
            onClick={() => setActiveTab('stock')}
            className="flex items-center justify-center space-x-2 bg-brand-gold/20 hover:bg-brand-gold text-white hover:text-brand-dark border border-brand-gold/40 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
          >
            <Plus size={18} strokeWidth={3} />
            <span>{t('admin.new_entry', 'Nouv. Saisie')}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-premium border-l-[6px] border-l-brand-emerald border-y border-r border-gray-100/60 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(0,107,62,0.15)] transition-all duration-500">
          <div className="absolute -right-6 -bottom-6 text-brand-emerald/5 group-hover:text-brand-emerald/10 transition-colors transform group-hover:scale-125 duration-700">
            <PackageOpen size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-gradient-to-br from-brand-emerald/20 to-brand-emerald/5 w-fit rounded-2xl mb-4 border border-brand-emerald/10 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <PackageOpen size={24} className="text-brand-emerald" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-gray-400 group-hover:text-brand-emerald mb-2 uppercase tracking-[0.2em] transition-colors">{t('admin.global_volume', 'Volume Global')}</p>
            <h3 className="text-4xl font-black text-brand-dark tracking-tighter group-hover:scale-105 origin-left transition-transform duration-300">{stats.totalVolumeT} <span className="text-base text-gray-400 font-bold uppercase group-hover:text-brand-emerald transition-colors">{t('common.tonnes', 'T')}</span></h3>
            <div className="mt-5 w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner flex group-hover:h-3 transition-all">
              <div className="bg-gradient-to-r from-brand-darkEmerald to-brand-emerald h-full rounded-full relative" style={{ width: `75%` }}>
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-shimmer"></div>
              </div>
            </div>
            <p className="text-[10px] text-brand-dark font-black mt-3 flex justify-between items-center uppercase tracking-widest">
              <span className="text-gray-400 group-hover:text-brand-dark transition-colors">{t('admin.capacity_used', 'Utilisation')}</span>
              <span className="bg-brand-emerald/10 text-brand-emerald px-2 py-0.5 rounded-md border border-brand-emerald/20 group-hover:bg-brand-emerald group-hover:text-white transition-all duration-300 shadow-sm">{t('common.optimal', 'Optimal')}</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-premium border-l-[6px] border-l-blue-500 border-y border-r border-gray-100/60 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.15)] transition-all duration-500">
          <div className="absolute -right-6 -bottom-6 text-blue-600/5 group-hover:text-blue-600/10 transition-colors transform group-hover:scale-125 duration-700">
            <Download size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/5 w-fit rounded-2xl mb-4 border border-blue-500/10 shadow-inner group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
              <Download size={24} className="text-blue-600" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-gray-400 group-hover:text-blue-600 mb-2 uppercase tracking-[0.2em] transition-colors">{t('admin.incoming_mvts_month', 'Entrées Mois')}</p>
            <h3 className="text-4xl font-black text-brand-dark tracking-tighter group-hover:scale-105 origin-left transition-transform duration-300">{stats.incomingCount} <span className="text-base text-gray-400 font-bold uppercase group-hover:text-blue-600 transition-colors">{t('admin.oper_abbr', 'Op.')}</span></h3>
            <div className="mt-4 flex items-center space-x-2">
              <span className={`inline-flex items-center text-[10px] font-black px-2.5 py-1.5 rounded-xl border tracking-widest uppercase transition-all group-hover:scale-110 ${stats.incomingVariationPercent >= 0 ? 'text-brand-emerald bg-brand-emerald/5 border-brand-emerald/10 group-hover:bg-brand-emerald/10' : 'text-red-500 bg-red-50 border-red-100 group-hover:bg-red-100'}`}>
                <TrendingUp size={12} className={`mr-1 stroke-[3] ${stats.incomingVariationPercent < 0 && 'rotate-180'}`} />
                {stats.incomingVariationPercent >= 0 ? '+' : ''}{stats.incomingVariationPercent}% vs {stats.capitalizedPrevMonth}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-premium border-l-[6px] border-l-indigo-500 border-y border-r border-gray-100/60 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)] transition-all duration-500">
          <div className="absolute -right-6 -bottom-6 text-indigo-600/5 group-hover:text-indigo-600/10 transition-colors transform group-hover:scale-125 duration-700">
            <TrendingUp size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 w-fit rounded-2xl mb-4 border border-indigo-500/10 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <TrendingUp size={24} className="text-indigo-600" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-gray-400 group-hover:text-indigo-600 mb-2 uppercase tracking-[0.2em] transition-colors">{t('admin.outgoing_mvts_month', 'Sorties Mois')}</p>
            <h3 className="text-4xl font-black text-brand-dark tracking-tighter group-hover:scale-105 origin-left transition-transform duration-300">{stats.outgoingCount} <span className="text-base text-gray-400 font-bold uppercase group-hover:text-indigo-600 transition-colors">{t('admin.oper_abbr', 'Op.')}</span></h3>
            <div className="mt-4 flex items-center space-x-2">
              <span className={`inline-flex items-center text-[10px] font-black px-2.5 py-1.5 rounded-xl border tracking-widest uppercase transition-all group-hover:scale-110 ${stats.variationPercent >= 0 ? 'text-brand-emerald bg-brand-emerald/5 border-brand-emerald/10 group-hover:bg-brand-emerald/10' : 'text-red-500 bg-red-50 border-red-100 group-hover:bg-red-100'}`}>
                <TrendingUp size={12} className={`mr-1 stroke-[3] ${stats.variationPercent < 0 && 'rotate-180'}`} />
                {stats.variationPercent >= 0 ? '+' : ''}{stats.variationPercent}% vs {stats.capitalizedPrevMonth}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-premium border-l-[6px] border-l-brand-gold border-y border-r border-gray-100/60 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(45,106,79,0.15)] transition-all duration-500 flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 text-brand-gold/5 group-hover:text-brand-gold/10 transition-colors transform group-hover:scale-125 duration-700">
            <TrendingUp size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10 w-full">
            <div className="p-3 bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 w-fit rounded-2xl mb-4 border border-brand-gold/10 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
              <TrendingUp size={24} className="text-brand-gold" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-gray-400 group-hover:text-brand-gold mb-2 uppercase tracking-[0.2em] transition-colors">{t('admin.total_revenue', 'Revenus Totaux')}</p>
            <h3 className="text-2xl font-black text-brand-dark tracking-tighter group-hover:scale-105 origin-left transition-transform duration-300">
              {stats.totalRevenue.toLocaleString()}
              <span className="block text-xs text-gray-400 font-bold uppercase group-hover:text-brand-gold transition-colors mt-1">{t('admin.currency_fcfa')}</span>
            </h3>
            <div className="mt-4 flex items-center space-x-2">
              <span className={`inline-flex items-center text-[10px] font-black px-2.5 py-1.5 rounded-xl border tracking-widest uppercase transition-all group-hover:scale-110 ${stats.revenueVariationPercent >= 0 ? 'text-brand-emerald bg-brand-emerald/5 border-brand-emerald/10 group-hover:bg-brand-emerald/10' : 'text-red-500 bg-red-50 border-red-100 group-hover:bg-red-100'}`}>
                <TrendingUp size={12} className={`mr-1 stroke-[3] ${stats.revenueVariationPercent < 0 && 'rotate-180'}`} />
                {stats.revenueVariationPercent >= 0 ? '+' : ''}{stats.revenueVariationPercent}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-premium border-l-[6px] border-l-brand-gold border-y border-r border-gray-100/60 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(212,175,55,0.15)] transition-all duration-500">
          <div className="absolute -right-6 -bottom-6 text-brand-gold/5 group-hover:text-brand-gold/10 transition-colors transform group-hover:scale-125 duration-700">
            <AlertTriangle size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 w-fit rounded-2xl mb-4 border border-brand-gold/10 shadow-inner group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
              <AlertTriangle size={24} className="text-brand-gold" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-gray-400 group-hover:text-brand-gold mb-2 uppercase tracking-[0.2em] transition-colors">{t('admin.low_stock_alerts', 'Alertes Stock')}</p>
            <h3 className="text-4xl font-black text-brand-dark tracking-tighter group-hover:scale-105 origin-left transition-transform duration-300">{stats.lowStockCount} <span className="text-base text-gray-400 font-bold uppercase group-hover:text-brand-gold transition-colors">{t('admin.lots_label')}</span></h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {stats.lowStockProducts.map((p: any) => (
                <span key={p.id} className="text-[9px] font-black text-brand-gold bg-brand-gold/5 px-2.5 py-1 rounded-lg border border-brand-gold/20 uppercase tracking-widest transition-all group-hover:bg-brand-gold/10 group-hover:scale-110">{p.product}</span>
              ))}
              {stats.lowStockProducts.length === 0 && <span className="text-[9px] font-black text-brand-emerald bg-brand-emerald/5 px-2.5 py-1 rounded-lg border border-brand-emerald/20 uppercase tracking-widest transition-all group-hover:bg-brand-emerald/10 group-hover:scale-110">{t('admin.all_optimal')}</span>}
            </div>
          </div>
        </div>

        <div className="bg-brand-dark p-6 rounded-3xl shadow-premium border border-white/5 relative overflow-hidden group hover:-translate-y-2 hover:shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] transition-all duration-500">
          <div className="absolute -right-6 -bottom-6 text-white/5 group-hover:text-white/10 transition-colors transform group-hover:scale-125 duration-700">
            <Users size={140} strokeWidth={1} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-white/10 w-fit rounded-2xl mb-4 border border-white/10 shadow-inner group-hover:bg-white/20 transition-all duration-500">
              <Users size={24} className="text-brand-gold" strokeWidth={2.5} />
            </div>
            <p className="text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">{t('admin.active_actors', 'Acteurs Actifs')}</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">{stats.activeSuppliers + stats.activeClients}</h3>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl text-center hover:bg-white/10 transition-all">
                <span className="block text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">{t('admin.suppliers_abbr', 'Fourn.')}</span>
                <span className="text-white font-black text-xl tracking-tighter">{stats.activeSuppliers}</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl text-center hover:bg-white/10 transition-all">
                <span className="block text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">{t('admin.clients', 'Clients')}</span>
                <span className="text-white font-black text-xl tracking-tighter">{stats.activeClients}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Table Section */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden relative">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-emerald/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center relative z-10 gap-4 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-none">{t('admin.recent_mvt_journal', 'Journal des Mouvements')}</h3>
            <p className="text-gray-500 font-medium text-sm mt-2">{t('admin.traceability_desc', 'Traçabilité complète des derniers flux physiques.')}</p>
          </div>
          <button
            onClick={() => setActiveTab('stock')}
            className="flex items-center space-x-2 text-[11px] font-black text-white bg-brand-dark hover:bg-brand-emerald border border-brand-dark/10 px-8 py-4 rounded-2xl tracking-[0.15em] uppercase transition-all shadow-lg active:scale-95 whitespace-nowrap"
          >
            <span>{t('admin.view_all_history', 'Tout l\'historique')}</span>
          </button>
        </div>

        <div className="overflow-x-auto px-4 pb-4 hover-hide-scrollbar transition-all duration-300">
          <table className="w-full text-left text-sm border-separate border-spacing-y-3">
            <thead className="text-xs uppercase tracking-widest font-black sticky top-0">
              <tr>
                <th className="px-6 py-4 text-gray-500 bg-gray-50/80 rounded-l-xl w-1/5">{t('admin.flux_type', 'Type de Flux')}</th>
                <th className="px-6 py-4 text-gray-500 bg-gray-50/80 w-2/5">{t('admin.prod_ref', 'Produit & Référence')}</th>
                <th className="px-6 py-4 text-gray-500 bg-gray-50/80 w-1/5">{t('common.volume', 'Volume')}</th>
                <th className="px-6 py-4 text-gray-500 bg-gray-50/80 w-1/5">{t('common.status', 'Statut')}</th>
                <th className="px-6 py-4 text-gray-500 bg-gray-50/80 text-right rounded-r-xl">{t('admin.timestamp', 'Horodatage')}</th>
              </tr>
            </thead>
            <tbody className="">
              {filteredMovements.length > 0 ? (
                filteredMovements.map((movement) => {
                  const typeStylesMap: Record<string, string> = {
                    EXPORT: 'bg-purple-50 text-purple-700 border-purple-200/60 group-hover:border-purple-200',
                    TRANSFO: 'bg-brand-green/10 text-brand-green border-brand-green/20 group-hover:border-brand-green/30',
                    ACHAT: 'bg-blue-50 text-blue-600 border-blue-200 group-hover:border-blue-200',
                  };
                  const typeStyles = typeStylesMap[movement.type] || 'bg-gray-50 text-gray-700 border-gray-200 group-hover:border-gray-300';

                  const hoverBorderColorMap: Record<string, string> = {
                    EXPORT: 'group-hover:border-purple-200',
                    TRANSFO: 'group-hover:border-brand-green/30',
                    ACHAT: 'group-hover:border-blue-200',
                  };
                  const hoverBorderColor = hoverBorderColorMap[movement.type] || 'group-hover:border-gray-300';

                  const IconCmp = movement.icon;
                  const StatusIconCmp = movement.statusIcon !== 'pulse' ? movement.statusIcon : null;

                  return (
                    <React.Fragment key={movement.id}>
                      <tr className="bg-white hover:bg-brand-green/[0.03] dark:hover:bg-white/[0.02] transition-all group shadow-sm rounded-2xl border border-gray-100 relative">
                        <td className={`px-6 py-5 rounded-l-2xl border-y border-l border-gray-100 ${hoverBorderColor} transition-colors`}>
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-black tracking-wider border shadow-sm transition-all group-hover:scale-110 ${typeStyles}`}>
                            <IconCmp size={14} className="mr-2" strokeWidth={3} /> {movement.typeLabel}
                          </span>
                        </td>
                        <td className={`px-6 py-5 border-y border-gray-100 ${hoverBorderColor} transition-colors`}>
                          <span className="font-black text-brand-dark text-lg block mb-0.5 transition-colors">{movement.product}</span>
                          <span className="text-xs text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 font-bold uppercase tracking-wide transition-colors">{movement.type === 'ACHAT' ? t('admin.lot_ref_prefix') : t('admin.lot_batch_prefix')}<span className="font-mono text-brand-dark bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded ml-1 group-hover:bg-brand-yellow/20 transition-colors">{movement.ref}</span></span>
                        </td>
                        <td className={`px-6 py-5 font-black text-brand-dark text-lg tracking-tighter border-y border-gray-100 ${hoverBorderColor} transition-colors group-hover:scale-105 origin-left`}>{movement.volume}</td>
                        <td className={`px-6 py-5 border-y border-gray-100 ${hoverBorderColor} transition-colors`}>
                          {movement.statusColor === 'yellow' ? (
                            <span className="flex items-center text-yellow-600 font-bold bg-yellow-50 px-3 py-1.5 rounded-xl w-fit border border-yellow-200/50 shadow-[0_0_10px_rgba(250,204,21,0.2)] group-hover:bg-yellow-100 transition-colors">
                              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse shadow-[0_0_5px_rgba(250,204,21,0.8)]"></span>
                              {movement.status}
                            </span>
                          ) : movement.statusColor === 'red' ? (
                            <span className="flex items-center text-red-600 font-bold bg-red-50 px-3 py-1.5 rounded-xl w-fit border border-red-200/50 shadow-[0_0_10px_rgba(220,38,38,0.1)] group-hover:bg-red-100 transition-colors">
                              <X size={16} className="mr-2" strokeWidth={2.5} />
                              {movement.status}
                            </span>
                          ) : (
                            <span className="flex items-center text-brand-green font-bold bg-brand-green/5 px-3 py-1.5 rounded-xl w-fit border border-brand-green/20 shadow-[0_0_10px_rgba(0,132,61,0.1)] group-hover:bg-brand-green/10 transition-colors">
                              {StatusIconCmp && <StatusIconCmp size={16} className="mr-2" strokeWidth={2.5} />}
                              {movement.status}
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 font-semibold text-right rounded-r-2xl border-y border-r border-gray-100 ${hoverBorderColor} transition-colors whitespace-nowrap`}>
                          {movement.date}
                        </td>
                      </tr>
                      {movement.typeLabel === 'ACHAT' && movement.notes && (
                        <tr className="bg-gray-50/20">
                          <td colSpan={5} className="px-6 py-2 border-b border-gray-50">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm gap-4">
                              <div className="text-sm text-gray-600 font-medium w-full">
                                <span className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 mt-0">{t('admin.order_details', 'Détails de la commande')}</span>
                                {movement.deliveryDate && (
                                  <div className="mb-3 inline-flex items-center px-3 py-1.5 bg-brand-yellow/10 text-yellow-700 rounded-xl text-xs font-bold border border-brand-yellow/30 shadow-sm">
                                    <Clock size={14} className="mr-2" />
                                    {t('admin.delivery_wanted_on', 'Livraison souhaitée le :')} {movement.deliveryDate}
                                  </div>
                                )}
                                <p className="whitespace-pre-wrap text-sm leading-relaxed">{movement.notes}</p>
                              </div>
                              {movement.rawStatus !== 'COMPLETED' && movement.rawStatus !== 'CANCELLED' && (
                                <button
                                  onClick={(e) => handleMarkAsDelivered(movement.id, e)}
                                  className="inline-flex items-center px-4 py-2 bg-brand-green text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md shadow-brand-green/20 whitespace-nowrap"
                                >
                                  <CheckCircle size={16} className="mr-2" /> {t('admin.mark_delivered', 'Marquer comme Livré')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center border border-gray-100 rounded-2xl bg-white shadow-sm">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium text-lg">{t('admin.no_movements', 'Aucun mouvement trouvé.')}</p>
                      <p className="text-gray-400 text-sm mt-1">{t('admin.adjust_search', 'Essayez d\'ajuster votre recherche.')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardOverview;
