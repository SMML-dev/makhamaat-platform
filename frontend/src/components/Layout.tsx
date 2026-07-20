import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo_mbc.jpg';

const Layout = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('common.home'), path: '/' },
    { name: t('common.about'), path: '/about' },
    { name: t('common.services'), path: '/services' },
    { name: t('common.contact'), path: '/contact' },
  ];

  const domainItems = [
    { key: 'agriculture', emoji: '🌾' },
    { key: 'horticulture', emoji: '🌻' },
    { key: 'market_gardening', emoji: '🥕' },
    { key: 'cereals_fruits', emoji: '🍎' },
    { key: 'agro_food', emoji: '🥫' },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col bg-brand-light font-sans">
      <header 
        className={`fixed w-full z-50 transition-all duration-500 ${
          isScrolled 
            ? 'py-3 glass' 
            : 'py-5 bg-white/40 backdrop-blur-md border-b border-white/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center group">
              <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 group-hover:shadow-2xl transition-all duration-500 transform group-hover:-rotate-3 group-hover:scale-105">
                <img src={logo} alt="Makhamaat Logo" className="h-10 w-auto" />
              </div>
              <div className="ml-4 hidden lg:block">
                 <span className="block text-brand-emerald font-black text-xl leading-none tracking-tighter uppercase">Makhamaat</span>
                 <span className="block text-brand-gold text-[10px] font-black uppercase tracking-[0.3em] mt-1">Business Corporation</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center space-x-12">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`relative text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 group py-2 ${
                    location.pathname === link.path 
                      ? 'text-brand-emerald' 
                      : 'text-brand-dark/60 hover:text-brand-emerald'
                  }`}
                >
                  {link.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-emerald transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-gray-100/50 p-1 rounded-full border border-gray-200/50">
                <button 
                  onClick={() => changeLanguage('fr')}
                  className={`text-[9px] font-black w-8 h-8 rounded-full transition-all duration-300 ${i18n.language === 'fr' ? 'bg-brand-emerald text-white shadow-lg' : 'text-gray-400 hover:text-brand-dark'}`}
                >
                  FR
                </button>
                <button 
                  onClick={() => changeLanguage('en')}
                  className={`text-[9px] font-black w-8 h-8 rounded-full transition-all duration-300 ${i18n.language === 'en' ? 'bg-brand-emerald text-white shadow-lg' : 'text-gray-400 hover:text-brand-dark'}`}
                >
                  EN
                </button>
              </div>

              <Link 
                to="/login" 
                className="text-[11px] font-black text-brand-dark/70 hover:text-brand-emerald transition-all uppercase tracking-[0.2em]"
              >
                {t('common.login')}
              </Link>
              <Link 
                to="/register" 
                className="premium-emerald-gradient text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl hover:shadow-brand-emerald/40"
              >
                {t('navbar.get_started')}
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg bg-gray-50 text-brand-dark hover:text-brand-green transition-all border border-gray-100 shadow-sm"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        <motion.div 
          initial={false}
          animate={isMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className={`md:hidden overflow-hidden glass animate-none ${isMenuOpen ? 'border-t border-gray-100 py-6' : ''}`}
        >
          <div className="px-6 space-y-4 flex flex-col items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className="text-brand-dark font-bold uppercase tracking-widest py-2 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 flex flex-col items-center space-y-4 w-full">
              <div className="flex items-center space-x-4 mb-4">
                <button 
                  onClick={() => changeLanguage('fr')}
                  className={`px-4 py-2 rounded-xl border font-bold text-xs ${i18n.language === 'fr' ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                  FRANÇAIS
                </button>
                <button 
                  onClick={() => changeLanguage('en')}
                  className={`px-4 py-2 rounded-xl border font-bold text-xs ${i18n.language === 'en' ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-500 border-gray-200'}`}
                >
                  ENGLISH
                </button>
              </div>
              <Link to="/login" className="text-brand-green font-bold uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>{t('common.login')}</Link>
              <Link to="/register" className="premium-gradient text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-center w-full shadow-lg" onClick={() => setIsMenuOpen(false)}>
                {t('navbar.get_started')}
              </Link>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="flex-grow pt-20">
        <Outlet />
      </main>

      <footer id="contact" className="bg-brand-dark text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                  <img src={logo} alt="Makhamaat Logo" className="h-12 w-auto" />
                </div>
              </div>
              <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
                {t('footer.description')}
              </p>
              <p className="text-sm text-gray-500">{t('footer.manager')}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center"><span className="w-8 h-1 bg-brand-green mr-3 rounded-full"></span> {t('footer.domains_title')}</h3>
              <ul className="space-y-3 text-gray-400">
                {domainItems.map(({ key, emoji }) => (
                  <li key={key} className="hover:text-brand-yellow transition-colors cursor-pointer flex items-center">
                    {t(`footer.domains.${key}`)}
                    <span className="ml-2 text-xs">{emoji}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-6 flex items-center"><span className="w-8 h-1 bg-brand-yellow mr-3 rounded-full"></span> {t('footer.contact_title')}</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start">
                  <span className="text-brand-green mr-3">🏠</span> 
                  <span>
                    <span className="text-white text-xs font-bold block uppercase mb-1">{t('footer.headquarters')}</span>
                    {t('footer.address_line1')}<br/>{t('footer.address_line2')}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-brand-green mr-3">🌾</span> 
                  <span>
                    <span className="text-white text-xs font-bold block uppercase mb-1">{t('footer.farm')}</span>
                    {t('footer.farm_location')}
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="text-brand-green mr-3">📞</span> 
                  <span>+221 77 555 23 49</span>
                </li>
                <li className="flex items-center">
                  <span className="text-brand-green mr-3">✉️</span> 
                  <span>contact@mbc-suarl.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="text-gray-500 hover:text-white cursor-pointer transition-colors">{t('footer.privacy')}</span>
              <span className="text-gray-500 hover:text-white cursor-pointer transition-colors">{t('footer.terms')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
