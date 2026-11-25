import React, { useState, useEffect } from 'react';
import wallRoomImg from './assets/wall-room.jpg';
import heroMainImg from './assets/hero-main.jpg';
import artistImg from './assets/artist-anmol.jpg';
import { api } from './api';

// Default initial artworks (Only the real Radha Krishna masterpiece requested by user)
const DEFAULT_ARTWORKS = [
  {
    id: 'art-0',
    title: 'Divine Radha Krishna (Handcrafted Masterpiece)',
    category: 'painting',
    medium: 'Handmade Acrylic, Charcoal & Gold Foil Artwork',
    paper: 'Canvas Board',
    dimensions: 'A3 (11.7 × 16.5 inches)',
    price: 3499,
    image: heroMainImg,
    description: 'Soulful handcrafted painting capturing the divine love of Radha & Krishna with peacock feather details and intricate traditional jewellery embossed with fine craftsmanship.',
    tag: 'Masterpiece',
    listingType: 'sale'
  }
];

// Pure dynamic reviews - no fake demo reviews
const DEFAULT_REVIEWS = [];

// Default initial studio settings
const DEFAULT_SETTINGS = {
  studioName: 'Anmol Art',
  tagline: 'Sketch Studio',
  logoLetter: 'A',
  whatsappNumber: '916352700572',
  instagramHandle: 'anmolart_gallery',
  instagramUrl: 'https://www.instagram.com/anmolart_gallery/',
  artistName: 'Anmol',
  artistTitle: 'Lead Fine Artist & Charcoal Specialist',
  artistBio: 'Main pichle 8 saalon se professional charcoal & graphite portrait artist hoon. Mera har artwork 300 GSM Fabriano acid-free paper par premium pencils se banaya jata hai.',
  announcement: 'Taking Custom Portrait Orders | Free Safe Wooden Packing'
};

const ADMIN_PASSWORD = 'admin'; // Default login password

