import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, ShoppingBag, Truck, LayoutDashboard, LogOut, Search, ChevronRight, TrendingUp, CheckCircle, Clock, MapPin, X, Plus, Minus, AlertTriangle, Loader2, Star, PackageOpen, CreditCard, Bell, Calendar, Camera, Award, Zap, Crown, UserCheck } from 'lucide-react';
import { authService, productsService, activitiesService, messagesService, paymentService } from '../services/api';

const UserDashboard = () => {
  const { t, i18n } = useTranslation();
  const user = authService.getCurrentUser();
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeOrders: 0, totalSpent: 0, inDelivery: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Cart State
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_MONEY'>('CASH');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Order Detail State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [sortOrdersBy, setSortOrdersBy] = useState('date-desc');
  const [trackingFilter, setTrackingFilter] = useState('ALL');
  const [isHandlingOrder, setIsHandlingOrder] = useState(false);

  // Profile & Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Product Detail & Filters State
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'price-asc', 'price-desc'
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const adjustImageRef = useRef<HTMLImageElement>(null);
  const [imgNaturalSize, setImgNaturalSize] = useState({ width: 0, height: 0 });

  // Notifications State
  const [notifications, setNotifications] = useState<{ id: string, message: string, time: Date, type: 'order' | 'info' }[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [isSortOrdersDropdownOpen, setIsSortOrdersDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const addNotification = (message: string, type: 'order' | 'info' = 'info') => {
    const translatedMessage = t(`common.${message}`, message);
    setNotifications(prev => [{ id: Math.random().toString(36).substr(2, 9), message: translatedMessage, time: new Date(), type }, ...prev].slice(0, 10));
    showToast(message, 'success');
  };


  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const next = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const updateTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast(t('user.file_too_large', "Fichier trop volumineux (max 20MB)"), 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setTempImageUrl(e.target?.result as string);
      setIsAdjusting(true);
      setZoom(1);
      setCropOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const applyCrop = async () => {
    if (!adjustImageRef.current || !tempImageUrl) return;

    try {
      setIsUploadingAvatar(true);
      setIsAdjusting(false);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = 500;
      canvas.width = size;
      canvas.height = size;

      const img = adjustImageRef.current;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // The viewing window is 320x320
      const viewSize = 320;

      // Get the actual rendered dimensions of the image in the AdjusterBox
      const rect = img.getBoundingClientRect();
      const displayedWidth = rect.width / zoom;
      const displayedHeight = rect.height / zoom;

      const scaleX = naturalWidth / displayedWidth;
      const scaleY = naturalHeight / displayedHeight;

      const sourceWidth = viewSize * scaleX / zoom;
      const sourceHeight = viewSize * scaleY / zoom;

      // Center + offset
      const centerX = naturalWidth / 2;
      const centerY = naturalHeight / 2;

      const sourceX = centerX - (sourceWidth / 2) - (cropOffset.x * scaleX / zoom);
      const sourceY = centerY - (sourceHeight / 2) - (cropOffset.y * scaleY / zoom);

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, size, size);

      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, size, size
      );

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Canvas to Blob failed');
        const file = new File([blob], 'avatar.png', { type: 'image/png' });

        try {
          const { url } = await authService.uploadAvatar(file);
          const updatedProfile = { ...profileData, avatarUrl: url };
          setProfileData(updatedProfile);
          await authService.updateProfile({ avatarUrl: url });
          showToast(t('user.profile_success', "Profil mis à jour avec succès"));
        } catch (error) {
          console.error('Upload Error:', error);
          showToast(t('user.profile_error', "Échec de la mise à jour"), 'error');
        } finally {
          setIsUploadingAvatar(false);
          setTempImageUrl(null);
        }
      }, 'image/png', 0.95);

    } catch (err: any) {
      console.error('Apply Crop failed:', err);
      setIsUploadingAvatar(false);
      showToast(t('user.profile_error', "Échec de la mise à jour"), 'error');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await authService.updateProfile(profileData);
      showToast(t('user.profile_success', "Profil mis à jour avec succès"));
      updateTab('dashboard');
    } catch (error) {
      console.error("Profile update failed", error);
      showToast(t('user.profile_error', "Échec de la mise à jour"), "error");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Loyalty calculation logic moved to component level for global access (e.g., benefits modal)
  const VOUCHER_GOAL = 500000;
  const loyaltyProgress = stats.totalSpent > 0 ? ((stats.totalSpent % VOUCHER_GOAL) / VOUCHER_GOAL * 100) : 0;
  const earnedVouchers = Math.floor(stats.totalSpent / VOUCHER_GOAL);
  const currentTier = stats.totalSpent >= 2000000 ? 'Platinum' : stats.totalSpent >= 500000 ? 'Gold' : 'Privilege';

  let tierName = t('user.tier_privilege', "Compte Privilège");
  let tierColor = "text-emerald-400";
  let tierBg = "bg-emerald-400";
  if (currentTier === 'Platinum') {
    tierName = t('user.tier_platinum', "Compte Platinum");
    tierColor = "text-cyan-400";
    tierBg = "bg-cyan-400";
  } else if (currentTier === 'Gold') {
    tierName = t('user.tier_gold', "Compte Gold");
    tierColor = "text-brand-yellow";
    tierBg = "bg-brand-yellow";
  }

  const addToCart = (product: any) => {
    const existing = cart.find(item => item._id === product._id);
    const requestedQty = existing ? existing.cartQuantity + 1 : 1;

    if (requestedQty > product.stockQuantity) {
      showToast(t('user.insufficient_stock', "Stock insuffisant pour ce produit"), "error");
      return;
    }

    setCart(prev => {
      if (existing) {
        return prev.map(item => item._id === product._id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = Math.max(1, item.cartQuantity + delta);
        if (newQty > item.stockQuantity && delta > 0) {
          showToast(t('user.max_stock_reached', "Limite de stock atteinte"), "error");
          return item;
        }
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
    if (paymentMethod === 'CARD' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
      showToast(t('user.fill_card_info', "Veuillez remplir les informations de la carte"), "error");
      return;
    }
    if (!profileData.address || !profileData.phone) {
      showToast(t('user.fill_profile_info', "L'adresse et le numéro de téléphone sont requis."), "error");
      setCheckoutStep(1);
      return;
    }

    // Final stock verification before processing
    const invalidItems = cart.filter(item => item.cartQuantity > item.stockQuantity);
    if (invalidItems.length > 0) {
      showToast(t('user.stock_changed_error', "Certains articles de votre panier ne sont plus disponibles en quantité suffisante."), "error");
      setIsPlacingOrder(false);
      return;
    }

    setIsPlacingOrder(true);
    try {
      const paymentInfo = paymentMethod === 'CASH' ? t('user.pay_on_delivery', 'Espèces à la livraison') :
        paymentMethod === 'CARD' ? t('user.pay_by_card', 'Carte Bancaire') : 'Mobile Money';

      const orderNotes = `Commande client via Dashboard | Paiement: ${paymentInfo}\n${t('user.delivery_address', 'Adresse')}: ${profileData.address} | Tel: ${profileData.phone}`;

      // Create SALE activities for each item in the cart
      const orderPromises = cart.map(item =>
        activitiesService.createActivity({
          type: 'SALE', // Corrected to SALE so it deducts stock
          productId: item._id,
          actorId: user?._id || user?.id || null,
          quantity: item.cartQuantity,
          status: 'PENDING',
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === 'CASH' ? 'PENDING' : 'PENDING',
          deliveryDate: new Date(deliveryDate),
          notes: orderNotes
        })
      );

      const createdActivities = await Promise.all(orderPromises);
      const orderIds = createdActivities.map((a: any) => a._id);

      if (paymentMethod === 'CASH') {
        showToast(t('user.order_success', "Commande passée avec succès !"));
        setCart([]);
        setIsCheckoutOpen(false);
        setCheckoutStep(1);
        updateTab('orders');
      } else {
        // Initiate real payment session (Simulation)
        showToast(t('user.init_payment', "Initialisation du paiement sécurisé..."));
        const session = await paymentService.initiatePayment({
          amount: cartTotal,
          currency: 'XOF',
          orderIds: orderIds,
          returnUrl: window.location.origin,  // Pass actual frontend origin dynamically
          customer: {
            name: profileData.name || user?.name || '',
            email: profileData.email || user?.email || '',
            phone: profileData.phone || user?.phone || ''
          }
        });

        // Redirect to simulation page
        if (session && session.url) {
          window.location.href = session.url;
        } else {
          throw new Error("Failed to initiate payment session");
        }
      }

    } catch (e) {
      console.error(e);
      showToast(t('user.order_error', "Erreur lors de la validation de la commande."), "error");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const executeCancelOrder = async () => {
    if (!orderToCancel) return;
    setIsHandlingOrder(true);
    try {
      await activitiesService.cancelOrder(orderToCancel);
      showToast(t('user.order_cancelled', "Commande annulée avec succès"));

      const ordersData = await activitiesService.getUserOrders();
      setOrders(ordersData);
      setSelectedOrder(null);
      setOrderToCancel(null);
    } catch (error) {
      console.error("Cancel failed", error);
      showToast(t('user.cancel_failed', "Échec de l'annulation"), "error");
    } finally {
      setIsHandlingOrder(false);
    }
  };

  const handleReorder = (order: any) => {
    addToCart(order.productId);
    showToast(t('user.readded', "Produit ajouté au panier pour une nouvelle commande"));
  };


  // ─── Handle Payment Callback ───────────────────────────────────────────────
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      showToast(t('user.payment_success', '✅ Paiement confirmé ! Votre commande est en cours de traitement.'), 'success');
      setCart([]);
      // Clean the URL param so it doesn't re-trigger on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment');
      setSearchParams(newParams, { replace: true });
    } else if (paymentStatus === 'failed') {
      showToast(t('user.payment_failed', '❌ Le paiement a échoué. Vos commandes ont été annulées.'), 'error');
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment');
      setSearchParams(newParams, { replace: true });
    }
  }, []); // Run only once on mount

  const previousOrdersRef = useRef<any[]>([]);
  const previousMessagesRef = useRef<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsData, ordersData, messagesData] = await Promise.all([
          productsService.getProducts(i18n.language),
          activitiesService.getUserOrders().catch(() => []),
          messagesService.getMyMessages().catch(() => [])
        ]);

        if (productsData && productsData.length > 0) setProducts(productsData);
        else setProducts([]);

        if (ordersData && previousOrdersRef.current.length > 0) {
          ordersData.forEach((newOrder: any) => {
            const oldOrder = previousOrdersRef.current.find((o: any) => o._id === newOrder._id);
            if (oldOrder && oldOrder.status !== newOrder.status) {
              const statusKey = newOrder.status === 'COMPLETED' ? 'status_completed' : newOrder.status === 'IN_TRANSIT' ? 'status_in_transit' : newOrder.status === 'PREPARING' ? 'status_preparing' : newOrder.status === 'CANCELLED' ? 'status_cancelled' : 'status_pending';
              const statusTranslated = t(`common.${statusKey}`);
              addNotification(`${t('user.order_status_changed', "Votre commande")} #${newOrder.orderNumber || newOrder._id.substring(0, 8).toUpperCase()} ${t('user.is_now', "est passée à")} "${statusTranslated}"`, 'order');
            }
          });
        }
        previousOrdersRef.current = ordersData || [];
        setOrders(ordersData || []);

        const activeOrdersCount = (ordersData || []).filter((o: any) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
        const inDeliveryCount = (ordersData || []).filter((o: any) => ['PENDING', 'PREPARING', 'IN_TRANSIT'].includes(o.status)).length;
        const totalSpentCount = (ordersData || []).filter((o: any) => o.status !== 'CANCELLED').reduce((sum: number, o: any) => sum + ((o.quantity || 1) * (o.productId?.price || 0)), 0);
        setStats({ activeOrders: activeOrdersCount, totalSpent: totalSpentCount, inDelivery: inDeliveryCount });

        if (messagesData && previousMessagesRef.current.length > 0) {
          const oldIds = previousMessagesRef.current.map((m: any) => m._id);
          const newMessages = messagesData.filter((m: any) => !oldIds.includes(m._id));
          newMessages.forEach((msg: any) => {
            const shortSubject = msg.subject.length > 25 ? msg.subject.substring(0, 25) + '...' : msg.subject;
            addNotification(`${t('user.new_msg', "Nouveau message")}: ${shortSubject}`, 'info');
          });
        }
        previousMessagesRef.current = messagesData || [];

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        setProducts([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [activeTab, i18n.language]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });

  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.category)))];

  const renderContent = () => {
    switch (activeTab) {
      case 'catalog':
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="pb-20">
            <div className="mb-8 flex flex-col md:flex-row justify-end items-start md:items-center gap-6">

              <div className="flex flex-wrap gap-3">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {categories.slice(0, 4).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedCategory === cat ? 'bg-white text-brand-green shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-100 border-none rounded-xl px-4 py-2 text-xs font-bold text-gray-500 outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option value="name">{t('common.sort_by', "Trier par")}: {t('common.name', "Nom")}</option>
                  <option value="price-asc">{t('common.price_asc', "Prix croissant")}</option>
                  <option value="price-desc">{t('common.price_desc', "Prix décroissant")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-brand-green/5 transition-all duration-500 group flex flex-col h-full relative cursor-pointer overflow-hidden backdrop-blur-sm"
                  onClick={() => setSelectedDetailProduct(product)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(product._id); }}
                    className={`absolute top-6 right-6 z-10 p-3 rounded-2xl backdrop-blur-md transition-all ${favorites.includes(product._id) ? 'bg-red-500 text-white shadow-xl shadow-red-500/30' : 'bg-white/80 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
                  >
                    <motion.div animate={{ scale: favorites.includes(product._id) ? [1, 1.2, 1] : 1 }}>
                      <Package size={20} fill={favorites.includes(product._id) ? "currentColor" : "none"} />
                    </motion.div>
                  </button>

                  <div className="relative aspect-square mb-6 rounded-[2rem] overflow-hidden group">
                    <img src={product.imageUrl} alt={product.localizedName || product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black text-brand-dark uppercase tracking-widest shadow-sm">
                      {product.category}
                    </div>
                  </div>

                  <div className="flex-grow space-y-2 px-1">
                    <h3 className="font-black text-brand-dark text-xl leading-tight group-hover:text-brand-green transition-colors">{product.localizedName || product.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{product.unit || 'Kg'}</p>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('common.price', "Prix")}</p>
                      <p className="font-black text-brand-dark text-2xl tracking-tighter">{product.price.toLocaleString()} <span className="text-xs font-bold text-gray-400 ml-1">F</span></p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {product.stockQuantity > 0 ? (
                        <p className="text-[9px] font-black text-brand-green bg-brand-green/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {product.stockQuantity} {product.unit || 'Kg'} {t('user.available', 'Disponible')}
                        </p>
                      ) : (
                        <p className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {t('user.out_of_stock', 'Rupture')}
                        </p>
                      )}
                      <button
                        disabled={product.stockQuantity <= 0}
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${product.stockQuantity <= 0 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'premium-gradient text-white hover:shadow-2xl shadow-brand-green/30 hover:scale-110 active:scale-95'}`}
                      >
                        {product.stockQuantity <= 0 ? <X size={20} /> : <Plus size={24} strokeWidth={3} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-gray-500">{t('user.no_products', "Aucun produit ne correspond à votre recherche.")}</div>
            )}
          </motion.div>
        );

      case 'orders':
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-5xl">
            <div className="mb-10 flex flex-col md:flex-row justify-end items-start md:items-center gap-6">
              <div className="relative w-full md:w-auto z-20">
                <button
                  onClick={() => setIsSortOrdersDropdownOpen(!isSortOrdersDropdownOpen)}
                  className="w-full md:w-auto bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black text-brand-dark outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green shadow-sm cursor-pointer flex items-center justify-between gap-8 transition-all hover:shadow-md hover:border-brand-green/30 min-w-[200px]"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-brand-green" />
                    {sortOrdersBy === 'date-desc' ? t('common.recent') :
                      sortOrdersBy === 'date-asc' ? t('common.oldest') :
                        sortOrdersBy === 'price-desc' ? t('common.price_desc') :
                          sortOrdersBy === 'price-asc' ? t('common.price_asc') :
                            t('common.status')}
                  </span>
                  <ChevronRight size={18} className={`text-gray-400 transition-transform duration-300 ${isSortOrdersDropdownOpen ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortOrdersDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-full md:w-[240px] bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden shadow-brand-dark/10"
                    >
                      {[
                        { id: 'date-desc', label: t('common.recent'), icon: Clock },
                        { id: 'date-asc', label: t('common.oldest'), icon: Calendar },
                        { id: 'price-desc', label: t('common.price_desc'), icon: TrendingUp },
                        { id: 'price-asc', label: t('common.price_asc'), icon: TrendingUp },
                        { id: 'status', label: t('common.status'), icon: CheckCircle },
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortOrdersBy(option.id);
                            setIsSortOrdersDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold transition-all ${sortOrdersBy === option.id
                              ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20'
                              : 'text-gray-500 hover:bg-gray-50 hover:text-brand-green'
                            }`}
                        >
                          <option.icon size={16} className={sortOrdersBy === option.id ? 'text-white' : 'text-gray-300'} />
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 p-20 text-center shadow-sm">
                  <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <PackageOpen className="w-10 h-10 text-gray-200" />
                  </div>
                  <p className="text-gray-400 font-bold text-lg">{t('user.no_orders', "No orders at the moment.")}</p>
                  <button
                    onClick={() => updateTab('catalog')}
                    className="mt-6 bg-brand-dark text-white px-8 py-3 rounded-2xl font-black text-sm hover:shadow-xl transition-all"
                  >
                    {t('user.order_now', "Browse catalog")}
                  </button>
                </div>
              ) : (
                [...orders].sort((a, b) => {
                  if (sortOrdersBy === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                  if (sortOrdersBy === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                  if (sortOrdersBy === 'price-desc') return ((b.productId?.price || 0) * (b.quantity || 1)) - ((a.productId?.price || 0) * (a.quantity || 1));
                  if (sortOrdersBy === 'price-asc') return ((a.productId?.price || 0) * (a.quantity || 1)) - ((b.productId?.price || 0) * (b.quantity || 1));
                  if (sortOrdersBy === 'status') return a.status.localeCompare(b.status);
                  return 0;
                }).map((order) => (
                  <motion.div
                    key={order._id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-brand-green/5 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-brand-green group-hover:bg-brand-green group-hover:text-white transition-all duration-500 shadow-inner">
                        <Package size={28} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-black text-brand-dark text-xl">#{order.orderNumber || order._id.substring(0, 8).toUpperCase()}</h4>
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                              order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                              order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                              order.status === 'PREPARING' ? 'bg-blue-50 text-blue-600' :
                              order.status === 'IN_TRANSIT' ? 'bg-cyan-50 text-cyan-600' :
                                  'bg-yellow-50 text-yellow-600'
                            }`}>
                            {order.status === 'COMPLETED' ? t('common.status_delivered', "Delivered") :
                              order.status === 'IN_TRANSIT' ? t('common.status_in_transit', "In transit") :
                              order.status === 'PREPARING' ? t('common.status_preparing', "Preparing") :
                                order.status === 'CANCELLED' ? t('common.status_cancelled', "Cancelled") :
                                  t('common.status_pending', "Pending")}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-400 text-xs font-bold gap-3 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-300" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-brand-dark truncate max-w-[150px]">{order.productId?.name || t('common.product', 'Product')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-6 md:pt-0 border-gray-50">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('common.total', "Total")}</p>
                        <p className="font-black text-brand-dark text-2xl tracking-tighter">{((order.productId?.price || 0) * order.quantity).toLocaleString()} <span className="text-sm font-bold text-gray-400">F</span></p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-brand-green group-hover:text-white transition-all">
                        <ChevronRight size={20} strokeWidth={3} />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        );

      case 'tracking':
        const trackableOrders = orders.filter(o => ['PENDING', 'PREPARING', 'IN_TRANSIT', 'COMPLETED'].includes(o.status));
        const activeDeliveries = trackingFilter === 'ALL' ? trackableOrders : trackableOrders.filter(o => o.status === trackingFilter);
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-4xl">
            {trackableOrders.length === 0 ? (
              <div className="bg-white rounded-[3rem] border border-gray-100 p-20 text-center shadow-sm">
                <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck size={40} className="text-gray-200" />
                </div>
                <p className="text-gray-400 font-bold text-lg">{t('user.no_delivery', "No shipments currently in progress.")}</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-[3rem] border border-gray-100 p-4 md:p-6 shadow-sm flex flex-wrap gap-3 mb-8">
                  {[
                    { key: 'ALL', label: t('user.all', 'All') },
                    { key: 'PENDING', label: t('superadmin.status_pending', 'Pending') },
                    { key: 'PREPARING', label: t('user.preparing', 'Preparing') },
                    { key: 'IN_TRANSIT', label: t('user.in_transit', 'In Transit') },
                    { key: 'COMPLETED', label: t('user.order_completed', 'Completed') }
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setTrackingFilter(opt.key)}
                      className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${trackingFilter === opt.key ? 'bg-brand-dark text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="space-y-8">
                  {activeDeliveries.map(activeDelivery => {
              const statusMap: Record<string, number> = {
                'PENDING': 0,
                'PREPARING': 1,
                'IN_TRANSIT': 2,
                'COMPLETED': 3
              };
              const activeStepIndex = statusMap[activeDelivery.status] ?? 0;
              const createdAtDate = new Date(activeDelivery.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
              const updatedAtDate = new Date(activeDelivery.updatedAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

              const steps = [
                {
                  id: 'confirmed',
                  title: t('user.order_confirmed', "Order Confirmed"),
                  desc: t('user.payment_validated', "Payment validated by the system"),
                  icon: CheckCircle,
                  date: createdAtDate
                },
                {
                  id: 'preparing',
                  title: t('user.preparing', "Preparing"),
                  desc: t('user.packaging', "Products selected and packed"),
                  icon: Package,
                  date: activeStepIndex > 1 ? updatedAtDate : null
                },
                {
                  id: 'route',
                  title: t('user.in_route', "In Delivery"),
                  desc: t('user.carrier_info', "The carrier is on the way"),
                  activeDesc: t('user.current_step', "Current Step"),
                  icon: Truck,
                  date: activeStepIndex > 2 ? updatedAtDate : null
                },
                {
                  id: 'delivered',
                  title: t('user.delivered', "Delivered"),
                  desc: t('user.estimated', "Arrival expected at destination"),
                  icon: MapPin,
                  date: activeStepIndex === 3 ? updatedAtDate : null
                }
              ];

              return (
                <motion.div key={activeDelivery._id} variants={itemVariants} className="bg-white rounded-[3rem] shadow-xl shadow-brand-green/5 border border-gray-100 p-8 md:p-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/[0.02] rounded-bl-[120px] pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 relative z-10 gap-6">
                    <div>
                      <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-[0.2em] mb-2">
                        {t('user.order_num', "Order No.")} #{activeDelivery.orderNumber || activeDelivery._id.substring(0, 8).toUpperCase()}
                      </h3>
                      <p className="text-4xl font-black text-brand-dark tracking-tighter">
                        {activeStepIndex === 3 ? t('user.delivered', "Delivered") : t('user.in_transit', "In Transit")}
                      </p>
                      <p className="text-brand-green font-bold text-sm mt-1">
                        {activeDelivery.productId?.name || t('common.product', 'Product')} — {activeDelivery.quantity} {activeDelivery.productId?.unit || t('common.kg', 'kg')}
                      </p>
                    </div>
                    <div className={`${activeStepIndex === 3 ? 'bg-brand-dark' : 'bg-brand-green'} text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest flex items-center shadow-2xl shadow-brand-green/30`}>
                      <Truck size={20} className="mr-3" strokeWidth={2.5} />
                      {activeStepIndex === 3 ? t('user.order_completed', "Completed") : t('user.soon', "Delivery: Today")}
                    </div>
                  </div>

                  <div className="relative z-10 px-4">
                    <div className="absolute left-10 top-0 bottom-0 w-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(activeStepIndex / (steps.length - 1)) * 100}%` }}
                        className="w-full bg-gradient-to-b from-brand-green to-brand-yellow"
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>

                    <div className="space-y-16">
                      {steps.map((step, idx) => {
                        const isCompleted = idx < activeStepIndex;
                        const isActive = idx === activeStepIndex;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.id} className={`relative flex items-start gap-10 transition-all duration-500 ${!isActive && !isCompleted ? 'opacity-30 grayscale' : ''}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ring-[12px] ring-white z-10 shadow-xl transition-all duration-500 ${isCompleted ? 'bg-brand-green text-white shadow-brand-green/20' :
                                isActive ? 'bg-brand-yellow text-white shadow-brand-yellow/40 scale-110' :
                                  'bg-gray-100 text-gray-400'
                              }`}>
                              <StepIcon size={24} strokeWidth={isActive ? 3 : 2.5} className={isActive ? 'animate-pulse' : ''} />
                            </div>
                            <div className="pt-1">
                              <p className={`font-black text-xl transition-colors ${isActive ? 'text-brand-dark' : isCompleted ? 'text-brand-dark' : 'text-gray-400'}`}>
                                {step.title}
                              </p>
                              {isActive && step.activeDesc && (
                                <p className="text-brand-green font-black text-xs uppercase tracking-widest mt-1.5">{step.activeDesc}</p>
                              )}
                              <p className="text-sm text-gray-400 font-medium mt-1">{step.desc}</p>
                              {step.date && (
                                <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isActive ? 'text-brand-yellow' : 'text-gray-300'}`}>
                                  {step.date}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
                })}
              </div>
            </>
            )}
          </motion.div>
        );

      case 'profile': {
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-6xl">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left Column: Form */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-brand-green border-4 border-white shadow-xl overflow-hidden relative">
                        {isUploadingAvatar ? (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm z-10">
                            <Loader2 className="animate-spin text-brand-green" size={24} />
                          </div>
                        ) : null}

                        {profileData.avatarUrl ? (
                          <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={32} />
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAvatarClick}
                        disabled={isUploadingAvatar}
                        className="absolute -bottom-2 -right-2 bg-brand-dark text-white p-2.5 rounded-2xl shadow-lg border-4 border-white hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-brand-dark">{profileData.name}</h3>
                      <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">{t('user.member_since', { year: user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear() })}</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('common.full_name', "Nom complet")}</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-[1.5rem] px-6 py-4 outline-none transition-all font-bold text-brand-dark shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('common.email', "Email")}</label>
                        <input
                          type="email"
                          value={profileData.email}
                          disabled
                          className="w-full bg-gray-100/50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 outline-none text-gray-400 font-bold cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('common.phone', "Téléphone")}</label>
                        <input
                          type="text"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-[1.5rem] px-6 py-4 outline-none transition-all font-bold text-brand-dark shadow-inner"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('navbar.language', "Langue Préférée")}</label>
                        <div className="flex bg-gray-50 p-1.5 rounded-[1.5rem] border border-transparent focus-within:border-brand-green transition-all shadow-inner">
                          <button
                            type="button"
                            onClick={() => i18n.changeLanguage('fr')}
                            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${i18n.language === 'fr' ? 'bg-white text-brand-green shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            FRANÇAIS
                          </button>
                          <button
                            type="button"
                            onClick={() => i18n.changeLanguage('en')}
                            className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${i18n.language === 'en' ? 'bg-white text-brand-green shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                            ENGLISH
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{t('user.delivery_address', "Adresse de livraison par défaut")}</label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                        rows={3}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-green focus:bg-white rounded-[1.5rem] px-6 py-4 outline-none transition-all font-bold text-brand-dark resize-none shadow-inner"
                      />
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex items-center justify-center gap-3 bg-brand-dark text-white px-10 py-5 rounded-[2rem] text-sm font-black shadow-2xl shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isUpdatingProfile ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={20} strokeWidth={3} />}
                        {t('user.save_profile', "Mettre à jour le profil")}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="relative z-10">
                    <h3 className="text-rose-900 font-black text-lg mb-1">{t('common.danger_zone', "Supprimer mon compte")}</h3>
                    <p className="text-rose-600 text-xs font-medium max-w-sm">{t('user.delete_account_desc', "Cette action est irréversible et supprimera définitivement toutes vos données.")}</p>
                  </div>
                  <button className="relative z-10 px-8 py-3 bg-white text-rose-600 font-black text-xs uppercase tracking-widest rounded-2xl border border-rose-200 hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                    {t('common.delete_account', "Supprimer")}
                  </button>
                </div>
              </div>

              {/* Right Column: Loyalty & Sidebar Info */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-brand-dark text-white rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl">
                  <div className={`absolute top-0 right-0 w-48 h-48 ${tierBg.replace('bg-', 'bg-')}/10 rounded-bl-[100px] -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-700`}></div>

                  <div className="relative z-10">
                    <div className="w-20 h-20 bg-white/5 backdrop-blur-xl rounded-3xl mb-8 flex items-center justify-center border border-white/10 shadow-2xl">
                      <Star size={40} className={tierColor} fill="currentColor" />
                    </div>
                    <h3 className="text-3xl font-black mb-2 tracking-tighter">{tierName}</h3>
                    <div className="flex items-center gap-2 mb-8">
                      <div className={`w-2 h-2 rounded-full ${tierBg} animate-pulse`}></div>
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        {earnedVouchers} {t('user.vouchers', "bons")} {t('user.earned', "collectés")}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t('user.progress', "Progression")}</span>
                        <span className={`text-xs font-black ${tierColor}`}>{Math.round(loyaltyProgress || 0)}%</span>
                      </div>
                      <div className="bg-white/5 h-3 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${loyaltyProgress || 0}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className={`${tierBg} h-full rounded-full shadow-lg`}
                        ></motion.div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                        {t('user.next_voucher_in', { amount: (VOUCHER_GOAL - (stats.totalSpent % VOUCHER_GOAL)).toLocaleString() })}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsBenefitsModalOpen(true)}
                      className="w-full mt-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-sm font-black transition-all active:scale-95"
                    >
                      {t('user.view_benefits', "Voir mes avantages")}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-brand-dark flex items-center tracking-tight">
                      <TrendingUp className="mr-3 text-brand-green" size={24} />
                      {t('user.recent_activity', "Activité")}
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {favorites.length === 0 ? (
                      <div className="text-center py-8">
                        <Star className="mx-auto text-gray-100 mb-3" size={32} />
                        <p className="text-xs text-gray-400 font-medium italic">{t('user.no_favorites', "Aucun favori")}</p>
                      </div>
                    ) : (
                      products.filter(p => favorites.includes(p._id)).slice(0, 3).map(p => (
                        <div key={p._id} className="flex gap-4 items-center group cursor-pointer">
                          <div className="relative">
                            <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-white shadow-sm">
                              <Star size={8} fill="currentColor" />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-brand-dark truncate group-hover:text-brand-green transition-colors">{p.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.category}</p>
                          </div>
                          <button onClick={() => toggleFavorite(p._id)} className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-all">
                            <X size={14} strokeWidth={3} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <button onClick={() => updateTab('catalog')} className="w-full mt-8 py-3 text-xs font-black text-brand-green hover:underline uppercase tracking-widest">
                    {t('user.discover_more', "Découvrir plus")}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      }

      case 'dashboard':
      default:
        return (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
            {/* Bento Stats Grid */}
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              {/* Active Orders Card - Large Bento */}
              <motion.div
                variants={itemVariants}
                className="md:col-span-2 bg-[#f0f9f4] p-8 rounded-[3rem] border border-brand-green/10 hover:shadow-2xl hover:shadow-brand-green/5 transition-all relative overflow-hidden group cursor-pointer"
                onClick={() => updateTab('orders')}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/[0.03] rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-brand-green mb-10 border border-brand-green/5 group-hover:rotate-6 transition-transform">
                      <ShoppingBag size={32} strokeWidth={2.5} />
                    </div>
                    <div className="bg-brand-green text-white px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase">
                      Live
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{t('user.active_orders', "Commandes actives")}</p>
                    <h3 className="text-6xl font-black text-brand-dark tracking-tighter tabular-nums">{stats.activeOrders}</h3>
                  </div>
                </div>
              </motion.div>

              {/* Total Spent Card - Bento Medium */}
              <motion.div
                variants={itemVariants}
                className="bg-brand-dark p-8 rounded-[3rem] shadow-2xl shadow-brand-dark/20 relative overflow-hidden group cursor-pointer lg:col-span-1"
                onClick={() => updateTab('profile')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-transparent opacity-50"></div>
                <div className="relative z-10 flex flex-col h-full justify-between text-white">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-brand-yellow mb-10 border border-white/10 group-hover:scale-110 transition-transform">
                    <TrendingUp size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">{t('user.total_spent', "Total dépensé")}</p>
                    <h3 className="text-3xl font-black tracking-tight tabular-nums group-hover:text-brand-yellow transition-colors">
                      {stats.totalSpent.toLocaleString()} <span className="text-xs font-bold text-gray-500">FCFA</span>
                    </h3>
                  </div>
                </div>
              </motion.div>

              {/* Next Delivery Card - Bento Small/Tall */}
              <motion.div
                variants={itemVariants}
                className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group cursor-pointer"
                onClick={() => updateTab('tracking')}
              >
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-yellow/5 rounded-full -mb-10 -mr-10 transition-transform group-hover:scale-125"></div>
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-brand-yellow mb-8 group-hover:-translate-y-1 transition-transform">
                    <Truck size={28} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('user.next_delivery', "Prochaine livraison")}</p>
                    <p className="text-2xl font-black text-brand-dark tracking-tight">{stats.inDelivery > 0 ? stats.inDelivery : '0'}</p>
                    <p className="text-xs font-bold text-brand-green mt-2 flex items-center group-hover:gap-2 transition-all">
                      {t('user.tracking', "Voir détails")} <ChevronRight size={14} />
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Latest Products Section Header */}
            <div className="flex justify-between items-center mb-10 px-2">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark">{t('user.latest_products', "Derniers produits")}</h2>
                <p className="text-gray-500 text-sm mt-1">{t('user.freshly_harvested', "Fraîchement récoltés pour vous.")}</p>
              </div>
              <button
                onClick={() => updateTab('catalog')}
                className="flex items-center gap-2 text-brand-green font-black text-sm uppercase tracking-widest hover:gap-4 transition-all group"
              >
                {t('user.view_all_catalog', "Voir tout")} <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 h-[380px] animate-pulse">
                    <div className="bg-gray-100 aspect-square rounded-[2rem] w-full mb-6"></div>
                    <div className="bg-gray-100 h-4 rounded-full w-1/3 mb-4"></div>
                    <div className="bg-gray-100 h-8 rounded-full w-2/3 mb-8"></div>
                    <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                      <div className="bg-gray-100 h-8 rounded-lg w-24"></div>
                      <div className="bg-gray-100 w-12 h-12 rounded-2xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
                {products.slice(0, 4).map((product) => (
                  <motion.div
                    key={product._id}
                    variants={itemVariants}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-[2.5rem] p-5 shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-brand-green/5 transition-all duration-500 group flex flex-col h-full relative cursor-pointer overflow-hidden backdrop-blur-sm"
                    onClick={() => setSelectedDetailProduct(product)}
                  >
                    <div className="relative aspect-square mb-6 rounded-[2rem] overflow-hidden">
                      <img src={product.imageUrl} alt={product.localizedName || product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl text-[10px] font-black text-brand-dark uppercase tracking-widest shadow-sm">
                        {product.category}
                      </div>
                    </div>
                    <div className="flex-grow space-y-1.5">
                      <h3 className="font-black text-brand-dark text-lg leading-tight group-hover:text-brand-green transition-colors">{product.localizedName || product.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{product.unit || 'Kg'}</p>
                    </div>
                    <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                      <p className="font-black text-brand-dark text-xl">{product.price.toLocaleString()} <span className="text-xs font-bold text-gray-400">F</span></p>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                        className="w-12 h-12 rounded-2xl bg-gray-50 text-brand-dark hover:bg-brand-green hover:text-white transition-all flex items-center justify-center group/btn"
                      >
                        <Plus size={20} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-[#f8fafc] flex pt-20 font-inter">
      {/* Dynamic Background Elements */}
      <div className="fixed top-20 left-64 w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Premium Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-2xl border-r border-gray-100/50 hidden md:flex flex-col z-10 relative overflow-hidden">
        {/* Subtle top indicator */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-yellow via-brand-green to-brand-dark opacity-50"></div>

        <div className="p-8 pb-4">
          <h1 className="text-2xl font-black text-brand-dark mb-10 px-2 tracking-tighter flex items-center group cursor-pointer">
            <div className="w-10 h-10 bg-brand-yellow/10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform shadow-sm">
              <ShoppingBag className="text-brand-yellow" size={20} />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-dark to-gray-700">MAKHAMAAT</span>
          </h1>

          <div className="px-2 mb-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('user.navigate', "Naviguer")}</p>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: t('common.dashboard', "Tableau de bord") },
              { id: 'catalog', icon: Package, label: t('user.catalog', "Catalogue") },
              { id: 'orders', icon: ShoppingBag, label: t('user.orders', "Commandes") },
              { id: 'tracking', icon: Truck, label: t('user.tracking', "Suivi") }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => updateTab(item.id)}
                className={`group relative flex items-center space-x-3 w-full px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab === item.id
                    ? 'bg-brand-green/10 text-brand-green shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-brand-dark'
                  }`}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 w-1.5 h-6 bg-brand-green rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon size={18} className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110 text-brand-green' : 'group-hover:scale-110'}`} />
                <span className="relative z-10">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-brand-green/40"
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile & Account Section at the bottom */}
        <div className="mt-auto p-6 space-y-4">
          <div className="px-4 py-6 bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-brand-green/5 rounded-bl-full transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-700"></div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-dark text-white flex items-center justify-center font-black text-lg shadow-lg shadow-brand-dark/20 uppercase relative z-10">
                {user?.name ? user.name[0] : 'C'}
              </div>
              <div className="min-w-0 relative z-10">
                <p className="font-black text-brand-dark text-sm truncate uppercase tracking-tight">{user?.name || 'Client'}</p>
                <p className="text-[10px] text-gray-400 truncate tracking-wide font-bold">{user?.email || 'client@makhamaat.sn'}</p>
              </div>
            </div>

            <button
              onClick={() => updateTab('profile')}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all relative z-10 ${activeTab === 'profile'
                  ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20'
                  : 'bg-white text-gray-600 border border-gray-100 hover:border-brand-green hover:text-brand-green hover:shadow-md'
                }`}
            >
              <LayoutDashboard size={14} />
              {t('user.profile', "Mon Profil")}
            </button>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-[10px] text-red-500 hover:bg-red-50 transition-all uppercase tracking-[0.2em] border border-transparent hover:border-red-100"
          >
            <LogOut size={16} />
            <span>{t('common.logout', "Déconnexion")}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 relative z-10 w-full overflow-y-auto font-inter">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <div className="w-2 h-12 bg-brand-yellow rounded-full"></div>
                <div>
                  <h1 className="text-4xl font-black text-brand-dark tracking-tighter">
                    {activeTab === 'dashboard' && (
                      <>
                        <span className="text-gray-400 font-bold">Hello, </span>
                        <span className="text-brand-dark">{user?.name ? user.name.split(' ')[0] : 'Client'}</span> 👋
                      </>
                    )}
                    {activeTab === 'catalog' && t('user.catalog', "Catalogue")}
                    {activeTab === 'orders' && t('user.orders', "Commandes")}
                    {activeTab === 'tracking' && t('user.tracking', "Suivi")}
                    {activeTab === 'profile' && t('user.profile', "Profil")}
                  </h1>
                  <p className="text-gray-500 text-sm font-medium mt-1 ml-1">
                    {activeTab === 'dashboard' ? t('user.welcome_back', "Heureux de vous revoir") : t(`user.${activeTab}_desc`)}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative group flex-1 lg:flex-initial">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-green transition-colors" size={18} />
                <input
                  type="text"
                  placeholder={t('user.search_prod', "Rechercher un produit...")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full lg:w-80 bg-white border border-gray-100 rounded-[1.5rem] pl-12 pr-6 py-4 text-sm font-bold text-brand-dark focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green outline-none transition-all shadow-sm group-hover:shadow-md"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="relative p-4 bg-white border border-gray-100 rounded-2xl text-brand-dark hover:shadow-xl hover:shadow-brand-green/5 transition-all group active:scale-95"
                >
                  <Bell size={22} className="group-hover:rotate-12 transition-transform" />
                  {notifications.length > 0 && (
                    <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-brand-yellow rounded-full border-2 border-white"></span>
                  )}
                </button>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-4 bg-brand-green text-white rounded-2xl hover:shadow-2xl hover:shadow-brand-green/30 transition-all group active:scale-95 border border-brand-green"
                >
                  <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-brand-yellow text-brand-dark text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                      {cart.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[400px] bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-green text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-green/20">
                    <ShoppingBag size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark">{t('user.my_cart', "Mon Panier")}</h2>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                    <ShoppingBag size={64} className="mb-4 text-gray-300" />
                    <p className="font-bold text-gray-400">{t('user.cart_empty', "Votre panier est vide.")}</p>
                    <button
                      onClick={() => { setIsCartOpen(false); updateTab('catalog'); }}
                      className="mt-4 text-brand-green font-bold hover:underline"
                    >
                      {t('user.explore_catalog', "Explorer le catalogue")}
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item._id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-brand-dark truncate">{item.name}</h4>
                        <p className="text-sm font-black text-brand-green mb-2">{item.price.toLocaleString()} FCFA</p>
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <div className="flex items-center bg-gray-100 rounded-lg p-1 w-fit">
                              <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:bg-white rounded-md transition-shadow">
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center font-bold text-sm">{item.cartQuantity}</span>
                              <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:bg-white rounded-md transition-shadow">
                                <Plus size={14} />
                              </button>
                            </div>
                            {item.cartQuantity > item.stockQuantity && (
                              <p className="text-[9px] text-red-500 font-black uppercase tracking-wider mt-1.5 flex items-center gap-1">
                                <AlertTriangle size={10} /> {t('user.stock_insufficient', "Stock insuffisant")}
                              </p>
                            )}
                          </div>
                          <button onClick={() => removeFromCart(item._id)} className="text-xs font-bold text-red-500 hover:text-red-700 h-fit mt-1">{t('common.remove', "Supprimer")}</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">{t('user.subtotal', "Sous-total")}</span>
                    <span className="text-2xl font-black text-brand-dark">{cartTotal.toLocaleString()} FCFA</span>
                  </div>
                  <button
                    onClick={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                    className="w-full py-4 premium-gradient text-white font-bold rounded-2xl shadow-xl shadow-brand-green/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    {t('user.go_to_checkout', "Passer à la caisse")} <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
            >
              <div className="flex min-h-[500px] max-h-[90vh]">
                <div className="w-1/3 bg-gray-50 p-8 border-r border-gray-100 hidden md:block">
                  <h3 className="font-bold text-gray-500 uppercase tracking-widest text-xs mb-8">{t('user.order_summary', "Résumé")}</h3>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2">
                    {cart.map(item => (
                      <div key={item._id} className="text-sm">
                        <p className="font-bold text-brand-dark truncate">{item.name}</p>
                        <p className="text-gray-500">Qty: {item.cartQuantity} × {item.price.toLocaleString()} F</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">{t('user.total_to_pay', "Total à payer")}</p>
                    <p className="text-2xl font-black text-brand-green leading-none">{cartTotal.toLocaleString()} FCFA</p>
                  </div>
                </div>

                <div className="flex-1 p-8 flex flex-col overflow-y-auto">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2">
                      <button onClick={() => setCheckoutStep(1)} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${checkoutStep === 1 ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}>1</button>
                      <button onClick={() => {
                        if (!profileData.address || !profileData.phone) {
                          showToast(t('user.fill_profile_info', "L'adresse et le numéro de téléphone sont requis."), 'error');
                          return;
                        }
                        setCheckoutStep(2);
                      }} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${checkoutStep === 2 ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}>2</button>
                    </div>
                    <button onClick={() => setIsCheckoutOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>

                  {checkoutStep === 1 ? (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                      <h2 className="text-2xl font-black text-brand-dark mb-2">{t('user.delivery', "Livraison")}</h2>
                      <p className="text-sm text-gray-500 mb-8">{t('user.delivery_desc', "Où devrions-nous envoyer votre récolte ?")}</p>

                      <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('user.address', "Adresse")}</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-3.5 text-brand-green" size={18} />
                            <input
                              value={profileData.address}
                              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                              placeholder={t('user.address_placeholder', "Entrez votre adresse")}
                              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-brand-green transition-colors font-bold text-brand-dark"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.phone', "Téléphone")}</label>
                          <input
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            placeholder={t('user.phone_placeholder', "Entrez votre numéro")}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-brand-green transition-colors font-bold text-brand-dark"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!profileData.address || !profileData.phone) {
                            showToast(t('user.fill_profile_info', "L'adresse et le numéro de téléphone sont requis."), 'error');
                            return;
                          }
                          setCheckoutStep(2);
                        }}
                        className="w-full py-4 premium-gradient text-white font-bold rounded-2xl shadow-xl shadow-brand-green/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                      >
                        {t('common.next', "Suivant")} <ChevronRight size={20} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                      <h2 className="text-2xl font-black text-brand-dark mb-2">{t('user.payment', "Paiement")}</h2>
                      <p className="text-sm text-gray-500 mb-6">{t('user.payment_desc', "Choisissez votre méthode de paiement.")}</p>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-4">{t('user.payment_method', "Mode de paiement")}</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('CASH')}
                            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group ${paymentMethod === 'CASH' ? 'bg-brand-green/5 border-brand-green ring-4 ring-brand-green/10' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                          >
                            <Truck className={`w-8 h-8 mb-3 transition-colors ${paymentMethod === 'CASH' ? 'text-brand-green' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            <span className={`font-bold text-sm ${paymentMethod === 'CASH' ? 'text-brand-green' : 'text-gray-500'}`}>{t('user.pay_on_delivery', "Paiement à la livraison")}</span>
                            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Standard</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('CARD')}
                            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group ${paymentMethod === 'CARD' ? 'bg-blue-50 border-blue-500 ring-4 ring-blue-500/10' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                          >
                            <CreditCard className={`w-8 h-8 mb-3 transition-colors ${paymentMethod === 'CARD' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            <span className={`font-bold text-sm ${paymentMethod === 'CARD' ? 'text-blue-500' : 'text-gray-500'}`}>{t('user.pay_by_card', "Carte Bancaire")}</span>
                            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Sécurisé</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('MOBILE_MONEY')}
                            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all group ${paymentMethod === 'MOBILE_MONEY' ? 'bg-orange-50 border-orange-500 ring-4 ring-orange-500/10' : 'bg-white border-gray-100 hover:border-gray-200'}`}
                          >
                            <ShoppingBag className={`w-8 h-8 mb-3 transition-colors ${paymentMethod === 'MOBILE_MONEY' ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            <span className={`font-bold text-sm ${paymentMethod === 'MOBILE_MONEY' ? 'text-orange-500' : 'text-gray-500'}`}>Mobile Money</span>
                            <span className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Wave, Orange, MTN</span>
                          </button>
                        </div>
                      </div>

                      {paymentMethod === 'CARD' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 mt-6">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('user.card_number', "Numéro de Carte")}</label>
                            <input
                              type="text"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                              placeholder="0000 0000 0000 0000"
                              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition-colors font-bold text-brand-dark"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('user.expiry', "Expiration")}</label>
                              <input
                                type="text"
                                value={cardDetails.expiry}
                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                placeholder="MM/YY"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition-colors font-bold text-brand-dark"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CVV</label>
                              <input
                                type="text"
                                value={cardDetails.cvv}
                                onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                placeholder="000"
                                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 transition-colors font-bold text-brand-dark"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <div className="space-y-4 mt-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('user.delivery_date_request', "Date de Livraison Souhaitée")}</label>
                          <input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-3 outline-none focus:border-brand-green transition-colors font-bold text-brand-dark"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 mt-6">
                        <button onClick={() => setCheckoutStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors">{t('common.back', "Retour")}</button>
                        <button
                          onClick={handleCheckout}
                          disabled={isPlacingOrder || cart.length === 0}
                          className="w-full h-14 bg-brand-green text-white rounded-2xl font-black text-lg shadow-xl shadow-brand-green/20 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center relative overflow-hidden"
                        >
                          {isPlacingOrder ? (
                            <Loader2 className="animate-spin text-white" />
                          ) : (
                            <>
                              <div className="absolute inset-0 bg-white/10 w-full h-full -skew-x-[20deg] -translate-x-[150%] hover:animate-[shimmer_2s_infinite]"></div>
                              <CheckCircle className="mr-3" size={24} />
                              {t('user.pay_order', "Régler la commande")}
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-brand-dark/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl relative z-10 overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">{t('user.order_details', "Order Details")}</h3>
                  <p className="text-xl font-black text-brand-dark">#{selectedOrder.orderNumber || selectedOrder._id.substring(0, 12).toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-md">
                    <img src={selectedOrder.productId?.imageUrl} alt={selectedOrder.productId?.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-brand-dark">{selectedOrder.productId?.name}</h4>
                    <p className="text-gray-500 font-medium">{selectedOrder.quantity} {selectedOrder.productId?.unit || t('common.unit_s', 'Unit(s)')} × {selectedOrder.productId?.price?.toLocaleString()} FCFA</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-6 border-y border-gray-100">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('user.status', "Current Status")}</p>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold ${selectedOrder.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'IN_TRANSIT' ? 'bg-cyan-100 text-cyan-800' :
                      selectedOrder.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                        selectedOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                      }`}>
                      {selectedOrder.status === 'COMPLETED' ? t('common.status_delivered', "DELIVERED") :
                        selectedOrder.status === 'IN_TRANSIT' ? t('common.status_in_transit', "IN TRANSIT") :
                        selectedOrder.status === 'PREPARING' ? t('common.status_preparing', "PREPARING") :
                          selectedOrder.status === 'CANCELLED' ? t('common.status_cancelled', "CANCELLED") : t('common.status_pending', "PENDING")}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('user.total_paid', "Total Paid")}</p>
                    <p className="text-2xl font-black text-brand-green">{(selectedOrder.productId?.price * selectedOrder.quantity).toLocaleString()} FCFA</p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  {selectedOrder.status === 'PENDING' && (
                    <button
                      onClick={() => setOrderToCancel(selectedOrder._id)}
                      disabled={isHandlingOrder}
                      className="flex-1 py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                    >
                      {t('user.cancel_order', "Cancel Order")}
                    </button>
                  )}
                  <button
                    onClick={() => handleReorder(selectedOrder)}
                    className="flex-1 py-4 premium-gradient text-white font-bold rounded-2xl shadow-xl shadow-brand-green/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                  >
                    {t('user.reorder', "Order again")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDetailProduct && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailProduct(null)}
              className="absolute inset-0 bg-brand-dark/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[50px] shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 h-[300px] md:h-auto relative">
                <img src={selectedDetailProduct.imageUrl} alt={selectedDetailProduct.localizedName || selectedDetailProduct.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => toggleFavorite(selectedDetailProduct._id)}
                  className={`absolute top-8 left-8 p-4 rounded-3xl backdrop-blur-md transition-all ${favorites.includes(selectedDetailProduct._id) ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400'}`}
                >
                  <Package size={24} fill={favorites.includes(selectedDetailProduct._id) ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="md:w-1/2 p-12 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-brand-green font-bold text-xs uppercase tracking-widest">{selectedDetailProduct.category}</span>
                    <h2 className="text-4xl font-black text-brand-dark mt-2">{selectedDetailProduct.localizedName || selectedDetailProduct.name}</h2>
                  </div>
                  <button onClick={() => setSelectedDetailProduct(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={32} className="text-gray-300" />
                  </button>
                </div>

                <div className="flex-1 space-y-8">
                  <p className="text-gray-500 leading-relaxed">
                    {t('user.product_desc', "Qualité garantie et fraîcheur maximale pour vos besoins agro-alimentaires.")}
                  </p>

                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('user.unit_price', "Prix Unitaire")}</p>
                      <p className="text-3xl font-black text-brand-dark">{selectedDetailProduct.price.toLocaleString()} <span className="text-sm">FCFA / {selectedDetailProduct.unit || 'Kg'}</span></p>
                    </div>
                  </div>
                </div>

                <div className="pt-10">
                  <button
                    onClick={() => { addToCart(selectedDetailProduct); setSelectedDetailProduct(null); }}
                    className="w-full py-5 premium-gradient text-white font-bold rounded-2xl shadow-2xl shadow-brand-green/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <ShoppingBag size={24} /> {t('common.add_to_cart', "Ajouter au Panier")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderToCancel && (
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOrderToCancel(null)} className="absolute inset-0 bg-brand-dark/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm relative z-10 overflow-hidden text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">{t('user.cancel_order_q', "Annuler la commande ?")}</h3>
              <p className="text-gray-500 text-sm mb-6">{t('user.cancel_confirm', "Cette action est définitive.")}</p>
              <div className="flex gap-3">
                <button onClick={() => setOrderToCancel(null)} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                  {t('common.cancel', "Annuler")}
                </button>
                <button onClick={executeCancelOrder} disabled={isHandlingOrder} className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/30 flex items-center justify-center">
                  {isHandlingOrder ? <Loader2 size={18} className="animate-spin" /> : t('user.confirm_cancellation', "Confirmer")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
            />
            <motion.aside
              initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[100] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-black text-brand-dark flex items-center gap-2">
                  <Clock size={18} className="text-brand-green" /> {t('user.notifications', "Notifications")}
                </h2>
                <button onClick={() => setIsNotificationsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 text-center px-4">
                    <Bell className="w-16 h-16 text-gray-100 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">{t('user.no_notifs', "Aucune nouvelle notification.")}</h3>
                    <p className="text-gray-500 text-sm font-medium">{t('user.all_caught_up', "Tout est à jour.")}</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-bold text-brand-dark leading-tight mb-2">{n.message}</p>
                      <p className="text-[10px] text-gray-400">{n.time.toLocaleTimeString()}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[110] flex items-center gap-3 border ${toast.type === 'success' ? 'bg-brand-dark text-white border-brand-green/30' : 'bg-red-600 text-white border-red-700'}`}
          >
            {toast.type === 'success' ? <CheckCircle className="text-brand-green" size={20} /> : <X size={20} />}
            <span className="font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isAdjusting && tempImageUrl && (
          <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-dark/95 backdrop-blur-2xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-xl relative z-10 overflow-hidden text-center border border-white/20">
              <h3 className="text-2xl font-black text-brand-dark mb-8 tracking-tighter uppercase">{t('user.adjust_photo', "Ajuster la Photo")}</h3>

              <div className="relative w-[320px] h-[320px] mx-auto rounded-full overflow-hidden bg-gray-100 border-4 border-gray-100 shadow-inner group flex items-center justify-center">
                <motion.img
                  ref={adjustImageRef}
                  src={tempImageUrl}
                  alt="Adjusting"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    setImgNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
                  }}
                  drag
                  dragMomentum={false}
                  onDragEnd={(_, info) => setCropOffset({ x: cropOffset.x + info.offset.x, y: cropOffset.y + info.offset.y })}
                  style={{
                    scale: zoom,
                    x: cropOffset.x,
                    y: cropOffset.y,
                    maxWidth: 'none',
                    maxHeight: 'none',
                    width: imgNaturalSize.width > imgNaturalSize.height ? 'auto' : '320px',
                    height: imgNaturalSize.height > imgNaturalSize.width ? 'auto' : '320px',
                    minWidth: '320px',
                    minHeight: '320px'
                  }}
                  className="cursor-move"
                />
                {/* Circular Mask Overlay */}
                <div className="absolute inset-0 pointer-events-none border-[100px] border-black/40 rounded-full scale-[1.5]" />
              </div>

              <div className="mt-12 space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('user.zoom', "Zoom")}</span>
                    <span className="text-xs font-black text-brand-green">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-100 rounded-full appearance-none cursor-pointer accent-brand-green"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => { setIsAdjusting(false); setTempImageUrl(null); }}
                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 font-black rounded-2xl transition-all uppercase text-xs tracking-widest"
                  >
                    {t('common.cancel', "Annuler")}
                  </button>
                  <button
                    onClick={applyCrop}
                    className="flex-1 py-4 premium-gradient text-white font-black rounded-2xl shadow-xl shadow-brand-green/30 hover:-translate-y-1 active:scale-95 transition-all uppercase text-xs tracking-widest"
                  >
                    {t('user.save_apply', "Appliquer & Enregistrer")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[150] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-brand-dark/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-sm relative z-10 overflow-hidden text-center border border-white/20"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-brand-gold to-red-500"></div>

              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <LogOut size={40} className="text-red-500" />
              </div>

              <h3 className="text-2xl font-black text-brand-dark mb-3 tracking-tighter">
                {t('common.logout_confirm_title', "Déconnexion ?")}
              </h3>
              <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                {t('common.logout_confirm_desc_user', "Êtes-vous sûr de vouloir quitter votre session ?")}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => authService.logout()}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/20 uppercase text-xs tracking-widest"
                >
                  {t('common.confirm_logout', "Oui, se déconnecter")}
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 font-black rounded-2xl transition-all uppercase text-xs tracking-widest"
                >
                  {t('common.cancel', "Annuler")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBenefitsModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[150] p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBenefitsModalOpen(false)} className="absolute inset-0 bg-brand-dark/80 backdrop-blur-xl" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-white rounded-[3.5rem] shadow-2xl w-full max-w-5xl relative z-10 overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-white/20"
            >
              <div className="md:w-1/2 p-12 bg-brand-dark relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex-1">
                  <div className={`w-24 h-24 rounded-3xl mb-12 flex items-center justify-center border-4 border-white/5 shadow-2xl bg-white/5 backdrop-blur-xl`}>
                    <Crown size={48} className={tierColor} />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">{t('user.loyalty_perks', "Vos Privilèges Fidélité")}</h2>
                  <p className="text-gray-400 text-lg font-medium leading-relaxed max-w-md">
                    {currentTier === 'Platinum' ? t('user.tier_platinum_desc') : currentTier === 'Gold' ? t('user.tier_gold_desc') : t('user.tier_privilege_desc')}
                  </p>
                </div>

                <div className="relative z-10 mt-12 bg-white/5 p-8 rounded-3xl border border-white/5 backdrop-blur-lg">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-white font-black text-xs uppercase tracking-widest">{t('user.unlock_next', "Progression vers le niveau supérieur")}</p>
                    <span className={`text-xl font-black ${tierColor}`}>{Math.round(loyaltyProgress)}%</span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${loyaltyProgress}%` }}
                      className={`${tierBg} h-full rounded-full shadow-lg shadow-brand-green/20`}
                    />
                  </div>
                </div>
              </div>

              <div className="md:w-1/2 p-12 overflow-y-auto">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-brand-dark flex items-center tracking-tight">
                    <Zap className="mr-3 text-brand-green" size={28} />
                    {tierName}
                  </h3>
                  <button onClick={() => setIsBenefitsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-all group">
                    <X size={24} className="text-gray-300 group-hover:text-brand-dark group-hover:rotate-90 transition-all duration-300" strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-6">
                  {currentTier === 'Privilege' && (
                    <>
                      <BenefitItem icon={Package} label={t('user.benefit_catalog_label', "Accès Complet au Catalogue")} desc={t('user.benefit_catalog_desc', "Commandez tous nos produits frais sans restriction.")} />
                      <BenefitItem icon={Clock} label={t('user.benefit_tracking_label', "Suivi en Temps Réel")} desc={t('user.benefit_tracking_desc', "Visualisez l'état de vos commandes 24h/24.")} />
                      <BenefitItem icon={MapPin} label={t('user.benefit_support_label', "Support Standard")} desc={t('user.benefit_support_desc', "Assistance via messagerie pendant les heures d'ouvertures.")} />
                      <div className="mt-10 p-6 bg-brand-green/5 rounded-3xl border border-brand-green/10">
                        <p className="text-brand-green font-black text-xs uppercase tracking-widest mb-2">{t('user.upgrade_to_gold', "Upgrade vers Gold")}</p>
                        <p className="text-gray-500 text-xs font-bold leading-relaxed">{t('user.upgrade_to_gold_desc', "Gagnez 5% de remise sur chaque commande après 500k F dépensés.")}</p>
                      </div>
                    </>
                  )}
                  {currentTier === 'Gold' && (
                    <>
                      <BenefitItem icon={Award} label={t('user.benefit_reward_5')} desc={t('user.benefit_reward_5_desc', "Remise automatique créditée sur votre compte.")} highlight />
                      <BenefitItem icon={Truck} label={t('user.benefit_priority')} desc={t('user.benefit_priority_desc', "Vos commandes sont préparées et expédiées avant les autres membres.")} />
                      <BenefitItem icon={Zap} label={t('user.benefit_exclusives_gold_label', "Offres Exclusives Gold")} desc={t('user.benefit_exclusives_gold_desc', "Profitez de ventes privées chaque mois.")} />
                      <div className="mt-10 p-6 bg-cyan-50 rounded-3xl border border-cyan-100">
                        <p className="text-cyan-600 font-black text-xs uppercase tracking-widest mb-2">{t('user.upgrade_to_platinum', "Upgrade vers Platinum")}</p>
                        <p className="text-gray-500 text-xs font-bold leading-relaxed">{t('user.upgrade_to_platinum_desc', "Gagnez 10% de cashback et un conseiller dédié après 2M F dépensés.")}</p>
                      </div>
                    </>
                  )}
                  {currentTier === 'Platinum' && (
                    <>
                      <BenefitItem icon={Crown} label={t('user.benefit_reward_10')} desc={t('user.benefit_reward_10_desc', "Le maximum de cashback disponible sur la plateforme.")} highlight />
                      <BenefitItem icon={UserCheck} label={t('user.benefit_advisor')} desc={t('user.benefit_advisor_desc', "Un contact VIP direct pour toutes vos demandes spécifiques.")} />
                      <BenefitItem icon={Truck} label={t('user.benefit_free_shipping')} desc={t('user.benefit_free_shipping_desc', "Plus de frais de port sur vos commandes importantes.")} />
                      <BenefitItem icon={Calendar} label={t('user.benefit_events')} desc={t('user.benefit_events_desc', "Soyez notre invité d'honneur aux grands sommets agricoles.")} />
                    </>
                  )}
                </div>

                <button
                  onClick={() => setIsBenefitsModalOpen(false)}
                  className="w-full mt-10 py-5 bg-brand-dark text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-dark/20 hover:scale-105 active:scale-95 transition-all"
                >
                  {t('common.close', "Fermer")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BenefitItem = ({ icon: Icon, label, desc, highlight = false }: { icon: any, label: string, desc: string, highlight?: boolean }) => (
  <div className={`p-6 rounded-[2rem] border transition-all ${highlight ? 'bg-brand-green/10 border-brand-green/20' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
    <div className="flex gap-5">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${highlight ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' : 'bg-white text-gray-300'} transition-transform group-hover:scale-110`}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className={`font-black text-sm ${highlight ? 'text-brand-green' : 'text-brand-dark'} mb-1.5`}>{label}</h4>
        <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-wider">{desc}</p>
      </div>
    </div>
  </div>
);

export default UserDashboard;
