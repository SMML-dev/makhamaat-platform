import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Handshake, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import aboutHero from '../assets/about_hero.png';

const About = () => {
  const { t } = useTranslation();

  const cards = [
    { key: 'fruits', icon: '🍋' },
    { key: 'hydroponics', icon: '🌱' },
  ] as const;

  const commitments = [
    { key: 'quality', icon: <ShieldCheck className="w-8 h-8 text-brand-yellow" /> },
    { key: 'logistics', icon: <Truck className="w-8 h-8 text-brand-green" /> },
    { key: 'proximity', icon: <Handshake className="w-8 h-8 text-brand-yellow" /> },
  ] as const;

  return (
    <div className="py-24 bg-brand-light min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-brand-dark mb-6 tracking-tight">
            {t('about_page.title_prefix')} <span className="text-brand-green">{t('about_page.title_highlight')}</span>
          </h1>
          <div className="w-24 h-1.5 bg-brand-yellow mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {t('about_page.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-brand-green/10 rounded-[2.5rem] blur-2xl group-hover:bg-brand-green/20 transition-all duration-700"></div>
            <img
              src={aboutHero}
              alt={t('about_page.farm_alt')}
              className="relative rounded-3xl shadow-2xl w-full h-[500px] object-cover border-8 border-white/80"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-green/5 border border-brand-green/10 text-brand-green text-sm font-bold uppercase tracking-widest">
              <Target className="w-4 h-4" />
              <span>{t('about_page.vision_badge')}</span>
            </div>
            <h2 className="text-4xl font-bold text-brand-dark leading-tight">{t('about_page.expertise_title')}</h2>
            <p className="text-gray-600 leading-relaxed text-lg font-light">
              {t('about_page.expertise_description')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {cards.map((card) => (
                <div key={card.key} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="text-3xl mb-4 group-hover:scale-125 transition-transform duration-300 inline-block">{card.icon}</div>
                  <h4 className="font-bold text-brand-dark mb-1 group-hover:text-brand-green transition-colors">{t(`about_page.cards.${card.key}.title`)}</h4>
                  <p className="text-sm text-gray-500 font-light">{t(`about_page.cards.${card.key}.desc`)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Engagement Section */}
        <section className="bg-[#0b121e] rounded-[4rem] p-12 md:p-24 text-white overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-green/10 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-yellow/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>

          <div className="relative z-10">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="h-px w-12 bg-white/20"></div>
                <span className="text-brand-yellow font-bold uppercase tracking-[0.4em] text-xs">{t('about_page.partnership_badge')}</span>
                <div className="h-px w-12 bg-white/20"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t('about_page.commitment_title')}</h2>
              <p className="text-gray-400 text-lg font-light leading-relaxed">{t('about_page.commitment_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {commitments.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.8 }}
                  className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] hover:bg-white/[0.08] transition-all hover:border-white/20 hover:shadow-2xl flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 tracking-tight text-white">{t(`about_page.commitments.${item.key}.title`)}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm font-light">{t(`about_page.commitments.${item.key}.desc`)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
