import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Apple, ShoppingBag, Truck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import pimentHydro from '../assets/piment_hydro.png';

export const SERVICES_CONTENT_KEYS: string[] = [
  'services_page.title_prefix',
  'services_page.title_highlight',
  'services_page.subtitle',
  'services_page.items.hydroponics.title',
  'services_page.items.hydroponics.desc',
  'services_page.items.fruits.title',
  'services_page.items.fruits.desc',
  'services_page.items.kiosks.title',
  'services_page.items.kiosks.desc',
  'services_page.items.export.title',
  'services_page.items.export.desc',
  'services_page.focus_title_prefix',
  'services_page.focus_title_highlight',
  'services_page.focus_description',
  'services_page.focus_image_alt',
];

export const SERVICES_CONTENT_ZONES: string[] = ['top', 'after-hero', 'after-list', 'after-focus', 'bottom'];

const Services = () => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState<Record<string, string | { en?: string; fr?: string; zone?: string }>>({});
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  useEffect(() => {
    api.get('/content').then(res => setContent(res.data)).catch(() => {});
  }, []);

  const getContent = (key: string) => {
    const value = content[key];
    if (typeof value === 'string') return value || t(key);
    return value?.[lang] ?? t(key);
  };

  const renderDynamicZone = (zone: string, bgClass: string = 'bg-white') => {
    const keys = Object.keys(content).filter((key) => {
      const value = content[key];
      if (SERVICES_CONTENT_KEYS.includes(key)) return false;
      if (typeof value === 'string') return zone === 'bottom' && value.length > 0;
      return value?.zone === zone && (value?.en || value?.fr);
    });
    if (keys.length === 0) return null;
    return (
      <section className={`py-16 ${bgClass}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {keys.map((key) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-bold text-brand-dark mb-2">{key}</h3>
              <p className="text-gray-600">{getContent(key)}</p>
            </motion.div>
          ))}
        </div>
      </section>
    );
  };


  const servicesList = [
    { icon: Leaf, key: 'hydroponics' },
    { icon: Apple, key: 'fruits' },
    { icon: ShoppingBag, key: 'kiosks' },
    { icon: Truck, key: 'export' },
  ] as const;

  return (
    <div className="py-24 bg-white min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderDynamicZone('top')}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            {getContent('services_page.title_prefix')} <span className="text-brand-yellow">{getContent('services_page.title_highlight')}</span>
          </h1>
          <div className="w-24 h-1 bg-brand-green mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {getContent('services_page.subtitle')}
          </p>
        </motion.div>

        {renderDynamicZone('after-hero')}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-24">
          {servicesList.map((service, idx) => (
            <motion.div 
              key={service.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="flex p-8 rounded-3xl bg-brand-light border border-gray-100 hover:shadow-2xl hover:shadow-brand-green/10 transition-all duration-300 group"
            >
              <div className="mr-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center text-brand-green group-hover:scale-110 group-hover:bg-brand-green group-hover:text-white transition-all">
                  <service.icon className="w-8 h-8" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brand-dark mb-3 leading-tight">{getContent(`services_page.items.${service.key}.title`)}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{getContent(`services_page.items.${service.key}.desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {renderDynamicZone('after-list')}

        {/* Projet Focus */}
        <div className="bg-gradient-to-br from-brand-green/5 to-brand-yellow/5 rounded-[3rem] p-12 border border-brand-green/10 relative overflow-hidden group">
             <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                   <h2 className="text-3xl font-bold text-brand-dark mb-6 tracking-tight">
                     {getContent('services_page.focus_title_prefix')} <span className="text-brand-green underline decoration-brand-yellow decoration-4 underline-offset-8">{getContent('services_page.focus_title_highlight')}</span>
                   </h2>
                   <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                      {getContent('services_page.focus_description')}
                   </p>
                </div>
                <div className="md:w-1/2 relative">
                   <div className="absolute -inset-1 bg-gradient-to-r from-brand-green to-brand-yellow rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                   <img 
                      src={pimentHydro} 
                      alt={getContent('services_page.focus_image_alt')} 
                      className="relative rounded-[2rem] shadow-2xl border-4 border-white transform group-hover:scale-105 group-hover:rotate-0 transition-all duration-700 w-full object-cover h-[400px]"
                   />
                </div>
             </div>
        </div>

        {renderDynamicZone('after-focus')}

      {renderDynamicZone('bottom')}
      </div>
    </div>
  );
};

export default Services;
