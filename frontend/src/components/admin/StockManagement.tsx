import React from 'react';
import { motion } from 'framer-motion';
import { 
  Download, TrendingUp, Plus, Package, Settings, ExternalLink, Trash2 
} from 'lucide-react';

interface StockManagementProps {
  t: any;
  stockFilter: string;
  setStockFilter: (filter: string) => void;
  filteredStocks: any[];
  handleExportPDF: () => void;
  setShowMvtSortantModal: (show: boolean) => void;
  setShowNewProductModal: (show: boolean) => void;
  setShowNewLotModal: (show: boolean) => void;
  handleEditProduct: (item: any) => void;
  setModalContent: (content: any) => void;
  handleDeleteProduct: (id: string, name: string) => void;
}

const StockManagement: React.FC<StockManagementProps> = ({
  t,
  stockFilter,
  setStockFilter,
  filteredStocks,
  handleExportPDF,
  setShowMvtSortantModal,
  setShowNewProductModal,
  setShowNewLotModal,
  handleEditProduct,
  setModalContent,
  handleDeleteProduct
}) => {
  return (
    <motion.div
      key="stock"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-brand-dark tracking-tight">{t('admin.stock_mgmt', 'Gestion des Stocks')}</h2>
          <p className="text-gray-500 font-medium mt-1">{t('admin.stock_desc', 'Inventaire en temps réel et suivi qualitatif des lots.')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold transition-all shadow-sm group whitespace-nowrap"
          >
            <Download size={18} className="mr-2 group-hover:translate-y-0.5 transition-transform" />
            {t('admin.export_pdf_btn', 'Exporter PDF')}
          </button>
          <button
            onClick={() => setShowMvtSortantModal(true)}
            className="flex items-center px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 group whitespace-nowrap"
          >
            <TrendingUp size={18} className="mr-2 group-hover:scale-110 transition-transform" />
            {t('admin.ship_sale_btn', 'Expédier / Vendre')}
          </button>
          <button
            onClick={() => setShowNewProductModal(true)}
            className="flex items-center px-4 py-2 bg-brand-yellow text-brand-dark hover:bg-yellow-400 rounded-xl font-bold transition-all shadow-lg shadow-brand-yellow/20 group whitespace-nowrap"
          >
            <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
            {t('admin.new_product_btn', 'Nouveau Produit')}
          </button>
          <button
            onClick={() => setShowNewLotModal(true)}
            className="flex items-center px-4 py-2 bg-brand-green text-white hover:bg-green-700 rounded-xl font-bold transition-all shadow-lg shadow-brand-green/20 group whitespace-nowrap"
          >
            <Package size={18} className="mr-2 group-hover:-translate-y-0.5 transition-transform" />
            {t('admin.receive_lot_btn', 'Réceptionner Lot')}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-gray-100">
        {[t('admin.all_products', 'Tous les produits'), t('admin.raw_materials', 'Matières Premières'), t('admin.finished_products', 'Produits Finis'), t('admin.packaging', 'Emballages'), t('admin.on_alert', 'En Alerte')].map(filter => (
          <button
            key={filter}
            onClick={() => setStockFilter(filter)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${stockFilter === filter ? 'bg-brand-dark text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <div className="overflow-x-auto hover-hide-scrollbar transition-all duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t('admin.lot_id_ref', 'ID Lot / Réf')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t('admin.prod_cat', 'Produit & Catégorie')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t('admin.vol_avail', 'Volume Dispo.')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t('admin.quality', 'Qualité')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t('admin.stock_state', 'État')}</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">{t('admin.last_update', 'Dernière MAJ')}</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStocks.length > 0 ? (
                filteredStocks.map((item, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    whileHover={{ scale: 1.002, x: 2 }}
                    key={item.id}
                    className="hover:bg-brand-green/[0.03] dark:hover:bg-white/[0.02] transition-all group border-b border-gray-100/50"
                  >
                    <td className="px-8 py-5 font-mono text-xs font-black text-gray-400 group-hover:text-brand-green transition-colors">{item.ref}</td>
                    <td className="px-6 py-5">
                      <div className="font-black text-brand-dark text-base transition-colors">{item.product}</div>
                      <div className="text-[11px] font-black text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 uppercase mt-1 tracking-wider transition-colors">{item.category}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-black text-brand-dark text-lg tracking-tighter group-hover:scale-105 transition-transform origin-left">{item.volume}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all group-hover:shadow-sm ${item.quality === t('admin.quality_standard', 'Standard') ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : item.quality === t('admin.quality_excellent', 'Excellent') ? 'bg-green-50 text-green-600 group-hover:bg-green-100' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                        {item.quality}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center group-hover:translate-x-1 transition-transform">
                        <span className={`w-2 h-2 rounded-full mr-2 ${item.statusColor === 'green' ? 'bg-green-500' : item.statusColor === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                        <span className={`text-[11px] font-bold ${item.statusColor === 'green' ? 'text-green-600' : item.statusColor === 'yellow' ? 'text-yellow-600' : 'text-red-600'} uppercase tracking-tight`}>{item.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{item.date}</td>
                    <td className="px-8 py-5 text-right flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditProduct(item)}
                        className="p-2 text-gray-400 group-hover:text-brand-green hover:bg-green-500/10 rounded-lg transition-all shadow-sm active:scale-95"
                        title={t('common.edit', 'Modifier')}
                      >
                        <Settings size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setModalContent({ title: t('admin.order_details', 'Détails du Lot'), message: t('admin.depth_view_lot', { ref: item.ref }) })}
                        className="p-2 text-gray-400 group-hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        <ExternalLink size={16} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(item.id, item.product)}
                        className="p-2 text-gray-400 group-hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all shadow-sm active:scale-95"
                        title={t('common.delete', 'Supprimer')}
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-gray-400 font-medium italic">
                    {t('admin.no_stock', 'Aucun stock correspondant.')}
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

export default StockManagement;
