import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Database, ShieldCheck, BarChart3, Users, LogOut, Download, CheckCircle, TrendingUp, DollarSign, Package, Truck, Activity, X, UserPlus, Mail, Lock, ShieldAlert, Key, Loader2, Edit2, Check, Trash2, Target, Layout, Sprout, ShoppingCart, AlertTriangle, MessageSquare, Send, Globe, Megaphone, ChevronDown, Calendar } from 'lucide-react';
import { senegalMarketData } from '../data/senegalMarketData';
import api, { authService, usersService, systemService, productsService, activitiesService, messagesService } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ObjectivesTab from '../components/SuperAdmin/ObjectivesTab';
import { HOME_CONTENT_KEYS, CONTENT_ZONES } from './Home';
import { ABOUT_CONTENT_KEYS, ABOUT_CONTENT_ZONES } from './About';
import { SERVICES_CONTENT_KEYS, SERVICES_CONTENT_ZONES } from './Services';
import { CONTACT_CONTENT_KEYS, CONTACT_CONTENT_ZONES } from './Contact';

// Helper to format date
const formatDate = (dateString: string, language: string) => {
  return new Date(dateString).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
};

const SuperAdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [logFilter, setLogFilter] = useState('');
  const [showLogFilter, setShowLogFilter] = useState(false);
  
  const [logsData, setLogsData] = useState<{data: any[], total: number}>({ data: [], total: 0 });
  const [logsPage, setLogsPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    if (activeTab === 'logs') {
      const fetchLogs = async () => {
        try {
          const res = await activitiesService.getLogs(logsPage, logsPerPage, logFilter);
          setLogsData(res);
        } catch (error) {
          console.error("Failed to fetch paginated logs", error);
        }
      };
      
      const delayFn = setTimeout(() => {
        fetchLogs();
      }, 300);
      return () => clearTimeout(delayFn);
    }
  }, [activeTab, logsPage, logFilter]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchBroadcasts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'pages-content') {
      fetchHomeContent();
    }
  }, [activeTab]);
  
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [isLoading, setIsLoading] = useState(false);
  const [resetFlowState, setResetFlowState] = useState<{ step: number; passwordAttempt: string; otp: string; loading: boolean; devOtp?: string }>({ step: 0, passwordAttempt: '', otp: '', loading: false });
  
  const [revenueGoal, setRevenueGoal] = useState<number>(() => parseInt(localStorage.getItem('makhamaat_revenue_goal') || '250', 10));
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editGoalValue, setEditGoalValue] = useState(revenueGoal.toString());
  
  const [logisticsRevenueRate, setLogisticsRevenueRate] = useState<number>(() => parseFloat(localStorage.getItem('makhamaat_logistics_revenue_rate') || '0.15'));
  const [logisticsStockRate, setLogisticsStockRate] = useState<number>(() => parseFloat(localStorage.getItem('makhamaat_logistics_stock_rate') || '0.05'));
  const [isEditingLogistics, setIsEditingLogistics] = useState(false);
  const [editLogisticsRevenueRate, setEditLogisticsRevenueRate] = useState(() => (logisticsRevenueRate * 100).toString());
  const [editLogisticsStockRate, setEditLogisticsStockRate] = useState(() => (logisticsStockRate * 100).toString());

  const [isEditingProjections, setIsEditingProjections] = useState(false);
  const [projectionsData, setProjectionsData] = useState(() => {
    const saved = localStorage.getItem('makhamaat_projections');
    if (saved) return JSON.parse(saved);
    return {
      bulk: [
        { price: 3000, volume: 30 },
        { price: 4000, volume: 34 }
      ],
      kiosks: [
        { price: 4500, volume: 30 },
        { price: 5500, volume: 34 }
      ]
    };
  });

  const handleUpdateProjection = (type: 'bulk' | 'kiosks', index: number, field: 'price' | 'volume', value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const newData = { ...projectionsData };
    newData[type][index][field] = numValue;
    setProjectionsData(newData);
    localStorage.setItem('makhamaat_projections', JSON.stringify(newData));
  };

  const [selectedPeriod, setSelectedPeriod] = useState('ALL');
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  
  const periods = [
    { value: 'ALL', label: t('superadmin.all_data', 'Toutes les données') },
    { value: 'Q1_2026', label: t('superadmin.q1_2026', '1er Trimestre 2026') },
    { value: '2025', label: t('superadmin.year_2025', 'Année 2025') },
    { value: '2024', label: t('superadmin.year_2024', 'Année 2024') },
  ];

  const [activityPeriod, setActivityPeriod] = useState('THIS_YEAR');
  const [isActivityDropdownOpen, setIsActivityDropdownOpen] = useState(false);
  const activityPeriods = [
    { value: 'THIS_YEAR', label: t('superadmin.this_year', 'Cette Année') },
    { value: 'LAST_YEAR', label: t('superadmin.last_year', "L'année dernière") },
  ];

  // ─── Messaging State ────────────────────────────────────────────────────────
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [isLoadingBroadcasts, setIsLoadingBroadcasts] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ subject: '', content: '', targetRole: 'ADMIN' as 'ADMIN' | 'USER' | 'ALL' });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [saToast, setSaToast] = useState<string | null>(null);
  const [homeContentDraft, setHomeContentDraft] = useState<Record<string, { en?: string; fr?: string; zone?: string }>>({});
  const [homeContentLoading, setHomeContentLoading] = useState(false);
  const [homeContentSaving, setHomeContentSaving] = useState<string | null>(null);
  const [homeContentDeleting, setHomeContentDeleting] = useState<string | null>(null);
  const [newContentKey, setNewContentKey] = useState('');
  const [newContentEn, setNewContentEn] = useState('');
  const [newContentFr, setNewContentFr] = useState('');
  const [newContentZone, setNewContentZone] = useState('bottom');
  const [selectedPage, setSelectedPage] = useState<'home' | 'about' | 'services' | 'contact'>('home');

  const PAGES_CONFIG = {
    home: { labelKey: 'page_home', titleKey: 'tab_home_content', descKey: 'home_content_desc', keys: HOME_CONTENT_KEYS, prefix: 'home.', zones: CONTENT_ZONES },
    about: { labelKey: 'page_about', titleKey: 'tab_about_content', descKey: 'about_content_desc', keys: ABOUT_CONTENT_KEYS, prefix: 'about_page.', zones: ABOUT_CONTENT_ZONES },
    services: { labelKey: 'page_services', titleKey: 'tab_services_content', descKey: 'services_content_desc', keys: SERVICES_CONTENT_KEYS, prefix: 'services_page.', zones: SERVICES_CONTENT_ZONES },
    contact: { labelKey: 'page_contact', titleKey: 'tab_contact_content', descKey: 'contact_content_desc', keys: CONTACT_CONTENT_KEYS, prefix: 'contact_page.', zones: CONTACT_CONTENT_ZONES },
  };
  const [selectedBroadcast, setSelectedBroadcast] = useState<any | null>(null);

  // Market Price State
  const [marketPriceData, setMarketPriceData] = useState<any[]>([]);
  const [isLoadingMarketPrices, setIsLoadingMarketPrices] = useState(false);

  const showSaToast = (msg: string) => {
    setSaToast(msg);
    setTimeout(() => setSaToast(null), 3500);
  };

  const fetchHomeContent = async () => {
    setHomeContentLoading(true);
    try {
      const res = await api.get('/content');
      setHomeContentDraft(res.data);
    } catch (error) {
      console.error('Failed to fetch home content', error);
    } finally {
      setHomeContentLoading(false);
    }
  };

  const handleSaveHomeContent = async (key: string) => {
    const draft = homeContentDraft[key] ?? {};
    setHomeContentSaving(key);
    try {
      await api.post('/content', {
        key,
        en: draft.en ?? i18n.t(key, { lng: 'en' }),
        fr: draft.fr ?? i18n.t(key, { lng: 'fr' }),
        zone: activeTab.endsWith('-content') ? (draft.zone ?? 'bottom') : undefined,
      });
      showSaToast(t('superadmin.content_saved', 'Enregistré'));
    } catch (error) {
      console.error('Failed to save home content', error);
    } finally {
      setHomeContentSaving(null);
    }
  };

  const handleDeleteHomeContent = async (key: string) => {
    setHomeContentDeleting(key);
    try {
      await api.delete('/content/' + key);
      setHomeContentDraft(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      showSaToast(t('superadmin.content_deleted', 'Supprimé'));
    } catch (error) {
      console.error('Failed to delete home content', error);
    } finally {
      setHomeContentDeleting(null);
    }
  };

  const handleAddHomeContent = async () => {
    if (!newContentKey) return;
    try {
      const newZone = activeTab.endsWith('-content') ? newContentZone : undefined;
      await api.post('/content', { key: newContentKey, en: newContentEn, fr: newContentFr, zone: newZone });
      setHomeContentDraft(prev => ({
        ...prev,
        [newContentKey]: { en: newContentEn, fr: newContentFr, zone: newZone },
      }));
      setNewContentKey('');
      setNewContentEn('');
      setNewContentFr('');
      setNewContentZone('bottom');
      showSaToast(t('superadmin.content_added', 'Ajouté'));
    } catch (error) {
      console.error('Failed to add home content', error);
    }
  };

  const fetchBroadcasts = async () => {
    setIsLoadingBroadcasts(true);
    try {
      const data = await messagesService.getBroadcasts();
      setBroadcasts(data);
    } catch (e) {
      console.error('Failed to fetch broadcasts', e);
    } finally {
      setIsLoadingBroadcasts(false);
    }
  };

  const fetchMarketPriceData = async () => {
    setIsLoadingMarketPrices(true);
    try {
      const data = await productsService.getMarketPriceComparison(i18n.language);
      setMarketPriceData(data);
    } catch (error) {
      console.error("Failed to fetch market price data", error);
      showSaToast(t("admin.error_market_prices", "Erreur lors du chargement des prix de marché."));
    } finally {
      setIsLoadingMarketPrices(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.subject || !broadcastForm.content) return;
    setIsSendingBroadcast(true);
    try {
      await messagesService.sendBroadcast(broadcastForm);
      setBroadcastSuccess(true);
      setBroadcastForm({ subject: '', content: '', targetRole: 'ADMIN' });
      showSaToast(t('superadmin.broadcast_success', 'Broadcast envoyé avec succès !'));
      fetchBroadcasts();
      setTimeout(() => setBroadcastSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to send broadcast', e);
      showSaToast(t('superadmin.broadcast_error', "Erreur lors de l'envoi du broadcast."));
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Custom Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
    confirmText?: string;
  }>({
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const handleSaveGoal = () => {
    const val = parseInt(editGoalValue, 10);
    if (!isNaN(val) && val > 0) {
      setRevenueGoal(val);
      localStorage.setItem('makhamaat_revenue_goal', val.toString());
    } else {
      setEditGoalValue(revenueGoal.toString());
    }
    setIsEditingGoal(false);
  };

  const handleSaveLogisticsRates = () => {
    const revRate = parseFloat(editLogisticsRevenueRate) / 100;
    const stockRate = parseFloat(editLogisticsStockRate) / 100;
    if (!isNaN(revRate) && revRate >= 0) {
      setLogisticsRevenueRate(revRate);
      localStorage.setItem('makhamaat_logistics_revenue_rate', revRate.toString());
    } else {
      setEditLogisticsRevenueRate((logisticsRevenueRate * 100).toString());
    }
    if (!isNaN(stockRate) && stockRate >= 0) {
      setLogisticsStockRate(stockRate);
      localStorage.setItem('makhamaat_logistics_stock_rate', stockRate.toString());
    } else {
      setEditLogisticsStockRate((logisticsStockRate * 100).toString());
    }
    setIsEditingLogistics(false);
  };

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "market-prices") fetchMarketPriceData();
  }, [activeTab]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const fetchDashboardData = async () => {
    setIsDataLoading(true);
    try {
      const [usersData, productsData, activitiesData] = await Promise.all([
        usersService.getUsers(),
        productsService.getProducts(i18n.language),
        activitiesService.getActivities()
      ]);
      
      const formattedUsers = usersData.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: t('common.active', 'Actif'),
        lastLogin: formatDate(u.updatedAt || u.createdAt, i18n.language)
      }));
      
      setUsersList(formattedUsers);
      setProductsList(productsData);
      setActivitiesList(activitiesData);

      // Fetch maintenance status
      const maintenanceRes = await systemService.getMaintenanceStatus();
      setIsMaintenanceMode(maintenanceRes.isMaintenance);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsDataLoading(false);
    }
  };



  const handleToggleMaintenance = async () => {
    const newStatus = !isMaintenanceMode;
    const confirmMsg = newStatus 
      ? t('admin.maintenance_enable_confirm')
      : t('admin.maintenance_disable_confirm');
    
    setConfirmConfig({
      title: t('superadmin.maintenance_title', "Mode Maintenance"),
      message: confirmMsg,
      type: newStatus ? 'danger' : 'warning',
      confirmText: newStatus ? t('superadmin.enable_mode', "Activer le mode") : t('superadmin.disable_mode', "Désactiver le mode"),
      onConfirm: async () => {
        try {
          const res = await systemService.setMaintenanceMode(newStatus);
          setIsMaintenanceMode(res.isMaintenance);
          setShowConfirmModal(false);
        } catch (error) {
          console.error("Failed to toggle maintenance mode", error);
          setShowConfirmModal(false);
          alert(t('superadmin.maintenance_error', "Erreur lors du changement de statut de maintenance."));
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleDownloadBackup = async () => {
    setIsBackupLoading(true);
    try {
      const backupData = await systemService.getPlatformBackup();
      const blob = new Blob([backupData], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mbc_backup_${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Backup failed", error);
      alert(t('superadmin.backup_error', "Échec de la sauvegarde de la base de données."));
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await usersService.createUser(newUser);
      setIsAddUserModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'USER' });
      fetchDashboardData();
    } catch (error) {
      console.error('Failed to create user', error);
      alert(t('superadmin.create_user_error', "Erreur lors de la création de l'utilisateur"));
    } finally {
      setIsLoading(false);
    }
  };



  const handleExportLogs = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(t('superadmin.security_log_title'), 14, 22);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${t('superadmin.refresh', 'Généré le')}: ${new Date().toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}`, 14, 30);
    
    const tableData = filteredLogs.map(log => [
      log.time,
      log.user,
      log.ip,
      log.action,
      log.status
    ]);

    autoTable(doc, {
      startY: 40,
      head: [[
        t('superadmin.security_log_col_timestamp'),
        t('superadmin.security_log_col_user'),
        t('superadmin.security_log_col_ip'),
        t('superadmin.security_log_col_action'),
        t('superadmin.security_log_col_status'),
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [17, 24, 39] },
      styles: { fontSize: 9 },
      didParseCell: function (data) {
        if (data.row.section === 'body' && data.column.index === 4) {
           const logId = String(filteredLogs[data.row.index]?.id);
           const log = filteredLogs.find(l => l.id === logId);
           if (log?.rawStatus === 'CANCELLED') {
             data.cell.styles.textColor = [220, 38, 38];
             data.cell.styles.fontStyle = 'bold';
           } else if (log?.rawStatus === 'COMPLETED') {
             data.cell.styles.textColor = [22, 163, 74];
             data.cell.styles.fontStyle = 'bold';
           }
        }
      }
    });

    doc.save(t('superadmin.security_log_filename'));
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      await usersService.updateUserRole(userId, newRole);
      setUsersList(usersList.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmConfig({
      title: t('superadmin.delete_user_title', "Confirmation de Suppression"),
      message: t('admin.confirm_delete_user'),
      type: 'danger',
      confirmText: t('common.delete', 'Supprimer'),
      onConfirm: async () => {
        try {
          await usersService.deleteUser(userId);
          setUsersList(usersList.filter(user => user.id !== userId));
          setShowConfirmModal(false);
        } catch (error) {
          console.error("Failed to delete user:", error);
          setShowConfirmModal(false);
        }
      }
    });
    setShowConfirmModal(true);
  };

  const getProductName = (productId: any) => {
    if (!productId) return null;
    const id = productId._id || productId;
    const product = productsList.find((p: any) => String(p._id) === String(id) || String(p.id) === String(id));
    return product?.localizedName || product?.name || (typeof productId === 'object' ? (productId.localizedName || productId.name) : null);
  };

  const getLogAction = (act: any) => {
    const productName = getProductName(act.productId) || t('superadmin.unknown_product', 'Unknown Product');
    if (act.type === 'PRODUCT_UPDATED' && act.orderNumber) {
      return t('superadmin.order_status_changed', { orderNumber: act.orderNumber, product: productName });
    }
    if (['PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED'].includes(act.type)) {
      return `${t(`activity.type.${act.type}`, act.type)} - ${productName}`;
    }
    return `${t(`activity.type.${act.type}`, act.type)} - ${productName} (${t('superadmin.quantity_abbr', 'Qty')}: ${act.quantity})`;
  };

  const filteredLogs = (logsData.data || []).map(act => ({
    id: act._id,
    time: formatDate(act.createdAt, i18n.language),
    user: act.actorId?.name || t('superadmin.system_actor', "Système"),
    ip: act.actorId?.email || t('superadmin.internal_service', "Service interne"),
    action: getLogAction(act),
    status: act.status === 'COMPLETED' ? t('superadmin.status_success', 'Réussi') : act.status === 'CANCELLED' ? t('superadmin.status_failed', 'Échoué') : t('superadmin.status_pending', 'En Attente'),
    rawStatus: act.status,
    rawType: act.type
  }));

  // Premium Dashboard Metrics


  // Derived Metrics
  const totalAdmins = usersList.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length;
  const totalUsers = usersList.filter(u => u.role === 'USER').length;
  
  const totalStockValue = productsList.reduce((sum, p) => sum + ((p.price || 0) * (p.stockQuantity || 0)), 0);
  const totalStockQuantity = productsList.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const warehouseCapacity = Math.min(100, (totalStockQuantity / 10000) * 100);

  const totalExports = activitiesList.filter(a => a.type === 'EXPORT').reduce((sum, a) => sum + (a.quantity || 0), 0);

  const filteredActivitiesForCharts = activitiesList.filter(act => {
    if (selectedPeriod === 'ALL') return true;
    const date = new Date(act.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    
    if (selectedPeriod === 'Q1_2026') {
      return year === 2026 && month >= 0 && month <= 2;
    }
    if (selectedPeriod === '2025') {
      return year === 2025;
    }
    if (selectedPeriod === '2024') {
      return year === 2024;
    }
    return true;
  });

  const exportData = Object.values(filteredActivitiesForCharts.filter(a => a.type === 'EXPORT' && a.productId).reduce((acc: any, act) => {
    const productName = act.productId.localizedName || act.productId.name || t('superadmin.unknown_product', 'Inconnu');
    if (!acc[productName]) acc[productName] = { name: productName, volume: 0 };
    acc[productName].volume += act.quantity;
    return acc;
  }, {})).sort((a: any, b: any) => b.volume - a.volume).slice(0, 5);

  const revenueData = (() => {
    const months = [
      t('superadmin.month_jan', 'Jan'), t('superadmin.month_feb', 'Fév'),
      t('superadmin.month_mar', 'Mar'), t('superadmin.month_apr', 'Avr'),
      t('superadmin.month_may', 'Mai'), t('superadmin.month_jun', 'Juin'),
      t('superadmin.month_jul', 'Juil'), t('superadmin.month_aug', 'Aoû'),
      t('superadmin.month_sep', 'Sep'), t('superadmin.month_oct', 'Oct'),
      t('superadmin.month_nov', 'Nov'), t('superadmin.month_dec', 'Déc')
    ];
    const data = months.map(m => ({ name: m, revenue: 0 }));
    filteredActivitiesForCharts.forEach(act => {
      if ((act.type === 'EXPORT' || act.type === 'SALE') && act.productId) {
        const monthIdx = new Date(act.createdAt).getMonth();
        const price = act.productId.price || 0;
        data[monthIdx].revenue += (act.quantity * price) / 1000000;
      }
    });
    return data;
  })();

  const currentRevenue = revenueData[revenueData.length - 1]?.revenue || 0;
  const previousRevenue = revenueData.length > 1 ? (revenueData[revenueData.length - 2]?.revenue || 0) : 0;
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const revenueGoalMatch = Math.min(100, (currentRevenue / revenueGoal) * 100);

  const logisticsCosts = currentRevenue * logisticsRevenueRate + (totalStockValue / 1000000) * logisticsStockRate;
  const operatingMargin = currentRevenue > 0 ? ((currentRevenue - logisticsCosts) / currentRevenue) * 100 : 0;

  const handleExport = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    const reportTitle = activeTab === 'finance' 
      ? t('superadmin.report_title_finance', 'Rapport MBC-SUARL - Financier')
      : t('superadmin.report_title_global', 'Rapport MBC-SUARL - Global');
    doc.text(reportTitle, 14, 22);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const generatedOnLabel = t('superadmin.generated_on', 'Généré le :');
    const formattedDate = new Date().toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US');
    doc.text(`${generatedOnLabel} ${formattedDate}`, 14, 32);
    
    if (activeTab === 'finance') {
      doc.text(t('superadmin.finance_performance_overview', 'Aperçu des performances financières :'), 14, 45);
      const financeData = [
        [t('superadmin.report_net_revenue', 'Revenu Net (Global)'), `${currentRevenue.toFixed(1)}M FCFA`, `${revenueGoalMatch.toFixed(0)}% ${t('superadmin.of_goal', 'de l\'Objectif')}`],
        [t('superadmin.report_fixed_stock', 'Valeur du Stock Fixe'), `${(totalStockValue / 1000000).toFixed(1)}M FCFA`, `${warehouseCapacity.toFixed(1)}% ${t('superadmin.capacity', 'Capacité')}`],
        [t('superadmin.report_external_ops', 'Opérations Externes'), `${totalExports} ${t('superadmin.report_active', 'Actif')}`, t('superadmin.report_fluid', 'Fluide')]
      ];
      autoTable(doc, {
        startY: 55,
        head: [[t('superadmin.report_metric', 'Métrique'), t('superadmin.report_value', 'Valeur'), t('superadmin.report_trend', 'Tendance')]],
        body: financeData,
        theme: 'striped',
        headStyles: { fillColor: [0, 132, 61] }
      });
    } else {
      doc.text(t('superadmin.report_overview_desc', { tab: activeTab }), 14, 45);
    }

    doc.save(`mbc_rapport_${activeTab}_2026.pdf`);
  };

  const renderPageContentEditor = (pageKeys: string[], pagePrefix: string, titleKey: string, descKey: string, zones: string[]) => {
    const allKeys = Array.from(new Set([
      ...pageKeys,
      ...Object.keys(homeContentDraft).filter(k => !pageKeys.includes(k) && k.startsWith(pagePrefix)),
    ]));
    const allowZone = zones.length > 0;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center">
              <Layout className="text-brand-yellow" size={22} />
            </div>
            {t('superadmin.' + titleKey, titleKey)}
          </h2>
          <p className="text-gray-500 text-sm">{t('superadmin.' + descKey, descKey)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-lg font-bold text-brand-dark">{t('superadmin.add_content_key', 'Ajouter une clé')}</h3>
          <div className={`grid grid-cols-1 ${allowZone ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
            <input
              value={newContentKey}
              onChange={(e) => setNewContentKey(e.target.value)}
              placeholder={t('superadmin.key', 'Clé (ex: home.hero_badge)')}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
            />
            <input
              value={newContentEn}
              onChange={(e) => setNewContentEn(e.target.value)}
              placeholder={t('superadmin.english', 'Anglais')}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
            />
            <input
              value={newContentFr}
              onChange={(e) => setNewContentFr(e.target.value)}
              placeholder={t('superadmin.french', 'Français')}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
            />
            {allowZone && (
              <select
                value={newContentZone}
                onChange={(e) => setNewContentZone(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
              >
                {zones.map(zone => (
                  <option key={zone} value={zone}>{t('superadmin.zone_' + zone.replace(/-/g, '_'), zone)}</option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={handleAddHomeContent}
            disabled={!newContentKey}
            className="flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-brand-dark/90 transition-all disabled:opacity-50"
          >
            <Check size={16} />
            {t('superadmin.add', 'Ajouter')}
          </button>
        </div>

        {homeContentLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-brand-green" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {allKeys.map((key) => {
              const draft = homeContentDraft[key] ?? {};
              const isHardcoded = pageKeys.includes(key);
              return (
                <div key={key} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-gray-500 uppercase tracking-widest">{key}</label>
                    <button
                      onClick={() => handleDeleteHomeContent(key)}
                      disabled={homeContentDeleting === key}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-sm font-black disabled:opacity-50"
                    >
                      {homeContentDeleting === key ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      {isHardcoded ? t('superadmin.reset', 'Reset') : t('superadmin.delete', 'Supprimer')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">{t('superadmin.english', 'Anglais')}</label>
                      <textarea
                        value={draft.en ?? i18n.t(key, { lng: 'en' })}
                        onChange={(e) => setHomeContentDraft(prev => ({ ...prev, [key]: { ...prev[key], en: e.target.value } }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all resize-y"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">{t('superadmin.french', 'Français')}</label>
                      <textarea
                        value={draft.fr ?? i18n.t(key, { lng: 'fr' })}
                        onChange={(e) => setHomeContentDraft(prev => ({ ...prev, [key]: { ...prev[key], fr: e.target.value } }))}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all resize-y"
                      />
                    </div>
                  </div>
                  {allowZone && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase">{t('superadmin.placement', 'Placement')}</label>
                      <select
                        value={draft.zone ?? 'bottom'}
                        onChange={(e) => setHomeContentDraft(prev => ({ ...prev, [key]: { ...prev[key], zone: e.target.value } }))}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green"
                      >
                        {zones.map(zone => (
                          <option key={zone} value={zone}>{t('superadmin.zone_' + zone.replace(/-/g, '_'), zone)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button
                    onClick={() => handleSaveHomeContent(key)}
                    disabled={homeContentSaving === key}
                    className="flex items-center gap-2 bg-brand-dark text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-brand-dark/90 transition-all disabled:opacity-50"
                  >
                    {homeContentSaving === key ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    {t('common.save', 'Enregistrer')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'market-prices':
        return <MarketPriceComparison t={t} i18n={i18n} marketPriceData={marketPriceData} isLoadingMarketPrices={isLoadingMarketPrices} onRefresh={fetchMarketPriceData} />;

      case 'messages':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-yellow/10 flex items-center justify-center">
                    <Megaphone className="text-brand-yellow" size={22} />
                  </div>
                  {t('superadmin.tab_messages', 'Messagerie Stratégique')}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{t('superadmin.strat_msg_desc', 'Diffusez des communications officielles vers les admins et/ou utilisateurs.')}</p>
              </div>
              <div className="flex gap-3">
                <span className="px-3 py-1.5 bg-brand-yellow/10 text-yellow-700 border border-brand-yellow/30 rounded-full text-xs font-black flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse"></span>
                  {broadcasts.length === 1 
                    ? t('superadmin.broadcast_count', { count: 1 }) 
                    : t('superadmin.broadcast_count_plural', { count: broadcasts.length })}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* ─ Composer Broadcast ─ */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-brand-dark to-gray-900 rounded-3xl p-7 shadow-xl border border-white/5 sticky top-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-yellow/20 flex items-center justify-center">
                      <Send size={20} className="text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-lg">{t('superadmin.new_broadcast', 'Nouveau Broadcast')}</h3>
                      <p className="text-xs text-gray-400">{t('superadmin.official_msg_desc', 'Message officiel vers tous les destinataires')}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    {/* Target Role */}
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('superadmin.recipients', 'Destinataires')}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['ADMIN', 'USER', 'ALL'] as const).map(role => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setBroadcastForm({...broadcastForm, targetRole: role})}
                            className={`py-2.5 rounded-xl text-xs font-black transition-all transform hover:scale-[1.02] active:scale-95 ${
                              broadcastForm.targetRole === role
                                ? 'bg-brand-yellow text-brand-dark shadow-lg shadow-brand-yellow/30'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10 hover:text-white'
                            }`}
                          >
                            {role === 'ADMIN' ? t('superadmin.target_admins', '👤 Admins') : role === 'USER' ? t('superadmin.target_users', '🧑 Users') : t('superadmin.target_all', '🌍 Tous')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('superadmin.msg_subject', 'Objet du message')}</label>
                      <input
                        type="text"
                        required
                        value={broadcastForm.subject}
                        onChange={e => setBroadcastForm({...broadcastForm, subject: e.target.value})}
                        placeholder={t('superadmin.broadcast_subject_example')}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow/50 transition-all"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('superadmin.msg_content', 'Contenu')}</label>
                      <textarea
                        required
                        value={broadcastForm.content}
                        onChange={e => setBroadcastForm({...broadcastForm, content: e.target.value})}
                        rows={5}
                        placeholder={t('superadmin.msg_content_placeholder', 'Rédigez votre message officiel ici...')}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow/50 transition-all resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingBroadcast || !broadcastForm.subject || !broadcastForm.content}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-brand-yellow hover:bg-yellow-400 text-brand-dark font-black rounded-2xl transition-all shadow-lg shadow-brand-yellow/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wider"
                    >
                      {isSendingBroadcast ? (
                        <><Loader2 size={18} className="animate-spin" /> {t('superadmin.sending_in_progress', 'Envoi en cours...')}</>
                      ) : broadcastSuccess ? (
                        <><CheckCircle size={18} /> {t('superadmin.sent', 'Envoyé !')}</>
                      ) : (
                        <><Send size={18} /> {t('superadmin.send_broadcast', 'Envoyer le Broadcast')}</>  
                      )}
                    </button>
                  </form>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-3">
                    {[
                      { label: t('superadmin.total', 'Total'), value: broadcasts.length, color: 'text-white' },
                      { label: t('superadmin.admins', 'Admins'), value: broadcasts.filter(b => b.targetRole === 'ADMIN').length, color: 'text-brand-yellow' },
                      { label: t('superadmin.all', 'Tous'), value: broadcasts.filter(b => b.targetRole === 'ALL').length, color: 'text-green-400' },
                    ].map(stat => (
                      <div key={stat.label} className="text-center bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ─ Broadcast History ─ */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-brand-dark flex items-center gap-2">
                    <Globe size={18} className="text-brand-green" />
                    {t('superadmin.broadcast_history', 'Historique des Broadcasts')}
                  </h3>
                  <button
                    onClick={fetchBroadcasts}
                    className="text-xs font-bold text-gray-400 hover:text-brand-green transition-colors flex items-center gap-1"
                  >
                    <Activity size={14} /> {t('superadmin.refresh', 'Actualiser')}
                  </button>
                </div>

                {isLoadingBroadcasts ? (
                  <div className="flex flex-col items-center py-20 bg-white rounded-3xl border border-gray-100">
                    <Loader2 className="w-10 h-10 text-brand-yellow animate-spin mb-3" />
                    <p className="text-gray-500 font-bold text-sm">{t('common.loading', 'Chargement...')}</p>
                  </div>
                ) : broadcasts.length === 0 ? (
                  <div className="flex flex-col items-center py-20 bg-white rounded-3xl border border-gray-100 text-center px-6">
                    <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-4">
                      <Megaphone size={32} className="text-brand-yellow/50" />
                    </div>
                    <h4 className="text-lg font-bold text-brand-dark mb-1">{t('superadmin.no_broadcasts', 'Aucun broadcast envoyé')}</h4>
                    <p className="text-gray-500 text-sm">{t('superadmin.instructions_msg', 'Utilisez le formulaire pour diffuser un message officiel.')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {broadcasts.map((broadcast: any, idx: number) => (
                      <motion.div
                        key={broadcast._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5 cursor-pointer active:scale-[0.98]"
                        onClick={() => setSelectedBroadcast(broadcast)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              broadcast.targetRole === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                              broadcast.targetRole === 'USER' ? 'bg-blue-100 text-blue-600' :
                              'bg-brand-yellow/10 text-yellow-600'
                            }`}>
                              {broadcast.targetRole === 'ADMIN' ? <Users size={18} /> :
                               broadcast.targetRole === 'USER' ? <Mail size={18} /> :
                               <Globe size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-brand-dark truncate group-hover:text-brand-green transition-colors">{broadcast.subject}</p>
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{broadcast.content}</p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              broadcast.targetRole === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                              broadcast.targetRole === 'USER' ? 'bg-blue-50 text-blue-700' :
                              'bg-brand-yellow/10 text-yellow-700'
                            }`}>
                              → {broadcast.targetRole === 'ALL' ? t('superadmin.target_all', 'Tous') : broadcast.targetRole}
                            </span>
                            <p className="text-[10px] text-gray-400 font-bold mt-1.5">
                              {new Date(broadcast.createdAt).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 'roles':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark">{t('superadmin.roles', 'Gestion des Rôles')}</h2>
                <p className="text-gray-500 text-sm mt-1">{t('superadmin.manage_roles_desc', 'Gérez les administrateurs et utilisateurs du système.')}</p>
              </div>
              <button 
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors">
                {t('superadmin.add_user', '+ Ajouter Utilisateur')}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                    <th className="p-4 pl-6">{t('superadmin.user', 'Utilisateur')}</th>
                    <th className="p-4">{t('superadmin.role', 'Rôle')}</th>
                    <th className="p-4">{t('superadmin.status', 'Statut')}</th>
                    <th className="p-4">{t('superadmin.last_login', 'Dernière Connexion')}</th>
                    <th className="p-4 text-center">{t('superadmin.actions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold mr-3">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{user.name}</p>
                            <p className="text-gray-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${
                          user.role === 'SUPER_ADMIN' ? 'bg-brand-yellow/20 text-yellow-700' :
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center text-xs font-bold ${user.status === 'Actif' ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${user.status === 'Actif' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          {user.role === 'SUPER_ADMIN' ? t('common.active', 'Actif') : user.status}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 text-xs font-medium">
                        {user.lastLogin}
                      </td>
                      <td className="p-4 text-center">
                        {user.role !== 'SUPER_ADMIN' && (
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => toggleUserRole(user.id, user.role)}
                              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-brand-green hover:bg-brand-green/10 hover:text-brand-dark text-xs font-black transition-all transform hover:scale-105 active:scale-95"
                            >
                              {user.role === 'ADMIN' ? t('superadmin.demote', 'Rétrograder') : t('superadmin.promote', 'Promouvoir')}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-500/10 transition-all transform hover:scale-110 active:scale-95 group"
                              title="Supprimer l'utilisateur"
                            >
                              <Trash2 size={16} className="group-hover:shake-icon" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        );

      case 'finance':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark flex items-center gap-2">
                  <BarChart3 className="text-brand-green" /> {t('superadmin.finance_overview', "Vue d'ensemble Financière")}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{t('superadmin.finance_desc', 'Analyse détaillée des revenus, coûts et marges de la supply chain.')}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('superadmin.period', 'Période')}</span>
                
                <div className="relative">
                  <button
                    onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-100 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all group active:scale-95"
                  >
                    <span className="text-sm font-black text-brand-dark">
                      {periods.find(p => p.value === selectedPeriod)?.label}
                    </span>
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-400 group-hover:text-brand-green transition-transform duration-500 ease-out ${isPeriodDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>

                  <AnimatePresence>
                    {isPeriodDropdownOpen && (
                      <>
                        {/* Backdrop to close */}
                        <div 
                          className="fixed inset-0 z-[90]" 
                          onClick={() => setIsPeriodDropdownOpen(false)} 
                        />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-72 bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] shadow-2xl p-2 z-[100] origin-top-right overflow-hidden"
                        >
                          <div className="space-y-1">
                            {periods.map((period) => (
                              <button
                                key={period.value}
                                onClick={() => {
                                  setSelectedPeriod(period.value);
                                  setIsPeriodDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                  selectedPeriod === period.value
                                    ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20'
                                    : 'text-gray-600 hover:bg-brand-green/5 hover:text-brand-green'
                                }`}
                              >
                                {period.label}
                                {selectedPeriod === period.value && <Check size={16} strokeWidth={3} />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
              {isEditingLogistics ? (
                <div className='flex flex-col md:flex-row gap-6 items-end'>
                  <div className='flex-1'>
                    <label className='block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>{t('superadmin.logistics_revenue_rate', 'Revenue rate')}</label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        value={editLogisticsRevenueRate}
                        onChange={(e) => setEditLogisticsRevenueRate(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLogisticsRates(); if (e.key === 'Escape') { setIsEditingLogistics(false); setEditLogisticsRevenueRate((logisticsRevenueRate * 100).toString()); setEditLogisticsStockRate((logisticsStockRate * 100).toString()); } }}
                        className='w-28 border border-gray-200 rounded-xl px-3 py-2 font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none'
                      />
                      <span className='text-sm font-bold text-gray-400'>%</span>
                    </div>
                  </div>
                  <div className='flex-1'>
                    <label className='block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>{t('superadmin.logistics_stock_rate', 'Stock value rate')}</label>
                    <div className='flex items-center gap-2'>
                      <input
                        type='number'
                        value={editLogisticsStockRate}
                        onChange={(e) => setEditLogisticsStockRate(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveLogisticsRates(); if (e.key === 'Escape') { setIsEditingLogistics(false); setEditLogisticsRevenueRate((logisticsRevenueRate * 100).toString()); setEditLogisticsStockRate((logisticsStockRate * 100).toString()); } }}
                        className='w-28 border border-gray-200 rounded-xl px-3 py-2 font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none'
                      />
                      <span className='text-sm font-bold text-gray-400'>%</span>
                    </div>
                  </div>
                  <div className='flex gap-2'>
                    <button onClick={handleSaveLogisticsRates} className='bg-brand-green hover:bg-brand-green/90 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2'>
                      <Check size={14} className='stroke-[3px]' /> {t('common.save', 'Save')}
                    </button>
                    <button onClick={() => { setIsEditingLogistics(false); setEditLogisticsRevenueRate((logisticsRevenueRate * 100).toString()); setEditLogisticsStockRate((logisticsStockRate * 100).toString()); }} className='bg-gray-100 hover:bg-gray-200 text-gray-500 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all'>
                      {t('common.cancel', 'Cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                  <div>
                    <h3 className='text-lg font-black text-brand-dark'>{t('superadmin.logistics_settings', 'Logistics cost calculation')}</h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      {t('superadmin.logistics_revenue_rate', 'Revenue rate')}: <span className='font-bold text-brand-dark'>{(logisticsRevenueRate * 100).toFixed(0)}%</span> - {t('superadmin.logistics_stock_rate', 'Stock value rate')}: <span className='font-bold text-brand-dark'>{(logisticsStockRate * 100).toFixed(0)}%</span>
                    </p>
                  </div>
                  <button onClick={() => { setIsEditingLogistics(true); setEditLogisticsRevenueRate((logisticsRevenueRate * 100).toString()); setEditLogisticsStockRate((logisticsStockRate * 100).toString()); }} className='bg-brand-green/10 hover:bg-brand-green/20 text-brand-green px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2'>
                    <Edit2 size={14} /> {t('common.edit', 'Edit')}
                  </button>
                </div>
              )}
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 pointer-events-none"><DollarSign size={80} /></div>
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">{t('superadmin.net_revenue', 'Revenu Net (Mensuel)')}</h3>
                <p className="text-4xl font-black text-brand-dark mb-2">{currentRevenue.toFixed(1)}M <span className="text-lg font-bold text-gray-400">FCFA</span></p>
                <div className={`flex items-center text-sm font-bold inline-flex px-2 py-1 rounded-md ${revenueGrowth >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                  <TrendingUp size={14} className={`mr-1 ${revenueGrowth < 0 && 'rotate-180'}`} /> {revenueGrowth > 0 ? '+' : ''}{revenueGrowth.toFixed(1)}% {t('superadmin.vs_prev_month', 'vs Mois Précédent')}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700 pointer-events-none"><Package size={80} /></div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Package size={24} />
                </div>
                <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">{t('superadmin.est_logistics_costs', 'Coûts Logistiques Estimés')}</h3>
                <h3 className="text-4xl font-black text-brand-dark mb-2">{logisticsCosts.toFixed(1)}M <span className="text-lg font-bold text-gray-400">FCFA</span></h3>
                <div className="flex items-center text-sm font-bold text-blue-600 bg-blue-50 inline-flex px-2 py-1 rounded-md">
                   {t('superadmin.storage_transport', 'Stockage & Transport')}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-3xl shadow-sm border border-gray-200 relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700 pointer-events-none"><TrendingUp size={80} /></div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">{t('superadmin.operating_margin', 'Marge Opérationnelle')}</h3>
                <p className="text-4xl font-black text-brand-dark mb-2">{operatingMargin.toFixed(1)}<span className="text-3xl">%</span></p>
                <div className={`flex items-center text-sm font-bold inline-flex px-2 py-1 rounded-md ${operatingMargin >= 20 ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'}`}>
                   <CheckCircle size={14} className="mr-1" /> {operatingMargin >= 20 ? t('superadmin.excellent', 'Excellente') : t('superadmin.to_optimize', 'À Optimiser')}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-8'>
              {/* Projections Hydroponiques Section */}
              <div className="bg-white rounded-[2rem] shadow-sm border border-brand-green/20 p-8 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-brand-dark flex items-center gap-2">
                       <Sprout className="text-brand-green" /> {t('superadmin.hydro_projections', 'Projections Hydroponiques (512m²)')}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{t('superadmin.hydro_projections_desc', 'Estimation basée sur 2 000 plants et un rendement de 15-17kg/plant.')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsEditingProjections(!isEditingProjections)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                        isEditingProjections 
                          ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20' 
                          : 'bg-brand-green/10 text-brand-green hover:bg-brand-green/20'
                      }`}
                    >
                      {isEditingProjections ? <><Check size={14} /> {t('common.save', 'Enregistrer')}</> : <><Edit2 size={14} /> {t('common.edit', 'Modifier')}</>}
                    </button>
                    <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
                      {t('superadmin.high_perf_model', 'Modèle Haute Performance')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Table Gros */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <ShoppingCart size={18} className="text-brand-yellow" /> {t('superadmin.bulk_scenario', 'Scénario Vente en Gros')}
                    </h4>
                    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold">
                          <tr>
                            <th className="px-4 py-3">{t('superadmin.price_kg', 'Prix / kg')}</th>
                            <th className="px-4 py-3">{t('superadmin.volume_t_unit', 'Volume (T)')}</th>
                            <th className="px-4 py-3">{t('superadmin.ra_cycle', 'C.A / Cycle')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {projectionsData.bulk.map((row: any, i: number) => (
                            <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${i === 1 ? 'bg-brand-green/5' : ''}`}>
                              <td className="px-4 py-3">
                                {isEditingProjections ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none"
                                      value={row.price}
                                      onChange={(e) => handleUpdateProjection('bulk', i, 'price', e.target.value)}
                                    />
                                    <span className="text-[10px] text-gray-400 font-bold">FCFA</span>
                                  </div>
                                ) : (
                                  <span className="font-bold">{row.price.toLocaleString()} FCFA</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditingProjections ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-brand-dark focus:ring-2 focus:ring-brand-green focus:outline-none"
                                      value={row.volume}
                                      onChange={(e) => handleUpdateProjection('bulk', i, 'volume', e.target.value)}
                                    />
                                    <span className="text-[10px] text-gray-400 font-bold">T</span>
                                  </div>
                                ) : (
                                  <span className="font-bold">{row.volume} T</span>
                                )}
                              </td>
                              <td className={`px-4 py-3 font-black ${i === 1 ? 'text-brand-green' : 'text-brand-dark'}`}>
                                {((row.price * row.volume * 1000) / 1000000).toFixed(0)}M FCFA
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table Kiosques */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2 border-b border-gray-100 pb-2">
                      <TrendingUp size={18} className="text-blue-500" /> {t('superadmin.scenario_kiosques', 'Scénario Kiosques Premium')}
                    </h4>
                    <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold">
                          <tr>
                            <th className="px-4 py-3">{t('superadmin.price_kg', 'Prix / kg')}</th>
                            <th className="px-4 py-3">{t('superadmin.volume_t_unit', 'Volume (T)')}</th>
                            <th className="px-4 py-3">{t('superadmin.ra_cycle', 'C.A / Cycle')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {projectionsData.kiosks.map((row: any, i: number) => (
                            <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${i === 1 ? 'bg-brand-yellow/5' : ''}`}>
                              <td className="px-4 py-3">
                                {isEditingProjections ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-brand-dark focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                                      value={row.price}
                                      onChange={(e) => handleUpdateProjection('kiosks', i, 'price', e.target.value)}
                                    />
                                    <span className="text-[10px] text-gray-400 font-bold">FCFA</span>
                                  </div>
                                ) : (
                                  <span className="font-bold">{row.price.toLocaleString()} FCFA</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {isEditingProjections ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 font-bold text-brand-dark focus:ring-2 focus:ring-brand-yellow focus:outline-none"
                                      value={row.volume}
                                      onChange={(e) => handleUpdateProjection('kiosks', i, 'volume', e.target.value)}
                                    />
                                    <span className="text-[10px] text-gray-400 font-bold">T</span>
                                  </div>
                                ) : (
                                  <span className="font-bold">{row.volume} T</span>
                                )}
                              </td>
                              <td className={`px-4 py-3 font-black ${i === 1 ? 'text-yellow-700' : 'text-brand-dark'}`}>
                                {((row.price * row.volume * 1000) / 1000000).toFixed(0)}M FCFA
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-brand-dark rounded-2xl text-white">
                   <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Activity size={18} className="text-brand-yellow" /> {t('superadmin.plan_transition', 'Plan de Transition (Objectif Annuel : 250M+)')}
                   </h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { cycle: "1", task: t('superadmin.task_cycle_1', "Gros 100%"), focus: t('superadmin.focus_cycle_1', "Trésorerie") },
                        { cycle: "2", task: t('superadmin.task_cycle_2', "Mix Pilote"), focus: t('superadmin.focus_cycle_2', "Test Kiosques") },
                        { cycle: "3", task: t('superadmin.task_cycle_3', "Kiosques ++"), focus: t('superadmin.focus_cycle_3', "Expansion") },
                        { cycle: "4", task: t('superadmin.task_cycle_4', "Omnicanal"), focus: t('superadmin.focus_cycle_4', "Marge Totale") }
                      ].map((item, i) => (
                        <div key={i} className="border-l-2 border-brand-yellow/30 pl-4 py-1">
                           <span className="text-[10px] uppercase font-bold text-gray-400">{t('superadmin.cycle', 'Cycle')} {item.cycle}</span>
                           <p className="font-bold text-sm block">{item.task}</p>
                           <p className="text-[10px] text-brand-yellow font-black">{item.focus}</p>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 h-[500px] flex flex-col">
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-brand-dark">{t('superadmin.export_vol', 'Volumes d\'Exportation')}</h3>
                  <p className="text-sm text-gray-500">{t('superadmin.pole_activity_desc', 'Répartition par pôle d\'activité (Tonnes)')}</p>
                </div>
                <div className="flex-grow w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={exportData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}} 
                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ color: '#00843D', fontWeight: '900' }}
                      />
                      <Bar dataKey="volume" name={t('superadmin.volume_t', 'Volume (T)')} fill="url(#colorVolume)" radius={[8, 8, 0, 0]} barSize={45}>
                      </Bar>
                      <defs>
                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00843D" />
                          <stop offset="100%" stopColor="#005c2a" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-brand-dark to-gray-900 rounded-3xl shadow-lg border border-gray-800 p-8 h-[500px] flex flex-col text-white">
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-white">{t('superadmin.monthly_revenue', 'Chiffre d\'Affaires Mensuel')}</h3>
                  <p className="text-sm text-gray-400">{t('superadmin.revenue_evolution', 'Évolution de la croissance sur l\'année en cours')}</p>
                </div>
                <div className="flex-grow w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevDark" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FFD100" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#FFD100" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', backgroundColor: '#1e293b', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                        labelStyle={{ fontWeight: 'bold', color: '#f8fafc' }}
                        itemStyle={{ color: '#FFD100', fontWeight: '900' }}
                      />
                      <Area type="monotone" name={t('superadmin.revenue_m_fcfa', 'M FCFA')} dataKey="revenue" stroke="#FFD100" strokeWidth={4} fillOpacity={1} fill="url(#colorRevDark)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'logs':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-dark flex items-center">
                  <Activity className="mr-2 text-brand-green" /> {t('superadmin.activity_register', 'Registre d\'Activité')}
                </h2>
                <p className="text-gray-500 text-sm mt-1">{t('superadmin.activity_desc', 'Historique complet des actions de sécurité et des événements système.')}</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  {showLogFilter && (
                    <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} className="absolute right-full mr-2 top-0">
                      <input 
                        type="text" 
                        placeholder={t('common.search')} 
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-brand-green"
                        autoFocus
                      />
                    </motion.div>
                  )}
                  <button 
                    onClick={() => setShowLogFilter(!showLogFilter)}
                    className={`border px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors ${showLogFilter ? 'bg-brand-green text-white border-brand-green' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                  >
                    {t('superadmin.filter', 'Filtrer')}
                  </button>
                </div>
                <button onClick={handleExportLogs} className="bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-800 transition-colors flex items-center">
                  <Download size={14} className="mr-2" /> {t('superadmin.export_logs', 'Exporter Logs')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 text-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-bold">
                        <th className="p-4 pl-6 w-1/4">{t('superadmin.timestamp', 'Horodatage')}</th>
                        <th className="p-4 w-1/4">{t('superadmin.user_ip', 'Utilisateur / IP')}</th>
                        <th className="p-4 w-1/4">{t('superadmin.action', 'Action')}</th>
                        <th className="p-4 w-1/4">{t('superadmin.status_label', 'Statut')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <AnimatePresence>
                        {filteredLogs.map((log) => (
                          <motion.tr 
                            key={log.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`hover:bg-gray-50 transition-colors ${log.rawStatus === 'CANCELLED' ? 'bg-red-50/30' : ''}`}
                          >
                            <td className="p-4 pl-6 font-medium text-gray-500">{log.time}</td>
                            <td className="p-4">
                                <span className="font-bold text-brand-dark block">{log.user}</span>
                                <span className={`text-xs ${log.rawStatus === 'CANCELLED' ? 'text-red-500' : 'text-gray-400'}`}>{log.ip}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border flex items-center justify-center w-fit shadow-sm transition-all hover:scale-105
                                ${log.rawType === 'SALE' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                                  log.rawType === 'PURCHASE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                  log.rawType === 'ADJUSTMENT' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                  log.rawType === 'EXPORT' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                  log.rawType === 'PRODUCT_CREATED' ? 'bg-teal-50 text-teal-600 border-teal-100' :
                                  log.rawType === 'PRODUCT_UPDATED' ? 'bg-cyan-50 text-cyan-600 border-cyan-100' :
                                  log.rawType === 'PRODUCT_DELETED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                  'bg-gray-50 text-gray-600 border-gray-100'
                                }`}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4">
                                <span className={`${log.rawStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : log.rawStatus === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'} px-2 py-1 rounded text-xs font-bold flex items-center w-fit`}>
                                   {log.rawStatus === 'COMPLETED' && <CheckCircle size={12} className="mr-1"/>}
                                   {log.status}
                                </span>
                            </td>
                          </motion.tr>
                        ))}
                        {filteredLogs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-500 italic">{t('superadmin.no_results', { filter: logFilter })}</td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </tbody>
                    </table>
                </div>
                {logsData.total > logsPerPage && (
                  <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/50">
                    <span className="text-xs text-gray-500 font-bold">
                      {t('superadmin.showing_range', { 
                        start: (logsPage - 1) * logsPerPage + 1, 
                        end: Math.min(logsPage * logsPerPage, logsData.total), 
                        total: logsData.total 
                      })}
                    </span>
                    <div className="flex gap-2">
                      <button 
                        disabled={logsPage === 1}
                        onClick={() => setLogsPage(p => Math.max(1, p - 1))}
                        className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        {t('superadmin.previous', 'Précédent')}
                      </button>
                      <button 
                        disabled={logsPage * logsPerPage >= logsData.total}
                        onClick={() => setLogsPage(p => p + 1)}
                        className="px-3 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                      >
                        {t('superadmin.next', 'Suivant')}
                      </button>
                    </div>
                  </div>
                )}
            </div>
          </motion.div>
        );

      case 'objectives':
        return <ObjectivesTab />;

      case 'pages-content': {
        const config = PAGES_CONFIG[selectedPage];
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wider">{t('superadmin.select_page', 'Page')}</label>
              <select
                value={selectedPage}
                onChange={(e) => setSelectedPage(e.target.value as 'home' | 'about' | 'services' | 'contact')}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green min-w-[180px]"
              >
                <option value="home">{t('superadmin.page_home', 'Home')}</option>
                <option value="about">{t('superadmin.page_about', 'About')}</option>
                <option value="services">{t('superadmin.page_services', 'Services')}</option>
                <option value="contact">{t('superadmin.page_contact', 'Contact')}</option>
              </select>
            </div>
            {renderPageContentEditor(config.keys, config.prefix, config.titleKey, config.descKey, config.zones)}
          </div>
        );
      }

      case 'dashboard':
      default:
        if (isDataLoading) {
          return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-brand-green" size={48} />
              <p className="text-gray-500 font-bold">{t('superadmin.loading_metrics', 'Chargement des indicateurs...')}</p>
            </div>
          );
        }
        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="space-y-8">
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-brand-yellow/30 bg-gradient-to-r from-white to-yellow-50/30">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-3 animate-pulse ${isMaintenanceMode ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                  {t('superadmin.status_system', 'Statut du Système :')} 
                  <button 
                    onClick={handleToggleMaintenance}
                    className={`ml-2 px-2 py-0.5 rounded-full transition-colors ${isMaintenanceMode ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                  >
                    {isMaintenanceMode ? t('superadmin.maintenance', 'Maintenance') : t('superadmin.operational', 'Opérationnel')}
                  </button>
                </h2>
                <p className="text-sm text-gray-500 mt-1">{t('superadmin.last_sync_desc', 'Dernière synchronisation des données : À l\'instant.')}</p>
              </div>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-white border border-green-200 rounded-full text-xs font-bold text-green-700 shadow-sm flex items-center"><CheckCircle size={12} className="mr-1"/> {t('superadmin.online', 'En ligne')}</span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 shadow-sm">{t('superadmin.real_time', 'Temps réel')}</span>
              </div>
            </div>



            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-brand-dark to-gray-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Users size={100} /></div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                  <Users size={20} className="text-brand-yellow" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{t('superadmin.global_community', 'Communauté Globale')}</p>
                <h3 className="text-4xl font-black mb-1">{totalUsers + totalAdmins}</h3>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded text-white">{totalAdmins} {t('superadmin.role_admins_badge')}</span>
                  <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-gray-300">{totalUsers} {t('superadmin.role_users_badge')}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-brand-green to-emerald-700 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500"><Database size={100} /></div>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                  <Database size={20} className="text-green-300" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-100 mb-1">{t('superadmin.stock_value', 'Valeur du Stock')}</p>
                <h3 className="text-4xl font-black mb-1">{(totalStockValue / 1000000).toFixed(1)}M <span className="text-sm font-bold text-green-200">FCFA</span></h3>
                <div className="mt-4">
                  <div className="w-full bg-black/20 rounded-full h-1.5 mb-1">
                    <div className="bg-green-300 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${warehouseCapacity}%` }}></div>
                  </div>
                  <p className="text-[10px] font-bold text-green-200">{t('superadmin.warehouse_capacity_desc', { percent: warehouseCapacity.toFixed(1) })}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-between group hover:-translate-y-1 transition-transform">
                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-20 group-hover:opacity-40 transition-opacity"><TrendingUp size={80} /></div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">{t('superadmin.monthly_revenue', 'Chiffre d\'Affaires Mensuel')}</p>
                  <h3 className="text-4xl font-black mb-1">{(revenueData[revenueData.length - 1]?.revenue || 0).toFixed(1)}M <span className="text-sm font-bold text-blue-200">FCFA</span></h3>
                </div>
                <div className="mt-4 bg-white/10 rounded-xl p-3 backdrop-blur-md border border-white/10">
                   <div className="flex items-center justify-between w-full mb-1 text-xs text-blue-100">
                     {isEditingGoal ? (
                        <div className="flex items-center bg-blue-900 border border-brand-yellow/50 rounded-md shadow-lg pl-3 h-8 flex-1 mr-2">
                          <span className="text-white/60 font-bold mr-1 shrink-0">{t('superadmin.goal_prefix')}</span>
                          <input 
                            type="number" 
                            className="bg-transparent text-white w-full text-center font-bold focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-[30px]"
                            value={editGoalValue}
                            onChange={(e) => setEditGoalValue(e.target.value)}
                            onKeyDown={(e) => {
                               if (e.key === 'Enter') handleSaveGoal();
                               if (e.key === 'Escape') {
                                 setIsEditingGoal(false);
                                 setEditGoalValue(revenueGoal.toString());
                               }
                            }}
                            autoFocus
                          />
                          <span className="text-blue-300 font-bold pr-2">M</span>
                          <button 
                            onClick={handleSaveGoal}
                            title="Sauvegarder"
                            className="h-full px-2.5 bg-brand-yellow hover:bg-yellow-400 text-brand-dark transition-colors border-l border-brand-yellow/50 flex items-center justify-center shrink-0"
                          >
                            <Check size={14} className="stroke-[3px]" />
                          </button>
                          <button 
                            onClick={() => {
                              setIsEditingGoal(false);
                              setEditGoalValue(revenueGoal.toString());
                            }}
                            title="Annuler"
                            className="h-full px-2 flex items-center justify-center text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-colors rounded-r-md shrink-0"
                          >
                            <X size={14} className="stroke-2" />
                          </button>
                        </div>
                     ) : (
                        <div className="flex items-center flex-wrap gap-y-1">
                          <span className="opacity-90 font-black">{t('superadmin.monthly_goal', 'Objectif (Mensuel)')}</span>
                          <button 
                            onClick={() => {
                              setEditGoalValue(revenueGoal.toString());
                              setIsEditingGoal(true);
                            }}
                            className="ml-0 sm:ml-2 flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-md transition-all font-black shadow-sm shrink-0"
                            title="Modifier l'objectif"
                          >
                            {revenueGoal}M <Edit2 size={12} className="opacity-60 transition-opacity" />
                          </button>
                        </div>
                     )}
                     <span className="text-white font-bold">{revenueGoalMatch.toFixed(0)}%</span>
                   </div>
                   <div className="h-1 w-full bg-blue-900 rounded-full mt-2 overflow-hidden">
                     <div className="h-full bg-brand-yellow rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(255,209,0,0.8)]" style={{ width: `${revenueGoalMatch}%` }}></div>
                   </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform border border-purple-500/30">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:-rotate-12 transition-transform duration-500"><Truck size={90} /></div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">{t('superadmin.export_year', 'Exportations (Année)')}</p>
                <h3 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200">{totalExports}</h3>
                <div className="mt-auto">
                  <div className="inline-flex items-center text-xs font-black bg-purple-900/50 text-purple-200 px-3 py-1.5 rounded-lg border border-purple-400/30">
                    <TrendingUp size={14} className="mr-2 text-brand-yellow"/> {t('superadmin.active_operations', 'Opérations Actives')}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:col-span-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-bl-full pointer-events-none"></div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-brand-dark flex items-center">
                      <BarChart3 className="mr-2 text-brand-yellow" size={24}/> {t('superadmin.platform_activity', 'Activité de la Plateforme')}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">{t('superadmin.real_time_revenue', 'Consultation des revenus en temps réel')}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsActivityDropdownOpen(!isActivityDropdownOpen)}
                      className="flex items-center gap-3 bg-white border border-gray-100 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md hover:border-brand-yellow/30 transition-all group"
                    >
                      <span className="text-sm font-black text-gray-700">
                        {activityPeriods.find(p => p.value === activityPeriod)?.label}
                      </span>
                      <ChevronDown 
                        size={18} 
                        className={`text-gray-400 group-hover:text-brand-yellow transition-transform duration-300 ${isActivityDropdownOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>

                    <AnimatePresence>
                      {isActivityDropdownOpen && (
                        <>
                          {/* Backdrop to close */}
                          <div 
                            className="fixed inset-0 z-[90]" 
                            onClick={() => setIsActivityDropdownOpen(false)} 
                          />
                          
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-56 bg-white/80 backdrop-blur-xl border border-white rounded-[1.5rem] shadow-2xl p-2 z-[100] origin-top-right overflow-hidden"
                          >
                            <div className="space-y-1">
                              {activityPeriods.map((period) => (
                                <button
                                  key={period.value}
                                  onClick={() => {
                                    setActivityPeriod(period.value);
                                    setIsActivityDropdownOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                                    activityPeriod === period.value
                                      ? 'bg-brand-yellow text-brand-dark shadow-lg shadow-brand-yellow/20'
                                      : 'text-gray-600 hover:bg-brand-yellow/5 hover:text-brand-yellow'
                                  }`}
                                >
                                  {period.label}
                                  {activityPeriod === period.value && <Check size={16} strokeWidth={3} />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenueGraph" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00843D" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#00843D" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}
                        itemStyle={{ color: '#00843D', fontWeight: '900' }}
                      />
                      <Area type="monotone" name={t('superadmin.revenue_m_fcfa', 'Revenus (M FCFA)')} dataKey="revenue" stroke="#00843D" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenueGraph)" activeDot={{r: 8, strokeWidth: 0, fill: '#FFD100', stroke: '#fff'}} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h3 className="font-bold text-brand-dark mb-6 flex items-center">
                  <ShieldCheck className="mr-2 text-brand-green" size={20} /> {t('superadmin.security_journal', 'Journal de Sécurité')}
                </h3>
                  {filteredLogs.slice(0, 3).map((log, idx) => (
                    <div key={idx} className={`flex gap-4 items-start p-3 rounded-xl border transition-colors ${
                      log.rawStatus === 'CANCELLED' || log.rawType === 'PRODUCT_DELETED' 
                        ? 'bg-red-50 border-red-100 hover:bg-red-100' 
                        : log.rawType === 'PRODUCT_CREATED'
                        ? 'bg-green-50 border-green-100 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        log.rawStatus === 'CANCELLED' || log.rawType === 'PRODUCT_DELETED' 
                          ? 'bg-red-200 text-red-600' 
                          : log.rawType === 'PRODUCT_CREATED'
                          ? 'bg-green-200 text-green-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {log.rawStatus === 'CANCELLED' ? <ShieldAlert size={14} /> : 
                         log.rawType === 'PRODUCT_DELETED' ? <Trash2 size={14} /> :
                         log.rawType === 'PRODUCT_CREATED' ? <Package size={14} /> :
                         log.rawType === 'PRODUCT_UPDATED' ? <Edit2 size={14} /> :
                         <Activity size={14} />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${log.rawStatus === 'CANCELLED' ? 'text-red-800' : 'text-gray-800'}`}>{log.action}</p>
                        <p className={`text-xs ${log.rawStatus === 'CANCELLED' ? 'text-red-600/70' : 'text-gray-500'}`}>{log.user} ({log.ip})</p>
                        <p className={`text-[10px] font-bold mt-1 ${log.rawStatus === 'CANCELLED' ? 'text-red-400' : 'text-gray-400'}`}>{log.time}</p>
                      </div>
                    </div>
                  ))}
                <button 
                  onClick={() => handleTabChange('logs')}
                  className="w-full mt-4 py-3 text-sm font-bold text-brand-dark bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  {t('superadmin.view_full_log', 'Voir tout le journal')}
                </button>
              </div>
            </div>

            <div className="bg-white border-2 border-brand-dark/10 rounded-3xl p-8 mb-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div>
                  <h3 className="text-xl font-black text-brand-dark mb-2 flex items-center gap-2">
                    <Database className="text-brand-green" /> {t('superadmin.full_backup', 'Sauvegarde Intégrale')}
                  </h3>
                  <p className="text-gray-500 text-sm max-w-md">{t('superadmin.backup_desc', 'Téléchargez un instantané complet de la base de données (Produits, Utilisateurs, Logs) au format SQL explicite.')}</p>
                </div>
                <button 
                  onClick={handleDownloadBackup}
                  disabled={isBackupLoading}
                  className="bg-brand-dark hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-black transition-all transform hover:scale-105 active:scale-95 shadow-xl flex items-center gap-3 disabled:opacity-50"
                >
                  {isBackupLoading ? <Loader2 className="animate-spin" /> : <Download size={20} />}
                  {t('superadmin.download_backup_sql', 'TÉLÉCHARGER SAUVEGARDE (.SQL)')}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-red-100 mt-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
              <h3 className="text-xl font-bold text-red-600 mb-4 border-b border-red-100 pb-4 flex items-center">
                <ShieldAlert className="mr-2" size={24} />
                {t('superadmin.danger_zone', 'Zone de Danger')}
              </h3>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 relative z-10">
                <div>
                  <h4 className="font-bold text-brand-dark">{t('superadmin.reset_platform', 'Réinitialiser la plateforme')}</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-lg">
                    {t('superadmin.reset_desc', 'Cette action nécessitera une double vérification (mot de passe + OTP). Elle nettoiera l\'intégralité des flux et de l\'historique de la base de données.')}
                  </p>
                </div>
                  <button 
                    onClick={() => setResetFlowState({...resetFlowState, step: 1})}
                    className="shrink-0 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl shadow-lg shadow-red-600/20 transition-all border border-red-700 w-full md:w-auto hover:-translate-y-1 hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                  >
                    {t('superadmin.start_reset', 'Démarrer la réinitialisation')}
                  </button>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-20">
      <aside className="w-[280px] bg-black text-white hidden md:flex flex-col border-r border-gray-800 shadow-2xl z-20 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-8 gap-3">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(255,209,0,0.3)]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="font-black text-sm tracking-widest text-brand-yellow block">{t('superadmin.role_label', 'SUPER ADMIN')}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">{currentUser?.name || t('superadmin.default_name', 'Chef Réseau')}</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4 pl-2">{t('superadmin.system_control', 'Contrôle Système')}</p>
          <nav className="space-y-2">
            <button 
              onClick={() => handleTabChange('dashboard')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap border group ${activeTab === 'dashboard' ? 'bg-white/10 text-brand-yellow border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}`}
            >
              <div className="w-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Database size={18} />
              </div>
              <span>{t('superadmin.dashboard', 'Tableau de Bord')}</span>
            </button>
            <button 
              onClick={() => handleTabChange('roles')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap border group ${activeTab === 'roles' ? 'bg-white/10 text-brand-yellow border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}`}
            >
              <div className="w-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Users size={18} />
              </div>
              <span>{t('superadmin.roles', 'Gestion des Rôles')}</span>
            </button>
            <button 
              onClick={() => handleTabChange('finance')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap border group ${activeTab === 'finance' ? 'bg-white/10 text-brand-yellow border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}`}
            >
              <div className="w-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 size={18} />
              </div>
              <span>{t('superadmin.finance', 'Rapports Financiers')}</span>
            </button>
            <button
              onClick={() => handleTabChange('logs')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap border group ${activeTab === 'logs' ? 'bg-white/10 text-brand-yellow border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}`}
            >
              <div className="w-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Activity size={18} />
              </div>
              <span>{t('superadmin.logs', 'Journal de Sécurité')}</span>
            </button>
            <button
              onClick={() => handleTabChange('market-prices')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap border group ${activeTab === 'market-prices' ? 'bg-white/10 text-brand-yellow border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}`}
            >
              <div className="w-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={18} />
              </div>
              <span>{t('admin.market_prices', 'Marchés Sénégal')}</span>
            </button>
            <button
              onClick={() => handleTabChange('messages')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap border group ${activeTab === 'messages' ? 'bg-white/10 text-brand-yellow border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}`}
            >
              <div className="w-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare size={18} />
              </div>
              <span>{t('superadmin.messages', 'Messagerie')}</span>
            </button>
            <button
              onClick={() => handleTabChange('objectives')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap border group ${activeTab === 'objectives' ? 'bg-white/10 text-brand-yellow border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}`}
            >
              <div className="w-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Target size={18} />
              </div>
              <span>{t('superadmin.objectives', 'Objectifs')}</span>
            </button>
            <button
              onClick={() => handleTabChange('pages-content')}
              className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap border group ${activeTab === 'pages-content' ? 'bg-white/10 text-brand-yellow border-white/10 shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white border-transparent'}`}
            >
              <div className="w-5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Layout size={18} />
              </div>
              <span>{t('superadmin.pages_content', 'Pages Content')}</span>
            </button>
          </nav>
        </div>
        <div className="px-6 py-4 border-t border-gray-900/50">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3 pl-2">{t('navbar.language', 'Langue')}</p>
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 shadow-inner">
            <button
              onClick={() => i18n.changeLanguage('fr')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${i18n.language.startsWith('fr') ? 'bg-brand-yellow text-brand-dark shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t('superadmin.language_fr_upper')}
            </button>
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${i18n.language.startsWith('en') ? 'bg-brand-yellow text-brand-dark shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t('superadmin.language_en_upper')}
            </button>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-gray-900">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-center space-x-3 px-4 py-3 w-full text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl font-bold transition-colors"
          >
            <LogOut size={18} />
            <span>{t('common.logout', 'Déconnexion')}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-10 h-[calc(100vh-80px)] overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-2">
            <div>
              <h1 className="text-3xl font-black text-brand-dark tracking-tight">
                {activeTab === 'dashboard' && t('superadmin.tab_dashboard', 'Contrôle Global MBC-SUARL')}
                {activeTab === 'roles' && t('superadmin.tab_roles', 'Administration des Comptes')}
                {activeTab === 'finance' && t('superadmin.tab_finance', 'Performances Financières')}
                {activeTab === 'logs' && t('superadmin.tab_logs', "Centre de Sécurité & Logs")}
                {activeTab === 'messages' && t('superadmin.tab_messages', 'Messagerie Stratégique')}
                {activeTab === 'objectives' && t('superadmin.tab_objectives', 'Objectifs Produits')}
                {activeTab === 'pages-content' && t('superadmin.tab_pages_content', 'Pages Content')}
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-1">{t('admin.secure_access_subtitle', 'Vue Super Administrateur - Accès Complet Sécurisé')}</p>
            </div>
            
            <button onClick={handleExport} className="flex items-center space-x-2 bg-brand-yellow text-brand-dark px-5 py-2.5 rounded-xl text-sm font-black shadow-[0_4px_14px_0_rgba(255,209,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,209,0,0.23)] hover:scale-105 transition-all">
              <Download size={18} />
              <span>{t('superadmin.export_report', 'Exporter Rapport')}</span>
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Super Admin Toast */}
      <AnimatePresence>
        {saToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-brand-dark text-white px-6 py-3 rounded-2xl shadow-2xl border border-brand-yellow/20 flex items-center gap-3 text-sm font-bold"
          >
            <CheckCircle size={18} className="text-brand-yellow" />
            {saToast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddUserModalOpen && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                  <UserPlus className="text-brand-green" size={24} /> 
                  {t('superadmin.new_user_title', "Nouvel Utilisateur")}
                </h3>
                <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('superadmin.full_name', 'Nom Complet')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
                      placeholder={t('superadmin.full_name_placeholder', 'Ex: Jean Dupont')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('superadmin.email_label', 'Email')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="email" 
                      required
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
                      placeholder={t('superadmin.email_placeholder', 'Ex: jean@mbc.com')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('superadmin.password_label', 'Mot de Passe')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" 
                      required
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all"
                      placeholder={t('superadmin.password_placeholder', 'Ex: motdepasse123')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t('superadmin.system_role', 'Rôle Système')}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ShieldCheck size={18} className="text-gray-400" />
                    </div>
                    <select 
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-green/50 focus:border-brand-green transition-all appearance-none"
                    >
                      <option value="USER">{t('superadmin.role_user_label', 'Utilisateur (USER)')}</option>
                      <option value="ADMIN">{t('superadmin.role_admin_label', 'Administrateur (ADMIN)')}</option>
                      <option value="SUPER_ADMIN">{t('superadmin.role_super_admin_label', 'Super Administrateur')}</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-colors"
                  >
                    {t('common.cancel', 'Annuler')}
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-brand-green hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-[0_4px_14px_0_rgba(0,132,61,0.39)] hover:shadow-[0_6px_20px_rgba(0,132,61,0.23)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? t('common.creating', 'Création...') : t('superadmin.create_user_btn', 'Créer l\'utilisateur')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {resetFlowState.step > 0 && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-t-4 border-red-600"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-bl-full pointer-events-none"></div>
              <button 
                onClick={() => setResetFlowState({ step: 0, passwordAttempt: '', otp: '', loading: false })}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="flex items-center space-x-3 mb-6 relative z-10">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                  <ShieldAlert size={28} />
                </div>
                <h3 className="text-2xl font-extrabold text-brand-dark">{t('superadmin.security_validation')}</h3>
              </div>

              {resetFlowState.step === 1 ? (
                <div className="space-y-4 relative z-10">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t('superadmin.reset_warning_text', "Vous êtes sur le point d'effacer toutes les données de la plateforme. Pour confirmer votre identité, veuillez saisir votre mot de passe ci-dessous.")}
                  </p>
                  <input 
                    type="password" 
                    value={resetFlowState.passwordAttempt}
                    onChange={(e) => setResetFlowState({...resetFlowState, passwordAttempt: e.target.value})}
                    placeholder={t('superadmin.password_placeholder_alt', 'Votre mot de passe...')}
                    className="w-full border-2 border-red-200 focus:border-red-500 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-red-500/20 bg-red-50/30 text-center outline-none transition-all"
                  />
                  <button 
                    disabled={!resetFlowState.passwordAttempt || resetFlowState.loading}
                    onClick={async () => {
                       setResetFlowState({...resetFlowState, loading: true});
                       try {
                         const res = await systemService.requestResetOtp(resetFlowState.passwordAttempt);
                         setResetFlowState({
                           ...resetFlowState, 
                           step: 2, 
                           loading: false,
                           devOtp: res.otpFallback // Correct access
                         });
                         
                         if (res.emailSent === false) {
                           showSaToast(t('superadmin.email_failed_fallback', "Email non envoyé, code de secours généré."));
                         }
                       } catch (err: any) {
                         alert(err.response?.data?.message || t('superadmin.otp_send_error'));
                         setResetFlowState({...resetFlowState, loading: false});
                       }
                    }}
                    className="w-full flex justify-center items-center py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    {resetFlowState.loading ? <Loader2 size={20} className="animate-spin" /> : t('superadmin.verify_and_send_otp')}
                  </button>
                </div>
              ) : resetFlowState.step === 2 ? (
                <div className="space-y-4 relative z-10">
                  <p className="text-sm text-gray-600 leading-relaxed text-center">
                    {t('superadmin.reset_otp_instruction', { email: currentUser?.email })}
                  </p>
                  <div className="flex justify-center my-6 flex-col items-center gap-4">
                    {resetFlowState.devOtp && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-brand-yellow/20 border border-brand-yellow p-3 rounded-2xl text-center shadow-[0_0_20px_rgba(255,209,0,0.2)]"
                      >
                        <p className="text-[10px] font-black text-yellow-700 uppercase tracking-widest mb-1">{t('superadmin.dev_rescue_code', 'Code de secours (Dev Mode)')}</p>
                        <p className="text-2xl font-black text-brand-dark tracking-[0.3em] font-mono">{resetFlowState.devOtp}</p>
                      </motion.div>
                    )}
                    <div className="relative w-48">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input 
                        type="text" 
                        maxLength={6}
                        value={resetFlowState.otp}
                        onChange={(e) => setResetFlowState({...resetFlowState, otp: e.target.value.replace(/\D/g, '')})}
                        placeholder={t('superadmin.otp_placeholder')} 
                        className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-2xl tracking-[0.5em] text-center focus:ring-4 focus:ring-red-500/20 focus:border-red-500 bg-gray-50/50 outline-none font-bold text-brand-dark"
                      />
                    </div>
                  </div>
                  <button 
                    disabled={resetFlowState.otp.length !== 6 || resetFlowState.loading}
                    onClick={async () => {
                       setResetFlowState({...resetFlowState, loading: true});
                       try {
                         await systemService.resetPlatform(resetFlowState.otp);
                         setResetFlowState({...resetFlowState, step: 3, loading: false});
                       } catch (err: any) {
                         alert(err.response?.data?.message || t('admin.generic_error'));
                         setResetFlowState({...resetFlowState, loading: false});
                       }
                    }}
                    className="w-full flex justify-center items-center py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetFlowState.loading ? <Loader2 size={20} className="animate-spin" /> : t('superadmin.confirm_reset')}
                  </button>
                  <button onClick={() => setResetFlowState({ step: 0, passwordAttempt: '', otp: '', loading: false })} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 font-bold transition-colors">{t('common.cancel')}</button>
                </div>
              ) : resetFlowState.step === 3 ? (
                <div className="text-center space-y-6 relative z-10 py-4">
                  <div className="flex justify-center">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10, stiffness: 100 }}
                      className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle size={48} />
                    </motion.div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-brand-dark">{t('superadmin.platform_reset_title')}</h4>
                    <p className="text-sm text-gray-600">
                      {t('superadmin.platform_reset_desc')}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      authService.logout();
                      window.location.href = '/login';
                    }}
                    className="w-full py-4 bg-brand-dark text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-2"
                  >
                    <span>{t('superadmin.leave_platform')}</span>
                    <LogOut size={18} />
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md"
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden border border-gray-100"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-full -z-10"></div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-4 rounded-2xl ${
                  confirmConfig.type === 'danger' ? 'bg-red-50 text-red-500' : 
                  confirmConfig.type === 'warning' ? 'bg-amber-50 text-amber-500' : 
                  'bg-blue-50 text-blue-500'
                }`}>
                  <AlertTriangle size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-brand-dark tracking-tight">{confirmConfig.title}</h3>
                  <div className={`h-1 w-12 rounded-full mt-1 ${
                    confirmConfig.type === 'danger' ? 'bg-red-500' : 
                    confirmConfig.type === 'warning' ? 'bg-amber-500' : 
                    'bg-blue-500'
                  }`}></div>
                </div>
              </div>

              <p className="text-gray-600 font-medium leading-relaxed mb-8">
                {confirmConfig.message}
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
                >
                  {t('common.cancel', 'Annuler')}
                </button>
                <button
                  onClick={confirmConfig.onConfirm}
                  className={`flex-1 px-6 py-4 rounded-2xl font-black text-white shadow-lg transition-all active:scale-95 uppercase tracking-widest text-xs ${
                    confirmConfig.type === 'danger' ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' : 
                    confirmConfig.type === 'warning' ? 'bg-amber-500 shadow-amber-500/20 hover:bg-amber-600' : 
                    'bg-blue-500 shadow-blue-500/20 hover:bg-blue-600'
                  }`}
                >
                  {confirmConfig.confirmText || t('common.confirm', 'Confirmer')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[150] p-4 font-inter">
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
                {t('common.logout_confirm_desc_sa', "Êtes-vous sûr de vouloir quitter votre session Super Admin ?")}
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
      
      {/* Broadcast View Modal */}
      <AnimatePresence>
        {selectedBroadcast && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBroadcast(null)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md"
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-white/20"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              {/* Header */}
              <div className="p-8 pb-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    selectedBroadcast.targetRole === 'ADMIN' ? 'bg-purple-100 text-purple-600 shadow-purple-500/10' :
                    selectedBroadcast.targetRole === 'USER' ? 'bg-blue-100 text-blue-600 shadow-blue-500/10' :
                    'bg-brand-yellow/20 text-yellow-600 shadow-yellow-500/10'
                  }`}>
                    {selectedBroadcast.targetRole === 'ADMIN' ? <Users size={28} /> :
                     selectedBroadcast.targetRole === 'USER' ? <Mail size={28} /> :
                     <Globe size={28} />}
                  </div>
                  <div>
                    <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-1.5 ${
                      selectedBroadcast.targetRole === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                      selectedBroadcast.targetRole === 'USER' ? 'bg-blue-50 text-blue-700' :
                      'bg-brand-yellow/10 text-yellow-700'
                    }`}>
                      {selectedBroadcast.targetRole === 'ALL' ? t('superadmin.target_all', 'Tous') : selectedBroadcast.targetRole}
                    </div>
                    <h3 className="text-2xl font-black text-brand-dark tracking-tight leading-none group-hover:text-brand-green transition-colors">
                      {selectedBroadcast.subject}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBroadcast(null)}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content Container */}
              <div className="p-8 pt-4 overflow-y-auto flex-1 custom-scrollbar">
                <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 min-h-[150px]">
                  <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap text-lg">
                    {selectedBroadcast.content}
                  </p>
                </div>
                
                <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-dark flex items-center justify-center text-white shrink-0 shadow-lg">
                      <Calendar size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{t('superadmin.timestamp', 'Horodatage')}</p>
                      <p className="text-sm font-bold text-brand-dark">
                        {new Date(selectedBroadcast.createdAt).toLocaleString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', { 
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand-green/20">
                      <Megaphone size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">{t('superadmin.target', 'Cible')}</p>
                      <p className="text-sm font-bold text-brand-dark">
                        {selectedBroadcast.targetRole === 'ALL' ? t('superadmin.target_all', 'Tous') : selectedBroadcast.targetRole}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-8 bg-gray-50/30 border-t border-gray-100">
                <button
                  onClick={() => setSelectedBroadcast(null)}
                  className="w-full py-4 bg-brand-dark hover:bg-gray-800 text-white font-black rounded-2xl shadow-xl transition-all uppercase text-sm tracking-widest active:scale-[0.98]"
                >
                  {t('common.close', 'Fermer')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
};

const MarketPriceComparison = ({ t, isLoadingMarketPrices, onRefresh, i18n }: any) => {
  const [selectedMarket, setSelectedMarket] = useState<any>(null);

  // Use real Senegalese market data instead of platform products
  const marketsWithProducts = senegalMarketData.map((market) => {
    return {
      ...market,
      displayName: t(`admin.market_${market.id}`, i18n.language === 'fr' ? market.name : market.nameEn),
      productCount: market.products.length
    };
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">
            {t("admin.market_prices_title", "Marchés Sénégal - Produits Agricoles")}
          </h2>
          <p className="font-bold uppercase tracking-widest text-xs text-gray-500">
            {t("admin.market_prices_subtitle", "Produits disponibles par marché")}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-white border border-gray-200 hover:bg-gray-50 text-brand-dark shadow-sm"
        >
          <Activity size={18} />
          {t("common.refresh", "Actualiser")}
        </button>
      </div>

      {isLoadingMarketPrices ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin mb-4" />
          <p className="font-black text-xs uppercase tracking-widest text-gray-500">
            {t("common.loading", "Chargement...")}
          </p>
        </div>
      ) : marketsWithProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6">
            <TrendingUp size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-black mb-2 text-brand-dark">
            {t("admin.no_market_data", "Aucune donnée de marché")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("admin.no_market_data_desc", "Commencez par ajouter des prix de marché pour vos produits.")}
          </p>
        </div>
      ) : (
        <>
          {/* Horizontal Market Cards */}
          {!selectedMarket && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {marketsWithProducts.map((market) => (
                <div
                  key={market.id}
                  onClick={() => setSelectedMarket(market)}
                  className="rounded-2xl border p-6 cursor-pointer transition-all hover:scale-105 bg-white border-gray-200 hover:border-brand-green/50 shadow-sm hover:shadow-md"
                >
                  <h3 className="text-lg font-black tracking-tight mb-2 text-brand-dark">
                    {market.displayName}
                  </h3>
                  <div className="px-3 py-1.5 rounded-lg bg-brand-green/5 border border-brand-green/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-green">
                      {market.productCount} {t("admin.products_count", "produits")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Selected Market Details */}
          {selectedMarket && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedMarket(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all bg-white border border-gray-200 hover:bg-gray-50 text-brand-dark"
              >
                <X size={16} />
                {t("admin.back_to_markets", "Retour aux marchés")}
              </button>

              <div className="rounded-[2.5rem] border overflow-hidden bg-white border-gray-100 shadow-sm">
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight text-brand-dark">
                        {selectedMarket.displayName}
                      </h3>
                      <p className="text-xs font-black uppercase tracking-widest mt-1 text-gray-500">
                        {selectedMarket.productCount} {t("admin.products_count", "produits")}
                      </p>
                    </div>
                    <div className="px-4 py-2 rounded-xl bg-brand-green/5 border border-brand-green/10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-green">
                        {t("admin.available_products", "Produits disponibles")}
                      </p>
                      <p className="text-lg font-black text-brand-dark">
                        {selectedMarket.productCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          {t("admin.product", "Produit")}
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right text-gray-500">
                          {t("admin.price", "Prix")}
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center text-gray-500">
                          {t("admin.last_updated", "Dernière mise à jour")}
                        </th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center text-gray-500">
                          {t("admin.status", "Statut")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedMarket.products.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-black text-brand-dark">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-black">{i18n.language === 'fr' ? item.name : item.nameEn}</div>
                                <div className="text-[10px] uppercase tracking-widest text-gray-500">
                                  {t("admin.unit", "Unité")}: {item.unit}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-black text-right text-brand-dark">
                            {item.price.toLocaleString()} FCFA
                          </td>
                          <td className="px-6 py-4 text-xs text-center text-gray-500">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-green/5 text-brand-green border border-brand-green/10">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                              {t("admin.available", "Disponible")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