export default function App() {
  // 1. Dynamic Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('anmol_settings') || localStorage.getItem('kalakriti_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.studioName === 'Kalakriti' || !parsed.studioName) {
          parsed.studioName = 'Anmol Art';
          parsed.logoLetter = 'A';
        }
        if (!parsed.instagramUrl) {
          parsed.instagramUrl = 'https://www.instagram.com/anmolart_gallery/';
          parsed.instagramHandle = 'anmolart_gallery';
        }
        if (parsed.whatsappNumber === '919876543210' || !parsed.whatsappNumber || parsed.whatsappNumber === '9876543210') {
          parsed.whatsappNumber = '916352700572';
        }
        return parsed;
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 2. Dynamic Artworks State (Only real artworks - no fake Unsplash demo cards)
  const [artworks, setArtworks] = useState(() => {
    try {
      const saved = localStorage.getItem('kalakriti_artworks');
      if (saved) {
        let parsed = JSON.parse(saved);
        // Filter out all fake demo items (art-1..art-6, comp-1..comp-6)
        parsed = parsed.filter(item => item.id === 'art-0' || (!item.id.match(/^art-[1-6]$/) && !item.id.match(/^comp-[1-6]$/)));
        if (!parsed.some(a => a.id === 'art-0')) {
          parsed = [DEFAULT_ARTWORKS[0], ...parsed];
        }
        return parsed;
      }
      return DEFAULT_ARTWORKS;
    } catch {
      return DEFAULT_ARTWORKS;
    }
  });

  // 3. Dynamic Customer Orders State (Pure real orders only)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('kalakriti_orders');
      if (saved) {
        let parsed = JSON.parse(saved);
        return parsed.filter(o => o.id !== 'ORD-101');
      }
      return [];
    } catch {
      return [];
    }
  });

  // 4. Admin Auth & Modals State
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('kalakriti_is_admin') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('artworks'); // 'artworks', 'orders', 'reviews', 'settings'
  const [adminArtworkFilter, setAdminArtworkFilter] = useState('all'); // 'all', 'sale', 'completed'

  // Artwork Add/Edit Modal
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [artworkForm, setArtworkForm] = useState({
    id: null,
    title: '',
    category: 'portrait',
    medium: 'Natural Charcoal & Pencil',
    paper: '300 GSM Fabriano Paper',
    dimensions: 'A3 (11.7 × 16.5 inches)',
    price: 1999,
    image: '',
    description: '',
    tag: 'Original Piece',
    listingType: 'sale', // 'sale' | 'completed'
    clientCity: '',
    deliveredDate: ''
  });

  // Customer Shopping State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('kalakriti_react_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [completedCategory, setCompletedCategory] = useState('all');
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // View on Wall State
  const [wallArtwork, setWallArtwork] = useState(null);
  const [wallFrameStyle, setWallFrameStyle] = useState('teak');
  const [wallScale, setWallScale] = useState('A3');

  // Custom order configurator state
  const [customMedium, setCustomMedium] = useState('pencil');
  const [customSize, setCustomSize] = useState('A4');
  const [customFaces, setCustomFaces] = useState('1');
  const [customFrame, setCustomFrame] = useState('none');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFileName, setPhotoFileName] = useState('');

  // Checkout inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // 5. Dynamic Customer Reviews State (Only real customer/admin reviews)
  const [reviews, setReviews] = useState(() => {
    try {
      const saved = localStorage.getItem('anmol_reviews') || localStorage.getItem('kalakriti_reviews');
      if (saved) {
        let parsed = JSON.parse(saved);
        return parsed.filter(r => !['rev-1', 'rev-2', 'rev-3', 'rev-test-101'].includes(r.id));
      }
      return [];
    } catch {
      return [];
    }
  });

  // Customer Feedback Modal State
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    city: '',
    stars: 5,
    item: 'Custom Portrait Order',
    quote: ''
  });

  // 6. MySQL Database Connection Status
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    mysql: false,
    checked: false,
    database: 'anmol_art_db',
    label: 'Connecting to Database...'
  });

  // Fetch all initial data from MySQL backend
  const loadDataFromBackend = async () => {
    try {
      const health = await api.checkHealth();
      if (health.connected && health.mysql) {
        setDbStatus({
          connected: true,
          mysql: true,
          checked: true,
          database: health.data?.database || 'anmol_art_db',
          label: 'MySQL Connected (anmol_art_db)'
        });

        const [dbSettings, dbArtworks, dbOrders, dbReviews] = await Promise.all([
          api.getSettings(),
          api.getArtworks(),
          api.getOrders(),
          api.getReviews(),
        ]);

        if (dbSettings) {
          if (dbSettings.whatsappNumber === '919876543210' || !dbSettings.whatsappNumber) {
            dbSettings.whatsappNumber = '916352700572';
          }
          setSettings(dbSettings);
        }
        if (dbArtworks) {
          const cleanArtworks = dbArtworks
            .filter(item => item.id === 'art-0' || (!item.id.match(/^art-[1-6]$/) && !item.id.match(/^comp-[1-6]$/)))
            .map((a) => {
              if (a.id === 'art-0' && (!a.image || a.image.includes('hero-main'))) {
                return { ...a, image: heroMainImg };
              }
              return a;
            });
          setArtworks(cleanArtworks);
        }
        if (dbOrders) {
          setOrders(dbOrders.filter(o => o.id !== 'ORD-101'));
        }
        if (dbReviews) {
          setReviews(dbReviews.filter(r => !['rev-1', 'rev-2', 'rev-3', 'rev-test-101'].includes(r.id)));
        }

        // Auto-sync any reviews added previously in Local Storage Mode up to MySQL
        try {
          const localReviews = JSON.parse(localStorage.getItem('anmol_reviews') || '[]');
          const dbReviewIds = new Set((dbReviews || []).map((r) => r.id));
          for (const lr of localReviews) {
            if (!dbReviewIds.has(lr.id) && !['rev-1', 'rev-2', 'rev-3', 'rev-test-101'].includes(lr.id)) {
              api.createReview(lr).catch(() => {});
            }
          }
        } catch {}

        // Auto-sync any artworks added previously in Local Storage Mode up to MySQL
        try {
          const localArtworks = JSON.parse(localStorage.getItem('kalakriti_artworks') || '[]');
          const dbArtIds = new Set((dbArtworks || []).map((a) => a.id));
          for (const la of localArtworks) {
            if (!dbArtIds.has(la.id) && la.id !== 'art-0' && !la.id.match(/^art-[1-6]$/)) {
              api.createArtwork(la).catch(() => {});
            }
          }
        } catch {}
      } else if (health.connected && !health.mysql) {
        setDbStatus({
          connected: true,
          mysql: false,
          checked: true,
          database: 'anmol_art_db',
          label: 'MySQL Offline (Start XAMPP MySQL)'
        });
      } else {
        setDbStatus({
          connected: false,
          mysql: false,
          checked: true,
          database: 'anmol_art_db',
          label: 'Local Storage Mode'
        });
      }
    } catch {
      setDbStatus({
        connected: false,
        mysql: false,
        checked: true,
        database: 'anmol_art_db',
        label: 'Local Storage Mode'
      });
    }
  };

  useEffect(() => {
    loadDataFromBackend();
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('anmol_settings', JSON.stringify(settings));
    localStorage.setItem('kalakriti_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('kalakriti_artworks', JSON.stringify(artworks));
  }, [artworks]);

  useEffect(() => {
    localStorage.setItem('kalakriti_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('anmol_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('kalakriti_react_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kalakriti_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  // Secret Admin Access via URL hash (#admin) or Keyboard (Ctrl+Shift+A / Alt+A)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setIsAdminLoginOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);

    const handleKeyDown = (e) => {
      // Ctrl+Shift+A or Alt+A opens Admin Login secretly
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmitFeedback = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!feedbackForm.name.trim()) {
      showToast('⚠️ Kripya apna Naam dalein!');
      return;
    }
    if (!feedbackForm.quote.trim()) {
      showToast('⚠️ Kripya apna Feedback / Review description likhein!');
      return;
    }

    const newRev = {
      id: 'rev-' + Date.now(),
      name: feedbackForm.name.trim(),
      city: feedbackForm.city.trim() || 'India',
      stars: feedbackForm.stars || 5,
      item: feedbackForm.item.trim() || 'Custom Artwork',
      quote: feedbackForm.quote.trim(),
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    // 1. Immediately update state
    setReviews((prev) => [newRev, ...prev.filter((r) => r.id !== newRev.id)]);

    // 2. Immediately write to localStorage so page refresh/restart never loses it
    try {
      const saved = JSON.parse(localStorage.getItem('anmol_reviews') || '[]');
      const updated = [newRev, ...saved.filter((r) => r.id !== newRev.id)];
      localStorage.setItem('anmol_reviews', JSON.stringify(updated));
      localStorage.setItem('kalakriti_reviews', JSON.stringify(updated));
    } catch {}

    setIsFeedbackOpen(false);
    setFeedbackForm({
      name: '',
      city: '',
      stars: 5,
      item: 'Custom Portrait Order',
      quote: ''
    });

    // 3. Save to MySQL via API
    const res = await api.createReview(newRev);
    if (res && res.success !== false) {
      showToast('🎉 Shukriya! Review MySQL Database me live save ho gaya hai.');
    } else {
      showToast('🎉 Shukriya! Review save ho gaya hai.');
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- Admin Login & Logout ---
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (loginPasswordInput.trim() === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setIsAdminLoginOpen(false);
      setLoginPasswordInput('');
      setLoginError('');
      setIsAdminDashboardOpen(true);
      showToast('Welcome, Artist! Admin Mode Activated.');
    } else {
      setLoginError('Invalid password. Default password is: admin');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setIsAdminDashboardOpen(false);
    showToast('Logged out of Admin Mode.');
  };

  // --- Artwork CRUD Operations ---
  const handleOpenAddArtwork = (type = 'sale') => {
    setArtworkForm({
      id: null,
      title: '',
      category: 'portrait',
      medium: 'Natural Charcoal & Pencil',
      paper: '300 GSM Fabriano Grain Sheet',
      dimensions: 'A3 (11.7 × 16.5 inches)',
      price: 1999,
      image: type === 'completed' ? '/showcase/work-1.jpg' : 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      description: type === 'completed'
        ? 'Custom handmade client portrait drawn from reference photo. Safely delivered to client.'
        : 'Handmade portrait with high-contrast shading and fine smudge-free fixative varnish.',
      tag: type === 'completed' ? 'Delivered Order' : 'Original Piece',
      listingType: type,
      clientCity: type === 'completed' ? 'Pune, Maharashtra' : '',
      deliveredDate: type === 'completed' ? 'November 2026' : ''
    });
    setIsArtworkModalOpen(true);
  };

  const handleOpenEditArtwork = (art) => {
    setArtworkForm({
      ...art,
      listingType: art.listingType || 'sale',
      clientCity: art.clientCity || '',
      deliveredDate: art.deliveredDate || ''
    });
    setIsArtworkModalOpen(true);
  };

  const handleToggleListingType = (artId) => {
    setArtworks((prev) =>
      prev.map((item) => {
        if (item.id === artId) {
          const nextType = item.listingType === 'completed' ? 'sale' : 'completed';
          api.updateArtworkListingType(artId, nextType);
          showToast(`"${item.title}" moved to ${nextType === 'completed' ? 'Completed Orders Portfolio' : 'For Sale'} (MySQL).`);
          return {
            ...item,
            listingType: nextType,
            tag: item.tag === 'Delivered Order' || item.tag === 'Client Commission' ? 'Original Piece' : (nextType === 'completed' ? 'Delivered Order' : item.tag)
          };
        }
        return item;
      })
    );
  };

  const handlePromoteOrderToPortfolio = (ord) => {
    setArtworkForm({
      id: null,
      title: `${ord.customerName}'s Custom Portrait`,
      category: 'custom',
      medium: 'Custom Charcoal & Graphite',
      paper: '300 GSM Fabriano Acid-Free',
      dimensions: 'A3 (11.7 × 16.5 inches)',
      price: ord.total || 2499,
      image: '',
      description: `Custom portrait commissioned by ${ord.customerName} (${ord.customerCity}). ${ord.items}. Finished and delivered.`,
      tag: 'Complete Order',
      listingType: 'completed',
      clientCity: ord.customerCity || 'India',
      deliveredDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    });
    setIsArtworkModalOpen(true);
  };

  const handleSaveArtwork = async (e) => {
    e.preventDefault();
    if (!artworkForm.title || !artworkForm.price || !artworkForm.image) {
      alert('Kripya Title, Price aur Image URL/File zaroor dalein.');
      return;
    }

    if (artworkForm.id) {
      // Edit existing
      const updated = { ...artworkForm, price: Number(artworkForm.price) };
      setArtworks((prev) =>
        prev.map((item) => (item.id === artworkForm.id ? updated : item))
      );
      setIsArtworkModalOpen(false);
      const res = await api.updateArtwork(artworkForm.id, updated);
      if (res && res.success !== false) {
        showToast(`✓ Artwork "${artworkForm.title}" MySQL Database me update ho gaya!`);
      } else {
        showToast(`Artwork update saved locally.`);
      }
    } else {
      // Add new
      const newArt = {
        ...artworkForm,
        id: 'art-' + Date.now(),
        price: Number(artworkForm.price)
      };
      setArtworks((prev) => [newArt, ...prev]);
      setIsArtworkModalOpen(false);
      const res = await api.createArtwork(newArt);
      if (res && res.success !== false) {
        showToast(`✓ New artwork "${newArt.title}" MySQL Database me save ho gaya!`);
      } else {
        showToast(`Artwork locally save ho gaya.`);
      }
    }
  };

  const handleDeleteArtwork = (artId, title) => {
    if (window.confirm(`Kya aap sach me "${title}" sketch ko delete karna chahte hain?`)) {
      setArtworks((prev) => prev.filter((item) => item.id !== artId));
      api.deleteArtwork(artId);
      showToast(`Sketch "${title}" deleted from MySQL.`);
    }
  };

  // --- Orders CRUD ---
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    api.updateOrderStatus(orderId, newStatus);
    showToast(`Order ${orderId} marked as ${newStatus} (MySQL).`);
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Kya aap is order record ko delete karna chahte hain?')) {
      setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
      api.deleteOrder(orderId);
      showToast('Order record deleted from MySQL.');
    }
  };

  // --- Settings Form Update ---
  const handleSaveSettings = (e) => {
    e.preventDefault();
    api.updateSettings(settings);
    showToast('Studio settings saved to MySQL Database!');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Kya aap saare sketches aur settings ko wapas Default par reset karna chahte hain?')) {
      setArtworks(DEFAULT_ARTWORKS);
      setSettings(DEFAULT_SETTINGS);
      setReviews([]);
      setOrders([]);
      try {
        localStorage.removeItem('kalakriti_artworks');
        localStorage.removeItem('kalakriti_orders');
        localStorage.removeItem('anmol_reviews');
        localStorage.removeItem('kalakriti_reviews');
      } catch {}
      showToast('Reset to original clean data successfully!');
    }
  };

  // --- Custom Portrait Dynamic Price Calculation ---
  const calculateCustomPrice = () => {
    let base = 1499;
    if (customMedium === 'charcoal') base += 200;
    if (customMedium === 'color') base += 500;

    if (customSize === 'A3') base += 600;
    if (customSize === 'A2') base += 1300;

    const f = parseInt(customFaces, 10);
    if (f === 2) base += 600;
    if (f === 3) base += 1100;
    if (f >= 4) base += 1600;

    return base;
  };

  const customPrice = calculateCustomPrice();

  // --- Cart Actions ---
  const handleAddToCart = (artwork) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.id === artwork.id);
      if (index > -1) {
        return prev.map((item, i) => (i === index ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { ...artwork, qty: 1, isCustom: false }];
    });
    showToast(`"${artwork.title}" added to cart!`);
  };

  const handleAddCustomToCart = () => {
    const mediumNames = { pencil: 'Graphite Pencil', charcoal: 'Dark Charcoal', color: 'Color Pencil' };
    const newItem = {
      id: 'custom-' + Date.now(),
      title: `Custom ${mediumNames[customMedium]} Portrait`,
      medium: mediumNames[customMedium],
      dimensions: `${customSize} Size`,
      frame: 'Protective Roll Tube',
      price: customPrice,
      image: photoPreview || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
      qty: 1,
      isCustom: true
    };
    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
    showToast('Custom Portrait added to cart!');
  };

  const handleOrderCustomWhatsApp = () => {
    const mediumNames = { pencil: 'Graphite Pencil', charcoal: 'Dark Charcoal', color: 'Color Pencil' };
    
    // Record into orders manager as a new custom order inquiry
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      customerName: 'WhatsApp Custom Customer',
      customerPhone: 'In WhatsApp Chat',
      customerCity: 'To be confirmed',
      items: `Custom ${mediumNames[customMedium]} (${customSize}, ${customFaces} Face(s), Roll Tube)`,
      total: customPrice,
      status: 'New'
    };
    setOrders((prev) => [newOrder, ...prev]);
    api.createOrder(newOrder);

    const msg = `*Hello ${settings.studioName}! I want to order a Custom Portrait:*\n\n` +
      `🎨 *Style:* ${mediumNames[customMedium]}\n` +
      `📐 *Size:* ${customSize}\n` +
      `👥 *Faces:* ${customFaces} Person(s)\n` +
      `📦 *Packing:* Protective Roll Tube (Free Safe Delivery)\n` +
      `💰 *Estimated Total:* ₹${customPrice.toLocaleString('en-IN')}\n\n` +
      (photoPreview ? `📸 *Note:* I have uploaded reference photo ready to share.` : `📸 Sharing my reference photo here for confirmation.`);

    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDirectWhatsAppBuy = (artwork) => {
    // Record order in manager
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      customerName: 'Direct WhatsApp Buyer',
      customerPhone: 'In WhatsApp Chat',
      customerCity: 'Direct Delivery',
      items: `1x ${artwork.title} (${artwork.dimensions})`,
      total: artwork.price,
      status: 'New'
    };
    setOrders((prev) => [newOrder, ...prev]);
    api.createOrder(newOrder);

    const msg = `*Hello ${settings.studioName}! I want to buy this ready artwork:*\n\n` +
      `🎨 *Title:* ${artwork.title}\n` +
      `📐 *Size:* ${artwork.dimensions}\n` +
      `💰 *Price:* ₹${artwork.price}\n\n` +
      `Please let me know how to proceed!`;
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const totalCartPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Pure immutable quantity update — solves the 1 -> 3 jump bug!
  const updateQty = (index, delta) => {
    setCart((prev) => {
      return prev
        .map((item, i) => (i === index ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0);
    });
  };

  const removeCartItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // Soft pleasant audio chime when order placed
  const playOrderChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Ignored if browser blocks audio autoplay
    }
  };

  // Direct Cart Order: Saves into Orders Manager (Admin Panel), does NOT redirect to WhatsApp!
  const handleDirectCartOrder = () => {
    if (cart.length === 0) return;
    const name = customerName.trim();
    const phone = customerPhone.trim();
    const city = customerCity.trim();

    if (!name) {
      showToast('⚠️ Kripya apna Naam (Customer Name) dalein!');
      return;
    }
    if (!phone) {
      showToast('⚠️ Kripya apna Mobile number dalein!');
      return;
    }

    const itemsSummary = cart.map(item => `• ${item.qty}x ${item.title} (${item.dimensions}) - ₹${item.price * item.qty}`).join('\n');
    const itemsShort = cart.map(item => `${item.qty}x ${item.title}`).join(', ');

    // Save into Orders Manager for Admin
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      customerName: name,
      customerPhone: phone,
      customerCity: city || 'Not specified',
      items: itemsShort,
      total: totalCartPrice,
      status: 'New',
      source: 'Direct Website Order'
    };

    setOrders((prev) => [newOrder, ...prev]);
    api.createOrder(newOrder);
    playOrderChime();

    // Show Confirmation Dialog & clear inputs
    setPlacedOrder(newOrder);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerCity('');
    setIsCartOpen(false);

    showToast(`🎉 Order #${newOrder.id} placed! Sent to Admin Panel.`);
  };

  // Helper to determine if an artwork is a completed custom order
  const isCustomCompleted = (art) => {
    if (!art) return false;
    const cat = (art.category || '').toLowerCase();
    const type = (art.listingType || '').toLowerCase();
    const tag = (art.tag || '').toLowerCase();
    return cat === 'custom' || type === 'completed' || tag.includes('order') || tag.includes('delivered');
  };

  // Separate Artworks into "For Sale" vs "Completed Custom Orders"
  const saleArtworks = artworks.filter(art => !isCustomCompleted(art));
  const completedArtworks = artworks.filter(art => isCustomCompleted(art));

  // Filter artworks according to active category tab (all, sketch, painting, 3d, custom)
  const filteredArtworks = artworks.filter(art => {
    const cat = (art.category || '').toLowerCase();
    const isCustom = isCustomCompleted(art);

    if (activeCategory === 'all') return true;
    if (activeCategory === 'custom') return isCustom;
    if (activeCategory === 'sketch') {
      return !isCustom && (cat === 'sketch' || (!['painting', '3d'].includes(cat) && art.id !== 'art-0'));
    }
    if (activeCategory === 'painting') {
      return !isCustom && (cat === 'painting' || art.id === 'art-0');
    }
    if (activeCategory === '3d') {
      return !isCustom && (cat === '3d' || cat === '3d art');
    }
    return cat === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1816] flex flex-col font-sans overflow-x-hidden selection:bg-[#1A1816] selection:text-white">
      
      {/* ======================================================== */}
      {/* ADMIN STATUS BAR (VISIBLE ONLY WHEN ARTIST IS LOGGED IN) */}
      {/* ======================================================== */}
      {isAdmin && (
        <div className="bg-[#B87333] text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md z-50">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1">
              <span>👑 Artist Admin Mode Active</span>
            </span>
            <span className="hidden sm:inline opacity-80">| Managing: <strong>{settings.studioName}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAdminTab('artworks');
                setIsAdminDashboardOpen(true);
              }}
              className="px-3 py-1 bg-white text-[#1A1816] font-bold rounded-lg hover:bg-[#FAF7F2] transition shadow-sm text-xs"
            >
              📊 Open Admin Dashboard ({orders.length} Orders)
            </button>
            <button
              onClick={handleOpenAddArtwork}
              className="px-3 py-1 bg-[#1A1816] text-white font-bold rounded-lg hover:bg-black transition shadow-sm text-xs"
            >
              + Add New Sketch
            </button>
            <button
              onClick={handleAdminLogout}
              className="text-white/80 hover:text-white underline text-xs ml-1"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Top Banner (Dynamic from Settings) */}
      <div className="bg-[#1A1816] text-[#FAF7F2] text-[11px] sm:text-xs py-2 px-3 sm:px-4 text-center tracking-wide flex justify-center items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
        <span className="truncate sm:overflow-visible">{settings.announcement}</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E5DF] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Dynamic Logo & Name */}
          <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt={settings.studioName} 
                className="w-full h-full object-contain filter drop-shadow group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-[#1A1816] items-center justify-center font-serif text-lg sm:text-xl font-bold bg-[#1A1816] text-[#FAF7F2] group-hover:bg-[#B87333] transition">
                {settings.logoLetter || settings.studioName.charAt(0)}
              </div>
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight block leading-none">
                {settings.studioName}
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-widest text-[#6B6560] uppercase font-semibold">
                {settings.tagline}
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium text-[#3D3935]">
            <a href="#artworks" onClick={() => setActiveCategory('all')} className="hover:text-[#B87333] transition flex items-center gap-1.5">
              <span>🖼️ Gallery</span>
              <span className="bg-[#1A1816]/10 text-[#1A1816] text-[10px] font-bold px-1.5 py-0.5 rounded-full">{artworks.length}</span>
            </a>
            <a 
              href="#artworks" 
              onClick={() => setActiveCategory('custom')}
              className="hover:text-[#B87333] transition flex items-center gap-1.5 text-emerald-800 font-bold"
            >
              <span>🏆 Custom Orders</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{completedArtworks.length}</span>
            </a>
            <a href="#custom-order" className="hover:text-[#B87333] transition flex items-center gap-1.5">
              <span>✏️ Custom Portrait</span>
              <span className="bg-[#B87333] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Order</span>
            </a>
            <a href="#about" className="hover:text-[#B87333] transition">About Artist</a>
            <a href="#reviews" className="hover:text-[#B87333] transition">Reviews</a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href={`https://wa.me/${settings.whatsappNumber}`} 
              target="_blank" 
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-emerald-600/30 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-full transition"
            >
              <span>💬 Chat with Artist</span>
            </a>

            {/* Admin Dashboard button (ONLY visible when artist is logged in) */}
            {isAdmin && (
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#B87333] hover:bg-[#8C5220] text-white text-xs font-bold rounded-full shadow cursor-pointer transition"
              >
                <span>👑 Admin Dashboard</span>
              </button>
            )}

            {/* Cart Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full border border-[#A49E97]/40 hover:border-[#1A1816] hover:bg-[#1A1816] hover:text-white transition duration-200"
              aria-label="Open Cart"
            >
              <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span className="absolute -top-1 -right-1 bg-[#B87333] text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#1A1816] hover:bg-[#E8E5DF] transition"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#FAF7F2] border-b border-[#E8E5DF] px-5 py-4 space-y-3 text-sm font-medium animate-fadeIn">
            <a href="#artworks" onClick={() => { setActiveCategory('all'); setIsMobileMenuOpen(false); }} className="block py-1.5 hover:text-[#B87333] transition flex items-center justify-between">
              <span>🖼️ All Artworks Gallery</span>
              <span className="text-xs bg-[#1A1816]/10 px-2 py-0.5 rounded-full font-bold">{artworks.length}</span>
            </a>
            <a href="#artworks" onClick={() => { setActiveCategory('custom'); setIsMobileMenuOpen(false); }} className="block py-1.5 text-emerald-800 font-bold transition flex items-center justify-between">
              <span>🏆 Completed Custom Orders</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{completedArtworks.length}</span>
            </a>
            <a href="#custom-order" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-[#B87333] font-bold transition flex items-center justify-between">
              <span>✏️ Order Custom Portrait (Photo to Sketch)</span>
              <span className="text-[10px] bg-[#B87333] text-white px-1.5 py-0.5 rounded">Hot</span>
            </a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-[#B87333] transition">
              🎨 About Artist
            </a>
            <a href="#reviews" onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 hover:text-[#B87333] transition">
              ⭐ Customer Reviews
            </a>
            <a
              href={settings.instagramUrl || "https://www.instagram.com/anmolart_gallery/"}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-pink-700 font-bold hover:text-pink-800 transition flex items-center justify-between border-t border-[#E8E5DF] pt-2.5"
            >
              <span className="flex items-center gap-2">
                <span>📸</span>
                <span>Follow on Instagram (@anmolart_gallery)</span>
              </span>
              <span className="text-xs">↗</span>
            </a>
            
            {/* Mobile Artist Mode & Feedback Links */}
            <div className="pt-2.5 border-t border-[#E8E5DF] flex flex-col gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setFeedbackForm({
                    name: '',
                    city: '',
                    stars: 5,
                    item: 'Custom Portrait Order',
                    quote: ''
                  });
                  setIsFeedbackOpen(true);
                }}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>⭐ Give Order Feedback / Review</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (isAdmin) {
                    setIsAdminDashboardOpen(true);
                  } else {
                    setIsAdminLoginOpen(true);
                  }
                }}
                className="w-full py-2 bg-[#FAF7F2] hover:bg-[#E8E5DF] text-[#1A1816] border border-[#E8E5DF] rounded-xl font-bold flex items-center justify-center gap-1.5 transition"
              >
                <span>{isAdmin ? '👑 Open Artist Dashboard' : '🔒 Artist Admin Login'}</span>
              </button>
            </div>

            <div className="pt-2">
              <a 
                href={`https://wa.me/${settings.whatsappNumber}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex justify-center items-center gap-2 py-2.5 bg-emerald-600 text-white rounded-xl font-medium text-xs shadow"
              >
                <span>💬 Chat directly with Artist on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <section className="py-10 sm:py-16 md:py-20 border-b border-[#E8E5DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Copy */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-[#E8E5DF] text-[#3D3935] text-xs font-medium">
                  <span>✨ 100% Hand-Drawn with Pencil & Charcoal</span>
                </div>
                
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1A1816] leading-[1.2] sm:leading-[1.15]">
                  Turning precious memories into <span className="italic text-[#B87333]">timeless hand-drawn art.</span>
                </h1>
                
                <p className="text-[#6B6560] text-sm sm:text-base lg:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                  Discover authentic original sketches ready to hang, or turn your favorite personal photos into hyper-realistic portraits. Framed carefully and delivered safely across India.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-2">
                  <a 
                    href="#custom-order" 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 bg-[#1A1816] text-white rounded-full text-sm font-semibold hover:bg-[#B87333] hover:shadow-lg transition active:scale-95"
                  >
                    <span>Order Custom Portrait</span>
                    <span>→</span>
                  </a>
                  <a 
                    href="#artworks" 
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 border border-[#A49E97] text-[#1A1816] rounded-full text-sm font-semibold hover:border-[#1A1816] hover:bg-white transition active:scale-95"
                  >
                    <span>Browse Available Art</span>
                  </a>
                </div>

                {/* Trust stats */}
                <div className="pt-6 border-t border-[#E8E5DF] grid grid-cols-3 gap-2 sm:gap-4 text-center sm:text-left">
                  <div className="p-2 bg-white/60 sm:bg-transparent rounded-xl">
                    <p className="text-lg sm:text-2xl font-bold font-serif text-[#1A1816]">450+</p>
                    <p className="text-[10px] sm:text-xs text-[#6B6560]">Delivered</p>
                  </div>
                  <div className="p-2 bg-white/60 sm:bg-transparent rounded-xl">
                    <p className="text-lg sm:text-2xl font-bold font-serif text-[#1A1816]">4.9 ★</p>
                    <p className="text-[10px] sm:text-xs text-[#6B6560]">Rating</p>
                  </div>
                  <div className="p-2 bg-white/60 sm:bg-transparent rounded-xl">
                    <p className="text-lg sm:text-2xl font-bold font-serif text-[#1A1816]">Zero Damage</p>
                    <p className="text-[10px] sm:text-xs text-[#6B6560]">Safe Box</p>
                  </div>
                </div>
              </div>

              {/* Visual Card with View on Wall button */}
              <div className="lg:col-span-5 relative mt-4 lg:mt-0">
                <div className="relative mx-auto max-w-xs sm:max-w-md bg-white p-2.5 sm:p-3 rounded-2xl shadow-xl border border-[#E8E5DF]">
                  <div className="overflow-hidden rounded-xl aspect-[4/5] bg-[#E8E5DF] relative group">
                    <img 
                      src={artworks[0]?.image || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'} 
                      alt="Detailed Charcoal Sketch" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-xl text-left border border-white/60 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-[#1A1816] truncate max-w-[170px]">{artworks[0]?.title || 'Portrait Sketch'}</p>
                        <p className="text-[10px] text-[#6B6560]">{artworks[0]?.dimensions || 'A3 Size'}</p>
                      </div>
                      <button
                        onClick={() => setWallArtwork(artworks[0])}
                        className="px-2.5 py-1.5 bg-[#1A1816] text-white hover:bg-[#B87333] rounded-lg text-[11px] font-bold flex items-center gap-1 shadow transition"
                      >
                        <span>🖼️ View on Wall</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Available Sketches Store (100% Dynamic with Admin Edit & Delete!) */}
        <section id="artworks" className="py-12 sm:py-16 md:py-20 border-b border-[#E8E5DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-wider text-[#B87333] uppercase">Original Artworks</span>
                  {isAdmin && (
                    <button
                      onClick={handleOpenAddArtwork}
                      className="px-3 py-1 bg-[#1A1816] text-white rounded-full text-xs font-bold hover:bg-[#B87333] transition shadow flex items-center gap-1"
                    >
                      <span>+ Add Sketch</span>
                    </button>
                  )}
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1816] mt-1">
                  Available Ready Sketches ({filteredArtworks.length})
                </h2>
                <p className="text-[#6B6560] text-xs sm:text-sm mt-1">Single-piece original handmade sketches ready for direct delivery.</p>
              </div>

              {/* Horizontal Scrollable Categories on Mobile */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none sm:flex-wrap">
                {[
                  { id: 'all', label: 'All Artworks' },
                  { id: 'sketch', label: 'Sketch' },
                  { id: 'painting', label: 'Painting' },
                  { id: '3d', label: '3D' },
                  { id: 'custom', label: 'Custom' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full border text-xs font-bold uppercase transition flex-shrink-0 flex items-center gap-1.5 ${
                      activeCategory === cat.id
                        ? 'bg-[#1A1816] text-white border-[#1A1816] shadow-sm'
                        : 'bg-white text-[#3D3935] border-[#E8E5DF] hover:border-[#1A1816]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {cat.id === 'custom' && completedArtworks.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        activeCategory === cat.id ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {completedArtworks.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {filteredArtworks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E5DF] p-8">
                <p className="font-serif text-xl font-bold text-[#1A1816]">
                  {activeCategory === 'custom' ? 'Abhi koi custom complete order nahi hai.' : 'Koi artwork nahi mila is category me.'}
                </p>
                <p className="text-xs text-[#6B6560] mt-1">
                  {activeCategory === 'custom' ? 'Admin panel se custom order upload karein ya doosri category chunein.' : 'Kripya koi doosri category select karein ya naya sketch add karein.'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenAddArtwork(activeCategory === 'custom' ? 'completed' : 'sale')}
                    className="mt-4 px-5 py-2.5 bg-[#B87333] text-white rounded-xl text-xs font-bold"
                  >
                    {activeCategory === 'custom' ? '+ Upload Complete Order' : '+ Add New Artwork'}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
                {filteredArtworks.map((item) => {
                  const isCompleted = isCustomCompleted(item);
                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-[#E8E5DF] overflow-hidden flex flex-col justify-between hover:shadow-lg transition group relative">
                      
                      {/* Admin Action Buttons (Visible only when logged in) */}
                      {isAdmin && (
                        <div className="absolute top-3 right-3 z-20 flex gap-1.5 bg-black/80 backdrop-blur-md p-1.5 rounded-xl shadow-lg">
                          <button
                            onClick={() => handleOpenEditArtwork(item)}
                            className="px-2.5 py-1 bg-white/90 hover:bg-white text-[#1A1816] text-[10px] font-bold rounded-lg transition"
                            title="Edit this artwork"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteArtwork(item.id, item.title)}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition"
                            title="Delete this artwork"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}

                      {/* Artwork Image Container */}
                      <div className="relative aspect-[4/5] bg-[#E8E5DF] overflow-hidden cursor-pointer">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          onClick={() => setSelectedArtwork(item)}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                          loading="lazy"
                        />
                        
                        <div className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow ${
                          isCompleted ? 'bg-emerald-700 text-white' : 'bg-[#1A1816]/90 text-[#FAF7F2]'
                        }`}>
                          {isCompleted ? '✓ Complete Order' : (item.tag || 'Original Piece')}
                        </div>

                        {/* Quick "See on Wall" Floating Action Pill (When not in admin mode) */}
                        {!isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setWallArtwork(item);
                            }}
                            className="absolute top-3 right-3 bg-white/95 hover:bg-[#1A1816] text-[#1A1816] hover:text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow flex items-center gap-1 transition"
                            title="See how this artwork looks on your wall"
                          >
                            <span>🖼️ See on Wall</span>
                          </button>
                        )}
                      </div>

                      {/* Artwork Details */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[#6B6560] mb-1">
                            <span className="uppercase font-semibold text-[#B87333]">{item.category}</span>
                            <span>{item.dimensions}</span>
                          </div>
                          <h3 className="font-serif text-lg font-bold text-[#1A1816]">{item.title}</h3>
                          <p className="text-xs text-[#6B6560] mt-1 line-clamp-2">{item.description}</p>
                        </div>

                        {isCompleted ? (
                          <div className="pt-4 mt-4 border-t border-[#E8E5DF] space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Status</span>
                                <span className="font-serif text-base sm:text-lg font-bold text-emerald-800 flex items-center gap-1.5">
                                  <span>✓</span>
                                  <span>Complete Order</span>
                                </span>
                              </div>
                              
                              <button
                                onClick={() => setWallArtwork(item)}
                                className="text-xs font-semibold text-[#B87333] hover:underline flex items-center gap-1"
                              >
                                <span>Room Preview</span>
                                <span>→</span>
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <a 
                                href="#custom-order"
                                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 text-center"
                              >
                                <span>✏️ Order Similar Custom Sketch</span>
                              </a>
                              <button 
                                onClick={() => {
                                  const msg = `*Hello ${settings.studioName}! I saw your completed custom order "${item.title}" on your website and want to order a similar custom portrait!*`;
                                  window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-600/30 transition text-xs font-bold"
                                title="Inquire on WhatsApp"
                                aria-label="Inquire on WhatsApp"
                              >
                                💬
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="pt-4 mt-4 border-t border-[#E8E5DF] space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-[#6B6560] block uppercase">Price</span>
                                <span className="font-serif text-xl font-bold text-[#1A1816]">₹{item.price.toLocaleString('en-IN')}</span>
                              </div>
                              
                              <button
                                onClick={() => setWallArtwork(item)}
                                className="text-xs font-semibold text-[#B87333] hover:underline flex items-center gap-1"
                              >
                                <span>Room Preview</span>
                                <span>→</span>
                              </button>
                            </div>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleAddToCart(item)}
                                className="flex-1 py-2.5 bg-[#1A1816] text-white rounded-xl text-xs font-semibold hover:bg-[#B87333] transition active:scale-95 flex items-center justify-center gap-1"
                              >
                                <span>Add to Cart</span>
                              </button>
                              <button 
                                onClick={() => handleDirectWhatsAppBuy(item)}
                                className="p-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl border border-emerald-600/30 transition text-xs"
                                title="WhatsApp Order"
                                aria-label="Order on WhatsApp"
                              >
                                💬
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Custom Order Studio (Photo to Sketch) */}
        <section id="custom-order" className="py-12 sm:py-16 md:py-24 bg-white border-b border-[#E8E5DF]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-[#B87333]/10 text-[#B87333] text-xs font-bold uppercase tracking-wider mb-2">Personalized Commission</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1816]">Get a Custom Portrait Made From Your Photo</h2>
              <p className="text-[#6B6560] text-xs sm:text-sm mt-1 sm:mt-2">Turn any couple, family, wedding or pet photo into a realistic handmade pencil sketch.</p>
            </div>

            <div className="bg-[#FAF7F2] rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 border border-[#E8E5DF] grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
              
              {/* Form Options */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                
                {/* 1. Medium selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3935] mb-2">1. Drawing Style / Medium</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {[
                      { id: 'pencil', label: 'Graphite Pencil', sub: 'Classic Smooth' },
                      { id: 'charcoal', label: 'Dark Charcoal', sub: '+₹200 Deep Shading' },
                      { id: 'color', label: 'Color Pencil', sub: '+₹500 Vibrant' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCustomMedium(st.id)}
                        className={`p-3 rounded-xl border text-center transition active:scale-98 ${
                          customMedium === st.id ? 'border-[#1A1816] bg-[#1A1816] text-white shadow-sm' : 'border-[#E8E5DF] bg-white text-[#1A1816] hover:border-[#1A1816]'
                        }`}
                      >
                        <p className="text-xs font-bold">{st.label}</p>
                        <p className="text-[10px] opacity-80 mt-0.5">{st.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Paper Size */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3935] mb-2">2. Paper Size</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {[
                      { id: 'A4', label: 'A4 Size (Standard)', desc: '8.3 × 11.7 in · Single Face' },
                      { id: 'A3', label: 'A3 Size (2x Area)', desc: '11.7 × 16.5 in · Double / Couple' },
                      { id: 'A2', label: 'A2 Size (4x Grand)', desc: '16.5 × 23.4 in · Family / Big' }
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setCustomSize(sz.id)}
                        className={`p-3 rounded-xl border text-left sm:text-center transition active:scale-98 ${
                          customSize === sz.id ? 'border-[#1A1816] bg-[#1A1816] text-white shadow-sm' : 'border-[#E8E5DF] bg-white text-[#1A1816] hover:border-[#1A1816]'
                        }`}
                      >
                        <p className="text-xs font-bold">{sz.label}</p>
                        <p className="text-[10px] opacity-80 mt-0.5">{sz.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Faces in Photo */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3935] mb-1">3. Faces in Photo</label>
                  <select 
                    value={customFaces} 
                    onChange={(e) => setCustomFaces(e.target.value)}
                    className="w-full bg-white border border-[#E8E5DF] rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#1A1816]"
                  >
                    <option value="1">1 Person / Single Face</option>
                    <option value="2">2 Persons / Couple (+₹600)</option>
                    <option value="3">3 Persons / Family (+₹1,100)</option>
                    <option value="4">4+ Persons / Group (+₹1,600)</option>
                  </select>
                </div>

                {/* 4. Photo Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3935] mb-1">4. Reference Photo (Optional here, can send on WhatsApp)</label>
                  <div className="border border-dashed border-[#A49E97] rounded-xl p-4 bg-white text-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="portraitUpload"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setPhotoFileName(file.name);
                          const reader = new FileReader();
                          reader.onload = (evt) => setPhotoPreview(evt.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-[#6B6560] file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#1A1816] file:text-white hover:file:bg-[#B87333] cursor-pointer"
                    />
                    {photoFileName && (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-2">✓ Photo attached: {photoFileName}</p>
                    )}
                  </div>
                </div>

                {/* Safe Delivery Note */}
                <div className="flex items-center gap-2.5 p-3 bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl text-xs text-[#6B6560]">
                  <span className="text-base">📦</span>
                  <span>Har handmade sketch heavy-duty <strong>protective roll tube</strong> me safely pack hokar deliver hota hai (Free delivery).</span>
                </div>
              </div>

              {/* Live Estimate Sticky Card */}
              <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#E8E5DF] shadow-md space-y-5 lg:sticky lg:top-28 w-full">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#B87333]">Live Calculation</span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1816]">Order Summary</h3>
                </div>

                <div className="space-y-2 text-xs border-b border-[#E8E5DF] pb-4 text-[#6B6560]">
                  <div className="flex justify-between">
                    <span>Style:</span>
                    <strong className="text-[#1A1816] capitalize">{customMedium}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Paper Size:</span>
                    <strong className="text-[#1A1816]">{customSize} ({customSize === 'A4' ? '8.3×11.7 in' : customSize === 'A3' ? '11.7×16.5 in · 2x Bigger' : '16.5×23.4 in · 4x Grand'})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of Faces:</span>
                    <strong className="text-[#1A1816]">{customFaces} Person(s)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging:</span>
                    <strong className="text-emerald-700 font-medium">Safe Roll Tube (Free)</strong>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-[#6B6560] block">Payable Amount</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Free Safe Packing Included</span>
                  </div>
                  <span className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1816]">
                    ₹{customPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleOrderCustomWhatsApp}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow transition flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>💬 Order on WhatsApp (Fastest)</span>
                  </button>
                  <button
                    onClick={handleAddCustomToCart}
                    className="w-full py-3 border border-[#1A1816] text-[#1A1816] hover:bg-[#1A1816] hover:text-white rounded-xl text-xs font-semibold transition active:scale-98"
                  >
                    Add to Cart & Checkout Here
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* About Artist Section (Dynamic from Settings) */}
        <section id="about" className="py-12 sm:py-16 md:py-20 border-b border-[#E8E5DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-5">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] max-w-sm mx-auto shadow-xl border border-[#E8E5DF] group">
                  <img 
                    src={artistImg} 
                    alt={settings.artistName || 'Anmol - Fine Artist'} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1816]/90 via-[#1A1816]/20 to-transparent flex items-end p-5 sm:p-6">
                    <div className="text-white">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">Verified Artist</span>
                      </div>
                      <p className="font-serif text-xl sm:text-2xl font-bold tracking-wide">{settings.artistName}</p>
                      <p className="text-[11px] sm:text-xs text-[#E8E5DF] font-medium">{settings.artistTitle}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-left">
                <span className="text-xs font-semibold tracking-wider text-[#B87333] uppercase">Behind The Artwork</span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1816] leading-snug">
                  "Har sketch me ek aisi rooh hoti hai jo digital print me kabhi nahi aa sakti."
                </h2>
                <p className="text-[#6B6560] text-xs sm:text-sm leading-relaxed">
                  {settings.artistBio}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-semibold text-[#1A1816] text-left">
                  <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-[#E8E5DF]">
                    <span>✓</span>
                    <span>300 GSM Archival Acid-Free Paper</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-[#E8E5DF]">
                    <span>✓</span>
                    <span>Smudge-Proof Archival Fixative</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-[#E8E5DF]">
                    <span>✓</span>
                    <span>Preview sent on WhatsApp before dispatch</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/70 p-2.5 rounded-xl border border-[#E8E5DF]">
                    <span>✓</span>
                    <span>Hand-signed Authenticity Certificate</span>
                  </div>
                </div>

                <div className="pt-3 flex flex-wrap gap-3 justify-center lg:justify-start">
                  <a
                    href={settings.instagramUrl || "https://www.instagram.com/anmolart_gallery/"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 shadow-md transition transform hover:-translate-y-0.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Follow @anmolart_gallery</span>
                  </a>
                  <a
                    href={`https://wa.me/${settings.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold text-[#1A1816] bg-white hover:bg-[#FAF7F2] border border-[#E8E5DF] shadow-xs transition"
                  >
                    <span>💬 Chat on WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Customer Reviews */}
        <section id="reviews" className="py-12 sm:py-16 bg-white border-b border-[#E8E5DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto mb-8 sm:mb-12 gap-4">
              <div className="text-center sm:text-left">
                <span className="text-xs font-semibold tracking-wider text-[#B87333] uppercase">Happy Customers</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A1816] mt-1">What Art Lovers Say</h2>
                <p className="text-xs text-[#6B6560] mt-1">Real feedback from clients across India ({reviews.length} reviews)</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFeedbackForm({
                    name: '',
                    city: '',
                    stars: 5,
                    item: 'Custom Portrait Order',
                    quote: ''
                  });
                  setIsFeedbackOpen(true);
                }}
                className="px-5 py-2.5 bg-[#1A1816] hover:bg-[#B87333] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>⭐ Give Feedback / Review</span>
              </button>
            </div>

            {reviews.length === 0 ? (
              <div className="text-center py-12 bg-[#FAF7F2] rounded-3xl border border-[#E8E5DF] p-8 max-w-xl mx-auto">
                <p className="font-serif text-lg font-bold text-[#1A1816]">Abhi koi customer reviews nahi hain</p>
                <p className="text-xs text-[#6B6560] mt-1 mb-4">Aap pehle customer hain jo apna anubhav share kar sakte hain!</p>
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackForm({
                      name: '',
                      city: '',
                      stars: 5,
                      item: 'Custom Portrait Order',
                      quote: ''
                    });
                    setIsFeedbackOpen(true);
                  }}
                  className="px-5 py-2.5 bg-[#1A1816] hover:bg-[#B87333] text-white text-xs font-bold rounded-xl shadow transition"
                >
                  ⭐ Write the First Review
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {reviews.map((rev, i) => (
                  <div key={rev.id || i} className="bg-[#FAF7F2] p-5 sm:p-6 rounded-2xl border border-[#E8E5DF] flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="text-amber-500 mb-2 text-xs tracking-widest font-bold">
                        {'★'.repeat(rev.stars || 5)}{'☆'.repeat(Math.max(0, 5 - (rev.stars || 5)))}
                      </div>
                      <p className="text-xs sm:text-sm text-[#3D3935] leading-relaxed italic">"{rev.quote || rev.comment}"</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#E8E5DF] flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-[#1A1816]">{rev.name}</p>
                        <p className="text-[10px] text-[#6B6560]">{rev.item || 'Custom Artwork'} • {rev.city || 'India'}</p>
                      </div>
                      {rev.date && <span className="text-[9px] text-[#A49E97]">{rev.date}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#1A1816] text-[#FAF7F2] py-10 pb-24 md:pb-10 border-t border-[#2A2724]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#2A2724] text-center sm:text-left">
            <div className="md:col-span-6 space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2.5">
                <img src="/logo.png" alt={settings.studioName} className="w-8 h-8 object-contain" />
                <span className="font-serif text-2xl font-bold">{settings.studioName}</span>
              </div>
              <p className="text-xs text-[#A49E97] max-w-sm mx-auto sm:mx-0">
                Handmade pencil & charcoal artwork. Giving your memories artistic immortality.
              </p>
            </div>
            <div className="md:col-span-6 text-center sm:text-right space-y-1.5 text-xs text-[#A49E97]">
              <p>WhatsApp: +{settings.whatsappNumber}</p>
              <p>
                <span>Instagram: </span>
                <a
                  href={settings.instagramUrl || "https://www.instagram.com/anmolart_gallery/"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-400 hover:text-pink-300 font-bold underline inline-flex items-center gap-1"
                >
                  <span>@anmolart_gallery</span>
                  <span>↗</span>
                </a>
              </p>
              <p>Pan-India Safe Courier Available 🇮🇳</p>
              
              {/* Quick Links: Feedback & Admin Login */}
              <div className="pt-3 flex flex-wrap justify-center sm:justify-end items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackForm({
                      name: '',
                      city: '',
                      stars: 5,
                      item: 'Custom Portrait Order',
                      quote: ''
                    });
                    setIsFeedbackOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-[#2A2724] hover:bg-[#3D3935] text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>⭐ Write a Review / Feedback</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isAdmin) {
                      setIsAdminDashboardOpen(true);
                    } else {
                      setIsAdminLoginOpen(true);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-[#2A2724] hover:bg-[#3D3935] text-[#FAF7F2] border border-[#3D3935] rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{isAdmin ? '👑 Artist Dashboard' : '🔒 Artist Admin Login'}</span>
                </button>
              </div>

              {/* Secret Admin Portal Link (Only visible when logged in) */}
              {isAdmin && (
                <div className="pt-1">
                  <button
                    onClick={() => setIsAdminDashboardOpen(true)}
                    className="text-xs text-[#B87333] hover:underline font-semibold cursor-pointer"
                  >
                    👑 Logged in as Artist Admin
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="pt-4 text-xs text-[#6B6560] text-center select-none">
            <span
              onClick={() => setIsAdminLoginOpen(true)}
              className="cursor-default hover:text-[#FAF7F2] transition"
              title=""
            >
              ©
            </span>{' '}
            2026 {settings.studioName}. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Bottom Quick Action on Mobile */}
      <div className="md:hidden fixed bottom-3 left-3 right-3 z-30 flex gap-2">
        <a 
          href={`https://wa.me/${settings.whatsappNumber}`} 
          target="_blank" 
          rel="noreferrer"
          className="flex-1 py-3 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span>💬 WhatsApp</span>
        </a>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="py-3 px-4 bg-[#1A1816] text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 active:scale-95"
        >
          <span>🛒 Cart</span>
          {totalCartCount > 0 && (
            <span className="bg-[#B87333] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {totalCartCount}
            </span>
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 🔐 ARTIST ADMIN LOGIN MODAL */}
      {/* ======================================================== */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1816]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-[#E8E5DF] relative">
            <button 
              onClick={() => {
                setIsAdminLoginOpen(false);
                setLoginError('');
              }} 
              className="absolute top-4 right-4 text-[#6B6560] hover:text-[#1A1816] font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#B87333]/10 text-[#B87333] flex items-center justify-center mx-auto text-xl font-bold mb-2">
                🔐
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1A1816]">Artist Admin Login</h3>
              <p className="text-xs text-[#6B6560] mt-1">
                Enter your password to manage sketches, view customer orders & edit studio settings.
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3D3935] mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={loginPasswordInput}
                  onChange={(e) => setLoginPasswordInput(e.target.value)}
                  placeholder="Enter password (default: admin)"
                  className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A1816]"
                  autoFocus
                />
                {loginError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1.5">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1A1816] hover:bg-[#B87333] text-white rounded-xl text-xs font-bold shadow transition"
              >
                Log In to Admin Dashboard
              </button>
              
              <p className="text-[11px] text-center text-[#6B6560]">
                Default Password: <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded font-bold text-[#1A1816]">admin</code>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📊 ARTIST ADMIN DASHBOARD MODAL */}
      {/* ======================================================== */}
      {isAdminDashboardOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1816]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fadeIn">
          <div className="bg-[#FAF7F2] rounded-3xl max-w-5xl w-full h-[92vh] shadow-2xl border border-[#E8E5DF] flex flex-col overflow-hidden">
            
            {/* Dashboard Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8E5DF] bg-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#B87333] text-white flex items-center justify-center font-bold text-lg">
                  👑
                </div>
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1A1816]">
                    Artist Control Center
                  </h2>
                  <p className="text-[11px] text-[#6B6560]">
                    Manage store, artworks, customer orders & brand settings
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* MySQL Database Status Badge */}
                {dbStatus.mysql ? (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>MySQL: {dbStatus.database}</span>
                  </div>
                ) : (
                  <button
                    onClick={loadDataFromBackend}
                    title="Click to retry MySQL connection"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 rounded-xl text-[11px] font-bold transition"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>{dbStatus.label}</span>
                    <span className="underline ml-0.5">↻</span>
                  </button>
                )}

                <button
                  onClick={handleAdminLogout}
                  className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition"
                >
                  Logout
                </button>
                <button
                  onClick={() => setIsAdminDashboardOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#1A1816] text-white flex items-center justify-center hover:bg-[#B87333] transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white px-4 sm:px-6 border-b border-[#E8E5DF] flex gap-4 sm:gap-8 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
              <button
                onClick={() => setAdminTab('artworks')}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  adminTab === 'artworks'
                    ? 'border-[#B87333] text-[#B87333]'
                    : 'border-transparent text-[#6B6560] hover:text-[#1A1816]'
                }`}
              >
                <span>🖼️ My Sketches ({artworks.length})</span>
              </button>
              
              <button
                onClick={() => setAdminTab('orders')}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  adminTab === 'orders'
                    ? 'border-[#B87333] text-[#B87333]'
                    : 'border-transparent text-[#6B6560] hover:text-[#1A1816]'
                }`}
              >
                <span>📦 Customer Orders ({orders.length})</span>
                {orders.filter(o => o.status === 'New').length > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                    {orders.filter(o => o.status === 'New').length} New
                  </span>
                )}
              </button>

              <button
                onClick={() => setAdminTab('reviews')}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  adminTab === 'reviews'
                    ? 'border-[#B87333] text-[#B87333]'
                    : 'border-transparent text-[#6B6560] hover:text-[#1A1816]'
                }`}
              >
                <span>⭐ Customer Reviews & Feedback ({reviews.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('settings')}
                className={`py-3 border-b-2 transition flex items-center gap-2 ${
                  adminTab === 'settings'
                    ? 'border-[#B87333] text-[#B87333]'
                    : 'border-transparent text-[#6B6560] hover:text-[#1A1816]'
                }`}
              >
                <span>⚙️ Store & Brand Settings</span>
              </button>
            </div>

            {/* Dashboard Body Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              
              {/* TAB 1: ARTWORKS MANAGER */}
              {adminTab === 'artworks' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-[#E8E5DF]">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1A1816]">Artwork Inventory ({artworks.length})</h3>
                      <p className="text-xs text-[#6B6560]">
                        Yahan se aap apne sketches ko "For Sale" (Available) ya "Completed Client Orders" (Showcase Portfolio) me categorize kar sakte hain.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleOpenAddArtwork('sale')}
                        className="px-3.5 py-2 bg-[#1A1816] hover:bg-[#B87333] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>+ Add For Sale</span>
                      </button>
                      <button
                        onClick={() => handleOpenAddArtwork('completed')}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>+ Add Completed Order</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Pills for Admin: All / For Sale / Completed Orders */}
                  <div className="flex gap-2 border-b border-[#E8E5DF] pb-3 overflow-x-auto">
                    {[
                      { id: 'all', label: 'All Inventory', count: artworks.length },
                      { id: 'sale', label: '🏷️ For Sale (Ready to Buy)', count: saleArtworks.length },
                      { id: 'completed', label: '🏆 Completed Client Orders', count: completedArtworks.length }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setAdminArtworkFilter(f.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                          adminArtworkFilter === f.id
                            ? 'bg-[#1A1816] text-white shadow-sm'
                            : 'bg-white text-[#6B6560] border border-[#E8E5DF] hover:border-[#1A1816] hover:text-[#1A1816]'
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          adminArtworkFilter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#1A1816]'
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {artworks
                      .filter(item => {
                        if (adminArtworkFilter === 'sale') return (item.listingType || 'sale') === 'sale';
                        if (adminArtworkFilter === 'completed') return item.listingType === 'completed';
                        return true;
                      })
                      .map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl border border-[#E8E5DF] p-3 flex gap-3 shadow-sm hover:shadow transition relative">
                        <img src={item.image} alt={item.title} className="w-20 h-28 object-cover rounded-xl flex-shrink-0 bg-[#E8E5DF]" />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold text-[#B87333] uppercase">{item.category}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                item.listingType === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}>
                                {item.listingType === 'completed' ? '🏆 Completed' : '🏷️ For Sale'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-[#1A1816] truncate">{item.title}</h4>
                            <p className="text-[11px] text-[#6B6560]">{item.dimensions}</p>
                            {item.clientCity && (
                              <p className="text-[10px] text-emerald-700 font-semibold truncate">📍 {item.clientCity}</p>
                            )}
                            <p className="text-xs font-bold text-[#1A1816] mt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E8E5DF] mt-1">
                            <button
                              onClick={() => handleToggleListingType(item.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                                item.listingType === 'completed'
                                  ? 'bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border-amber-300'
                                  : 'bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white border-emerald-300'
                              }`}
                              title={item.listingType === 'completed' ? 'Move to For Sale' : 'Move to Completed Orders'}
                            >
                              {item.listingType === 'completed' ? '→ Move to Sale' : '→ Move to Completed'}
                            </button>
                            <button
                              onClick={() => handleOpenEditArtwork(item)}
                              className="px-2 py-1 bg-[#FAF7F2] hover:bg-[#1A1816] text-[#1A1816] hover:text-white rounded-lg text-[10px] font-semibold border border-[#E8E5DF] transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteArtwork(item.id, item.title)}
                              className="px-2 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg text-[10px] font-semibold border border-red-200 transition"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS MANAGER */}
              {adminTab === 'orders' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF]">
                    <h3 className="font-serif text-lg font-bold text-[#1A1816]">Customer Orders ({orders.length})</h3>
                    <p className="text-xs text-[#6B6560]">
                      Website aur WhatsApp se aane wale saare orders yahan automatically save hote hain.
                    </p>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E5DF] p-6 text-[#6B6560]">
                      <p className="font-serif text-lg font-bold text-[#1A1816]">No Orders Yet</p>
                      <p className="text-xs mt-1">Jab koi customer order karega, unki details yahan display hongi.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((ord) => (
                        <div key={ord.id} className="bg-white rounded-2xl border border-[#E8E5DF] p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#1A1816]">{ord.id}</span>
                              <span className="text-[11px] text-[#6B6560]">({ord.date})</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ord.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : (ord.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800')
                              }`}>
                                {ord.status}
                              </span>
                            </div>
                            
                            <p className="text-xs font-bold text-[#1A1816]">
                              👤 {ord.customerName} | 📱 {ord.customerPhone}
                            </p>
                            <p className="text-[11px] text-[#6B6560]">
                              📍 {ord.customerCity}
                            </p>
                            <p className="text-xs font-semibold text-[#B87333]">
                              📦 {ord.items}
                            </p>
                          </div>

                          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                            <span className="font-serif text-xl font-bold text-[#1A1816]">
                              ₹{ord.total.toLocaleString('en-IN')}
                            </span>
                            
                            <div className="flex flex-wrap items-center gap-1.5">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                                className="bg-[#FAF7F2] border border-[#E8E5DF] rounded-lg px-2 py-1 text-xs font-semibold"
                              >
                                <option value="New">New</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                              <button
                                onClick={() => handlePromoteOrderToPortfolio(ord)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-lg text-xs font-semibold border border-emerald-300 transition flex items-center gap-1"
                                title="Showcase this finished sketch in your Completed Portfolio"
                              >
                                <span>📸 Add to Portfolio</span>
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(ord.id)}
                                className="text-red-500 hover:text-red-700 text-xs p-1"
                                title="Delete order"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STORE & BRAND SETTINGS */}
              {adminTab === 'settings' && (
                <div className="bg-white p-5 sm:p-7 rounded-3xl border border-[#E8E5DF] max-w-2xl mx-auto space-y-6">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#1A1816]">Store & Brand Settings</h3>
                    <p className="text-xs text-[#6B6560] mt-0.5">
                      Yahan se aap studio ka naam, WhatsApp number aur artist details bina code chhue live change kar sakte hain.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-[#3D3935] mb-1">Studio / Brand Name</label>
                        <input
                          type="text"
                          value={settings.studioName}
                          onChange={(e) => setSettings({ ...settings, studioName: e.target.value })}
                          className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2.5 font-semibold text-sm focus:outline-none focus:border-[#1A1816]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#3D3935] mb-1">Sub-tagline (Under Logo)</label>
                        <input
                          type="text"
                          value={settings.tagline}
                          onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                          className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1816]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-[#3D3935] mb-1">Artist WhatsApp Number (With Country Code)</label>
                        <input
                          type="text"
                          value={settings.whatsappNumber}
                          onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                          placeholder="e.g. 916352700572"
                          className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1816]"
                          required
                        />
                        <p className="text-[10px] text-[#6B6560] mt-1">Customer ke saare orders isi WhatsApp number par aayenge.</p>
                      </div>

                      <div>
                        <label className="block font-bold text-[#3D3935] mb-1">Logo Icon Letter</label>
                        <input
                          type="text"
                          maxLength="2"
                          value={settings.logoLetter}
                          onChange={(e) => setSettings({ ...settings, logoLetter: e.target.value.toUpperCase() })}
                          className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#1A1816]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-[#3D3935] mb-1">Artist Name & Title</label>
                      <input
                        type="text"
                        value={settings.artistName}
                        onChange={(e) => setSettings({ ...settings, artistName: e.target.value })}
                        className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1816]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#3D3935] mb-1">Artist Bio (About Section Text)</label>
                      <textarea
                        rows="3"
                        value={settings.artistBio}
                        onChange={(e) => setSettings({ ...settings, artistBio: e.target.value })}
                        className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-[#1A1816]"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block font-bold text-[#3D3935] mb-1">Top Announcement Bar Text</label>
                      <input
                        type="text"
                        value={settings.announcement}
                        onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                        className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A1816]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#3D3935] mb-1">Instagram Profile URL</label>
                      <input
                        type="url"
                        value={settings.instagramUrl || 'https://www.instagram.com/anmolart_gallery/'}
                        onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                        placeholder="https://www.instagram.com/anmolart_gallery/"
                        className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A1816]"
                      />
                      <p className="text-[10px] text-[#6B6560] mt-1">Header, About Artist aur Footer me Instagram link yahan se control hota hai.</p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-3 bg-[#1A1816] hover:bg-[#B87333] text-white font-bold rounded-xl text-xs shadow transition"
                      >
                        Save Settings
                      </button>

                      <button
                        type="button"
                        onClick={handleResetDemoData}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Reset to Default Demo Data
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 4: REVIEWS & FEEDBACK MANAGER */}
              {adminTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#E8E5DF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#1A1816]">
                        Customer Feedback & Reviews ({reviews.length})
                      </h3>
                      <p className="text-xs text-[#6B6560]">
                        Website orders aur custom design se aane wale saare customer reviews yahan dikhte hain aur homepage par display hote hain.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2 bg-[#FAF7F2] px-3.5 py-1.5 rounded-xl border border-[#E8E5DF]">
                        <span className="text-amber-500 font-bold text-sm">★ 5.0</span>
                        <span className="text-xs font-semibold text-[#1A1816]">Customer Satisfaction</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFeedbackForm({
                            name: '',
                            city: '',
                            stars: 5,
                            item: 'Custom Portrait Order',
                            quote: ''
                          });
                          setIsFeedbackOpen(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#1A1816] hover:bg-[#B87333] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>+ Add Feedback</span>
                      </button>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-[#E8E5DF] p-6 text-[#6B6560]">
                      <p className="font-serif text-lg font-bold text-[#1A1816]">Abhi koi reviews nahi hain</p>
                      <p className="text-xs mt-1">Jab customer order place karke review denge, unki feedback yahan record hogi.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="bg-white rounded-2xl border border-[#E8E5DF] p-4 shadow-sm flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-bold text-xs text-[#1A1816]">{rev.name}</span>
                                <span className="text-[11px] text-[#6B6560] block">{rev.city} • {rev.item}</span>
                              </div>
                              <div className="text-amber-500 text-xs font-bold tracking-widest">
                                {'★'.repeat(rev.stars || 5)}{'☆'.repeat(Math.max(0, 5 - (rev.stars || 5)))}
                              </div>
                            </div>
                            <p className="text-xs text-[#3D3935] italic bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E5DF]/60">
                              "{rev.quote}"
                            </p>
                          </div>
                          <div className="pt-2 border-t border-[#E8E5DF] flex justify-between items-center text-[10px] text-[#A49E97]">
                            <span>{rev.date || 'Recent Order'}</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Kya aap "${rev.name}" ka review delete karna chahte hain?`)) {
                                  setReviews((prev) => prev.filter((r) => r.id !== rev.id));
                                  try {
                                    const saved = JSON.parse(localStorage.getItem('anmol_reviews') || '[]');
                                    const updated = saved.filter((r) => r.id !== rev.id);
                                    localStorage.setItem('anmol_reviews', JSON.stringify(updated));
                                    localStorage.setItem('kalakriti_reviews', JSON.stringify(updated));
                                  } catch {}
                                  api.deleteReview(rev.id).catch(() => {});
                                  showToast('Review removed from website & MySQL!');
                                }
                              }}
                              className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ✏️ ADD / EDIT ARTWORK MODAL */}
      {/* ======================================================== */}
      {isArtworkModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1816]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border border-[#E8E5DF] relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsArtworkModalOpen(false)}
              className="absolute top-4 right-4 text-[#6B6560] hover:text-[#1A1816] font-bold text-lg"
            >
              ✕
            </button>

            <div className="mb-5">
              <span className="text-[10px] uppercase font-bold text-[#B87333]">Artwork Manager</span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1816]">
                {artworkForm.id ? 'Edit Artwork' : 'Add New Sketch'}
              </h3>
            </div>

            <form onSubmit={handleSaveArtwork} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#3D3935] mb-1">Sketch Title *</label>
                <input
                  type="text"
                  value={artworkForm.title}
                  onChange={(e) => setArtworkForm({ ...artworkForm, title: e.target.value })}
                  placeholder="e.g. Royal Bengal Tiger in Shadows"
                  className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A1816]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3D3935] mb-1">Category *</label>
                  <select
                    value={artworkForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setArtworkForm({
                        ...artworkForm,
                        category: val,
                        listingType: val === 'custom' ? 'completed' : 'sale',
                        tag: val === 'custom' ? 'Complete Order' : (artworkForm.tag === 'Complete Order' ? 'Original Piece' : artworkForm.tag)
                      });
                    }}
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#1A1816]"
                  >
                    <option value="sketch">Sketch</option>
                    <option value="painting">Painting</option>
                    <option value="3d">3D</option>
                    <option value="custom">Custom (Complete Order)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#3D3935] mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={artworkForm.price}
                    onChange={(e) => setArtworkForm({ ...artworkForm, price: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2.5 text-sm font-bold focus:outline-none focus:border-[#1A1816]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3D3935] mb-1">Dimensions / Size</label>
                  <input
                    type="text"
                    value={artworkForm.dimensions}
                    onChange={(e) => setArtworkForm({ ...artworkForm, dimensions: e.target.value })}
                    placeholder="e.g. A3 (11.7 × 16.5 inches)"
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A1816]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3D3935] mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={artworkForm.tag}
                    onChange={(e) => setArtworkForm({ ...artworkForm, tag: e.target.value })}
                    placeholder="e.g. Best Seller / Original Piece"
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A1816]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3D3935] mb-1">Medium & Paper</label>
                <input
                  type="text"
                  value={artworkForm.medium}
                  onChange={(e) => setArtworkForm({ ...artworkForm, medium: e.target.value })}
                  placeholder="e.g. Natural Charcoal Powder & German Graphite on Fabriano"
                  className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A1816]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3D3935] mb-1">Artwork Image (Upload or URL) *</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          setArtworkForm({ ...artworkForm, image: evt.target.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-[#6B6560] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#1A1816] file:text-white hover:file:bg-[#B87333]"
                  />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#6B6560]">Ya Image URL dalein:</span>
                    <input
                      type="text"
                      value={artworkForm.image}
                      onChange={(e) => setArtworkForm({ ...artworkForm, image: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 bg-[#FAF7F2] border border-[#E8E5DF] rounded-lg px-2.5 py-1 text-xs"
                    />
                  </div>

                  {artworkForm.image && (
                    <div className="mt-2 flex items-center gap-3 bg-[#FAF7F2] p-2 rounded-xl border border-[#E8E5DF]">
                      <img src={artworkForm.image} alt="Preview" className="w-12 h-14 object-cover rounded-lg" />
                      <span className="text-[11px] text-emerald-600 font-semibold">✓ Image ready</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3D3935] mb-1">Short Description</label>
                <textarea
                  rows="2"
                  value={artworkForm.description}
                  onChange={(e) => setArtworkForm({ ...artworkForm, description: e.target.value })}
                  placeholder="Detail about the drawing, texture, fixative spray..."
                  className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#1A1816]"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArtworkModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E8E5DF] text-[#6B6560] rounded-xl text-xs font-semibold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#1A1816] hover:bg-[#B87333] text-white rounded-xl text-xs font-bold shadow transition"
                >
                  {artworkForm.id ? 'Save Changes' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🖼️ "VIEW ON WALL" LIVING ROOM PREVIEW MODAL */}
      {/* ======================================================== */}
      {wallArtwork && (
        <div 
          className="fixed inset-0 z-50 bg-[#1A1816]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setWallArtwork(null)}
        >
          <div 
            className="bg-[#FAF7F2] rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E8E5DF] flex flex-col max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8E5DF] bg-white flex justify-between items-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#B87333] tracking-wider">Living Room Simulator</span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1A1816]">
                  Preview "{wallArtwork.title}" on Wall
                </h3>
              </div>
              <button 
                onClick={() => setWallArtwork(null)}
                className="w-8 h-8 rounded-full bg-[#1A1816] text-white flex items-center justify-center hover:bg-[#B87333] transition"
              >
                ✕
              </button>
            </div>

            {/* Virtual Room Wall Viewport — Realistic Hanging */}
            <div
              className="relative flex-1 min-h-[340px] sm:min-h-[460px] flex items-center justify-center overflow-hidden"
              style={{
                backgroundImage: `url('C:/Users/HP/.gemini/antigravity/brain/30fac6ac-1b56-4c70-92f0-541b582b0ee1/.user_uploaded/media_1795166056459_a02dfdfd.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
              }}
            >
              {/* Dark vignette overlay — edges darker for depth */}
              <div className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.45) 100%)'
                }}
              />

              {/* Subtle warm wall tint */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(180,140,90,0.10)' }} />

              {/* Floor shadow strip at bottom */}
              <div className="absolute bottom-0 inset-x-0 h-10 sm:h-14 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.30), transparent)' }}
              />

              {/* === HANGING SYSTEM: Nail + Wire + Frame === */}
              <div className="relative flex flex-col items-center" style={{ marginTop: '-20px' }}>

                {/* Nail head on wall */}
                <div style={{
                  width: '14px',
                  height: '10px',
                  borderRadius: '50% 50% 40% 40%',
                  background: 'radial-gradient(circle at 40% 35%, #d4c4a0, #7a6040)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.3)',
                  zIndex: 10,
                  position: 'relative',
                }} />

                {/* Wire going down from nail — two angled lines forming a V */}
                <div style={{ position: 'relative', width: '80px', height: '28px', marginTop: '-1px' }}>
                  {/* Left wire */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    width: '1.5px',
                    height: '32px',
                    background: 'linear-gradient(to bottom, #a89060, #c8aa78)',
                    transformOrigin: 'top center',
                    transform: 'rotate(-22deg)',
                    opacity: 0.85,
                  }} />
                  {/* Right wire */}
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    width: '1.5px',
                    height: '32px',
                    background: 'linear-gradient(to bottom, #a89060, #c8aa78)',
                    transformOrigin: 'top center',
                    transform: 'rotate(22deg)',
                    opacity: 0.85,
                  }} />
                </div>

                {/* Framed Artwork */}
                <div
                  className={`transition-all duration-500 relative ${
                    wallScale === 'A4' ? 'w-36 sm:w-48' : (wallScale === 'A3' ? 'w-52 sm:w-72' : 'w-64 sm:w-96')
                  }`}
                  style={{
                    boxShadow: '0 30px 70px rgba(0,0,0,0.55), 0 10px 30px rgba(0,0,0,0.35), 4px 8px 20px rgba(0,0,0,0.25), -2px 2px 8px rgba(0,0,0,0.15)',
                    filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.4))',
                  }}
                >
                  {/* Outer Frame Border */}
                  <div className={`transition-colors duration-300 ${
                    wallFrameStyle === 'teak'
                      ? 'p-2.5 sm:p-3'
                      : wallFrameStyle === 'black'
                        ? 'p-2.5 sm:p-3'
                        : wallFrameStyle === 'white'
                          ? 'p-2.5 sm:p-3'
                          : 'p-0'
                  }`}
                    style={{
                      background:
                        wallFrameStyle === 'teak'
                          ? 'linear-gradient(145deg, #c8824a 0%, #7a4820 30%, #a86030 60%, #6b3a18 100%)'
                          : wallFrameStyle === 'black'
                            ? 'linear-gradient(145deg, #3a3733 0%, #0f0e0d 50%, #2a2825 100%)'
                            : wallFrameStyle === 'white'
                              ? 'linear-gradient(145deg, #ffffff 0%, #d8d5d0 50%, #f0ece6 100%)'
                              : 'transparent',
                      boxShadow:
                        wallFrameStyle !== 'none'
                          ? 'inset 0 2px 4px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.3)'
                          : 'none',
                    }}
                  >
                    {/* White Matting (Passepartout) */}
                    {wallFrameStyle !== 'none' && (
                      <div style={{
                        padding: '10px',
                        background: '#f8f5ef',
                        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.15)',
                      }}>
                        <img
                          src={wallArtwork.image}
                          alt={wallArtwork.title}
                          className="w-full h-auto object-cover block"
                          style={{ display: 'block' }}
                        />
                      </div>
                    )}
                    {wallFrameStyle === 'none' && (
                      <img
                        src={wallArtwork.image}
                        alt={wallArtwork.title}
                        className="w-full h-auto object-cover block"
                      />
                    )}
                  </div>
                </div>

                {/* Floor shadow under frame — ellipse blur */}
                <div style={{
                  width: wallScale === 'A4' ? '140px' : wallScale === 'A3' ? '220px' : '300px',
                  height: '14px',
                  borderRadius: '50%',
                  background: 'rgba(0,0,0,0.25)',
                  filter: 'blur(10px)',
                  marginTop: '18px',
                  transition: 'all 0.4s',
                }} />
              </div>

              {/* Dimension Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-[#1A1816] shadow">
                📐 {wallScale} · {wallScale === 'A4' ? '8.3 × 11.7 in (Single / Standard)' : wallScale === 'A3' ? '11.7 × 16.5 in (2x Area / Couple)' : '16.5 × 23.4 in (4x Area / Grand)'}
              </div>

              {/* Realistic badge */}
              <div className="absolute top-3 right-3 bg-[#1A1816]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#B87333] shadow tracking-wider uppercase">
                ✦ Lifelike Preview
              </div>
            </div>

            {/* Modal Controls Toolbar */}
            <div className="p-4 sm:p-5 bg-white border-t border-[#E8E5DF] flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-bold text-[#6B6560]">Frame:</span>
                <div className="flex gap-1.5 flex-1">
                  {[
                    { id: 'teak', label: 'Teak Wood', color: '#8B5A2B' },
                    { id: 'black', label: 'Matte Black', color: '#1A1816' },
                    { id: 'white', label: 'Minimal White', color: '#FFFFFF' },
                    { id: 'none', label: 'No Frame', color: '#E8E5DF' }
                  ].map(fr => (
                    <button
                      key={fr.id}
                      onClick={() => setWallFrameStyle(fr.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                        wallFrameStyle === fr.id 
                          ? 'border-[#1A1816] bg-[#1A1816] text-white shadow-sm' 
                          : 'border-[#E8E5DF] bg-[#FAF7F2] text-[#3D3935] hover:border-[#1A1816]'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-gray-400 inline-block" style={{ backgroundColor: fr.color }}></span>
                      <span className="hidden sm:inline">{fr.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1 border border-[#E8E5DF] rounded-xl p-0.5 bg-[#FAF7F2] text-xs font-bold">
                  {[
                    { id: 'A4', label: 'A4', sub: 'Standard' },
                    { id: 'A3', label: 'A3', sub: '2x Area' },
                    { id: 'A2', label: 'A2', sub: '4x Grand' }
                  ].map(sz => (
                    <button
                      key={sz.id}
                      onClick={() => setWallScale(sz.id)}
                      className={`px-3 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-1 ${
                        wallScale === sz.id ? 'bg-[#1A1816] text-white shadow-xs' : 'text-[#6B6560] hover:text-[#1A1816]'
                      }`}
                    >
                      <span>{sz.id}</span>
                      <span className={`text-[10px] hidden sm:inline ${wallScale === sz.id ? 'text-[#D4AF37]' : 'text-[#A49E97]'}`}>({sz.sub})</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    handleAddToCart(wallArtwork);
                    setWallArtwork(null);
                  }}
                  className="px-5 py-2.5 bg-[#B87333] hover:bg-[#8C5220] text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
                >
                  <span>Add to Cart (₹{wallArtwork.price.toLocaleString('en-IN')})</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
          <div className="absolute inset-0 bg-[#1A1816]/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full sm:max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col z-10 border-l border-[#E8E5DF]">
            
            {/* Header */}
            <div className="p-4 border-b border-[#E8E5DF] bg-white flex justify-between items-center">
              <h2 className="font-serif text-lg font-bold text-[#1A1816]">Your Cart ({totalCartCount})</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-[#6B6560] hover:text-[#1A1816] text-lg font-bold">✕</button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-[#6B6560]">
                  <p className="font-serif text-xl font-bold text-[#1A1816]">Cart is Empty</p>
                  <p className="text-xs mt-1">Add a sketch or customize a portrait order.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2 bg-[#1A1816] text-white text-xs font-semibold rounded-full"
                  >
                    Browse Artworks
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-[#E8E5DF] flex gap-3 items-center">
                    <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1A1816] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#6B6560]">{item.dimensions}</p>
                      <p className="text-xs font-bold mt-1 text-[#1A1816]">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-1 border border-[#E8E5DF] rounded-lg px-2 py-0.5 text-xs bg-[#FAF7F2]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQty(idx, -1);
                        }}
                        className="w-5 h-5 flex items-center justify-center text-[#6B6560] hover:text-[#1A1816] hover:bg-black/10 rounded cursor-pointer font-bold select-none"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-[#1A1816] select-none">{item.qty}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQty(idx, 1);
                        }}
                        className="w-5 h-5 flex items-center justify-center text-[#6B6560] hover:text-[#1A1816] hover:bg-black/10 rounded cursor-pointer font-bold select-none"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCartItem(idx)}
                      className="text-red-500 hover:text-red-700 text-xs px-1 cursor-pointer font-bold"
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Sticky Checkout Panel */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-[#E8E5DF] bg-white space-y-3">
                <div className="space-y-1.5 text-xs">
                  <input
                    type="text"
                    placeholder="Aapka Naam (Customer Name) *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#1A1816]"
                  />
                  <input
                    type="text"
                    placeholder="Mobile / Contact Number *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#1A1816]"
                  />
                  <input
                    type="text"
                    placeholder="Delivery City & Pin (e.g. Pune - 411038)"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-lg px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-[#1A1816]"
                  />
                </div>

                <div className="flex justify-between font-bold text-sm pt-2">
                  <span>Grand Total:</span>
                  <span className="font-serif text-xl">₹{totalCartPrice.toLocaleString('en-IN')}</span>
                </div>

                <button
                  type="button"
                  onClick={handleDirectCartOrder}
                  className="w-full py-3.5 bg-[#1A1816] hover:bg-[#B87333] text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <span>📦 Confirm & Place Order (Direct to Studio)</span>
                </button>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Order direct artist ke Admin Dashboard me notify hoga</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📦 ORDER CONFIRMATION MODAL (DIRECT ADMIN ORDER) */}
      {placedOrder && (
        <div className="fixed inset-0 z-50 bg-[#1A1816]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-[#E8E5DF] space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-inner font-bold">
              ✓
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Order Received
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1816] mt-2">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-[#6B6560] mt-1">
                Aapka order direct artist ke <strong className="text-[#1A1816]">Admin Dashboard</strong> me record ho gaya hai.
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E5DF] text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                <span className="text-[#6B6560]">Order ID:</span>
                <span className="font-bold text-[#1A1816] bg-white px-2 py-0.5 rounded border border-[#E8E5DF]">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                <span className="text-[#6B6560]">Customer:</span>
                <span className="font-bold text-[#1A1816]">{placedOrder.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                <span className="text-[#6B6560]">Mobile:</span>
                <span className="font-bold text-[#1A1816]">{placedOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                <span className="text-[#6B6560]">Delivery To:</span>
                <span className="font-bold text-[#1A1816]">{placedOrder.customerCity}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E5DF] pb-2">
                <span className="text-[#6B6560]">Artwork Items:</span>
                <span className="font-bold text-[#1A1816] text-right truncate max-w-[200px]">{placedOrder.items}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="font-bold text-[#1A1816]">Total Amount:</span>
                <span className="font-serif text-base font-bold text-[#B87333]">₹{placedOrder.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-left text-[11px] text-[#8C5220] flex items-start gap-2">
              <span className="text-sm">🔔</span>
              <span>
                <strong>Admin Notification Sent:</strong> Artist is order ko review karke processing & delivery confirm karne ke liye aapse sampark karenge.
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setFeedbackForm({
                    name: placedOrder.customerName !== 'Valued Customer' ? placedOrder.customerName : '',
                    city: placedOrder.customerCity !== 'Not specified' ? placedOrder.customerCity : '',
                    stars: 5,
                    item: placedOrder.items,
                    quote: ''
                  });
                  setPlacedOrder(null);
                  setIsFeedbackOpen(true);
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>⭐ Rate & Give Order Feedback</span>
              </button>
              <button
                type="button"
                onClick={() => setPlacedOrder(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-[#3D3935] rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Done / Continue Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ CUSTOMER FEEDBACK & REVIEW MODAL */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-[#1A1816]/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E8E5DF] relative max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsFeedbackOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] text-[#6B6560] hover:text-[#1A1816] hover:bg-[#E8E5DF] flex items-center justify-center text-sm font-bold cursor-pointer transition"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                ⭐ Order Experience & Review
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#1A1816] mt-2">
                Share Your Feedback
              </h3>
              <p className="text-xs text-[#6B6560] mt-1">
                Aapka review Anmol Art website ke <strong>"What Art Lovers Say"</strong> section me live dikhega aur artist ke <strong>Admin Dashboard</strong> me record hoga.
              </p>
            </div>

            <form onSubmit={handleSubmitFeedback} className="space-y-4 text-xs">
              {/* Star Rating Selector */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E5DF] text-center">
                <label className="block font-bold text-[#1A1816] mb-1.5 text-xs">
                  Aapka Rating Kaisa Raha?
                </label>
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, stars: star })}
                      className="text-2xl sm:text-3xl transition transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <span className={star <= feedbackForm.stars ? 'text-amber-500' : 'text-gray-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-semibold text-[#B87333] mt-1">
                  {feedbackForm.stars === 5 ? '⭐⭐⭐⭐⭐ 5 Stars - Outstanding Experience!' :
                   feedbackForm.stars === 4 ? '⭐⭐⭐⭐ 4 Stars - Very Good' :
                   feedbackForm.stars === 3 ? '⭐⭐⭐ 3 Stars - Average' : '⭐⭐ Needs Improvement'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3D3935] mb-1">Aapka Naam (Customer Name) *</label>
                  <input
                    type="text"
                    required
                    value={feedbackForm.name}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A1816]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3D3935] mb-1">City / Location</label>
                  <input
                    type="text"
                    value={feedbackForm.city}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, city: e.target.value })}
                    placeholder="e.g. Pune, Mumbai, Delhi"
                    className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A1816]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3D3935] mb-1">Custom Design / Artwork Info</label>
                <input
                  type="text"
                  value={feedbackForm.item}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, item: e.target.value })}
                  placeholder="e.g. Custom Couple Charcoal Sketch (A3)"
                  className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1A1816]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3D3935] mb-1">Feedback Description / Main Info *</label>
                <textarea
                  rows="3"
                  required
                  value={feedbackForm.quote}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, quote: e.target.value })}
                  placeholder="Sketch ki quality, realism, packaging aur artist ka response kaisa laga? Apna anubhav yahan likhein..."
                  className="w-full bg-[#FAF7F2] border border-[#E8E5DF] rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-[#1A1816]"
                ></textarea>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#1A1816] hover:bg-[#B87333] text-white rounded-xl font-bold shadow-md transition cursor-pointer text-xs"
                >
                  Submit Review (Website & Admin Dono Par Bhejein)
                </button>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-[#3D3935] rounded-xl font-semibold transition cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Artwork Zoom Modal */}
      {selectedArtwork && (
        <div className="fixed inset-0 z-50 bg-[#1A1816]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4" onClick={() => setSelectedArtwork(null)}>
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-6 relative flex flex-col md:flex-row gap-4 sm:gap-6 max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedArtwork(null)} 
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-[#1A1816]/80 text-white flex items-center justify-center hover:bg-[#1A1816] transition"
            >
              ✕
            </button>
            
            <div className="md:w-1/2 bg-[#E8E5DF] rounded-xl overflow-hidden flex items-center justify-center">
              <img src={selectedArtwork.image} alt={selectedArtwork.title} className="w-full h-auto object-cover max-h-72 md:max-h-96" />
            </div>

            <div className="md:w-1/2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#B87333] uppercase">{selectedArtwork.category}</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A1816] mt-1">{selectedArtwork.title}</h3>
                <p className="text-xs text-[#6B6560] mt-2 leading-relaxed">{selectedArtwork.description}</p>
                
                <div className="text-xs text-[#3D3935] mt-3 space-y-1 bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E5DF]">
                  <p><strong>Medium:</strong> {selectedArtwork.medium}</p>
                  <p><strong>Size:</strong> {selectedArtwork.dimensions}</p>
                  <p><strong>Paper:</strong> {selectedArtwork.paper}</p>
                </div>
              </div>

              {isCustomCompleted(selectedArtwork) ? (
                <div className="pt-4 border-t border-[#E8E5DF] mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Status</span>
                      <span className="font-serif text-lg font-bold text-emerald-800 flex items-center gap-1.5">
                        <span>✓</span>
                        <span>Complete Order</span>
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const item = selectedArtwork;
                        setSelectedArtwork(null);
                        setWallArtwork(item);
                      }}
                      className="text-xs font-bold text-[#B87333] hover:underline flex items-center gap-1"
                    >
                      <span>🖼️ Preview on Room Wall</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="#custom-order"
                      onClick={() => setSelectedArtwork(null)}
                      className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition text-center flex items-center justify-center gap-1"
                    >
                      <span>✏️ Order Similar Custom Sketch</span>
                    </a>
                    <button
                      onClick={() => {
                        const msg = `*Hello ${settings.studioName}! I saw your completed custom order "${selectedArtwork.title}" on website and want to order a similar custom portrait!*`;
                        window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="px-3.5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                      title="Inquire on WhatsApp"
                    >
                      💬 WhatsApp
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-[#E8E5DF] mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-[#1A1816]">₹{selectedArtwork.price.toLocaleString('en-IN')}</span>
                    <button
                      onClick={() => {
                        const item = selectedArtwork;
                        setSelectedArtwork(null);
                        setWallArtwork(item);
                      }}
                      className="text-xs font-bold text-[#B87333] hover:underline flex items-center gap-1"
                    >
                      <span>🖼️ Preview on Room Wall</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleAddToCart(selectedArtwork);
                        setSelectedArtwork(null);
                      }}
                      className="flex-1 py-2.5 bg-[#1A1816] text-white rounded-xl text-xs font-bold hover:bg-[#B87333] transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleDirectWhatsAppBuy(selectedArtwork)}
                      className="px-3.5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                    >
                      💬 WhatsApp Buy
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 bg-[#1A1816] text-white px-4 py-3 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
