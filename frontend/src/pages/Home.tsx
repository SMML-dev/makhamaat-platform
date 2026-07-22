import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sprout, Tractor, Globe, ShoppingCart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import logo from '../assets/logo_mbc.jpg';
import pimentHydro from '../assets/piment_hydro.png';

export const HOME_CONTENT_KEYS: string[] = [
  'home.hero_badge',
  'home.hero_title_prefix',
  'home.hero_title_highlight',
  'home.hero_description',
  'home.discover_services',
  'home.contact_us',
  'home.expertise_label',
  'home.expertise_title',
  'home.features.hydroponics.title',
  'home.features.hydroponics.desc',
  'home.features.transformation.title',
  'home.features.transformation.desc',
  'home.features.kiosks.title',
  'home.features.kiosks.desc',
  'home.features.export.title',
  'home.features.export.desc',
  'home.innovation_badge',
  'home.innovation_title_prefix',
  'home.innovation_title_highlight',
  'home.innovation_description',
  'home.production_record_title',
  'home.production_record_desc',
  'home.annual_cycles_title',
  'home.annual_cycles_desc',
  'home.greenhouse_crops_title',
  'home.greenhouse_crops_desc',
  'home.greenhouse_crops_list',
  'home.tech_badge',
  'home.quality_label',
  'home.quality_certified',
  'home.about_title',
  'home.about_description',
  'home.about_items.seasonal',
  'home.about_items.cereals',
  'home.about_items.export',
  'home.about_items.processing',
  'home.learn_more',
];

const Home = () => {
  const { t, i18n } = useTranslation();
  const { hash } = useLocation();
  const [content, setContent] = useState<Record<string, string | { en?: string; fr?: string }>>({});

  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';
  const getContent = (key: string) => {
    const value = content[key];
    if (typeof value === 'string') return value || t(key);
    return value?.[lang] ?? t(key);
  };
  const hasContent = (key: string) => {
    const value = content[key];
    if (typeof value === 'string') return value.length > 0;
    return !!(value?.en || value?.fr);
  };

  useEffect(() => {
    api.get('/content').then(res => setContent(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (hash) {
      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [hash]);

  const features = [
    { icon: Tractor, key: 'hydroponics', color: 'text-brand-green', bg: 'bg-brand-green/10' },
    { icon: Sprout, key: 'transformation', color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' },
    { icon: ShoppingCart, key: 'kiosks', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Globe, key: 'export', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const aboutItems = ['seasonal', 'cereals', 'export', 'processing'] as const;

  return (
    <div className="flex flex-col w-full">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/90 to-brand-green/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Agriculture field" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8 bg-white p-6 rounded-[2.5rem] shadow-2xl shadow-brand-green/20 border border-white"
            >
              <img src={logo} alt="Makhamaat Logo" className="h-32 md:h-44 w-auto" />
            </motion.div>
            <span className="inline-block py-1 px-4 rounded-full bg-brand-yellow/20 text-brand-yellow font-bold text-xs mb-8 border border-brand-yellow/30 backdrop-blur-md uppercase tracking-[0.4em]">
              {getContent('home.hero_badge')}
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
              {getContent('home.hero_title_prefix')} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-yellow to-brand-lightGreen">
                {getContent('home.hero_title_highlight')}
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-200 max-w-3xl mb-10 leading-relaxed font-light">
              {getContent('home.hero_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/services" className="premium-gradient text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-brand-green/30 transition-all transform hover:-translate-y-1 flex items-center justify-center">
                {getContent('home.discover_services')} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/contact" className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center">
                {getContent('home.contact_us')}
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
            <svg className="relative block w-full h-[50px] md:h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-brand-light"></path>
            </svg>
        </div>
      </section>

      <section id="services" className="py-24 bg-brand-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-brand-green font-bold tracking-wider uppercase text-sm mb-2">{getContent('home.expertise_label')}</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-brand-dark">{getContent('home.expertise_title')}</h3>
            <div className="w-24 h-1 bg-brand-yellow mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, idx) => (
              <motion.div 
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-lg shadow-gray-200/50 border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h4 className="text-xl font-bold text-brand-dark mb-3">{getContent(`home.features.${feature.key}.title`)}</h4>
                <p className="text-gray-600 leading-relaxed text-sm">{getContent(`home.features.${feature.key}.desc`)}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-brand-dark rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <span className="text-brand-yellow font-bold uppercase tracking-widest text-xs mb-4 block">{getContent('home.innovation_badge')}</span>
              <h3 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                {getContent('home.innovation_title_prefix')} <span className="text-brand-green">{getContent('home.innovation_title_highlight')}</span>
              </h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                {getContent('home.innovation_description')}
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <span className="font-bold text-brand-yellow">34T</span>
                  </div>
                  <p className="text-gray-300">
                    <span className="text-white font-bold block">{getContent('home.production_record_title')}</span>
                    {getContent('home.production_record_desc')}
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <span className="font-bold text-brand-green">2x</span>
                  </div>
                  <p className="text-gray-300">
                    <span className="text-white font-bold block">{getContent('home.annual_cycles_title')}</span>
                    {getContent('home.annual_cycles_desc')}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-gray-300 mb-4">
                    <span className="text-white font-bold block">{getContent('home.greenhouse_crops_title')}</span>
                    {getContent('home.greenhouse_crops_desc')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getContent('home.greenhouse_crops_list').split(', ').map((crop, index) => (
                      <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-white border border-white/20">
                        {crop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="relative group">
               <div className="absolute -inset-4 bg-brand-green/20 rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
               <img 
                 src={pimentHydro} 
                 alt="Serre hydroponique de haute technologie Makhamaat" 
                 className="rounded-[3rem] shadow-2xl relative z-10 border-4 border-white/20 transform group-hover:scale-[1.02] transition-transform duration-700 w-full h-[450px] object-cover"
               />
               <div className="absolute top-6 right-6 z-20 bg-brand-green/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs font-bold uppercase tracking-widest text-white shadow-xl">
                 {getContent('home.tech_badge')}
               </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 relative"
            >
              <div className="absolute inset-0 bg-brand-green rounded-3xl transform rotate-3 scale-105 opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Transformation" 
                className="rounded-3xl shadow-2xl relative z-10 w-full object-cover"
              />
              <div className="absolute -bottom-10 -right-10 glass p-6 rounded-2xl z-20 flex items-center gap-4 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center text-white font-bold text-xl">
                  ✓
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{getContent('home.quality_label')}</p>
                  <p className="font-bold text-brand-dark">{getContent('home.quality_certified')}</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-6">
                {getContent('home.about_title')}
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                {getContent('home.about_description')}
              </p>
              <ul className="space-y-4 mb-8">
                {aboutItems.map((item) => (
                  <li key={item} className="flex items-center text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center mr-3 flex-shrink-0 text-sm">✓</span>
                    {getContent(`home.about_items.${item}`)}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="inline-flex items-center text-brand-green font-bold hover:text-brand-dark transition-colors">
                {getContent('home.learn_more')} <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {Object.keys(content).filter(key => !HOME_CONTENT_KEYS.includes(key) && hasContent(key)).length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {Object.keys(content).filter(key => !HOME_CONTENT_KEYS.includes(key) && hasContent(key)).map(key => (
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
      )}
    </div>
  );
};

export default Home;
