import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  PackageOpen,
  Activity,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  TrendingUp,
  AlertTriangle,
  Download,
  MessageSquare,
  Inbox,
  Trash2,
  Send,
  Globe,
  Package,
  UserPlus,
  MessageCircle,
  ShieldCheck,
  Lock,
  Smartphone,
  MapPin,
  PackagePlus,
  Hash,
  CreditCard,
  Target,
  Sprout,
  ShoppingCart,
  User,
  Mail,
  Menu,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  QrCode,
  Sun,
  Moon,
  Truck
} from "lucide-react";
import {
  authService,
  actorsService,
  activitiesService,
  productsService,
  messagesService,
  usersService,
  systemService,
} from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-hot-toast";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { DeleteConfirmModal } from "../components/admin/modals/ConfirmationModals";
import TwoFactorModal from "../components/admin/modals/TwoFactorModal";
import RotationConfirmModal from "../components/admin/modals/RotationConfirmModal";
import BroadcastModal from "../components/admin/modals/BroadcastModal";
import QRCodeModal from "../components/admin/modals/QRCodeModal";
import SparklineChart from "../components/admin/charts/SparklineChart";

interface Message {
  _id: string;
  sender: string;
  receiverId?: string;
  subject: string;
  content: string;
  status: "UNREAD" | "READ";
  createdAt: string;
  type?: "BROADCAST" | "DIRECT";
  senderId?: string;
}

interface Actor {
  _id: string;
  name: string;
  type: string;
  location: string;
  contact: string;
}

