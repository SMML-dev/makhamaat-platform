import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Target, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import api from '../../services/api';

const typeOptions = ['sales', 'export', 'stock', 'production'];
const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled'];

export default function ObjectivesTab({ readOnly = false }: { readOnly?: boolean }) {
  const { t } = useTranslation();
  const [objectives, setObjectives] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product: '',
    name: '',
    targetQuantity: '',
    unit: 'kg',
    targetPrice: '',
    targetRevenue: '',
    deadline: '',
    type: 'sales',
    status: 'pending',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [objRes, prodRes] = await Promise.all([
        api.get('/objectives'),
        api.get('/products'),
      ]);
      setObjectives(objRes.data);
      setProducts(prodRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setFormData({
      product: '',
      name: '',
      targetQuantity: '',
      unit: 'kg',
      targetPrice: '',
      targetRevenue: '',
      deadline: '',
      type: 'sales',
      status: 'pending',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      product: formData.product,
      name: formData.name,
      targetQuantity: Number(formData.targetQuantity) || 0,
      unit: formData.unit,
      targetPrice: formData.targetPrice ? Number(formData.targetPrice) : undefined,
      targetRevenue: formData.targetRevenue ? Number(formData.targetRevenue) : undefined,
      deadline: new Date(formData.deadline).toISOString(),
      type: formData.type,
      status: formData.status,
      notes: formData.notes,
    };
    try {
      if (editingId) {
        await api.patch(`/objectives/${editingId}`, payload);
      } else {
        await api.post('/objectives', payload);
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (obj: any) => {
    setEditingId(obj._id);
    setFormData({
      product: typeof obj.product === 'object' ? obj.product._id : obj.product,
      name: obj.name,
      targetQuantity: obj.targetQuantity.toString(),
      unit: obj.unit || 'kg',
      targetPrice: obj.targetPrice?.toString() || '',
      targetRevenue: obj.targetRevenue?.toString() || '',
      deadline: obj.deadline ? new Date(obj.deadline).toISOString().split('T')[0] : '',
      type: obj.type,
      status: obj.status,
      notes: obj.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('superadmin.confirm_delete_objective', 'Supprimer cet objectif ?'))) return;
    try {
      await api.delete(`/objectives/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-green/10 flex items-center justify-center">
              <Target className="text-brand-green" size={22} />
            </div>
            {t('superadmin.tab_objectives', 'Objectifs Produits')}
          </h2>
          <p className="text-gray-500 text-sm mt-1">{t('superadmin.objectives_desc', 'Définissez les attentes par produit : quantités, prix, délais, etc.')}</p>
        </div>
        {!readOnly && (
        <button onClick={() => { if (showForm) resetForm(); else setShowForm(true); }} className="bg-brand-green hover:bg-brand-green/90 text-white px-4 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all">
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? t('common.close', 'Fermer') : t('superadmin.add_objective', 'Ajouter un objectif')}
        </button>
        )}
      </div>

      {showForm && !readOnly && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.product', 'Produit')}</label>
              <select name="product" value={formData.product} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none">
                <option value="">{t('superadmin.select_product', 'Choisir un produit')}</option>
                {products.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.objective_name', 'Nom')}</label>
              <input name="name" value={formData.name} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.target_quantity', 'Quantité cible')}</label>
              <input type="number" name="targetQuantity" value={formData.targetQuantity} onChange={handleChange} required min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.unit', 'Unité')}</label>
              <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder={t('superadmin.unit_placeholder', 'Ex: kg, T, units') as string} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.target_price', 'Prix cible (FCFA)')}</label>
              <input type="number" name="targetPrice" value={formData.targetPrice} onChange={handleChange} min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.target_revenue', 'Revenu cible (FCFA)')}</label>
              <input type="number" name="targetRevenue" value={formData.targetRevenue} onChange={handleChange} min="0" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.deadline', 'Date limite')}</label>
              <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.type', 'Type')}</label>
              <select name="type" value={formData.type} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none">
                {typeOptions.map(type => (
                  <option key={type} value={type}>{t(`superadmin.objective_type_${type}`, type)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.status', 'Statut')}</label>
              <select name="status" value={formData.status} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none">
                {statusOptions.map(status => (
                  <option key={status} value={status}>{t(`superadmin.objective_status_${status}`, status)}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('superadmin.notes', 'Notes')}</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-brand-green hover:bg-brand-green/90 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <Check size={14} className="stroke-[3px]" /> {editingId ? t('common.update', 'Mettre à jour') : t('common.create', 'Créer')}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest">
              {t('common.cancel', 'Annuler')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500 font-bold">{t('superadmin.loading_objectives', 'Chargement des objectifs...')}</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold">
                <tr>
                  <th className="px-4 py-3">{t('superadmin.product', 'Produit')}</th>
                  <th className="px-4 py-3">{t('superadmin.objective_name', 'Nom')}</th>
                  <th className="px-4 py-3">{t('superadmin.type', 'Type')}</th>
                  <th className="px-4 py-3">{t('superadmin.target_quantity', 'Qté')}</th>
                  <th className="px-4 py-3">{t('superadmin.target_price', 'Prix')}</th>
                  <th className="px-4 py-3">{t('superadmin.target_revenue', 'Revenu')}</th>
                  <th className="px-4 py-3">{t('superadmin.deadline', 'Date limite')}</th>
                  <th className="px-4 py-3">{t('superadmin.status', 'Statut')}</th>
                  {!readOnly && <th className="px-4 py-3">{t('superadmin.actions', 'Actions')}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {objectives.map(obj => (
                  <tr key={obj._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-brand-dark">{obj.product?.name || obj.product}</td>
                    <td className="px-4 py-3">{obj.name}</td>
                    <td className="px-4 py-3 capitalize">{(t(`superadmin.objective_type_${obj.type}`, obj.type) as string)}</td>
                    <td className="px-4 py-3">{obj.targetQuantity} {obj.unit}</td>
                    <td className="px-4 py-3">{obj.targetPrice ?? '-'}</td>
                    <td className="px-4 py-3">{obj.targetRevenue ?? '-'}</td>
                    <td className="px-4 py-3">{obj.deadline ? new Date(obj.deadline).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-black uppercase ${obj.status === 'completed' ? 'bg-green-100 text-green-600' : obj.status === 'cancelled' ? 'bg-red-100 text-red-600' : obj.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {(t(`superadmin.objective_status_${obj.status}`, obj.status) as string)}
                      </span>
                    </td>
                    {!readOnly && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(obj)} className="p-2 bg-brand-green/10 text-brand-green rounded-lg hover:bg-brand-green/20 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(obj._id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                    )}
                  </tr>
                ))}
                {objectives.length === 0 && (
                  <tr>
                    <td colSpan={readOnly ? 8 : 9} className="px-4 py-8 text-center text-gray-500 font-bold">
                      {readOnly ? t('superadmin.no_objectives', 'Aucun objectif défini.') : t('superadmin.no_objectives', 'Aucun objectif défini. Cliquez sur Ajouter pour créer le premier.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
