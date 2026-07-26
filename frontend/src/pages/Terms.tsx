import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import * as LucideIcons from 'lucide-react';
import api from '../services/api';

export const TERMS_CONTENT_KEYS: string[] = [
  'terms.title',
  'terms.last_updated',
  'terms.intro',
  'terms.acceptance.title',
  'terms.acceptance.text',
  'terms.accounts.title',
  'terms.accounts.text',
  'terms.use.title',
  'terms.use.text',
  'terms.ip.title',
  'terms.ip.text',
  'terms.liability.title',
  'terms.liability.text',
  'terms.modifications.title',
  'terms.modifications.text',
  'terms.law.title',
  'terms.law.text',
  'terms.contact.title',
  'terms.contact.text',
  'terms.email',
];

export const TERMS_CONTENT_ZONES: string[] = ['top', 'bottom'];

const DEFAULTS: Record<string, { en: string; fr: string }> = {
  'terms.title': { en: 'Terms of Service', fr: "Conditions d'Utilisation" },
  'terms.last_updated': { en: 'Last updated: July 26, 2026', fr: 'Dernière mise à jour : 26 juillet 2026' },
  'terms.intro': {
    en: 'These Terms of Service govern your access to and use of the MBC platform. By using the platform, you agree to be bound by these terms.',
    fr: "Les présentes conditions d'utilisation régissent votre accès et votre utilisation de la plateforme MBC. En utilisant la plateforme, vous acceptez d'être lié par ces conditions."
  },
  'terms.acceptance.title': { en: '1. Acceptance of Terms', fr: "1. Acceptation des conditions" },
  'terms.acceptance.text': {
    en: 'By creating an account or using the platform, you represent that you are at least 18 years old and agree to comply with these Terms and all applicable laws.',
    fr: "En créant un compte ou en utilisant la plateforme, vous déclarez avoir au moins 18 ans et acceptez de respecter les présentes conditions et toutes les lois applicables."
  },
  'terms.accounts.title': { en: '2. User Accounts', fr: '2. Comptes utilisateurs' },
  'terms.accounts.text': {
    en: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use.',
    fr: "Vous êtes responsable du maintien de la confidentialité de vos identifiants de compte et de toutes les activités qui se déroulent sous votre compte. Prévenez-nous immédiatement en cas d'utilisation non autorisée."
  },
  'terms.use.title': { en: '3. Acceptable Use', fr: "3. Utilisation acceptable" },
  'terms.use.text': {
    en: 'You agree not to misuse the platform, including but not limited to fraud, harassment, distribution of malware, or unauthorized access to systems or data.',
    fr: "Vous vous engagez à ne pas utiliser la plateforme de manière abusive, y compris mais sans s'y limiter, la fraude, le harcèlement, la distribution de logiciels malveillants ou l'accès non autorisé aux systèmes ou aux données."
  },
  'terms.ip.title': { en: '4. Intellectual Property', fr: '4. Propriété intellectuelle' },
  'terms.ip.text': {
    en: 'All content, branding, and materials on the platform are the property of MBC or its licensors. You may not copy, modify, or distribute them without permission.',
    fr: "Tout le contenu, l'image de marque et les matériaux sur la plateforme sont la propriété de MBC ou de ses concédants de licence. Vous ne pouvez pas les copier, modifier ou distribuer sans autorisation."
  },
  'terms.liability.title': { en: '5. Limitation of Liability', fr: '5. Limitation de responsabilité' },
  'terms.liability.text': {
    en: 'To the extent permitted by law, MBC is not liable for indirect, incidental, or consequential damages arising from your use of the platform.',
    fr: "Dans la mesure permise par la loi, MBC n'est pas responsable des dommages indirects, accidentels ou consécutifs découlant de votre utilisation de la plateforme."
  },
  'terms.modifications.title': { en: '6. Modifications', fr: '6. Modifications' },
  'terms.modifications.text': {
    en: 'We may update these Terms from time to time. Continued use of the platform after changes means you accept the revised Terms.',
    fr: "Nous pouvons mettre à jour ces conditions de temps à autre. L'utilisation continue de la plateforme après les modifications signifie que vous acceptez les conditions révisées."
  },
  'terms.law.title': { en: '7. Governing Law', fr: '7. Droit applicable' },
  'terms.law.text': {
    en: 'These Terms are governed by the laws of Senegal. Any disputes will be subject to the exclusive jurisdiction of the courts of Dakar.',
    fr: "Les présentes conditions sont régies par les lois du Sénégal. Tout litige sera soumis à la compétence exclusive des tribunaux de Dakar."
  },
  'terms.contact.title': { en: '8. Contact Us', fr: '8. Contactez-nous' },
  'terms.contact.text': {
    en: 'If you have any questions about these Terms, please contact us at:',
    fr: "Si vous avez des questions concernant les présentes conditions, veuillez nous contacter à :"
  },
  'terms.email': { en: 'privacy@mbc-suarl.com', fr: 'privacy@mbc-suarl.com' },
};

const sectionKeys = [
  ['terms.acceptance.title', 'terms.acceptance.text'],
  ['terms.accounts.title', 'terms.accounts.text'],
  ['terms.use.title', 'terms.use.text'],
  ['terms.ip.title', 'terms.ip.text'],
  ['terms.liability.title', 'terms.liability.text'],
  ['terms.modifications.title', 'terms.modifications.text'],
  ['terms.law.title', 'terms.law.text'],
];

const Terms = () => {
  const { t, i18n } = useTranslation();
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
      if (TERMS_CONTENT_KEYS.includes(key)) return false;
      if (typeof value === 'string') return key.startsWith('terms.') && zone === 'bottom' && value.length > 0;
      return key.startsWith('terms.') && value?.zone === zone && (value?.en || value?.fr);
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
            <h1 className='text-4xl md:text-5xl font-black text-brand-dark mb-4'>{getContent('terms.title')}</h1>
            <p className='text-sm text-gray-400 font-bold uppercase tracking-widest'>{getContent('terms.last_updated')}</p>
          </div>
          <p className='text-gray-600 leading-relaxed mb-10'>{getContent('terms.intro')}</p>
          <div className='space-y-8'>
            {sectionKeys.map(([titleKey, textKey]) => (
              <div key={titleKey}>
                <h2 className='text-2xl font-bold text-brand-dark mb-3'>{getContent(titleKey)}</h2>
                <p className='text-gray-600 leading-relaxed'>{getContent(textKey)}</p>
              </div>
            ))}
            <div className='pt-6 border-t border-gray-100'>
              <h2 className='text-2xl font-bold text-brand-dark mb-3'>{getContent('terms.contact.title')}</h2>
              <p className='text-gray-600 leading-relaxed mb-2'>{getContent('terms.contact.text')}</p>
              <a href={`mailto:${getContent('terms.email')}`} className='text-brand-green font-bold hover:text-brand-dark transition-colors'>
                {getContent('terms.email')}
              </a>
            </div>
          </div>
          <div className='mt-12 text-center'>
            <Link to='/' className='text-brand-green font-bold hover:text-brand-dark transition-colors'>
              {t('common.return_home', 'Return to home')}
            </Link>
          </div>
        </motion.div>
        {renderDynamicZone('bottom')}
      </div>
    </div>
  );
};

export default Terms;