const AdminDashboard = () => {

  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const setActiveTab = useCallback(
    (tab: string) => {
      setSearchParams((prev) => {
        prev.set("tab", tab);
        return prev;
      });
    },
    [setSearchParams],
  );

  // --- Dashboard Logic & State ---

  const [searchQuery, setSearchQuery] = useState("");
  const [actors, setActors] = useState<Actor[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("admin_settings");
      return saved
        ? JSON.parse(saved)
        : {
          darkMode: false,
          language: i18n.language || "fr",
          reduceAnimations: false,
          soundAlerts: true,
          offlineMode: false,
          density: "Standard",
          syncFreq: "Auto",
        };
    } catch (e) {
      console.error("Error loading admin settings:", e);
      return {
        darkMode: false,
        language: i18n.language || "fr",
        reduceAnimations: false,
        soundAlerts: true,
        offlineMode: false,
        density: "Standard",
        syncFreq: "Auto",
      };
    }
  });

  useEffect(() => {
    if (settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  useEffect(() => {
    localStorage.setItem("admin_settings", JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);



  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [products, setProducts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allInboxMessages, setAllInboxMessages] = useState<Message[]>([]);
  const [messageFolder, setMessageFolder] = useState<
    "INBOX" | "SENT" | "TRASH" | "BROADCASTS"
  >("INBOX");
  const [chartFilter, setChartFilter] = useState<"Month" | "Week" | "Year">("Year");

  const [showNewLotModal, setShowNewLotModal] = useState(false);
  const [lotForm, setLotForm] = useState({
    ref: "",
    product: "",
    category: "AGRICULTURAL",
    volume: "",
    unit: "T",
    quality: "Standard",
    actorId: "",
  });
  const [showNewActorModal, setShowNewActorModal] = useState(false);
  const [actorForm, setActorForm] = useState({
    name: "",
    type: "SUPPLIER",
    location: "",
    contactEmail: "",
  });
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "AGRICULTURAL",
    unit: "kg",
    stockQuantity: "0",
    imageUrl: "",
    description: "",
    lowStockThreshold: "500",
    translations: { en: { name: "", description: "" }, fr: { name: "", description: "" } },
  });
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState<"CONFIRM" | "SETUP">(
    "CONFIRM",
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<{
    qrCodeUrl: string;
    secret: string;
  } | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(
    authService.getCurrentUser(),
  );

  const [showActorProfileModal, setShowActorProfileModal] = useState(false);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [isEditingActor, setIsEditingActor] = useState(false);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'file'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Messaging Extension
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showViewMessageModal, setShowViewMessageModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [qrCodeTarget, setQrCodeTarget] = useState({ data: "", title: "" });
  const [stockHistoryData, setStockHistoryData] = useState<Record<string, any[]>>({});

  // Market Price State
  const [marketPriceData, setMarketPriceData] = useState<any[]>([]);
  const [isLoadingMarketPrices, setIsLoadingMarketPrices] = useState(false);

  const [revenueGoal] = useState<number>(() => parseInt(localStorage.getItem('makhamaat_revenue_goal') || '250', 10));

  const fetchMarketPriceData = useCallback(async () => {
    setIsLoadingMarketPrices(true);
    try {
      const data = await productsService.getMarketPriceComparison();
      setMarketPriceData(data);
    } catch (error) {
      console.error("Failed to fetch market price data", error);
      showToast(t("admin.error_market_prices", "Erreur lors du chargement des prix de marché."));
    } finally {
      setIsLoadingMarketPrices(false);
    }
  }, [showToast, t]);

  const [projectionsData] = useState(() => {
    try {
      const saved = localStorage.getItem('makhamaat_projections');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading projections:", e);
    }
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





  const fetchStockHistories = useCallback(async (productList: any[]) => {
    try {
      const histories: Record<string, any[]> = {};
      await Promise.all(productList.map(async (p) => {
        const history = await productsService.getProductHistory(p._id);
        histories[p._id] = history.slice(-30);
      }));
      setStockHistoryData(histories);
    } catch (error) {
      console.error("Error fetching stock histories:", error);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [actorsData, productsData, activitiesData, badgeMessages] = await Promise.all([
        actorsService.getActors(),
        productsService.getProducts(i18n.language),
        activitiesService.getActivities(),
        messagesService.getAdminInbox(),
      ]);
      setActors(actorsData);
      setProducts(productsData);
      setActivities(activitiesData);
      setAllInboxMessages(badgeMessages);
      setLastSync(new Date());
    } catch (error) {
      showToast(t("common.error_data", "Erreur réseau."));
    }
  }, [t, showToast, i18n.language]);

  useEffect(() => {
    if (products.length > 0) {
      fetchStockHistories(products);
    }
  }, [products, fetchStockHistories]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await activitiesService.updateActivity(orderId, { status: newStatus });
      setActivities(prev => prev.map(a => a._id === orderId ? { ...a, status: newStatus } : a));
      await fetchDashboardData();
      showToast(t("admin.status_updated", "Statut mis à jour"));
    } catch (error) {
      toast.error(t("admin.error_update_status", "Échec de la mise à jour"));
    }
  };

  const handleAddActor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await actorsService.createActor(actorForm);
      showToast(t("admin.actor_created", "Partenaire ajouté avec succès !"));
      setShowNewActorModal(false);
      setActorForm({ name: "", type: "SUPPLIER", location: "", contactEmail: "" });
      fetchDashboardData();
    } catch (error) {
      showToast(t("admin.error_create_actor", "Erreur lors de la création."));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      showToast(t("common.error_file_too_large", "Le fichier est trop volumineux (Max 20MB)."));
      return;
    }

    setIsUploading(true);
    try {
      const data = await productsService.uploadProductImage(file);
      setProductForm(prev => ({ ...prev, imageUrl: data.url }));
      showToast(t("common.upload_success", "Image téléchargée avec succès."));
    } catch (error) {
      showToast(t("common.upload_error", "Erreur lors du téléchargement."));
    } finally {
      setIsUploading(false);
    }
  };


  const fetchMessages = useCallback(async (folder: string) => {
    try {
      let data;
      if (folder === "BROADCASTS") {
        data = await messagesService.getAdminInbox();
        data = data.filter((m: any) => m.type === "BROADCAST");
      } else {
        data = await messagesService.getMessages(folder);
      }
      setMessages(data);
    } catch (error) {
      showToast(t("admin.error_messages", "Erreur messages."));
    }
  }, [t, showToast]);

  const handleViewMessage = useCallback(async (msg: Message) => {
    setSelectedMessage(msg);
    setShowViewMessageModal(true);
    setReplyContent("");

    if (msg.status === "UNREAD") {
      try {
        await messagesService.updateMessageStatus(msg._id, { status: "READ" });
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: "READ" } : m));
        setAllInboxMessages(prev => prev.map(m => m._id === msg._id ? { ...m, status: "READ" } : m));
      } catch (error) {
        console.error("Failed to mark message as read", error);
      }
    }
  }, []);

  const handleSendReply = useCallback(async () => {
    if (!selectedMessage || !replyContent.trim()) return;

    try {
      // Extract email from sender format "Name (email@example.com)" or use sender directly
      const emailMatch = selectedMessage.sender.match(/\(([^)]+)\)/);
      const receiverEmail = emailMatch ? emailMatch[1] : selectedMessage.sender;

      await messagesService.sendMessage({
        receiverId: selectedMessage.senderId || undefined,
        receiverEmail: receiverEmail,
        subject: `RE: ${selectedMessage.subject}`,
        content: replyContent,
        type: "DIRECT"
      });
      showToast(t("admin.reply_success", "Réponse transmise !"));
      setShowViewMessageModal(false);
      setReplyContent("");
    } catch (error) {
      showToast(t("admin.reply_error", "Erreur lors de l'envoi."));
    }
  }, [selectedMessage, replyContent, t, showToast]);


  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    if (activeTab === "messages") fetchMessages(messageFolder);
  }, [activeTab, messageFolder, fetchMessages]);

  useEffect(() => {
    if (activeTab === "market-prices") fetchMarketPriceData();
  }, [activeTab, fetchMarketPriceData]);

  const handleLogout = useCallback(() => {
    authService.logout();
    window.location.href = "/login";
  }, []);

  const openProfile = useCallback((actor: Actor) => {
    setSelectedActor(actor);
    setIsEditingActor(false);
    setShowActorProfileModal(true);
  }, []);

  const openContact = useCallback((actor: Actor) => {
    setActiveTab("messages");
    setMessageFolder("SENT"); // Optional: logic to start a new message could go here
    showToast(`${t("common.contacting")} ${actor.name}...`);
  }, [setActiveTab, showToast, t]);

  const handleUpdateActor = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActor) return;
    try {
      await actorsService.updateActor(selectedActor._id, actorForm);
      showToast(t("admin.actor_updated", "Partenaire mis à jour !"));
      setShowActorProfileModal(false);
      setIsEditingActor(false);
      fetchDashboardData();
    } catch (error) {
      showToast(t("admin.error_update_actor", "Erreur lors de la mise à jour."));
    }
  }, [selectedActor, actorForm, fetchDashboardData, showToast, t]);

  const handleDeleteActor = useCallback(async (actorId: string) => {
    if (!window.confirm(t("admin.confirm_delete_actor", "Confirmer la suppression ?"))) return;
    try {
      await actorsService.deleteActor(actorId);
      showToast(t("admin.actor_deleted", "Partenaire supprimé."));
      setShowActorProfileModal(false);
      fetchDashboardData();
    } catch (error) {
      showToast(t("admin.error_delete_actor", "Erreur lors de la suppression."));
    }
  }, [fetchDashboardData, showToast, t]);

  
  const handleRecordLot = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = await productsService.createProduct({
        name: lotForm.product,
        category: lotForm.category,
        price: 0,
        stockQuantity: 0,
        description: `Ref: ${lotForm.ref}`,
      });
      const qty = parseFloat(lotForm.volume) * (lotForm.unit === "T" ? 1000 : 1);
      await activitiesService.createActivity({
        type: "PURCHASE",
        status: "COMPLETED",
        productId: product._id,
        quantity: qty,
        notes: `Lot ${lotForm.ref}`,
      });
      showToast(t("admin.lot_reception_success"));
      setShowNewLotModal(false);
      fetchDashboardData();
    } catch (err) { showToast(t("admin.generic_error")); }
  }, [lotForm, fetchDashboardData, showToast, t]);




  const handleEditProduct = useCallback((product: any) => {
    setSelectedProductId(product._id);
    setProductForm({
      name: product.name || "",
      price: product.price?.toString() || "",
      category: product.category || "AGRICULTURAL",
      unit: product.unit || "kg",
      stockQuantity: product.stockQuantity?.toString() || "0",
      imageUrl: product.imageUrl || "",
      description: product.description || "",
      lowStockThreshold: (product.lowStockThreshold || 500).toString(),
      translations: {
        en: { name: product.translations?.en?.name || "", description: product.translations?.en?.description || "" },
        fr: { name: product.translations?.fr?.name || "", description: product.translations?.fr?.description || "" },
      },
    });
    setIsEditingProduct(true);
    setShowNewProductModal(true);
  }, []);

  const handleDeleteProduct = useCallback((product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!productToDelete) return;
    try {
      await productsService.deleteProduct(productToDelete._id);
      showToast(t("admin.product_deleted", "Produit supprimé."));
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchDashboardData();
    } catch {
      showToast(t("admin.delete_product_error"));
    }
  }, [productToDelete, fetchDashboardData, showToast, t]);

  const handleSaveProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productForm.name.trim()) {
      showToast(t("admin.error_prod_name", "Product name is required."));
      return;
    }
    if (!productForm.description.trim()) {
      showToast(t("admin.error_prod_desc", "Product description is required."));
      return;
    }
    if (Number(productForm.price) < 0 || productForm.price === "") {
      showToast(t("admin.error_prod_price", "Product price is invalid."));
      return;
    }
    if (Number(productForm.stockQuantity) < 0 || productForm.stockQuantity === "") {
      showToast(t("admin.error_prod_stock", "Initial stock is invalid."));
      return;
    }

    try {
      const pData = {
        ...productForm,
        price: Number(productForm.price),
        stockQuantity: Number(productForm.stockQuantity),
        lowStockThreshold: Number(productForm.lowStockThreshold),
      };

      if (isEditingProduct && selectedProductId) {
        await productsService.updateProduct(selectedProductId, pData);
        showToast(t("admin.product_updated", "Produit mis à jour."));
      } else {
        await productsService.createProduct(pData);
        showToast(t("admin.product_created_success", "Produit créé."));
      }

      setShowNewProductModal(false);
      setProductForm({
        name: "",
        price: "",
        category: "AGRICULTURAL",
        unit: "kg",
        stockQuantity: "0",
        imageUrl: "",
        description: "",
        lowStockThreshold: "500",
        translations: { en: { name: "", description: "" }, fr: { name: "", description: "" } },
      });
      setIsEditingProduct(false);
      setSelectedProductId(null);
      setImageSource('url');
      fetchDashboardData();
    } catch { showToast(t("admin.generic_error")); }
  }, [productForm, isEditingProduct, selectedProductId, fetchDashboardData, showToast, t]);

  const handleUpdate2FAState = useCallback((enabled: boolean) => {
    const updated = { ...currentUser, isTwoFactorEnabled: enabled };
    setCurrentUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  }, [currentUser]);

  const handleToggle2FA = async () => {
    try {
      if (currentUser?.isTwoFactorEnabled) {
        await usersService.disable2FA();
        handleUpdate2FAState(false);
        setShow2FAModal(false);
        showToast(t("admin.2fa_disabled"));
      } else if (twoFactorStep === "CONFIRM") {
        const res = await usersService.generate2FA();
        setQrCodeData({ qrCodeUrl: res.qrCodeDataUrl, secret: res.secret });
        setTwoFactorStep("SETUP");
      }
    } catch { showToast(t("admin.generic_error")); }
  };

  const handleConfirm2FAActivation = async () => {
    if (!qrCodeData || verificationToken.length !== 6) return;
    try {
      const res = await usersService.confirm2FA(verificationToken);
      if (res.success) {
        handleUpdate2FAState(true);
        setShow2FAModal(false);
        setTwoFactorStep("CONFIRM");
        showToast(t("admin.2fa_enabled"));
      } else { showToast(t("admin.invalid_2fa_code")); }
    } catch { showToast(t("admin.generic_error")); }
  };

  const handleRotateMasterKeys = async () => {
    setIsRotating(true);
    try {
      const res = await systemService.rotateMasterKeys();
      showToast(res.message);
      setShowRotationModal(false);

      // Give the user 2 seconds to see the toast before logout
      setTimeout(() => {
        authService.logout();
      }, 2000);
    } catch (err) {
      showToast(t("admin.rotation_error"));
    } finally {
      setIsRotating(false);
    }
  };



  const handleSendBroadcast = async (payload: any) => {
    setIsBroadcasting(true);
    try {
      await messagesService.sendBroadcast(payload);
      toast.success(t("admin.admin_broadcast_success"));
      setShowBroadcastModal(false);
      // Refresh messages if needed
      const msgs = await messagesService.getAdminInbox();
      setMessages(msgs);
    } catch (err) {
      toast.error(t("admin.admin_broadcast_error"));
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = [
      t("admin.pdf_col_ref"),
      t("admin.pdf_col_product"),
      t("admin.pdf_col_category"),
      t("admin.pdf_col_volume"),
      t("admin.pdf_col_status"),
      t("admin.pdf_col_date"),
    ];
    const tableRows = filteredStocks.map(s => [s.ref, s.product, s.category, s.volume, s.status, s.date]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.text(t("admin.pdf_inventory_title"), 14, 15);
    doc.save(t("admin.pdf_inventory_filename"));
    showToast(t("admin.pdf_success"));
  };

  const stocks = useMemo(() => {
    return products.map(p => {
      const vol = p.stockQuantity;
      const threshold = p.lowStockThreshold || 500;
      const isLow = vol <= threshold;
      const isCritical = vol <= (threshold * 0.2); // Critical at 20% of threshold

      return {
        id: p._id,
        ref: `#LOT-${p._id.slice(-4).toUpperCase()}`,
        product: p.name,
        category: p.category,
        volume: `${vol >= 1000 ? (vol / 1000).toFixed(1) + " T" : vol + " kg"}`,
        status: isCritical ? t("admin.status_critical") : isLow ? t("admin.status_low") : t("admin.status_optimal_label"),
        statusColor: isCritical ? "red" : isLow ? "yellow" : "emerald",
        date: new Date(p.updatedAt).toLocaleDateString(),
        originalProduct: p,
      };
    });
  }, [products, t, i18n.language]);


  const filteredStocks = useMemo(() => {
    return stocks.filter(s => searchQuery === "" || s.product.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [stocks, searchQuery]);

  const stats = useMemo(() => {
    const totalVolumeT = (products.reduce((acc, p) => acc + p.stockQuantity, 0) / 1000).toFixed(1);

    const totalRevenue = activities.reduce((acc, act) => {
      if (act.type === 'SALE' || act.type === 'EXPORT') {
        const product = products.find(p => p._id === (act.productId?._id || act.productId));
        const price = act.price || product?.price || 0;
        return acc + (act.quantity * price);
      }
      return acc;
    }, 0);

    const activeSuppliers = actors.filter(a => a.type === "SUPPLIER").length;
    const activeClients = actors.filter(a => a.type === "CLIENT" || a.type === "PARTNER").length;

    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(now.getDate() - 30);
    const previousPeriodStart = new Date(now);
    previousPeriodStart.setDate(now.getDate() - 60);

    const currentPeriodActivities = activities.filter(a => new Date(a.createdAt) >= currentPeriodStart);
    const previousPeriodActivities = activities.filter(a => {
      const d = new Date(a.createdAt);
      return d >= previousPeriodStart && d < currentPeriodStart;
    });

    const getRevenue = (acts: any[]) => acts.reduce((acc, act) => {
      if (act.type === 'SALE' || act.type === 'EXPORT') {
        const product = products.find(p => p._id === (act.productId?._id || act.productId));
        const price = act.price || product?.price || 0;
        return acc + (act.quantity * price);
      }
      return acc;
    }, 0);

    const currentRevenue = getRevenue(currentPeriodActivities);
    const previousRevenue = getRevenue(previousPeriodActivities);
    const revenueVariation = previousRevenue === 0 ? (currentRevenue > 0 ? '+100%' : '0%') : `${currentRevenue > previousRevenue ? '+' : ''}${(((currentRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1)}%`;

    const getStockFlow = (acts: any[]) => acts.reduce((acc, act) => {
      if (act.type === 'PURCHASE') return acc + act.quantity;
      if (act.type === 'SALE' || act.type === 'EXPORT') return acc - act.quantity;
      return acc;
    }, 0);

    const currentFlow = getStockFlow(currentPeriodActivities);
    const previousFlow = getStockFlow(previousPeriodActivities);
    const stockVariation = previousFlow === 0 ? (currentFlow > 0 ? '+100%' : '0%') : `${currentFlow > previousFlow ? '+' : ''}${(((currentFlow - previousFlow) / Math.abs(previousFlow)) * 100).toFixed(1)}%`;

    const currentActiveSkus = new Set(currentPeriodActivities.map(a => a.productId?._id || a.productId)).size;
    const previousActiveSkus = new Set(previousPeriodActivities.map(a => a.productId?._id || a.productId)).size;
    const skuVariation = previousActiveSkus === 0 ? (currentActiveSkus > 0 ? '+100%' : '0%') : `${currentActiveSkus > previousActiveSkus ? '+' : ''}${(((currentActiveSkus - previousActiveSkus) / previousActiveSkus) * 100).toFixed(1)}%`;

    const mvtVariation = previousPeriodActivities.length === 0 ? (currentPeriodActivities.length > 0 ? '+100%' : '0%') : `${currentPeriodActivities.length > previousPeriodActivities.length ? '+' : ''}${(((currentPeriodActivities.length - previousPeriodActivities.length) / previousPeriodActivities.length) * 100).toFixed(1)}%`;

    return {
      totalVolumeT,
      totalRevenue: totalRevenue.toLocaleString(),
      rawTotalRevenue: totalRevenue,
      lowStockCount: stocks.filter(s => s.statusColor !== "emerald").length,
      activeSuppliers,
      activeClients,
      transactionCount: activities.length,
      revenueVariation,
      stockVariation,
      skuVariation,
      mvtVariation
    };
  }, [products, stocks, actors, activities]);

  const chartData = useMemo(() => {
    const today = new Date();

    if (chartFilter === "Year") {
      const months = [
        t("admin.jan", "Jan"), t("admin.feb", "Feb"), t("admin.mar", "Mar"),
        t("admin.apr", "Apr"), t("admin.may", "May"), t("admin.jun", "Jun"),
        t("admin.jul", "Jul"), t("admin.aug", "Aug"), t("admin.sep", "Sep"),
        t("admin.oct", "Oct"), t("admin.nov", "Nov"), t("admin.dec", "Dec")
      ];
      const currentYear = today.getFullYear();
      return months.map((month, index) => {
        const monthlyRevenue = activities.reduce((acc, act) => {
          const date = new Date(act.createdAt);
          if (date.getMonth() === index && date.getFullYear() === currentYear) {
            if (act.type === 'SALE' || act.type === 'EXPORT') {
              const product = products.find(p => p._id === (act.productId?._id || act.productId));
              const price = act.price || product?.price || 0;
              return acc + (act.quantity * price);
            }
          }
          return acc;
        }, 0);
        return { name: month, revenue: monthlyRevenue };
      });
    }

    if (chartFilter === "Month") {
      // Last 30 days
      const days = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (29 - i));
        return d;
      });
      return days.map(day => {
        const dailyRevenue = activities.reduce((acc, act) => {
          const actDate = new Date(act.createdAt);
          if (actDate.toDateString() === day.toDateString()) {
            if (act.type === 'SALE' || act.type === 'EXPORT') {
              const product = products.find(p => p._id === (act.productId?._id || act.productId));
              const price = act.price || product?.price || 0;
              return acc + (act.quantity * price);
            }
          }
          return acc;
        }, 0);
        return { name: day.getDate().toString(), revenue: dailyRevenue };
      });
    }

    if (chartFilter === "Week") {
      // Last 7 days
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return d;
      });
      const weekdays = [
        t("admin.sun", "Sun"), t("admin.mon", "Mon"), t("admin.tue", "Tue"),
        t("admin.wed", "Wed"), t("admin.thu", "Thu"), t("admin.fri", "Fri"),
        t("admin.sat", "Sat")
      ];
      return days.map(day => {
        const dailyRevenue = activities.reduce((acc, act) => {
          const actDate = new Date(act.createdAt);
          if (actDate.toDateString() === day.toDateString()) {
            if (act.type === 'SALE' || act.type === 'EXPORT') {
              const product = products.find(p => p._id === (act.productId?._id || act.productId));
              const price = act.price || product?.price || 0;
              return acc + (act.quantity * price);
            }
          }
          return acc;
        }, 0);
        return { name: weekdays[day.getDay()], revenue: dailyRevenue };
      });
    }

    return [];
  }, [activities, products, chartFilter]);

  const sparklines = useMemo(() => {
    return {
      revenue: Array.from({ length: 10 }, () => Math.floor(Math.random() * 500)),
      stock: Array.from({ length: 10 }, () => Math.floor(Math.random() * 500)),
      skus: Array.from({ length: 10 }, () => Math.floor(Math.random() * 500)),
      mvts: Array.from({ length: 10 }, () => Math.floor(Math.random() * 500)),
    };
  }, [activities.length, products.length]);


  return (
    <MotionConfig reducedMotion={settings.reduceAnimations ? "always" : "never"}>
      <div
        className={`min-h-screen transition-colors duration-700 font-sans antialiased overflow-x-hidden ${settings.darkMode
            ? "bg-[#050505] text-white"
            : "bg-gray-50 text-brand-dark"
          }`}
        style={{
          backgroundImage: settings.darkMode
            ? "radial-gradient(circle at 50% -20%, #00f5a015, transparent 60%)"
            : "none"
        }}
      >
        {/* MOBILE SIDEBAR OVERLAY */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[75] xl:hidden"
            />
          )}
        </AnimatePresence>

        {/* PREMIUM VERTICAL SIDEBAR */}
        <aside className={`fixed left-0 top-0 bottom-0 h-screen z-[80] flex flex-col transition-transform duration-500 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
          } w-72 h-screen shadow-2xl overflow-hidden border-r ${settings.darkMode
            ? "bg-[#050505] border-white/5 shadow-black/50"
            : "bg-white/90 backdrop-blur-2xl border-gray-100 shadow-xl shadow-black/5"
          }`}>
          {/* Sidebar Logo Area */}
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-emerald to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-emerald/20 flex-shrink-0">
                <PackageOpen size={24} className="text-white" />
              </div>
              <div className="overflow-hidden">
                <span className={`font-black text-2xl tracking-tighter uppercase block leading-none ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{t("admin.sidebar_admin_label")}</span>
                <span className="text-[9px] font-black text-brand-emerald uppercase tracking-[0.3em]">Makhamaat</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="xl:hidden ml-auto w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            {[
              { id: "dashboard", icon: Activity, label: t("common.dashboard") },
              { id: "movements", icon: TrendingUp, label: t("admin.movements") },
              { id: "orders", icon: Truck, label: t("admin.orders", "Orders") },
              { id: "stock", icon: Package, label: t("admin.stock_mgmt") },
              { id: "clients", icon: Users, label: t("admin.actors") },
              { id: "targets", icon: Target, label: t("admin.targets_nav", "Objectifs") },
              { id: "market-prices", icon: TrendingUp, label: t("admin.market_prices", "Marchés Sénégal") },
              {
                id: "messages",
                icon: MessageSquare,
                label: t("admin.messages"),
                badge: (() => {
                  const count = allInboxMessages.filter(m => m.status === "UNREAD").length;
                  return count > 99 ? "+99" : count;
                })()
              },
              { id: "settings", icon: Settings, label: t("common.settings") },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1280) setIsSidebarOpen(false);
                }}
                className={`w-full group relative flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-[11px] tracking-widest uppercase transition-all duration-300 ${activeTab === item.id
                    ? "bg-brand-emerald text-brand-dark shadow-xl shadow-brand-emerald/30 border border-brand-emerald/20"
                    : (settings.darkMode ? "text-white/60 hover:text-white hover:bg-white/5" : "text-gray-500 hover:text-brand-dark hover:bg-black/5")
                  }`}
              >
                <item.icon size={20} className={`transition-transform duration-300 ${activeTab === item.id ? "scale-110" : "group-hover:translate-x-1"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge !== undefined && (typeof item.badge === 'string' || item.badge > 0) && (
                  <span className={`flex h-5 w-5 items-center justify-center rounded-lg text-[9px] font-black shadow-sm ${activeTab === item.id ? "bg-brand-dark text-brand-emerald" : "bg-cyan-500 text-white"
                    }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className={`p-6 border-t transition-colors ${settings.darkMode ? "border-white/5 bg-white/[0.02]" : "border-white/5 bg-black/10"}`}>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest group ${settings.darkMode ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t("common.logout")}</span>
            </button>
          </div>
        </aside>

        {/* CLEAN TOP HEADER BAR */}
        <header className="fixed top-0 left-0 xl:left-72 right-0 h-24 z-[60] flex items-center justify-between px-8 bg-brand-darkEmerald/10 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="xl:hidden w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">{t("admin.last_protocol_sync")}</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                <span className={`text-xs font-black tracking-widest ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{(() => { const h = lastSync.getHours(); const m = lastSync.getMinutes().toString().padStart(2, '0'); const s = lastSync.getSeconds().toString().padStart(2, '0'); if (settings.language === 'fr') { return `${h.toString().padStart(2, '0')}:${m}:${s}`; } const period = h >= 12 ? t('common.pm') : t('common.am'); return `${h % 12 || 12}:${m}:${s} ${period}`; })()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${settings.darkMode
                  ? "bg-white/5 border-white/10 text-gray-400 hover:text-brand-emerald"
                  : "bg-white border-gray-200 text-gray-500 hover:text-brand-dark shadow-sm"
                }`}
            >
              {settings.darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className={`w-12 h-12 rounded-2xl border overflow-hidden flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${settings.darkMode
                    ? "bg-gradient-to-br from-gray-700 to-gray-900 border-white/10"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-200 shadow-sm"
                  }`}
              >
                <Users size={22} className={settings.darkMode ? "text-white/50" : "text-gray-400"} />
              </button>

              <AnimatePresence>
                {showProfileDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProfileDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 mt-4 w-80 rounded-[2.5rem] shadow-2xl border z-50 overflow-hidden ${settings.darkMode
                          ? "bg-gray-900/90 backdrop-blur-3xl border-white/10"
                          : "bg-white border-gray-100 shadow-black/5"
                        }`}
                    >
                      <div className="p-8 border-b border-white/5">
                        <div className="flex items-center gap-6 mb-6">
                          <div className="w-14 h-14 rounded-2xl bg-brand-emerald/20 flex items-center justify-center text-brand-emerald border border-brand-emerald/20 shadow-inner">
                            <User size={28} />
                          </div>
                          <div>
                            <p className={`font-black tracking-tight text-lg ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
                              {currentUser?.firstName} {currentUser?.lastName}
                            </p>
                            <div className="bg-brand-emerald/10 text-brand-emerald px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] inline-block mt-1">
                              {currentUser?.role}
                            </div>
                          </div>
                        </div>
                        <div className={`flex items-center gap-3 ${settings.darkMode ? "text-gray-500" : "text-gray-400"} text-[11px] font-bold tracking-tight`}>
                          <Mail size={14} className="text-brand-emerald" />
                          <span>{currentUser?.email}</span>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <button
                          onClick={() => {
                            setActiveTab("settings");
                            setShowProfileDropdown(false);
                          }}
                          className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all ${settings.darkMode ? "hover:bg-white/5 text-white/70 hover:text-white" : "hover:bg-gray-50 text-gray-600 hover:text-brand-dark"
                            }`}
                        >
                          <Settings size={20} />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">{t("common.settings")}</span>
                        </button>

                        <div className={`flex items-center justify-between px-6 py-5 rounded-2xl ${settings.darkMode ? "bg-white/5" : "bg-gray-50"
                          }`}>
                          <div className="flex items-center gap-4">
                            <ShieldCheck size={20} className="text-brand-emerald" />
                            <span className={`text-[11px] font-black uppercase tracking-widest ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("admin.security_2fa", "Sécurité 2FA")}</span>
                          </div>
                          <div className={`w-2.5 h-2.5 rounded-full ${currentUser?.isTwoFactorEnabled ? "bg-brand-emerald shadow-[0_0_10px_#00f5a0]" : "bg-red-500"} animate-pulse`} />
                        </div>
                      </div>

                      <div className="p-6 bg-black/10">
                        <button
                          onClick={() => {
                            setShowLogoutConfirm(true);
                            setShowProfileDropdown(false);
                          }}
                          className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl transition-all group font-black text-xs tracking-widest"
                        >
                          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                          <span>{t("common.logout", "DÉCONNEXION")}</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="pt-32 xl:pl-72 px-6 pb-24 max-w-[1700px] mx-auto min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {activeTab === "dashboard" && <AdminOverview t={t} stats={stats} products={products} activities={activities} settings={settings} lastSync={lastSync} chartData={chartData} sparklines={sparklines} onViewAll={() => setActiveTab("movements")} chartFilter={chartFilter} setChartFilter={setChartFilter} revenueGoal={revenueGoal} />}
              {activeTab === "movements" && <ActivityLog t={t} activities={activities} products={products} settings={settings} />}
              {activeTab === "orders" && <OrderManagement t={t} activities={activities} settings={settings} onUpdateStatus={handleUpdateOrderStatus} />}
              {activeTab === "stock" && <StockManagement
                t={t} filteredStocks={filteredStocks} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                setShowNewLotModal={setShowNewLotModal} setShowNewProductModal={setShowNewProductModal}
                handleExportPDF={handleExportPDF} settings={settings}
                handleEditProduct={handleEditProduct} handleDeleteProduct={handleDeleteProduct}
                stockHistoryData={stockHistoryData} setQrCodeTarget={setQrCodeTarget} setShowQRCodeModal={setShowQRCodeModal}
              />}
              {activeTab === "clients" && <ActorManagement t={t} actors={actors} openProfile={openProfile} openContact={openContact} settings={{ ...settings, onAddActor: () => setShowNewActorModal(true) }} />}
              {activeTab === "targets" && <StrategicTargets t={t} projectionsData={projectionsData} settings={settings} />}
              {activeTab === "market-prices" && <MarketPriceComparison t={t} i18n={i18n} marketPriceData={marketPriceData} isLoadingMarketPrices={isLoadingMarketPrices} settings={settings} onRefresh={fetchMarketPriceData} />}
              {activeTab === "messages" && <CommunicationCenter t={t} messages={messages} messageFolder={messageFolder} setMessageFolder={setMessageFolder} onViewMessage={handleViewMessage} setShowBroadcastModal={setShowBroadcastModal} />}
              {activeTab === "settings" && <SettingsPanel t={t} i18n={i18n} settings={settings} setSettings={setSettings} setShow2FAModal={setShow2FAModal} setTwoFactorStep={setTwoFactorStep} setShowRotationModal={setShowRotationModal} setShowLogoutConfirm={setShowLogoutConfirm} showToast={showToast} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* RE-IMPLEMENTED MODALS */}
        <DashboardModals
          t={t}
          settings={settings}
          showLogoutConfirm={showLogoutConfirm} setShowLogoutConfirm={setShowLogoutConfirm}
          show2FAModal={show2FAModal} setShow2FAModal={setShow2FAModal}
          handleLogout={handleLogout} handleToggle2FA={handleToggle2FA}
          currentUser={currentUser} toastMessage={toastMessage}
          showNewLotModal={showNewLotModal} setShowNewLotModal={setShowNewLotModal} lotForm={lotForm} setLotForm={setLotForm} handleRecordLot={handleRecordLot}
          showNewActorModal={showNewActorModal} setShowNewActorModal={setShowNewActorModal} actorForm={actorForm} setActorForm={setActorForm} handleAddActor={handleAddActor}
          showNewProductModal={showNewProductModal} setShowNewProductModal={setShowNewProductModal} productForm={productForm} setProductForm={setProductForm} handleSaveProduct={handleSaveProduct}
          isEditingProduct={isEditingProduct} setIsEditingProduct={setIsEditingProduct}
          twoFactorStep={twoFactorStep} setTwoFactorStep={setTwoFactorStep} qrCodeData={qrCodeData} verificationToken={verificationToken} setVerificationToken={setVerificationToken} handleConfirm2FAActivation={handleConfirm2FAActivation}
          showActorProfileModal={showActorProfileModal} setShowActorProfileModal={setShowActorProfileModal}
          selectedActor={selectedActor}
          isEditingActor={isEditingActor} setIsEditingActor={setIsEditingActor}
          handleUpdateActor={handleUpdateActor} handleDeleteActor={handleDeleteActor}
          imageSource={imageSource} setImageSource={setImageSource}
          isUploading={isUploading} handleFileChange={handleFileChange}
          showViewMessageModal={showViewMessageModal} setShowViewMessageModal={setShowViewMessageModal}
          selectedMessage={selectedMessage}
          replyContent={replyContent} setReplyContent={setReplyContent}
          handleSendReply={handleSendReply}
          showRotationModal={showRotationModal} setShowRotationModal={setShowRotationModal}
          handleRotateMasterKeys={handleRotateMasterKeys}
          isRotating={isRotating}
          showBroadcastModal={showBroadcastModal} setShowBroadcastModal={setShowBroadcastModal}
          isBroadcasting={isBroadcasting} handleSendBroadcast={handleSendBroadcast}
          showQRCodeModal={showQRCodeModal} setShowQRCodeModal={setShowQRCodeModal}
          qrCodeTarget={qrCodeTarget}
        />
        <DeleteConfirmModal
          show={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title={t('admin.confirm_delete_product_title', 'Confirmation de suppression')}
          itemName={productToDelete?.name || ''}
          t={t}
        />
        
      </div>
    </MotionConfig>
  );
};

// --- SUB-COMPONENTS FOR CLEANER CODE ---

const AdminOverview = ({ t, stats, products, activities, settings, lastSync, chartData, sparklines, onViewAll, chartFilter, setChartFilter, revenueGoal }: any) => {
  const getSparklineData = (data: number[], color: string) => {
    return data.map(v => ({ value: v, color }));
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex-1">
          <h2 className="text-5xl font-black tracking-tight mb-2">
            {t("common.welcome")}, <span className="text-brand-emerald">{t("admin.administrator_role")}</span>
          </h2>
          <p className={`font-bold uppercase tracking-widest text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {new Date(lastSync).toLocaleDateString(settings.language === 'en' ? 'en-US' : 'fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>

        {/* Strategic Target Card */}
        <div className={`p-8 rounded-[2.5rem] border bg-white/5 backdrop-blur-xl transition-all hover:scale-105 duration-500 min-w-[320px] ${settings.darkMode ? "border-white/10" : "border-gray-100 shadow-xl shadow-black/5"}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-brand-emerald" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t("admin.strategic_goal", "Objectif Stratégique")}</span>
            </div>
            <span className="text-brand-emerald font-black text-xs">{(stats.rawTotalRevenue / (revenueGoal * 1000000) * 100).toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (stats.rawTotalRevenue / (revenueGoal * 1000000) * 100))}%` }}
              className="h-full bg-brand-emerald rounded-full shadow-[0_0_15px_rgba(0,245,160,0.5)]"
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-gray-400">
            <span>{t("admin.performance")}</span>
            <span className={settings.darkMode ? "text-white" : "text-brand-dark"}>{revenueGoal}M FCFA</span>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-brand-emerald/20 blur-2xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl overflow-hidden">
          <div className="w-12 h-12 bg-brand-emerald/20 rounded-2xl flex items-center justify-center text-brand-emerald">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="font-black text-lg">{t("admin.system_integrity")}</p>
            <p className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>{t("admin.live_nodes_active")}<br />{t("admin.protocol_layer_7")}</p>
          </div>
          <button className="bg-brand-emerald text-brand-dark px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform whitespace-nowrap">
            {t("admin.secure")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t("admin.stat_revenue"), value: stats.totalRevenue, unit: t("admin.unit_cfa"), color: "#00f5a0", var: stats.revenueVariation, icon: TrendingUp, spark: sparklines.revenue },
          { label: t("admin.stat_stock"), value: stats.totalVolumeT, unit: t("admin.unit_tons"), color: "#facc15", var: stats.stockVariation, icon: Package, spark: sparklines.stock },
          { label: t("admin.stat_skus"), value: products.length, unit: t("admin.unit_items_label"), color: "#3b82f6", var: stats.skuVariation, icon: PackageOpen, spark: sparklines.skus },
          { label: t("admin.stat_transactions"), value: stats.transactionCount, unit: t("admin.movements"), color: "#ef4444", var: stats.mvtVariation, icon: Activity, spark: sparklines.mvts },
        ].map((stat, i) => (
          <div key={i} className={`p-8 rounded-[3rem] shadow-premium relative overflow-hidden group hover:border-brand-emerald/30 transition-all border ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100"
            }`}>
            <div className="relative z-10">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>{stat.label}</p>
              <h3 className="text-4xl font-black tracking-tighter mb-2">{stat.value} <span className={`text-xs font-bold uppercase ${settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>{stat.unit}</span></h3>
              <div className="flex items-center gap-2 text-[10px] font-black text-brand-emerald mt-4">
                <TrendingUp size={12} className={stat.var.startsWith('+') ? "" : "rotate-180 text-red-500"} />
                <span className={stat.var.startsWith('+') ? "text-brand-emerald" : "text-red-500"}>{stat.var} <span className="text-gray-500 opacity-50 ml-1">{t("admin.since_last_month")}</span></span>
              </div>
            </div>
            <div className="absolute right-6 top-6 opacity-10 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 h-16 w-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getSparklineData(stat.spark, stat.color)}>
                  <Line type="monotone" dataKey="value" stroke={stat.color} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className={`xl:col-span-2 p-10 rounded-[4rem] shadow-premium h-[500px] flex flex-col border transition-all ${settings.darkMode ? "bg-white/5 backdrop-blur-xl border-white/10" : "bg-white border-gray-100"
          }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div className="space-y-1">
              <h3 className={`text-2xl font-black tracking-tighter ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
                {t("admin.revenue_trend")}
              </h3>
              <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>
                {t("admin.live_market_data")}
              </p>
            </div>
            <div className={`flex gap-1 p-1 rounded-2xl border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"
              }`}>
              {["Week", "Month", "Year"].map((v: any) => (
                <button
                  key={v}
                  onClick={() => setChartFilter(v)}
                  className={`px-6 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 border border-transparent ${chartFilter === v
                      ? "bg-brand-emerald text-brand-dark shadow-lg shadow-brand-emerald/20 scale-105 border-brand-emerald"
                      : "text-gray-500 hover:bg-brand-emerald/10 hover:text-brand-emerald hover:border-brand-emerald/20"
                    }`}
                >
                  {t(`admin.${v.toLowerCase()}`, v)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f5a0" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#00f5a0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="0" stroke={settings.darkMode ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: settings.darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}
                  dy={15}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ stroke: '#00f5a0', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: settings.darkMode ? 'rgba(10,10,10,0.9)' : 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '1.25rem',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                    padding: '1.25rem'
                  }}
                  itemStyle={{ color: '#00f5a0', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  labelStyle={{ color: settings.darkMode ? '#ffffff' : '#000000', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00f5a0"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-10 rounded-[4rem] shadow-premium flex flex-col border transition-all ${settings.darkMode ? "bg-white/5 backdrop-blur-xl border-white/10" : "bg-white border-gray-100"
          }`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black tracking-tight">{t("admin.top_activity")}</h3>
            <button onClick={onViewAll} className="text-[10px] font-black text-brand-emerald uppercase tracking-widest hover:underline">{t("admin.view_all_link")}</button>
          </div>

          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {activities.slice(0, 6).map((act: any, i: number) => (
              <div key={i} className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all group ${settings.darkMode ? "bg-white/5 border-white/5 hover:border-white/10" : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-brand-emerald group-hover:scale-110 transition-transform shadow-inner ${settings.darkMode ? "bg-white/5" : "bg-white"
                    }`}>
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm tracking-tight ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{act.productId?.name || "Ref: #" + (act._id?.slice(-4) || 'XXXX')}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest leading-none mt-1 ${settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>{t(`admin.${act.type}`, act.type)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-sm tracking-tighter ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{(act.quantity / 1000).toFixed(1)} T</p>
                  <p className="text-[9px] font-black text-brand-emerald uppercase tracking-widest">{t("admin.successful")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityLog = ({ t, activities, settings }: any) => {
  const [filter, setFilter] = useState("ALL");

  const filteredActivities = useMemo(() => {
    if (filter === "ALL") return activities;
    return activities.filter((a: any) => a.type === filter);
  }, [activities, filter]);

  const filterOptions = [
    { id: "ALL", label: t("common.all") },
    { id: "SALE", label: t("admin.sale_local") },
    { id: "PURCHASE", label: t("admin.new_lot") },
    { id: "EXPORT", label: t("admin.export") },
  ];

  return (
    <div className="space-y-8">
      <div className="px-6 flex items-center justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">{t("admin.movement_ledger")}</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{t("admin.transaction_stream_desc")}</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 overflow-x-auto">
          {filterOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id)}
              className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-transparent ${filter === opt.id
                  ? "bg-brand-emerald text-brand-dark shadow-lg shadow-brand-emerald/20 border-brand-emerald"
                  : "text-gray-500 hover:bg-brand-emerald/10 hover:text-brand-emerald hover:border-brand-emerald/20"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[4rem] shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${settings.darkMode ? "text-gray-500 border-white/5 bg-white/[0.01]" : "text-gray-400 border-gray-100 bg-gray-50/50"
                }`}>
                <th className="px-10 py-8">{t("admin.ledger_timestamp")}</th>
                <th className="px-10 py-8">{t("admin.ledger_type")}</th>
                <th className="px-10 py-8">{t("admin.ledger_product")}</th>
                <th className="px-10 py-8">{t("admin.ledger_volume")}</th>
                <th className="px-10 py-8 text-right">{t("admin.ledger_verification")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-500 font-black uppercase tracking-widest text-[10px]">{t("admin.no_movements_sector")}</td>
                </tr>
              ) : (
                filteredActivities.map((act: any) => (
                  <tr key={act._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-gray-400">{new Date(act.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${act.type === 'SALE' ? 'bg-cyan-500/10 text-cyan-500' :
                          act.type === 'PURCHASE' ? 'bg-brand-emerald/10 text-brand-emerald' :
                            'bg-fuchsia-500/10 text-fuchsia-500'
                        }`}>
                        {t(`admin.${act.type}`, act.type)}
                      </span>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Package size={16} className="text-gray-400" /></div>
                        <span className="tracking-tight">{act.productId?.name || t("admin.global_sync")}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 font-black tracking-tighter text-lg">
                      {(act.quantity / 1000).toFixed(2)} <span className={`text-[10px] font-bold uppercase ml-1 ${settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>T</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-brand-emerald">
                        <ShieldCheck size={14} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{t("admin.signed")}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const OrderManagement = ({ t, activities, settings, onUpdateStatus }: any) => {
  const orders = useMemo(() => activities.filter((a: any) => a.type === 'SALE'), [activities]);

  const statusOptions = [
    { id: 'PENDING', label: t("common.status_pending", "Pending") },
    { id: 'PREPARING', label: t("admin.status_preparing", "Preparing") },
    { id: 'IN_TRANSIT', label: t("admin.status_in_transit", "In Transit") },
    { id: 'COMPLETED', label: t("common.status_completed", "Completed") },
    { id: 'CANCELLED', label: t("common.status_cancelled", "Cancelled") },
  ];

  const statusStyle: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-500',
    PREPARING: 'bg-blue-500/10 text-blue-500',
    IN_TRANSIT: 'bg-cyan-500/10 text-cyan-500',
    COMPLETED: 'bg-brand-emerald/10 text-brand-emerald',
    CANCELLED: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="space-y-8">
      <div className="px-6">
        <h2 className="text-4xl font-black tracking-tighter">{t("admin.orders", "Orders")}</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{t("admin.orders_desc", "MANAGE CUSTOMER ORDERS AND DELIVERIES")}</p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[4rem] shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${settings.darkMode ? "text-gray-500 border-white/5 bg-white/[0.01]" : "text-gray-400 border-gray-100 bg-gray-50/50"}`}>
                <th className="px-10 py-8">{t("admin.order_ref", "Order")}</th>
                <th className="px-10 py-8">{t("admin.ledger_product")}</th>
                <th className="px-10 py-8">{t("admin.ledger_volume")}</th>
                <th className="px-10 py-8">{t("admin.order_status", "Status")}</th>
                <th className="px-10 py-8">{t("common.date")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-500 font-black uppercase tracking-widest text-[10px]">{t("admin.no_orders", "No orders found.")}</td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <td className="px-10 py-6 font-mono tracking-wider text-gray-400 group-hover:text-brand-emerald transition-colors">
                      #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-10 py-6">
                      <span className="tracking-tight">{order.productId?.name || t("admin.global_sync")}</span>
                    </td>
                    <td className="px-10 py-6 font-black tracking-tighter text-lg">
                      {(order.quantity / 1000).toFixed(2)} <span className={`text-[10px] font-bold uppercase ml-1 ${settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>T</span>
                    </td>
                    <td className="px-10 py-6">
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer transition-all ${statusStyle[order.status] || 'bg-white/5 text-gray-400'} border border-transparent hover:opacity-80`}
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.id} value={opt.id} className="text-brand-dark">{opt.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-10 py-6 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StockManagement = ({
  t, filteredStocks, searchQuery, setSearchQuery, setShowNewLotModal, setShowNewProductModal,
  handleExportPDF, settings, handleEditProduct, handleDeleteProduct,
  stockHistoryData, setQrCodeTarget, setShowQRCodeModal
}: any) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">{t("admin.stock_mgmt")}</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{t("admin.assets_mgmt_protocol")}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleExportPDF}
            className={`group flex items-center gap-3 px-8 py-4 border rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all ${settings.darkMode
                ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
              }`}
          >
            <Download size={18} /> <span>{t("admin.pdf_report")}</span>
          </button>
          <button
            onClick={() => setShowNewProductModal(true)}
            className={`group flex items-center gap-3 px-8 py-4 border rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all ${settings.darkMode
                ? "bg-white/5 border-white/10 text-brand-emerald hover:bg-brand-emerald/10"
                : "bg-white border-brand-emerald text-brand-emerald hover:bg-brand-emerald/5 shadow-sm"
              }`}
          >
            <PackagePlus size={18} /> <span>{t("admin.new_product_btn", "Nouveau Produit")}</span>
          </button>
          <button
            onClick={() => setShowNewLotModal(true)}
            className="group relative flex items-center gap-3 px-8 py-4 bg-brand-emerald text-brand-dark rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-emerald/20 hover:scale-105 transition-all overflow-hidden"
          >
            <Plus size={18} className="relative z-10" />
            <span className="relative z-10">{t("admin.new_lot", "Add New Entry")}</span>
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[4rem] shadow-premium overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-wrap items-center justify-between gap-6 bg-white/[0.02]">
          <div className={`flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`}>
            <div className="w-2 h-2 rounded-full bg-brand-emerald shadow-[0_0_10px_rgba(0,245,160,0.5)]" />
            <span>{t("admin.active_monitoring")}</span>
          </div>
          <div className="flex gap-2">
            <div className="relative group/search">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/search:text-brand-emerald transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("admin.filter_assets")}
                className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-emerald/50 w-64 transition-all"
              />
            </div>
            <button className="p-3 bg-white/5 rounded-2xl border border-white/10 text-gray-400 hover:text-white transition-all"><AlertTriangle size={18} /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-[0.2em] border-b ${settings.darkMode ? "text-gray-500 border-white/5 bg-white/[0.01]" : "text-gray-400 border-gray-100 bg-gray-50/50"
                }`}>
                <th className="px-10 py-8">{t("admin.reference")}</th>
                <th className="px-10 py-8 text-left">{t("admin.designation")}</th>
                <th className="px-10 py-8">{t("admin.analytics", "Analytics")}</th>
                <th className="px-10 py-8">{t("admin.ledger_volume")}</th>
                <th className="px-10 py-8">{t("admin.threshold")}</th>
                <th className="px-10 py-8 text-center">{t("common.status")}</th>
                <th className="px-10 py-8 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              {filteredStocks.map((s: any) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-6 text-gray-500 font-mono tracking-wider group-hover:text-brand-emerald transition-colors">{s.ref}</td>
                  <td className="px-10 py-6 text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform"><Package size={16} className="text-brand-emerald" /></div>
                      <span className="tracking-tight">{s.product}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <SparklineChart
                      data={stockHistoryData[s.originalProduct?._id] || []}
                      color={s.statusColor === "emerald" ? "#00f5a0" : s.statusColor === "yellow" ? "#facc15" : "#ef4444"}
                    />
                  </td>
                  <td className="px-10 py-6 font-black tracking-tighter text-lg">{s.volume}</td>
                  <td className={`px-10 py-6 uppercase text-[9px] font-black tracking-[0.2em] transition-all ${settings.darkMode
                      ? "text-gray-400 opacity-20 group-hover:opacity-100"
                      : "text-gray-700 font-bold transition-colors"
                    }`}>
                    {s.originalProduct?.lowStockThreshold || 500} kg
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${s.statusColor === "emerald" ? "bg-brand-emerald/10 text-brand-emerald" :
                        s.statusColor === "yellow" ? "bg-yellow-500/10 text-yellow-500" :
                          "bg-red-500/10 text-red-500"
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${s.statusColor === "emerald" ? "bg-brand-emerald" :
                          s.statusColor === "yellow" ? "bg-yellow-500 animate-pulse" :
                            "bg-red-500 animate-pulse"
                        }`} />
                      {s.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setQrCodeTarget({
                            data: s.originalProduct?._id || s.id,
                            title: s.product
                          });
                          setShowQRCodeModal(true);
                        }}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-brand-emerald hover:bg-brand-emerald/10 transition-all"
                        title={t("admin.qr_code_title")}
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (s.originalProduct) handleEditProduct(s.originalProduct);
                        }}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-brand-emerald hover:bg-brand-emerald/10 transition-all group"
                        title={t("common.edit")}
                      >
                        <Settings size={14} className="group-hover:rotate-90 transition-transform" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(s.originalProduct || { _id: s.id, name: s.name })}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all transform hover:scale-110 active:scale-95 group"
                        title={t("common.delete")}
                      >
                        <Trash2 size={14} className="group-hover:shake-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ActorManagement = ({ t, actors, openProfile, openContact, settings }: any) => {
  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-8">
          <div className="px-6 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tighter">{t("admin.actors")}</h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{t("admin.network_subtitle", "Personnel autorisé & accès aux nœuds")}</p>
            </div>
            <button
              onClick={() => settings.onAddActor()}
              className="group flex items-center gap-3 px-8 py-4 bg-brand-emerald text-brand-dark rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-brand-emerald/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={18} className="transition-transform group-hover:rotate-90" />
              <span>{t("admin.add_label")}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {actors.map((actor: any) => (
              <div key={actor._id} className={`p-8 rounded-[3rem] shadow-premium relative group overflow-hidden transition-all border ${settings.darkMode
                  ? "bg-white/5 border-white/10 hover:border-brand-emerald/30"
                  : "bg-white border-gray-100 hover:border-gray-200 shadow-gray-200/20"
                }`}>
                <div className="flex items-center gap-5 mb-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xl group-hover:scale-110 transition-transform duration-500 ${settings.darkMode
                      ? "bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-white/10 text-brand-emerald"
                      : "bg-white border-gray-200 text-brand-dark shadow-gray-200/50"
                    }`}>
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h4 className={`font-black text-lg tracking-tight group-hover:text-brand-emerald transition-colors ${settings.darkMode ? "text-white" : "text-brand-dark"
                      }`}>{actor.name}</h4>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${settings.darkMode ? "text-gray-500" : "text-gray-400"}`}>{actor.type}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className={`flex items-center gap-4 text-xs font-bold ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <div className={`p-2 rounded-lg text-brand-emerald shadow-inner ${settings.darkMode ? "bg-white/5" : "bg-gray-50"}`}><MapPin size={14} /></div>
                    <span>{actor.location}</span>
                  </div>
                  <div className={`flex items-center gap-4 text-xs font-bold ${settings.darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    <div className={`p-2 rounded-lg text-brand-emerald shadow-inner ${settings.darkMode ? "bg-white/5" : "bg-gray-50"}`}><Mail size={14} /></div>
                    <span className="truncate">{actor.contactEmail || actor.contact || t("admin.no_email")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openProfile(actor)}
                    className="py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-brand-emerald hover:text-brand-dark shadow-sm"
                  >
                    {t("user.profile")}
                  </button>
                  <button
                    onClick={() => openContact(actor)}
                    className="py-4 bg-brand-emerald/10 text-brand-emerald rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] transition-all hover:bg-brand-emerald hover:text-brand-dark shadow-sm"
                  >
                    {t("common.contact")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

const CommunicationCenter = ({ t, messages, setMessageFolder, messageFolder, onViewMessage, setShowBroadcastModal }: any) => {
  const [signalSearch, setSignalSearch] = useState("");

  const filteredMessages = useMemo(() => {
    return messages.filter((m: any) =>
      signalSearch === "" ||
      m.subject.toLowerCase().includes(signalSearch.toLowerCase()) ||
      m.sender.toLowerCase().includes(signalSearch.toLowerCase())
    );
  }, [messages, signalSearch]);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[4rem] shadow-premium overflow-hidden flex flex-col lg:flex-row h-[800px]">
      <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col pt-10 px-10">
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-3xl font-black tracking-tighter">{t("admin.msg_center_title", "MESSAGING")}</h3>
          <div className="w-10 h-10 bg-brand-emerald/10 rounded-2xl flex items-center justify-center text-brand-emerald shadow-inner animate-pulse">
            <MessageCircle size={20} />
          </div>
        </div>

        <button
          onClick={() => setShowBroadcastModal(true)}
          className="w-full mb-8 py-4 bg-brand-emerald text-brand-dark rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-brand-emerald/20 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
        >
          <Globe size={16} />
          {t("admin.new_broadcast", "Nouvelle Diffusion")}
        </button>

        <nav className="space-y-3">
          {[
            { id: "INBOX", icon: Inbox, label: t("admin.signals") },
            { id: "SENT", icon: Send, label: t("admin.sent_pulse") },
            { id: "TRASH", icon: Trash2, label: t("admin.archive") },
            { id: "BROADCASTS", icon: Globe, label: t("admin.global_folder") },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setMessageFolder(item.id as any)}
              className={`flex items-center justify-between w-full px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ease-out group active:scale-95 border border-transparent ${messageFolder === item.id
                  ? "bg-brand-emerald text-brand-dark shadow-xl shadow-brand-emerald/20 border-brand-emerald"
                  : "text-gray-500 hover:bg-brand-emerald/10 hover:text-brand-emerald hover:border-brand-emerald/20"
                }`}
            >
              <div className="flex items-center gap-5">
                <item.icon size={18} className={`transition-transform duration-500 ${messageFolder === item.id ? "scale-110" : "group-hover:scale-110 group-hover:rotate-6"}`} />
                <span className="transition-transform duration-500 group-hover:translate-x-1">{item.label}</span>
              </div>
              {messageFolder === item.id ? (
                <div className="w-2 h-2 rounded-full bg-brand-dark shadow-sm" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-brand-emerald/0 group-hover:bg-brand-emerald transition-all duration-500" />
              )}
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="px-5 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-gray-500">{t("admin.msg_channel", "Channel A-04")}</div>
            <h4 className="font-black uppercase text-[10px] tracking-[0.3em] text-gray-400 hidden sm:block">{t("admin.msg_frequency", "Frequency: Secure Layer 7")}</h4>
          </div>
          <div className="relative group/search">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/search:text-brand-emerald transition-colors" />
            <input
              type="text"
              value={signalSearch}
              onChange={(e) => setSignalSearch(e.target.value)}
              placeholder={t("admin.scanning_signals")}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-[10px] font-black tracking-widest outline-none focus:border-brand-emerald/50 w-48 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] border border-white/5 flex items-center justify-center animate-spin-slow">
                <Inbox size={48} className="opacity-20" />
              </div>
              <p className="font-black text-[10px] uppercase tracking-[0.5em] text-center max-w-[200px] leading-loose">{t("admin.no_signals_desc", "No active signals detected in this sector")}</p>
            </div>
          ) : (
            filteredMessages.map((msg: any) => (
              <div
                key={msg._id} onClick={() => onViewMessage(msg)}
                className={`p-10 rounded-[3.5rem] border transition-all cursor-pointer group relative overflow-hidden ${msg.status === "UNREAD" ? "bg-brand-emerald/10 border-brand-emerald/30 border-2 shadow-[0_0_20px_rgba(0,245,160,0.1)]" : "bg-white/[0.03] border-white/5 hover:border-white/20 hover:bg-white/[0.05]"}`}
              >
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-emerald/20 to-cyan-500/20 border border-brand-emerald/20 flex items-center justify-center font-black text-brand-emerald shadow-lg group-hover:scale-105 transition-transform">{msg.sender[0]}</div>
                    <div>
                      <p className="font-black text-lg tracking-tight group-hover:text-brand-emerald transition-colors">{msg.sender}</p>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{msg.type === 'BROADCAST' ? t("admin.global_folder") : t("admin.authenticated_type")}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <h5 className="text-xl font-black mb-4 tracking-tight leading-snug max-w-[80%] uppercase text-xs">{msg.subject}</h5>
                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const SettingsPanel = ({ t, i18n, settings, setSettings, setShow2FAModal, setTwoFactorStep, setShowRotationModal, setShowLogoutConfirm, showToast }: any) => {
  const changeLanguage = (lang: string) => {
    setSettings({ ...settings, language: lang });
    i18n.changeLanguage(lang);
    showToast(lang === 'fr' ? t('admin.lang_set_fr') : t('admin.lang_set_en'));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="px-6">
        <h2 className="text-4xl font-black tracking-tighter">{t('admin.settings_title', 'Paramètres')}</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{t('admin.settings_subtitle', 'Préférences de la plateforme & protocoles de sécurité')}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[4rem] shadow-premium space-y-8 group hover:border-brand-emerald/20 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-emerald shadow-inner"><Globe size={20} /></div>
            <h3 className="text-xl font-black tracking-tight tracking-widest uppercase text-xs opacity-50">{t("admin.localization")}</h3>
          </div>
          <div className={`flex gap-2 p-2 rounded-[2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
            {["fr", "en"].map(lang => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${settings.language === lang
                    ? "bg-brand-emerald text-brand-dark shadow-xl shadow-brand-emerald/20"
                    : (settings.darkMode ? "text-gray-500 hover:bg-white/5 hover:text-white" : "text-gray-400 hover:bg-black/5 hover:text-brand-dark")
                  }`}
              >
                {lang === "fr" ? t("admin.language_fr") : t("admin.language_en")}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 group-hover:bg-white/[0.02] transition-all">
            <div>
              <p className="font-black tracking-tight">{t("admin.dark_mode")}</p>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">{t("admin.dark_mode_optimized")}</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`w-16 h-9 rounded-full transition-all relative p-1 ${settings.darkMode ? "bg-brand-emerald shadow-lg shadow-brand-emerald/20" : "bg-gray-200"}`}
            >
              <motion.div
                animate={{ x: settings.darkMode ? 28 : 0 }}
                className="w-7 h-7 bg-white rounded-full shadow-md"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[4rem] shadow-premium space-y-8 group hover:border-brand-emerald/20 transition-all">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-brand-emerald shadow-inner"><ShieldCheck size={20} /></div>
            <h3 className="text-xl font-black tracking-tight tracking-widest uppercase text-xs opacity-50">{t("admin.security_section")}</h3>
          </div>
          <button
            onClick={() => {
              setTwoFactorStep("CONFIRM");
              setShow2FAModal(true);
            }}
            className="w-full flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-brand-emerald/50 hover:bg-white/[0.04] transition-all group/item"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-xl text-brand-emerald shadow-inner group-hover/item:scale-110 transition-transform"><Smartphone size={24} /></div>
              <div className="text-left">
                <p className="font-black tracking-tight">{t("admin.two_factor_access")}</p>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">{t("admin.mfa_gate")}</p>
              </div>
            </div>
            <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] group-hover/item:bg-brand-emerald group-hover/item:text-brand-dark transition-all">{t("admin.sync_btn")}</div>
          </button>
          <button
            onClick={() => setShowRotationModal(true)}
            className="w-full flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/10 hover:border-brand-emerald/50 hover:bg-white/[0.04] transition-all group/item"
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white/5 rounded-xl text-brand-emerald shadow-inner group-hover/item:scale-110 transition-transform"><Lock size={24} /></div>
              <div className="text-left">
                <p className="font-black tracking-tight">{t("admin.credentials")}</p>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">{t("admin.rotate_keys")}</p>
              </div>
            </div>
            <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] group-hover/item:bg-brand-emerald group-hover/item:text-brand-dark transition-all">{t("admin.rotate_btn")}</div>
          </button>

          {/* REDUNDANT LOGOUT FOR MAXIMUM VISIBILITY */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full mt-4 flex items-center justify-center py-6 bg-red-600/10 border-2 border-dashed border-red-600/20 rounded-[2.5rem] text-red-500 font-black text-xs uppercase tracking-[0.3em] hover:bg-red-600/20 hover:border-red-600/50 transition-all shadow-lg shadow-red-600/5"
          >
            <LogOut size={16} className="mr-3" />
            {t("common.logout")}
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardModals = ({
  t,
  settings,
  showLogoutConfirm, setShowLogoutConfirm,
  show2FAModal, setShow2FAModal,
  handleLogout, handleToggle2FA,
  currentUser, toastMessage,
  showNewLotModal, setShowNewLotModal, lotForm, setLotForm, handleRecordLot,
  showNewActorModal, setShowNewActorModal, actorForm, setActorForm, handleAddActor,
  showNewProductModal, setShowNewProductModal, productForm, setProductForm, handleSaveProduct,
  isEditingProduct, setIsEditingProduct,
  twoFactorStep, setTwoFactorStep, qrCodeData, verificationToken, setVerificationToken, handleConfirm2FAActivation,
  showActorProfileModal, setShowActorProfileModal,
  selectedActor,
  isEditingActor, setIsEditingActor,
  handleUpdateActor, handleDeleteActor,
  imageSource, setImageSource,
  isUploading, handleFileChange,
  showViewMessageModal, setShowViewMessageModal,
  selectedMessage,
  replyContent, setReplyContent,
  handleSendReply,
  showRotationModal, setShowRotationModal,
  handleRotateMasterKeys,
  isRotating,
  showBroadcastModal, setShowBroadcastModal,
  handleSendBroadcast,
  isBroadcasting,
  showQRCodeModal, setShowQRCodeModal,
  qrCodeTarget,
}: any) => {
  return (
    <>
      <TwoFactorModal
        t={t}
        settings={settings}
        show2FAModal={show2FAModal}
        setShow2FAModal={setShow2FAModal}
        twoFactorStep={twoFactorStep}
        setTwoFactorStep={setTwoFactorStep}
        qrCodeData={qrCodeData}
        verificationToken={verificationToken}
        setVerificationToken={setVerificationToken}
        handleToggle2FA={handleToggle2FA}
        handleConfirm2FAActivation={handleConfirm2FAActivation}
        currentUser={currentUser}
      />

      <RotationConfirmModal
        t={t}
        settings={settings}
        show={showRotationModal}
        onClose={() => setShowRotationModal(false)}
        onConfirm={handleRotateMasterKeys}
        isProcessing={isRotating}
      />

      <BroadcastModal
        show={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        onSend={handleSendBroadcast}
        settings={settings}
        t={t}
        isSending={isBroadcasting}
      />

      <QRCodeModal
        show={showQRCodeModal}
        onClose={() => setShowQRCodeModal(false)}
        data={qrCodeTarget.data}
        title={qrCodeTarget.title}
        settings={settings}
        t={t}
      />

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl ${settings.darkMode ? "bg-black/95" : "bg-black/40"}`}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className={`p-12 rounded-[4rem] max-w-sm w-full text-center shadow-premium border ${settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"}`}
            >
              <div className="w-24 h-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center text-red-500 mx-auto mb-10 shadow-lg shadow-red-500/20">
                <LogOut size={48} />
              </div>
              <h3 className={`text-3xl font-black mb-4 tracking-tight ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{t("admin.disconnect_title")}</h3>
              <p className="text-gray-500 font-bold text-sm leading-relaxed mb-10">{t("admin.terminate_session")}</p>
              <div className="flex gap-4">
                <button onClick={() => setShowLogoutConfirm(false)} className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>{t("admin.abort_btn")}</button>
                <button onClick={handleLogout} className="flex-1 py-5 bg-red-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-500/30 transition-transform active:scale-95">{t("admin.confirm_btn")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewLotModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl ${settings.darkMode ? "bg-black/95" : "bg-black/40"}`}>
            <motion.form noValidate onSubmit={handleRecordLot} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`p-12 rounded-[4rem] max-w-lg w-full shadow-premium border ${settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"}`}>
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-brand-emerald/10 rounded-2xl flex items-center justify-center text-brand-emerald shadow-inner">
                  <PackagePlus size={32} />
                </div>
                <div>
                  <h3 className={`text-3xl font-black tracking-tighter ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{t("admin.register_asset")}</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">{t("admin.industrial_asset_mgmt")}</p>
                </div>
              </div>
              <div className="space-y-6 mb-10">
                <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.product_designation")}</p>
                    <Package size={14} className="text-brand-emerald/50" />
                  </div>
                  <input
                    type="text"
                    value={lotForm.product}
                    onChange={e => setLotForm({ ...lotForm, product: e.target.value })}
                    className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                    placeholder={t("admin.product_placeholder", "Ex: Pomme de terre")}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.unit_label")}</p>
                    </div>
                    <div className="flex p-1 gap-1 relative">
                      {["T", "kg"].map(u => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => setLotForm({ ...lotForm, unit: u })}
                          className={`relative flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all z-10 ${lotForm.unit === u
                              ? (settings.darkMode ? "text-brand-dark" : "text-white")
                              : "text-gray-500 hover:text-gray-400"
                            }`}
                        >
                          <span className="relative z-10">{u === "T" ? t("admin.tonnes") : t("admin.kilograms")}</span>
                          {lotForm.unit === u && (
                            <motion.div
                              layoutId="unitTab"
                              className={`absolute inset-0 rounded-xl shadow-lg z-0 ${settings.darkMode ? "bg-brand-emerald" : "bg-brand-dark"}`}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={`flex-1 p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.ledger_volume")}</p>
                        <Activity size={12} className="text-brand-emerald/50" />
                      </div>
                      <input
                        type="number"
                        value={lotForm.volume}
                        onChange={e => setLotForm({ ...lotForm, volume: e.target.value })}
                        className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                        placeholder={t("admin.placeholder_volume")}
                        required
                      />
                    </div>
                    <div className={`flex-1 p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.lot_ref_label")}</p>
                        <Hash size={12} className="text-brand-emerald/50" />
                      </div>
                      <input
                        type="text"
                        value={lotForm.ref}
                        onChange={e => setLotForm({ ...lotForm, ref: e.target.value })}
                        className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                        placeholder={t("admin.lot_ref_placeholder")}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowNewLotModal(false)} className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 border border-white/10 text-white" : "bg-gray-100 text-gray-500"}`}>{t("common.cancel")}</button>
                <button type="submit" className="flex-1 py-5 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-95">{t("admin.confirm_btn")}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewActorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl ${settings.darkMode ? "bg-black/95" : "bg-black/40"}`}>
            <motion.form noValidate onSubmit={handleAddActor} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className={`p-12 rounded-[4rem] max-w-lg w-full shadow-premium border ${settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"}`}>
              <div className="flex items-center gap-6 mb-10">
                <div className="w-16 h-16 bg-brand-emerald/10 rounded-2xl flex items-center justify-center text-brand-emerald shadow-inner">
                  <UserPlus size={32} />
                </div>
                <div>
                  <h3 className={`text-3xl font-black tracking-tighter ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{t("admin.new_entity", "Nouveau Partenaire")}</h3>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">{t("admin.network_expansion_protocol")}</p>
                </div>
              </div>
              <div className="space-y-6 mb-10">
                <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.legal_name")}</p>
                    <UserPlus size={14} className="text-brand-emerald/50" />
                  </div>
                  <input
                    type="text"
                    value={actorForm.name}
                    onChange={e => setActorForm({ ...actorForm, name: e.target.value })}
                    className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                    placeholder={t("admin.actor_name_placeholder")}
                    required
                  />
                </div>

                <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.entity_type", "Type d'Entité")}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-1 p-1">
                    {[
                      { id: "SUPPLIER", label: t("admin.actor_type_supplier") },
                      { id: "CLIENT_B2B", label: t("admin.actor_type_b2b") },
                      { id: "CLIENT_EXPORT", label: t("admin.actor_type_export") },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setActorForm({ ...actorForm, type: type.id })}
                        className={`flex items-center justify-between px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${actorForm.type === type.id
                            ? "bg-brand-emerald text-brand-dark shadow-lg shadow-brand-emerald/20"
                            : "text-gray-500 hover:bg-white/5 hover:text-gray-400"
                          }`}
                      >
                        <span>{type.label}</span>
                        {actorForm.type === type.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-dark" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={`flex-1 p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.primary_location")}</p>
                    </div>
                    <input
                      type="text"
                      value={actorForm.location}
                      onChange={e => setActorForm({ ...actorForm, location: e.target.value })}
                      className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                      placeholder={t("admin.location_placeholder")}
                      required
                    />
                  </div>
                  <div className={`flex-1 p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("common.email")}</p>
                    </div>
                    <input
                      type="email"
                      value={actorForm.contactEmail}
                      onChange={e => setActorForm({ ...actorForm, contactEmail: e.target.value })}
                      className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                      placeholder={t("admin.placeholder_email_contact")}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setShowNewActorModal(false)} className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 border border-white/10 text-white" : "bg-gray-100 text-gray-500"}`}>{t("common.cancel")}</button>
                <button type="submit" className="flex-1 py-5 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-95">{t("admin.confirm_btn")}</button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewProductModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl ${settings.darkMode ? "bg-black/95" : "bg-black/40"}`}>
            <motion.form
              noValidate onSubmit={handleSaveProduct}
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className={`p-10 rounded-[4rem] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-premium border scrollbar-hide ${settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"}`}
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="w-14 h-14 bg-brand-emerald/10 rounded-2xl flex items-center justify-center text-brand-emerald shadow-inner relative">
                  <PackageOpen size={28} />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-emerald text-brand-dark rounded-xl flex items-center justify-center border-4 border-[#0a0a0a] shadow-lg">
                    <ImageIcon size={12} />
                  </div>
                </div>
                <div>
                  <h3 className={`text-2xl font-black tracking-tighter ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
                    {isEditingProduct ? t("admin.edit_product", "Edit Product") : t("admin.new_product")}
                  </h3>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-0.5">{t("admin.master_catalog_entry")}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className={`p-1 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 mb-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.prod_name_label")}</p>
                    <PackageOpen size={12} className="text-brand-emerald/50" />
                  </div>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                    className={`w-full bg-transparent px-4 py-2.5 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                    placeholder={t("admin.prod_name_placeholder")}
                    required
                  />
                </div>

                <div className={`p-1 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 mb-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("common.description")}</p>
                    <MessageSquare size={12} className="text-brand-emerald/50" />
                  </div>
                  <textarea
                    value={productForm.description}
                    onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    className={`w-full bg-transparent px-4 py-2.5 text-sm outline-none font-bold resize-none ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                    placeholder={t("admin.desc_placeholder")}
                    rows={3}
                    required
                  />
                </div>

                <div className={`p-3 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{t("admin.translations", "Translations")}</p>
                  <div className="space-y-3">
                    {(['en', 'fr'] as const).map((lang) => (
                      <div key={lang} className="space-y-2">
                        <p className="text-[8px] font-black text-brand-emerald uppercase tracking-widest">{lang === 'en' ? t("common.english", "English") : t("common.french", "French")}</p>
                        <input
                          type="text"
                          value={productForm.translations[lang].name}
                          onChange={e => setProductForm({ ...productForm, translations: { ...productForm.translations, [lang]: { ...productForm.translations[lang], name: e.target.value } } })}
                          className={`w-full bg-transparent px-3 py-2 text-xs outline-none font-bold rounded-xl border border-white/5 ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                          placeholder={t("admin.trans_name_placeholder", "Name in {{lang}}", { lang: lang.toUpperCase() })}
                        />
                        <textarea
                          value={productForm.translations[lang].description}
                          onChange={e => setProductForm({ ...productForm, translations: { ...productForm.translations, [lang]: { ...productForm.translations[lang], description: e.target.value } } })}
                          className={`w-full bg-transparent px-3 py-2 text-xs outline-none font-bold resize-none rounded-xl border border-white/5 ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                          placeholder={t("admin.trans_desc_placeholder", "Description in {{lang}}", { lang: lang.toUpperCase() })}
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-1 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 mb-2">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("common.image_source")}</p>
                    <div className="flex bg-black/20 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setImageSource('file')}
                        className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${imageSource === 'file' ? "bg-brand-emerald text-brand-dark shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                      >
                        <Smartphone size={8} className="inline mr-1" /> {t("common.local_device")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageSource('url')}
                        className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${imageSource === 'url' ? "bg-brand-emerald text-brand-dark shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                      >
                        <Globe size={8} className="inline mr-1" /> {t("common.url_internet")}
                      </button>
                    </div>
                  </div>

                  <div className="px-2 pb-2">
                    {imageSource === 'url' ? (
                      <div className="relative group/url">
                        <LinkIcon size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within/url:text-brand-emerald transition-colors" />
                        <input
                          type="text"
                          value={productForm.imageUrl}
                          onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                          className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] font-bold outline-none focus:border-brand-emerald/50 transition-all ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                          placeholder={t("admin.placeholder_image_url")}
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <input type="file" id="product-img" className="hidden" accept="image/*" onChange={handleFileChange} />
                        <label htmlFor="product-img" className={`flex flex-col items-center justify-center p-6 rounded-[1.5rem] border-2 border-dashed transition-all cursor-pointer ${isUploading ? "opacity-30 cursor-wait" : "hover:bg-white/5 hover:border-brand-emerald/50"} ${settings.darkMode ? "border-white/10" : "border-gray-200"}`}>
                          {isUploading ? (
                            <Activity size={20} className="text-brand-emerald animate-spin" />
                          ) : (
                            <>
                              <Upload size={20} className="text-gray-500 mb-2" />
                              <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{t("common.choose_local_image")}</span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                    {productForm.imageUrl && (
                      <div className="mt-4 relative group">
                        <img src={productForm.imageUrl} className="w-full h-32 object-cover rounded-2xl border border-white/10" alt={t("common.preview", "Preview")} />
                        <button type="button" onClick={() => setProductForm({ ...productForm, imageUrl: '' })} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"><X size={12} /></button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className={`flex-1 p-1 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                    <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 mb-1">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("common.price")}</p>
                      <CreditCard size={12} className="text-brand-emerald/50" />
                    </div>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                      className={`w-full bg-transparent px-4 py-2 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                      placeholder={t("admin.placeholder_price_fcfa")}
                      required
                    />
                  </div>
                  <div className={`flex-1 p-1 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                    <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 mb-1">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.stock_initial")}</p>
                      <Activity size={12} className="text-brand-emerald/50" />
                    </div>
                    <input
                      type="number"
                      value={productForm.stockQuantity}
                      onChange={e => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                      className={`w-full bg-transparent px-4 py-2 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                      placeholder={t("admin.placeholder_stock_zero")}
                      required
                    />
                  </div>
                  <div className={`flex-1 p-1 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                    <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 mb-1">
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.stock_threshold")}</p>
                      <AlertTriangle size={12} className="text-amber-500/50" />
                    </div>
                    <input
                      type="number"
                      value={productForm.lowStockThreshold || 500}
                      onChange={e => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                      className={`w-full bg-transparent px-4 py-2 text-sm outline-none font-black ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                      placeholder={t("admin.placeholder_stock_alert")}
                      required
                    />
                  </div>
                </div>

                <div className={`p-1 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 mb-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.prod_cat")}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-1">
                    {[
                      { id: "AGRICULTURAL", label: t("admin.cat_agri") },
                      { id: "HORTICULTURAL", label: t("admin.cat_horticultural") },
                      { id: "MARKET_GARDENING", label: t("admin.cat_market_gardening") },
                      { id: "CEREAL", label: t("admin.cat_cereal") },
                      { id: "FRUIT", label: t("admin.cat_fruit") },
                      { id: "AGRO_FOOD", label: t("admin.cat_agro_food") }
                    ].map(cat => (
                      <button
                        key={cat.id} type="button"
                        onClick={() => setProductForm({ ...productForm, category: cat.id })}
                        className={`py-2 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${productForm.category === cat.id ? "bg-brand-emerald text-brand-dark shadow-lg" : "text-gray-500 hover:bg-white/5"}`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`p-1 rounded-[1.2rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 mb-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.unit_label")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {[
                      { id: "KG", label: t("admin.kilograms") },
                      { id: "TONNE", label: t("admin.tonnes") }
                    ].map(unit => (
                      <button
                        key={unit.id} type="button"
                        onClick={() => setProductForm({ ...productForm, unit: unit.id })}
                        className={`py-2 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all ${productForm.unit === unit.id ? "bg-brand-emerald text-brand-dark shadow-lg" : "text-gray-500 hover:bg-white/5"}`}
                      >
                        {unit.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProductModal(false);
                    setIsEditingProduct(false);
                  }}
                  className={`flex-1 py-4 rounded-[2rem] font-black text-[9px] uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 border border-white/10 text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="flex-1 py-4 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[9px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-95">
                  {isEditingProduct ? t("admin.update_btn") : t("admin.master_create")}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showActorProfileModal && selectedActor && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl ${settings.darkMode ? "bg-black/95" : "bg-black/40"}`}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className={`p-10 rounded-[4rem] max-w-xl w-full shadow-premium border relative overflow-hidden ${settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"}`}
            >
              <button
                onClick={() => setShowActorProfileModal(false)}
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-20"
              >
                <X size={20} className={settings.darkMode ? "text-white" : "text-brand-dark"} />
              </button>

              <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-brand-emerald/10 rounded-3xl flex items-center justify-center text-brand-emerald shadow-inner">
                  <User size={36} />
                </div>
                <div>
                  <h3 className={`text-4xl font-black tracking-tighter ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{selectedActor.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-emerald/20">{selectedActor.type}</span>
                    <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{selectedActor.location}</span>
                  </div>
                </div>
              </div>

              {isEditingActor ? (
                <form noValidate onSubmit={handleUpdateActor} className="space-y-6">
                  <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.legal_name")}</p>
                    </div>
                    <input
                      type="text"
                      value={actorForm.name}
                      onChange={e => setActorForm({ ...actorForm, name: e.target.value })}
                      className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("admin.primary_location")}</p>
                      </div>
                      <input
                        type="text"
                        value={actorForm.location}
                        onChange={e => setActorForm({ ...actorForm, location: e.target.value })}
                        className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                        required
                      />
                    </div>
                    <div className={`p-1.5 rounded-[1.5rem] border transition-all ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-gray-100/50 border-gray-200"}`}>
                      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{t("common.email")}</p>
                      </div>
                      <input
                        type="email"
                        value={actorForm.contactEmail}
                        onChange={e => setActorForm({ ...actorForm, contactEmail: e.target.value })}
                        className={`w-full bg-transparent px-4 py-3 text-sm outline-none font-bold ${settings.darkMode ? "text-white" : "text-brand-dark"}`}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditingActor(false)}
                      className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 border border-white/10 text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      {t("common.cancel")}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-5 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      {t("common.save")}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-12">
                    <div className={`p-6 rounded-3xl border ${settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">{t("common.email")}</p>
                      <p className={`font-bold text-sm truncate ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{selectedActor.contactEmail || selectedActor.contact || "—"}</p>
                    </div>
                    <div className={`p-6 rounded-3xl border ${settings.darkMode ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"}`}>
                      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">{t("admin.network_status")}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
                        <p className="font-bold text-sm text-brand-emerald">{t("admin.network_active")}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        setActorForm({
                          name: selectedActor.name,
                          type: selectedActor.type,
                          location: selectedActor.location,
                          contactEmail: (selectedActor as any).contactEmail || (selectedActor as any).contact || ""
                        });
                        setIsEditingActor(true);
                      }}
                      className={`w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all border flex items-center justify-center gap-3 ${settings.darkMode ? "bg-brand-emerald text-brand-dark border-brand-emerald shadow-lg shadow-brand-emerald/20" : "bg-brand-dark text-white border-brand-dark"
                        }`}
                    >
                      <Plus size={16} className="-rotate-45" />
                      {t("admin.edit_partner_info")}
                    </button>

                    <button
                      onClick={() => handleDeleteActor(selectedActor._id)}
                      className="w-full py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 flex items-center justify-center gap-3"
                    >
                      <Trash2 size={16} />
                      {t("admin.delete_partner")}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showViewMessageModal && selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl ${settings.darkMode ? "bg-black/95" : "bg-black/40"}`}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className={`p-10 rounded-[4rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-premium border relative flex flex-col ${settings.darkMode ? "bg-[#0a0a0a] border-white/10" : "bg-white border-gray-100"}`}
            >
              <button
                onClick={() => setShowViewMessageModal(false)}
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors z-20"
              >
                <X size={20} className={settings.darkMode ? "text-white" : "text-brand-dark"} />
              </button>

              <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 bg-brand-emerald/10 rounded-3xl flex items-center justify-center text-brand-emerald shadow-inner">
                  <MessageSquare size={36} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`text-3xl font-black tracking-tighter ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>{selectedMessage.sender}</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-brand-emerald/10 text-brand-emerald rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-emerald/20">{selectedMessage.type === 'BROADCAST' ? t('admin.signal_global') : t('admin.signal_authenticated')}</span>
                    <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">{selectedMessage.subject}</span>
                  </div>
                </div>
              </div>

              <div className={`flex-1 p-10 rounded-[3rem] border mb-12 leading-relaxed text-lg font-bold ${settings.darkMode ? "bg-white/[0.02] border-white/5 text-gray-300" : "bg-gray-50 border-gray-100 text-gray-700"}`}>
                {selectedMessage.content}
              </div>

              {/* REPLY SECTION */}
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-brand-emerald/10 flex items-center justify-center text-brand-emerald"><Send size={14} /></div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{t("admin.secure_reply_title")}</h4>
                </div>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={t("admin.secure_reply_placeholder")}
                  className={`w-full min-h-[150px] p-8 rounded-[2rem] border outline-none transition-all focus:border-brand-emerald/50 text-sm font-bold resize-none ${settings.darkMode ? "bg-white/5 border-white/10 text-white" : "bg-gray-50 border-gray-200 text-brand-dark"}`}
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowViewMessageModal(false)}
                    className={`flex-1 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 border border-white/10 text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    {t("common.close")}
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyContent.trim()}
                    className={`flex-[2] py-5 bg-brand-emerald text-brand-dark rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-emerald/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100`}
                  >
                    {t("admin.transmit_reply")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-4 px-10 py-6 bg-brand-emerald text-brand-dark rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-emerald/30 border border-brand-emerald/50"
          >
            <ShieldCheck size={18} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const StrategicTargets = ({ t, projectionsData, settings }: any) => {
  return (
    <div className="space-y-8">
      <div className="px-6 text-center lg:text-left">
        <h2 className="text-4xl font-black tracking-tighter">{t("admin.strategic_targets", "Objectifs Stratégiques")}</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">{t("admin.targets_desc", "Directives et projections définies par le Super Administrateur.")}</p>
      </div>

      <div className={`p-10 rounded-[4rem] shadow-premium border ${settings.darkMode ? "bg-white/5 backdrop-blur-xl border-white/10" : "bg-white border-gray-100"}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h3 className={`text-2xl font-black flex items-center gap-3 ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
              <Sprout className="text-brand-emerald" /> {t('superadmin.hydro_projections', 'Projections Hydroponiques')}
            </h3>
            <p className="text-gray-500 text-sm mt-1">{t('superadmin.hydro_projections_desc', 'Modèle de performance basé sur 2000 plants.')}</p>
          </div>
          <div className="bg-brand-emerald/10 text-brand-emerald px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-brand-emerald/20">
            {t('superadmin.high_perf_model', 'Modèle Haute Performance')}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3 border-b border-white/5 pb-4">
              <ShoppingCart size={16} className="text-brand-emerald" /> {t('superadmin.bulk_scenario', 'Vente en Gros')}
            </h4>
            <div className="overflow-hidden rounded-[2.5rem] border border-white/5 shadow-inner bg-white/[0.02]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-500 font-black text-[9px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">{t('superadmin.price_per_kg', 'Prix / kg')}</th>
                    <th className="px-6 py-4">{t('superadmin.volume_t', 'Volume (T)')}</th>
                    <th className="px-6 py-4">{t('superadmin.ca_per_cycle', 'C.A / Cycle')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-bold">
                  {projectionsData.bulk.map((row: any, i: number) => (
                    <tr key={i} className={`hover:bg-white/[0.02] transition-colors ${i === 1 ? 'bg-brand-emerald/5' : ''}`}>
                      <td className={`px-6 py-5 ${settings.darkMode ? "text-gray-300" : "text-gray-700"}`}>{row.price.toLocaleString()} FCFA</td>
                      <td className={`px-6 py-5 ${settings.darkMode ? "text-gray-300" : "text-gray-700"}`}>{row.volume} T</td>
                      <td className={`px-6 py-5 font-black ${i === 1 ? 'text-brand-emerald' : (settings.darkMode ? "text-white" : "text-brand-dark")}`}>
                        {((row.price * row.volume * 1000) / 1000000).toFixed(0)}M FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-500 flex items-center gap-3 border-b border-white/5 pb-4">
              <TrendingUp size={16} className="text-cyan-500" /> {t('superadmin.scenario_kiosques', 'Kiosques Premium')}
            </h4>
            <div className="overflow-hidden rounded-[2.5rem] border border-white/5 shadow-inner bg-white/[0.02]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-gray-500 font-black text-[9px] uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">{t('superadmin.price_per_kg', 'Prix / kg')}</th>
                    <th className="px-6 py-4">{t('superadmin.volume_t', 'Volume (T)')}</th>
                    <th className="px-6 py-4">{t('superadmin.ca_per_cycle', 'C.A / Cycle')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-bold">
                  {projectionsData.kiosks.map((row: any, i: number) => (
                    <tr key={i} className={`hover:bg-white/[0.02] transition-colors ${i === 1 ? 'bg-cyan-500/5' : ''}`}>
                      <td className={`px-6 py-5 ${settings.darkMode ? "text-gray-300" : "text-gray-700"}`}>{row.price.toLocaleString()} FCFA</td>
                      <td className={`px-6 py-5 ${settings.darkMode ? "text-gray-300" : "text-gray-700"}`}>{row.volume} T</td>
                      <td className={`px-6 py-5 font-black ${i === 1 ? 'text-cyan-400' : (settings.darkMode ? "text-white" : "text-brand-dark")}`}>
                        {((row.price * row.volume * 1000) / 1000000).toFixed(0)}M FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarketPriceComparison = ({ t, isLoadingMarketPrices, settings, onRefresh, i18n, marketPriceData }: any) => {
  const [selectedMarket, setSelectedMarket] = useState<any>(null);

  const marketsWithProducts = (() => {
    const markets: Record<string, any> = {};
    (marketPriceData || []).forEach((product: any) => {
      const productNameFr = product.translations?.fr?.name || product.name;
      const productNameEn = product.translations?.en?.name || product.name;
      (product.markets || []).forEach((m: any) => {
        const marketId = m.marketName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        if (!markets[m.marketName]) {
          markets[m.marketName] = {
            id: marketId,
            name: m.marketName,
            nameEn: m.marketName,
            products: []
          };
        }
        markets[m.marketName].products.push({
          name: productNameFr,
          nameEn: productNameEn,
          price: m.price,
          unit: 'KG',
          lastUpdated: m.lastUpdated ? new Date(m.lastUpdated) : new Date()
        });
      });
    });
    return Object.values(markets).map((market: any) => ({
      ...market,
      displayName: t(`admin.market_${market.id}`, i18n.language === 'fr' ? market.name : market.nameEn),
      productCount: market.products.length
    }));
  })();

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">
            {t("admin.market_prices_title", "Marchés Sénégal - Produits Agricoles")}
          </h2>
          <p className={`font-bold uppercase tracking-widest text-xs ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {t("admin.market_prices_subtitle", "Produits disponibles par marché")}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white" : "bg-white border border-gray-200 hover:bg-gray-50 text-brand-dark shadow-sm"}`}
        >
          <Activity size={18} />
          {t("common.refresh", "Actualiser")}
        </button>
      </div>

      {isLoadingMarketPrices ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-brand-emerald/20 border-t-brand-emerald rounded-full animate-spin mb-4" />
          <p className={`font-black text-xs uppercase tracking-widest ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {t("common.loading", "Chargement...")}
          </p>
        </div>
      ) : marketsWithProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
            <TrendingUp size={40} className={settings.darkMode ? "text-gray-600" : "text-gray-400"} />
          </div>
          <h3 className={`text-xl font-black mb-2 ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
            {t("admin.no_market_data", "Aucune donnée de marché")}
          </h3>
          <p className={`text-sm ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                  className={`rounded-2xl border p-6 cursor-pointer transition-all hover:scale-105 ${settings.darkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:border-brand-emerald/50 shadow-sm hover:shadow-md"}`}
                >
                  <h3 className={`text-lg font-black tracking-tight mb-2 ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
                    {market.displayName}
                  </h3>
                  <div className={`px-3 py-1.5 rounded-lg ${settings.darkMode ? "bg-brand-emerald/10 border border-brand-emerald/20" : "bg-brand-emerald/5 border border-brand-emerald/10"}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${settings.darkMode ? "text-brand-emerald" : "text-brand-emerald"}`}>
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${settings.darkMode ? "bg-white/5 border border-white/10 hover:bg-white/10 text-white" : "bg-white border border-gray-200 hover:bg-gray-50 text-brand-dark"}`}
              >
                <X size={16} />
                {t("admin.back_to_markets", "Retour aux marchés")}
              </button>

              <div
                className={`rounded-[2.5rem] border overflow-hidden ${settings.darkMode ? "bg-white/5 border-white/10" : "bg-white border-gray-100 shadow-sm"}`}
              >
                <div className={`p-8 border-b ${settings.darkMode ? "border-white/10" : "border-gray-100"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-2xl font-black tracking-tight ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
                        {selectedMarket.displayName}
                      </h3>
                      <p className={`text-xs font-black uppercase tracking-widest mt-1 ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {selectedMarket.productCount} {t("admin.products_count", "produits")}
                      </p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl ${settings.darkMode ? "bg-brand-emerald/10 border border-brand-emerald/20" : "bg-brand-emerald/5 border border-brand-emerald/10"}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${settings.darkMode ? "text-brand-emerald" : "text-brand-emerald"}`}>
                        {t("admin.available_products", "Produits disponibles")}
                      </p>
                      <p className={`text-lg font-black ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
                        {selectedMarket.productCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`${settings.darkMode ? "bg-white/5" : "bg-gray-50"}`}>
                      <tr>
                        <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {t("admin.product", "Produit")}
                        </th>
                        <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {t("admin.price", "Prix")}
                        </th>
                        <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {t("admin.last_updated", "Dernière mise à jour")}
                        </th>
                        <th className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {t("admin.status", "Statut")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${settings.darkMode ? "divide-white/5" : "divide-gray-100"}`}>
                      {selectedMarket.products.map((item: any, idx: number) => (
                        <tr key={idx} className={`hover:${settings.darkMode ? "bg-white/5" : "bg-gray-50"} transition-colors`}>
                          <td className={`px-6 py-4 font-black ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="font-black">{i18n.language === 'fr' ? item.name : item.nameEn}</div>
                                <div className={`text-[10px] uppercase tracking-widest ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                  {t("admin.unit", "Unité")}: {item.unit}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-6 py-4 font-black text-right ${settings.darkMode ? "text-white" : "text-brand-dark"}`}>
                            {item.price.toLocaleString()} FCFA
                          </td>
                          <td className={`px-6 py-4 text-xs text-center ${settings.darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${settings.darkMode ? "bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20" : "bg-brand-emerald/5 text-brand-emerald border border-brand-emerald/10"}`}>
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
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

export default AdminDashboard;
