import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import api from '../services/api';

export const PRIVACY_CONTENT_KEYS: string[] = [
  'privacy.title',
  'privacy.last_updated',
  'privacy.intro',
  'privacy.collect.title',
  'privacy.collect.text',
  'privacy.use.title',
  'privacy.use.text',
  'privacy.cookies.title',
  'privacy.cookies.text',
  'privacy.sharing.title',
  'privacy.sharing.text',
  'privacy.rights.title',
  'privacy.rights.text',
  'privacy.security.title',
  'privacy.security.text',
  'privacy.contact.title',
  'privacy.contact.text',
  'privacy.email',
];

export const PRIVACY_CONTENT_ZONES: string[] = ['top', 'bottom'];

const DEFAULTS: Record<string, { en: string; fr: string }> = {
  'privacy.title': { en: 'Privacy Policy', fr: 'Politique de Confidentialité' },
  'privacy.last_updated': { en: 'Last updated: July 26, 2026', fr: 'Dernière mise à jour : 26 juillet 2026' },
  'privacy.intro': {
    en: 'Makhamaat Business Corporation - SUARL ("MBC", "we", "us") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, share, and safeguard information when you use our platform.',
    fr: "Makhamaat Business Corporation - SUARL (\"MBC\", \"nous\") s'engage à protéger vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons les informations lorsque vous utilisez notre plateforme."
  },
  'privacy.collect.title': { en: '1. Information We Collect', fr: '1. Informations que nous collectons' },
  'privacy.collect.text': {
    en: 'We collect account information (name, email, phone), usage data, and cookies to provide and improve our services. Some data is provided directly by you; other data is collected automatically when you interact with the platform.',
    fr: "Nous collectons les informations de compte (nom, e-mail, téléphone), les données d'utilisation et les cookies pour fournir et améliorer nos services. Certaines données sont directement fournies par vous ; d'autres sont collectées automatiquement lors de votre interaction avec la plateforme."
  },
  'privacy.use.title': { en: '2. How We Use Your Information', fr: '2. Comment nous utilisons vos informations' },
  'privacy.use.text': {
    en: 'We use your information to operate the platform, process transactions, manage accounts, communicate with you, and comply with legal obligations. We do not sell your personal data.',
    fr: "Nous utilisons vos informations pour exploiter la plateforme, traiter les transactions, gérer les comptes, communiquer avec vous et respecter les obligations légales. Nous ne vendons pas vos données personnelles."
  },
  'privacy.cookies.title': { en: '3. Cookies and Tracking', fr: '3. Cookies et suivi' },
  'privacy.cookies.text': {
    en: 'We use cookies and similar technologies to maintain sessions, remember preferences, and analyze platform usage. You can control cookies through your browser settings.',
    fr: "Nous utilisons des cookies et des technologies similaires pour maintenir les sessions, mémoriser les préférences et analyser l'utilisation de la plateforme. Vous pouvez contrôler les cookies via les paramètres de votre navigateur."
  },
  'privacy.sharing.title': { en: '4. Data Sharing and Disclosure', fr: '4. Partage et divulgation des données' },
  'privacy.sharing.text': {
    en: 'We may share data with trusted service providers and authorities when required by law. We implement appropriate safeguards to protect your information.',
    fr: "Nous pouvons partager des données avec des fournisseurs de services de confiance et des autorités lorsque la loi l'exige. Nous mettons en œuvre des garanties appropriées pour protéger vos informations."
  },
  'privacy.rights.title': { en: '5. Your Rights', fr: '5. Vos droits' },
  'privacy.rights.text': {
    en: 'You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us at the email below.',
    fr: "Vous avez le droit d'accéder, de corriger ou de supprimer vos données personnelles. Pour exercer ces droits, veuillez nous contacter à l'adresse ci-dessous."
  },
  'privacy.security.title': { en: '6. Security', fr: '6. Sécurité' },
  'privacy.security.text': {
    en: 'We use industry-standard security measures, including encrypted connections and secure authentication, to protect your data. However, no method is completely infallible.',
    fr: "Nous utilisons des mesures de sécurité standard, y compris des connexions chiffrées et une authentification sécurisée, pour protéger vos données. Cependant, aucune méthode n'est totalement infaillible."
  },
  'privacy.contact.title': { en: '7. Contact Us', fr: '7. Contactez-nous' },
  'privacy.contact.text': {
    en: 'If you have questions about this Privacy Policy, please reach out to us at:',
    fr: "Si vous avez des questions concernant cette politique de confidentialité, veuillez nous contacter à :"
  },
  'privacy.email': { en: 'privacy@mbc-suarl.com', fr: 'privacy@mbc-suarl.com' },
};

