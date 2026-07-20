import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Hash, ShoppingBag, Layers, Weight, Ruler, Users, CheckCircle } from 'lucide-react';

interface NewLotModalProps {
  t: any;
  show: boolean;
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  actors: any[];
}

const NewLotModal: React.FC<NewLotModalProps> = ({
  t,
  show,
  onClose,
  form,
  setForm,
  onSubmit,
  actors
}) => {
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
            className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-bl-[5rem] -mr-20 -mt-20"></div>
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              <X size={24} />
            </button>

            <div className="flex items-center mb-8 relative z-10">
              <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mr-4 shadow-inner">
                <Package size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black text-brand-dark tracking-tight">{t('admin.receive_lot_title', 'Réceptionner un nouveau lot')}</h3>
                <p className="text-gray-500 font-medium">{t('admin.receive_lot_desc', 'Enregistrement d\'une entrée de stock dans le terminal.')}</p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('admin.lot_ref', 'Référence du Lot')}</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" size={18} />
                    <input
                      required
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-green/10 outline-none font-bold text-brand-dark transition-all placeholder-gray-300"
                      placeholder={t('admin.placeholder_lot_ref')}
                      value={form.ref}
                      onChange={(e) => setForm({ ...form, ref: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.product', 'Produit')}</label>
                  <div className="relative">
                    <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" size={18} />
                    <input
                      required
                      type="text"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-green/10 outline-none font-bold text-brand-dark transition-all placeholder-gray-300"
                      placeholder={t('admin.prod_name_placeholder')}
                      value={form.product}
                      onChange={(e) => setForm({ ...form, product: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.category', 'Catégorie')}</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" size={18} />
                    <select
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-green/10 outline-none font-bold text-brand-dark transition-all appearance-none"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option>{t('admin.raw_materials', 'Matières Premières')}</option>
                      <option>{t('admin.finished_products', 'Produits Finis')}</option>
                      <option>{t('admin.packaging', 'Emballages')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.volume', 'Volume')}</label>
                    <div className="relative">
                      <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" size={18} />
                      <input
                        required
                        type="number"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-green/10 outline-none font-bold text-brand-dark transition-all placeholder-gray-300"
                        placeholder={t('admin.placeholder_volume')}
                        step="0.01"
                        value={form.volume}
                        onChange={(e) => setForm({ ...form, volume: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.unit', 'Unité')}</label>
                    <select
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-green/10 outline-none font-bold text-brand-dark appearance-none text-center"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    >
                      <option>T</option>
                      <option>kg</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('admin.quality', 'Qualité')}</label>
                  <div className="relative">
                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" size={18} />
                    <select
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-green/10 outline-none font-bold text-brand-dark appearance-none"
                      value={form.quality}
                      onChange={(e) => setForm({ ...form, quality: e.target.value })}
                    >
                      <option>{t('admin.quality_standard', 'Standard')}</option>
                      <option>{t('admin.quality_excellent', 'Excellent')}</option>
                      <option>{t('admin.quality_damaged', 'Endommagé')}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('admin.actor_origin', 'Producteur / Origine')}</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green" size={18} />
                    <select
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-green/10 outline-none font-bold text-brand-dark appearance-none"
                      value={form.actorId}
                      onChange={(e) => setForm({ ...form, actorId: e.target.value })}
                    >
                      <option value="">{t('admin.select_actor', 'Sélectionner un acteur...')}</option>
                      {actors.filter(a => a.type === 'SUPPLIER').map(a => (
                        <option key={a._id} value={a._id}>{a.name} - {a.location}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 bg-brand-green text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-green/30 hover:bg-green-700 transition-all hover:-translate-y-1 active:scale-95"
                >
                  <CheckCircle size={18} />
                  <span>{t('admin.record_lot', 'Enregistrer le lot')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewLotModal;
