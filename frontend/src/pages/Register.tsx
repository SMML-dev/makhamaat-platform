import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Loader2, CheckCircle2, AlertCircle, Home } from 'lucide-react';
import { authService } from '../services/api';
import logoMbc from '../assets/logo_mbc.jpg';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === 'SUPER_ADMIN') navigate('/sa/dashboard', { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
      else navigate('/user/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.register({ name, email, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      const backendMessage = err?.response?.data?.message;
      setError(backendMessage || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light relative overflow-hidden py-12">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-yellow/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-green/20 rounded-full blur-3xl animate-pulse delay-700"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 m-4 rounded-3xl glass relative z-10"
      >
        <div className="absolute top-4 left-4 z-20">
          <Link to="/" className="text-gray-400 hover:text-brand-green flex items-center space-x-1 text-sm font-medium transition-colors bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-100 shadow-sm hover:shadow-md">
            <Home size={16} />
            <span>Accueil</span>
          </Link>
        </div>

        <div className="flex flex-col items-center mb-8">
          <motion.img
            src={logoMbc}
            alt="MBC Logo"
            whileHover={{ scale: 1.05 }}
            className="w-24 h-auto mb-6 shadow-sm"
          />
          <h2 className="text-3xl font-bold text-brand-dark">Créer un Compte</h2>
          <p className="text-gray-500 mt-2 text-center">Rejoignez le réseau Makhamaat Business Corporation</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center text-sm font-medium border border-red-100"
          >
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center"
          >
            <CheckCircle2 className="w-16 h-16 text-brand-green mb-4" />
            <h3 className="text-2xl font-bold text-brand-dark mb-2">Inscription Réussie !</h3>
            <p className="text-gray-500">Vous allez être redirigé vers la page de connexion...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nom Complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 ${name ? 'text-brand-green' : 'text-gray-400'} transition-colors`} />
                </div>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all placeholder-gray-400 bg-white/50" 
                  placeholder="Jean Dupont" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Adresse Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className={`h-5 w-5 ${email ? 'text-brand-green' : 'text-gray-400'} transition-colors`} />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all placeholder-gray-400 bg-white/50" 
                  placeholder="vous@email.com" 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Mot de Passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 ${password ? 'text-brand-green' : 'text-gray-400'} transition-colors`} />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-green focus:border-brand-green outline-none transition-all placeholder-gray-400 bg-white/50" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-yellow to-brand-green text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-brand-green/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'S\'inscrire'}
            </button>
          </form>
        )}

        {!success && (
          <p className="mt-8 text-center text-sm text-gray-600 font-medium">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-bold text-brand-green hover:text-brand-dark transition-colors">Se Connecter</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Register;