const sectionKeys = [
  ['privacy.collect.title', 'privacy.collect.text'],
  ['privacy.use.title', 'privacy.use.text'],
  ['privacy.cookies.title', 'privacy.cookies.text'],
  ['privacy.sharing.title', 'privacy.sharing.text'],
  ['privacy.rights.title', 'privacy.rights.text'],
  ['privacy.security.title', 'privacy.security.text'],
];

const Privacy = () => {
  const { i18n } = useTranslation();
  const [content, setContent] = useState<Record<string, string | { en?: string; fr?: string; zone?: string; icon?: string }>>({});
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  useEffect(() => {
    api.get('/content').then(res => setContent(res.data)).catch(() => {});
  }, []);

  const getContent = (key: string) => {
    const value = content[key];
    const fallback = DEFAULTS[key]?.[lang] ?? DEFAULTS[key]?.en ?? key;
    if (typeof value === 'string') return value || fallback;
    if (typeof value === 'object' && value !== null) return value[lang] ?? fallback;
    return fallback;
  };

  const getIcon = (key: string) => {
    const value = content[key];
    if (typeof value === 'object' && value !== null) return value.icon;
    return undefined;
  };

  const renderIcon = (name: string | undefined, className: string) => {
    if (!name) return null;
    const Comp = (LucideIcons as Record<string, any>)[name];
    if (Comp && typeof Comp === 'function') return <Comp className={className} />;
    return <span className={className}>{name}</span>;
  };

  const renderDynamicZone = (zone: string, bgClass: string = 'bg-brand-light') => {
    const keys = Object.keys(content).filter((key) => {
      const value = content[key];
      if (PRIVACY_CONTENT_KEYS.includes(key)) return false;
      if (typeof value === 'string') return zone === 'bottom' && value.length > 0;
      return value?.zone === zone && (value?.en || value?.fr);
    });
    if (keys.length === 0) return null;
    return (
      <section className={`py-16 ${bgClass}`}>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8'>
          {keys.map((key) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className='bg-white rounded-2xl p-8 shadow-sm border border-gray-100'
            >
              {renderIcon(getIcon(key), 'w-8 h-8 text-brand-green mb-3')}
              <h3 className='text-lg font-bold text-brand-dark mb-2'>{key}</h3>
              <p className='text-gray-600'>{getContent(key)}</p>
            </motion.div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className='py-24 bg-brand-light min-h-[80vh]'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        {renderDynamicZone('top')}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='bg-white rounded-[3rem] p-8 md:p-12 shadow-lg border border-gray-100'
        >
          <div className='text-center mb-12'>
            <h1 className='text-4xl md:text-5xl font-black text-brand-dark mb-4'>{getContent('privacy.title')}</h1>
            <p className='text-sm text-gray-400 font-bold uppercase tracking-widest'>{getContent('privacy.last_updated')}</p>
          </div>
          <p className='text-gray-600 leading-relaxed mb-10'>{getContent('privacy.intro')}</p>
          <div className='space-y-8'>
            {sectionKeys.map(([titleKey, textKey]) => (
              <div key={titleKey}>
                <h2 className='text-2xl font-bold text-brand-dark mb-3'>{getContent(titleKey)}</h2>
                <p className='text-gray-600 leading-relaxed'>{getContent(textKey)}</p>
              </div>
            ))}
            <div className='pt-6 border-t border-gray-100'>
              <h2 className='text-2xl font-bold text-brand-dark mb-3'>{getContent('privacy.contact.title')}</h2>
              <p className='text-gray-600 leading-relaxed mb-2'>{getContent('privacy.contact.text')}</p>
              <a href={`mailto:${getContent('privacy.email')}`} className='text-brand-green font-bold hover:text-brand-dark transition-colors'>
                {getContent('privacy.email')}
              </a>
            </div>
          </div>
          <div className='mt-12 text-center'>
            <Link to='/' className='text-brand-green font-bold hover:text-brand-dark transition-colors'>
              Return to home
            </Link>
          </div>
        </motion.div>
        {renderDynamicZone('bottom')}
      </div>
    </div>
  );
};

export default Privacy;
