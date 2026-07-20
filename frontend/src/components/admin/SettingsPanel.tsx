import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, CheckCircle, Globe, Activity, Layout, 
  RefreshCcw, ShieldCheck, Lock, Smartphone, HelpCircle, MessageSquare 
} from 'lucide-react';

interface SettingsPanelProps {
  t: any;
  i18n: any;
  settings: any;
  setSettings: (settings: any) => void;
  handlePurgeCache: () => void;
  cacheSize: string;
  showToast: (msg: string) => void;
  setShowPasswordModal: (show: boolean) => void;
  setShow2FAModal: (show: boolean) => void;
  currentUser: any;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  t,
  i18n,
  settings,
  setSettings,
  handlePurgeCache,
  cacheSize,
  showToast,
  setShowPasswordModal,
  setShow2FAModal,
  currentUser
}) => {
  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/70 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-gray-200/50 rounded-full blur-3xl -z-10"></div>
        <div>
          <h2 className="text-3xl font-extrabold text-brand-dark flex items-center tracking-tight">
            <SettingsIcon className="mr-3 text-gray-500" size={32} strokeWidth={2.5} />
            {t('common.settings', 'Paramètres')}
          </h2>
          <p className="text-gray-500 text-sm mt-1 ml-11 font-medium">{t('admin.settings_desc', 'Configuration du terminal et des préférences locales.')}</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => {
              localStorage.setItem('admin_settings', JSON.stringify(settings));
              showToast(t('admin.settings_saved', 'Paramètres enregistrés avec succès.'));
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-brand-dark to-gray-900 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-gray-900/30 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <CheckCircle size={18} strokeWidth={2.5} />
            <span>{t('admin.save_settings', 'Enregistrer')}</span>
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">

        {/* Language Selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="p-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="font-bold text-brand-dark flex items-center text-sm">
              <Globe size={16} className="mr-2 text-brand-green" />
              {t('navbar.language', 'Langue')}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{t('admin.interface_lang', "Langue de l'interface")}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">{t('admin.apply_globally', 'Appliquer globalement')}</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => i18n.changeLanguage('fr')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${i18n.language === 'fr' ? 'bg-white text-brand-green shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  FRANÇAIS
                </button>
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${i18n.language === 'en' ? 'bg-white text-brand-green shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ENGLISH
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Display & Interface */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-gray-50 pb-4 flex items-center">
            <Activity size={18} className="mr-2 text-blue-500" />
            {t('admin.display_interface', 'Affichage & Interface')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-brand-dark">{t('admin.dark_mode', 'Mode Sombre')}</p>
                <p className="text-xs text-gray-500">{t('admin.dark_mode_desc', 'Activer le thème sombre pour ce terminal.')}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
                className={`w-12 h-6 ${settings.darkMode ? 'bg-brand-green' : 'bg-gray-200'} rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/20`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${settings.darkMode ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-brand-dark">{t('admin.reduce_anim', 'Animations réduites')}</p>
                <p className="text-xs text-gray-500">{t('admin.reduce_anim_desc', 'Désactiver les effets visuels gourmands.')}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, reduceAnimations: !settings.reduceAnimations })}
                className={`w-12 h-6 ${settings.reduceAnimations ? 'bg-brand-green' : 'bg-gray-200'} rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green/20`}
              >
                <span className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${settings.reduceAnimations ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>
            <div className="pt-2">
              <p className="text-sm font-bold text-brand-dark mb-2 flex items-center">
                <Layout size={14} className="mr-2" />
                {t('admin.info_density', 'Densité de l\'information')}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[t('admin.density_compact', 'Compact (Plus d\'éléments)'), t('admin.density_std', 'Standard (Recommandé)'), t('admin.density_large', 'Large (Meilleure lisibilité)')].map(d => (
                  <button
                    key={d}
                    onClick={() => setSettings({ ...settings, density: d })}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${settings.density === d ? 'bg-brand-dark text-white border-brand-dark' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100 border'}`}
                  >
                    {d.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Storage & Performance */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-gray-50 pb-4 flex items-center">
            <RefreshCcw size={18} className="mr-2 text-brand-gold" />
            {t('admin.storage_perf', 'Stockage & Performance')}
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <p className="text-sm font-bold text-brand-dark">{t('admin.local_cache', 'Cache local')}</p>
                <p className="text-xs text-brand-gold font-black uppercase tracking-widest">{cacheSize} MB {t('admin.used_space', 'Utilisés')}</p>
              </div>
              <button
                onClick={handlePurgeCache}
                className="px-4 py-2 bg-white text-brand-dark border border-gray-200 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm active:scale-95"
              >
                {t('admin.purge_cache', 'Purger le cache local')}
              </button>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <h3 className="text-lg font-bold text-brand-dark mb-4 border-b border-gray-50 pb-4 flex items-center">
            <ShieldCheck size={18} className="mr-2 text-brand-emerald" />
            {t('admin.security_privacy', 'Sécurité & Confidentialité')}
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm mr-4 group-hover:scale-110 transition-transform">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-brand-dark">{t('admin.change_password', 'Changer le mot de passe')}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t('admin.last_update', 'Dernière MAJ')} : {t('common.recently', 'Récemment')}</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setShow2FAModal(true)}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all group"
            >
              <div className="flex items-center">
                <div className="p-2 bg-white rounded-lg shadow-sm mr-4 group-hover:scale-110 transition-transform">
                  <Smartphone size={16} className="text-brand-emerald" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-brand-dark">{t('admin.two_factor_auth', 'Double Authentification (2FA)')}</p>
                  <div className="flex items-center mt-1">
                    <span className={`w-2 h-2 rounded-full mr-2 ${currentUser?.isTwoFactorEnabled ? 'bg-brand-emerald' : 'bg-gray-300'}`}></span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${currentUser?.isTwoFactorEnabled ? 'text-brand-emerald' : 'text-gray-400'}`}>
                      {currentUser?.isTwoFactorEnabled ? t('common.active', 'Activée') : t('common.inactive', 'Désactivée')}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Global Support Card */}
        <div className="bg-gradient-to-br from-brand-emerald to-brand-darkEmerald rounded-[2rem] p-8 text-white relative overflow-hidden group lg:col-span-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2">{t('admin.need_help', 'Besoin d\'assistance technique ?')}</h3>
                <p className="text-white/70 font-medium max-w-lg mb-6">{t('admin.support_desc', 'Notre équipe de support est disponible 24/7 pour vous aider à configurer votre terminal ou résoudre tout problème opérationnel.')}</p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-3 bg-white text-brand-darkEmerald rounded-xl font-bold hover:bg-brand-gold hover:text-brand-dark transition-all flex items-center shadow-lg">
                    <HelpCircle size={18} className="mr-2" />
                    {t('admin.open_doc', 'Documentation')}
                  </button>
                  <button className="px-6 py-3 bg-brand-gold text-brand-dark rounded-xl font-bold hover:bg-white transition-all flex items-center shadow-lg">
                    <MessageSquare size={18} className="mr-2" />
                    {t('admin.contact_support', 'Support en ligne')}
                  </button>
                </div>
              </div>
              <div className="hidden md:block">
                <SettingsIcon size={120} className="text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default SettingsPanel;
