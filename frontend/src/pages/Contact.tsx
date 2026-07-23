import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Loader2, CheckCircle, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api, { messagesService } from '../services/api';

export const CONTACT_CONTENT_KEYS: string[] = [
  'contact_page.title_prefix',
  'contact_page.title_highlight',
  'contact_page.subtitle',
  'contact_page.success_message',
  'contact_page.headquarters',
  'contact_page.address',
  'contact_page.phone',
  'contact_page.manager',
  'contact_page.email',
  'contact_page.form.full_name',
  'contact_page.form.full_name_placeholder',
  'contact_page.form.email',
  'contact_page.form.email_placeholder',
  'contact_page.form.subject',
  'contact_page.form.subject_placeholder',
  'contact_page.form.message',
  'contact_page.form.message_placeholder',
  'contact_page.form.sending',
  'contact_page.form.submit',
  'contact_page.error_message',
];

const Contact = () => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState<Record<string, string | { en?: string; fr?: string }>>({});
  const lang = i18n.language.startsWith('fr') ? 'fr' : 'en';

  useEffect(() => {
    api.get('/content').then(res => setContent(res.data)).catch(() => {});
  }, []);

  const getContent = (key: string) => {
    const value = content[key];
    if (typeof value === 'string') return value || t(key);
    return value?.[lang] ?? t(key);
  };

  const customKeys = Object.keys(content).filter(key => !CONTACT_CONTENT_KEYS.includes(key) && (typeof content[key] === 'string' ? (content[key] as string).length > 0 : (content[key]?.en || content[key]?.fr)));

  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const data = {
      sender: formData.get('sender') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      content: formData.get('content') as string,
    };

    try {
      await messagesService.sendContactMessage(data);
      setShowSuccess(true);
      form.reset();
      
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert(getContent('contact_page.error_message'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="py-24 bg-brand-light min-h-[80vh] relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-700 flex items-center space-x-3"
          >
            <CheckCircle size={20} className="text-brand-green" />
            <span className="font-medium text-sm">{getContent('contact_page.success_message')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6">
            {getContent('contact_page.title_prefix')}<span className="text-brand-green">{getContent('contact_page.title_highlight')}</span>
          </h1>
          <div className="w-24 h-1 bg-brand-yellow mx-auto mb-8 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {getContent('contact_page.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="flex items-start p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green mr-4 flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-brand-dark text-lg mb-1">{getContent('contact_page.headquarters')}</h3>
                <p className="text-gray-600 whitespace-pre-line">{getContent('contact_page.address')}</p>
              </div>
            </div>

            <div className="flex items-start p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-brand-yellow/30 flex items-center justify-center text-yellow-600 mr-4 flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-brand-dark text-lg mb-1">{getContent('contact_page.phone')}</h3>
                <p className="text-gray-600">+221 77 555 23 49</p>
                <p className="text-sm text-gray-400 mt-1">{getContent('contact_page.manager')}</p>
              </div>
            </div>

            <div className="flex items-start p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-brand-dark text-lg mb-1">{getContent('contact_page.email')}</h3>
                <p className="text-gray-600">contact@mbc-suarl.com</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <form noValidate onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{getContent('contact_page.form.full_name')}</label>
                  <input name="sender" required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" placeholder={getContent('contact_page.form.full_name_placeholder')} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{getContent('contact_page.form.email')}</label>
                  <input name="email" required type="email" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" placeholder={getContent('contact_page.form.email_placeholder')} />
                </div>
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">{getContent('contact_page.form.subject')}</label>
                <input name="subject" required type="text" className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all" placeholder={getContent('contact_page.form.subject_placeholder')} />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">{getContent('contact_page.form.message')}</label>
                <textarea name="content" required rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all resize-none" placeholder={getContent('contact_page.form.message_placeholder')}></textarea>
              </div>
              <button 
                type="submit" 
                disabled={isSending}
                className="w-full premium-gradient text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-brand-green/30 transition-all transform hover:-translate-y-1 disabled:opacity-75 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    {getContent('contact_page.form.sending')}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-3" />
                    {getContent('contact_page.form.submit')}
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      {customKeys.length > 0 && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {customKeys.map(key => (
              <div key={key} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-brand-dark mb-2">{key}</h3>
                <p className="text-gray-600">{getContent(key)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  );
};

export default Contact;
