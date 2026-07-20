import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Tag, Layers, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface NewProductModalProps {
  t: any;
  show: boolean;
  onClose: () => void;
  form: any;
  setForm: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NewProductModal: React.FC<NewProductModalProps> = ({
  t,
  show,
  onClose,
  form,
  setForm,
  onSubmit
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
            className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-bl-[3rem] -mr-10 -mt-10"></div>
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
              <X size={20} />
            </button>

            <div className="flex items-center mb-8 relative z-10">
              <div className="w-12 h-12 bg-brand-yellow/10 rounded-xl flex items-center justify-center text-brand-yellow mr-4 shadow-inner">
                <Plus size={24} />
              </div>
              <h3 className="text-2xl font-black text-brand-dark tracking-tight">{t('admin.new_product_title', 'Créer un Produit')}</h3>
            </div>

            <form onSubmit={onSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.name', 'Nom du produit')}</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-yellow" size={18} />
                  <input
                    required
                    type="text"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-yellow/10 outline-none font-bold text-brand-dark transition-all placeholder-gray-300"
                    placeholder={t('admin.prod_name_placeholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.category', 'Catégorie')}</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-yellow" size={18} />
                  <select
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-yellow/10 outline-none font-bold text-brand-dark appearance-none"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="Raw Materials">{t('admin.raw_materials', 'Matières Premières')}</option>
                    <option value="Finished Products">{t('admin.finished_products', 'Produits Finis')}</option>
                    <option value="Packaging">{t('admin.packaging', 'Emballages')}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('admin.unit_label', 'Unité par défaut')}</label>
                <div className="flex gap-2">
                  {['kg', 'T', 'G'].map(unit => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setForm({ ...form, unit })}
                      className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${form.unit === unit ? 'bg-brand-dark text-white border-brand-dark shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('admin.min_stock', 'Stock Alerte (Min)')}</label>
                <div className="relative">
                  <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-yellow" size={18} />
                  <input
                    type="number"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-yellow/10 outline-none font-bold text-brand-dark transition-all"
                    value={form.minStock}
                    onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">{form.unit}</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{t('common.description', 'Description')}</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 text-brand-yellow" size={18} />
                  <textarea
                    rows={2}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-yellow/10 outline-none font-bold text-brand-dark placeholder-gray-300 resize-none"
                    placeholder={t('admin.desc_placeholder')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-4 bg-brand-yellow text-brand-dark rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-yellow/20 hover:bg-yellow-400 transition-all active:scale-95 flex items-center justify-center space-x-2"
                >
                  <CheckCircle size={18} />
                  <span>{t('admin.create_product', 'Créer le Produit')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewProductModal;
