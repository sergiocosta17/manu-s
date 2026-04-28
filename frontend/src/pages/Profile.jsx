import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

// Função auxiliar para criar objeto Image a partir de URL
const createImage = (url) => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener('load', () => resolve(image));
  image.addEventListener('error', (error) => reject(error));
  image.src = url;
});

// Função para recortar imagem baseada na área selecionada no Cropper
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const AVATAR_SIZE = 400;
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  return canvas.toDataURL('image/jpeg', 0.8);
}

// Configuração padrão dos horários de funcionamento
const DEFAULT_BUSINESS_HOURS = {
  monday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
  tuesday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
  wednesday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
  thursday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
  friday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
  saturday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '18:00', closeTime: '23:00' },
};

// Mapeamento de dias para exibição
const DAY_LABELS = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

const DAY_SHORT_LABELS = {
  monday: 'Seg',
  tuesday: 'Ter',
  wednesday: 'Qua',
  thursday: 'Qui',
  friday: 'Sex',
  saturday: 'Sáb',
  sunday: 'Dom',
};

// ==================== FUNÇÕES AUXILIARES PARA DATAS ====================

// Função para converter timestamp (string ou número) para Date
const parseTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  // Se já é uma data válida em formato ISO
  if (typeof timestamp === 'string' && timestamp.includes('T')) {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  
  // Se é um timestamp numérico (string ou número)
  const numericTimestamp = typeof timestamp === 'string' ? Number(timestamp) : timestamp;
  
  if (isNaN(numericTimestamp)) return null;
  
  const date = new Date(numericTimestamp);
  return isNaN(date.getTime()) ? null : date;
};

// Função para formatar data de transação
const formatTransactionDate = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return 'Data indisponível';
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Função para formatar data de expiração
const formatExpirationDate = (timestamp) => {
  const date = parseTimestamp(timestamp);
  if (!date) return null;
  
  return date.toLocaleDateString('pt-BR');
};

// ==================== ÍCONES SVG ====================

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LocationIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const OrderIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const CardIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const StoreIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LogoutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const UploadIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CameraIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SaveIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const SpinnerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={`${className} animate-spin`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ReceiptIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ErrorIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const InfoIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WalletIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SparklesIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const GiftIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendingDownIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const AlertIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ShoppingBagIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const CurrencyIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TagIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const ShieldCheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ==================== COMPONENTES REUTILIZÁVEIS ====================

const InputField = ({ label, id, loading, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-[#1e3a5f]/70 text-xs mb-1.5 font-medium">{label}</label>}
    <div className="relative">
      <input
        id={id}
        className="w-full bg-[#faf8f5] border border-[#1e3a5f]/10 rounded-xl px-4 py-3 text-[#1e3a5f] text-sm placeholder:text-[#1e3a5f]/30 focus:outline-none focus:border-[#1e3a5f]/30 focus:ring-2 focus:ring-[#1e3a5f]/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        {...props}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <SpinnerIcon className="w-4 h-4 text-[#1e3a5f]" />
        </div>
      )}
    </div>
  </div>
);

const Modal = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={onClose} />
    <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <CloseIcon className="w-5 h-5 text-white" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-[#1e3a5f] text-white'
  };

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5" />,
    error: <ErrorIcon className="w-5 h-5" />,
    info: <InfoIcon className="w-5 h-5" />
  };

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-slide-down">
      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl ${typeStyles[toast.type]}`}>
        {icons[toast.type]}
        <span className="font-medium text-sm">{toast.message}</span>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">{title}</h3>
        <p className="text-[#1e3a5f]/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] font-medium transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium transition-colors">Confirmar</button>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================

export default function Profile() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';
  
  // Ref para o histórico de transações (para scroll)
  const transactionsRef = useRef(null);

  const [activeTab, setActiveTab] = useState(isAdmin ? 'STORE_INFO' : 'INFO');
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '', birthDate: '', avatarUrl: '' });
  const [adminData, setAdminData] = useState({ storeName: '', phone: '', email: '', avatarUrl: '' });
  const [addresses, setAddresses] = useState([]);
  const [adminAddressForm, setAdminAddressForm] = useState({
    label: 'Loja', zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', isDefault: true
  });
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '', zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', isDefault: false
  });
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [businessHours, setBusinessHours] = useState(DEFAULT_BUSINESS_HOURS);
  const [savingHours, setSavingHours] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const [cashbackData, setCashbackData] = useState({
    balance: 0, totalEarned: 0, totalUsed: 0, totalExpired: 0, pendingExpiration: 0,
    nextExpirationDate: null, transactions: [], isEnabled: true, currentCampaign: null
  });
  const [loadingCashback, setLoadingCashback] = useState(false);
  const [cashbackSettings, setCashbackSettings] = useState(null);

  // Função para rolar até o histórico de transações
  const scrollToTransactions = () => {
    if (transactionsRef.current) {
      transactionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  }, []);

  const showConfirm = useCallback((title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  }, []);

  const formatPhone = (val) => {
    if (!val) return '';
    let v = val.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2 && v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 7) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    if (v.length > 0) return `(${v}`;
    return v;
  };

  const handlePhoneChange = (e, isAdm) => {
    const formatted = formatPhone(e.target.value);
    if (isAdm) setAdminData({ ...adminData, phone: formatted });
    else setClientData({ ...clientData, phone: formatted });
  };

  const handleCepChange = async (e, targetForm) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    let formattedCep = val.length > 5 ? `${val.slice(0, 5)}-${val.slice(5)}` : val;

    if (targetForm === 'ADMIN') setAdminAddressForm(prev => ({ ...prev, zipCode: formattedCep }));
    else setAddressForm(prev => ({ ...prev, zipCode: formattedCep }));

    if (val.length === 8) {
      setIsCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await res.json();
        if (!data.erro) {
          const locationData = { street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf };
          if (targetForm === 'ADMIN') {
            setAdminAddressForm(prev => ({ ...prev, ...locationData }));
            document.getElementById('adminAddressNumber')?.focus();
          } else {
            setAddressForm(prev => ({ ...prev, ...locationData }));
            document.getElementById('addressNumber')?.focus();
          }
        }
      } catch (err) { } finally { setIsCepLoading(false); }
    }
  };

  const fetchCashbackData = useCallback(async () => {
    setLoadingCashback(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          query: `query {
            myCashbackWallet { id balance totalEarned totalUsed totalExpired transactions { id type amount description orderId expiresAt createdAt } }
            myCashbackSummary { balance pendingExpiration nextExpirationDate totalEarned isEnabled currentCampaign { id name description multiplier fixedPercentage endDate imageUrl } }
            cashbackSettings { isEnabled defaultPercentage minRedeemValue maxRedeemPercentage maxRedeemValue displayMessage }
          }`,
        }),
      });

      const result = await response.json();
      if (result.data) {
        const wallet = result.data.myCashbackWallet || {};
        const summary = result.data.myCashbackSummary || {};
        const settings = result.data.cashbackSettings;

        setCashbackData({
          balance: wallet.balance || summary.balance || 0,
          totalEarned: wallet.totalEarned || summary.totalEarned || 0,
          totalUsed: wallet.totalUsed || 0,
          totalExpired: wallet.totalExpired || 0,
          pendingExpiration: summary.pendingExpiration || 0,
          nextExpirationDate: summary.nextExpirationDate,
          transactions: wallet.transactions || [],
          isEnabled: summary.isEnabled ?? true,
          currentCampaign: summary.currentCampaign
        });
        setCashbackSettings(settings);
      }
    } catch (err) {
      console.error('Erro ao buscar cashback:', err);
    } finally {
      setLoadingCashback(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'CASHBACK' && !isAdmin) fetchCashbackData();
  }, [activeTab, isAdmin, fetchCashbackData]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        const profileRes = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            query: `query GetMe { me { id name email role phone birthDate avatarUrl storeName storeAddress { id label zipCode street number complement neighborhood city state isDefault } addresses { id label zipCode street number complement neighborhood city state isDefault } } }`
          })
        });

        const profileJson = await profileRes.json();
        if (profileJson.errors) throw new Error(profileJson.errors[0].message);

        const user = profileJson.data.me;

        if (isAdmin) {
          setAdminData({ storeName: user.storeName || user.name, phone: formatPhone(user.phone), email: user.email || '', avatarUrl: user.avatarUrl || '' });
          if (user.storeAddress) {
            setAdminAddressForm({
              label: user.storeAddress.label || 'Loja', zipCode: user.storeAddress.zipCode || '', street: user.storeAddress.street || '',
              number: user.storeAddress.number || '', complement: user.storeAddress.complement || '', neighborhood: user.storeAddress.neighborhood || '',
              city: user.storeAddress.city || '', state: user.storeAddress.state || '', isDefault: true
            });
          }

          const settingsRes = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ query: `query { storeSettings { id businessHours } }` })
          });
          const settingsJson = await settingsRes.json();
          if (settingsJson.data?.storeSettings?.businessHours) {
            try { setBusinessHours(JSON.parse(settingsJson.data.storeSettings.businessHours)); } catch (e) { console.error('Erro ao parsear horários:', e); }
          }
        } else {
          setClientData({ name: user.name || '', email: user.email || '', phone: formatPhone(user.phone), birthDate: user.birthDate || '', avatarUrl: user.avatarUrl || '' });
          if (user.addresses) setAddresses(user.addresses);
        }

        if (!isAdmin) {
          const ordersRes = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ query: `query GetOrders { orders { id total status createdAt cashbackEarned items { quantity name product { name } } } }` })
          });
          const ordersJson = await ordersRes.json();
          if (!ordersJson.errors) {
            const safeOrders = Array.isArray(ordersJson.data?.orders) ? ordersJson.data.orders : [];
            setOrders(safeOrders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [isAdmin, navigate]);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
        setCropModalOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (isAdmin) setAdminData(prev => ({ ...prev, avatarUrl: croppedImageBase64 }));
      else setClientData(prev => ({ ...prev, avatarUrl: croppedImageBase64 }));
      setCropModalOpen(false);
      setImageToCrop(null);
      showToast('Imagem ajustada! Clique em "Salvar alterações" para confirmar.', 'info');
    } catch (e) { showToast('Erro ao processar imagem.', 'error'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      if (isAdmin) {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            query: `mutation UpdateStore($input: UpdateStoreInput!) { updateStore(input: $input) { id storeName } }`,
            variables: { input: { storeName: adminData.storeName, phone: adminData.phone, avatarUrl: adminData.avatarUrl, storeAddress: { ...adminAddressForm, isDefault: true } } }
          })
        });
        const json = await response.json();
        if (json.errors) throw new Error(json.errors[0].message);
        showToast('Configurações da loja atualizadas com sucesso!', 'success');
      } else {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            query: `mutation UpdateProfile($input: UpdateProfileInput!) { updateProfile(input: $input) { id name } }`,
            variables: { input: { name: clientData.name, phone: clientData.phone, birthDate: clientData.birthDate, avatarUrl: clientData.avatarUrl } }
          })
        });
        const json = await response.json();
        if (json.errors) throw new Error(json.errors[0].message);
        showToast('Perfil atualizado com sucesso!', 'success');
      }
    } catch (err) {
      showToast('Erro ao salvar: ' + err.message, 'error');
    }
  };

  const handleDayChange = (day, field, value) => {
    setBusinessHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const handleApplyToAll = (sourceDay) => {
    const sourceHours = businessHours[sourceDay];
    const newHours = {};
    Object.keys(businessHours).forEach(day => { newHours[day] = { ...sourceHours }; });
    setBusinessHours(newHours);
    showToast('Horário aplicado em todos os dias!', 'success');
  };

  const handleSaveBusinessHours = async () => {
    setSavingHours(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          query: `mutation UpdateStoreSettings($input: StoreSettingsInput!) { updateStoreSettings(input: $input) { id businessHours } }`,
          variables: { input: { businessHours: JSON.stringify(businessHours) } }
        })
      });

      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);
      showToast('Horários de funcionamento salvos com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao salvar horários: ' + err.message, 'error');
    } finally {
      setSavingHours(false);
    }
  };

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({ ...address });
    } else {
      setEditingAddressId(null);
      setAddressForm({ label: '', zipCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', isDefault: addresses.length === 0 });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const mutation = editingAddressId
        ? `mutation UpdateAddress($addressId: ID!, $input: AddressInput!) { updateAddress(addressId: $addressId, input: $input) { id addresses { id label zipCode street number complement neighborhood city state isDefault } } }`
        : `mutation AddAddress($input: AddressInput!) { addAddress(input: $input) { id addresses { id label zipCode street number complement neighborhood city state isDefault } } }`;

      const { id, __typename, ...cleanAddressData } = addressForm;
      const addressInput = {
        label: cleanAddressData.label || '', zipCode: cleanAddressData.zipCode || '', street: cleanAddressData.street || '',
        number: cleanAddressData.number || '', complement: cleanAddressData.complement || null, neighborhood: cleanAddressData.neighborhood || '',
        city: cleanAddressData.city || '', state: cleanAddressData.state || '', isDefault: cleanAddressData.isDefault || false
      };

      const variables = editingAddressId ? { addressId: editingAddressId, input: addressInput } : { input: addressInput };

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query: mutation, variables })
      });

      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);

      const updatedAddresses = editingAddressId ? json.data.updateAddress.addresses : json.data.addAddress.addresses;
      setAddresses(updatedAddresses);
      setIsAddressModalOpen(false);
      showToast(editingAddressId ? 'Endereço atualizado!' : 'Endereço adicionado!', 'success');
    } catch (err) {
      showToast('Erro ao salvar endereço: ' + err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    showConfirm('Excluir endereço', 'Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita.', async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            query: `mutation DeleteAddress($addressId: ID!) { deleteAddress(addressId: $addressId) { id addresses { id label zipCode street number complement neighborhood city state isDefault } } }`,
            variables: { addressId: id }
          })
        });
        const json = await response.json();
        if (json.errors) throw new Error(json.errors[0].message);
        setAddresses(json.data.deleteAddress.addresses);
        showToast('Endereço excluído com sucesso!', 'success');
      } catch (err) {
        showToast('Erro ao excluir: ' + err.message, 'error');
      }
      closeConfirm();
    });
  };

  const handleLogout = () => {
    showConfirm('Sair da conta', 'Tem certeza que deseja sair da sua conta?', () => {
      localStorage.clear();
      navigate('/');
    });
  };

  const getStatusDisplay = (status) => {
    const map = {
      PLACED: { label: 'Recebido', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20' },
      CONFIRMED: { label: 'Confirmado', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20' },
      PREPARING: { label: 'Em Produção', color: 'bg-[#1e3a5f]/20 text-[#1e3a5f] border-[#1e3a5f]/30' },
      OUT_FOR_DELIVERY: { label: 'Saiu p/ Entrega', color: 'bg-[#1e3a5f]/30 text-[#1e3a5f] border-[#1e3a5f]/40' },
      DELIVERED: { label: 'Entregue', color: 'bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20' },
      COMPLETED: { label: 'Concluído', color: 'bg-green-100 text-green-700 border-green-200' },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-50 text-red-500 border-red-100' }
    };
    return map[status] || { label: status, color: 'bg-[#1e3a5f]/5 text-[#1e3a5f]/50 border-[#1e3a5f]/10' };
  };

  const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const clientTabs = [
    { id: 'INFO', label: 'Dados Pessoais', icon: <UserIcon /> },
    { id: 'CASHBACK', label: 'Cashback', icon: <WalletIcon /> },
    { id: 'ADDRESSES', label: 'Endereços', icon: <LocationIcon /> },
    { id: 'ORDERS', label: 'Pedidos', icon: <OrderIcon /> },
    { id: 'PAYMENTS', label: 'Pagamentos', icon: <CardIcon /> }
  ];

  const adminTabs = [
    { id: 'STORE_INFO', label: 'Dados da Loja', icon: <StoreIcon /> },
    { id: 'BUSINESS_HOURS', label: 'Funcionamento', icon: <ClockIcon /> }
  ];

  const tabs = isAdmin ? adminTabs : clientTabs;
  const currentAvatar = isAdmin ? adminData.avatarUrl : clientData.avatarUrl;
  const currentName = isAdmin ? adminData.storeName : clientData.name;

  return (
    <div 
      className="min-h-screen flex flex-col relative pb-28 md:pb-0 font-sans selection:bg-[#1e3a5f] selection:text-white"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}
    >
      <div className="absolute inset-0 bg-[#faf8f5]/85 pointer-events-none"></div>
      <div className="relative z-10 h-20"></div>

      <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />
      <ConfirmModal isOpen={confirmModal.show} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={closeConfirm} />

      {/* Modal de Crop */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-4">
              <h3 className="text-lg font-bold text-white">Ajustar Imagem</h3>
            </div>
            <div className="relative h-80 bg-black">
              <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-[#1e3a5f]/70 mb-1 block">Zoom</label>
                <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setCropModalOpen(false); setImageToCrop(null); }} className="flex-1 py-3 rounded-xl bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] font-medium">Cancelar</button>
                <button onClick={handleSaveCrop} className="flex-1 py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium">Aplicar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="relative z-10 flex-grow flex flex-col justify-center items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="mt-6 text-[#1e3a5f]/40 font-medium text-sm">Carregando perfil...</p>
        </div>
      ) : (
        <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-8 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#1e3a5f]/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 border-2 border-[#1e3a5f]/20 overflow-hidden flex-shrink-0 shadow-lg">
                  {currentAvatar ? (
                    <img src={currentAvatar} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#1e3a5f]/30">
                      <UserIcon className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-lg font-bold text-[#1e3a5f] truncate">{currentName || 'Bem-vindo(a)'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 bg-[#1e3a5f] rounded-full"></span>
                    <p className="text-xs font-medium text-[#1e3a5f]/50">{isAdmin ? 'Administrador' : 'Cliente'}</p>
                  </div>
                </div>
              </div>

              <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm whitespace-nowrap lg:whitespace-normal transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20'
                        : 'text-[#1e3a5f]/50 hover:bg-[#1e3a5f]/5 hover:text-[#1e3a5f]'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-white' : ''}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-[#1e3a5f]/10 hidden lg:block">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm text-[#1e3a5f]/60 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 transition-all">
                  <LogoutIcon />
                  Sair da conta
                </button>
              </div>
            </div>
          </aside>

          <section className="flex-grow">

            {/* Informações Pessoais / Dados da Loja */}
            {(activeTab === 'INFO' || activeTab === 'STORE_INFO') && (
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1e3a5f]/10">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-[#1e3a5f]">{isAdmin ? 'Informações da Loja' : 'Informações Pessoais'}</h3>
                    <p className="text-[#1e3a5f]/40 text-sm mt-1">Gerencie seus dados</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-[#faf8f5] rounded-2xl border border-[#1e3a5f]/5">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 border-2 border-dashed border-[#1e3a5f]/20 overflow-hidden flex-shrink-0 relative group">
                      {(isAdmin ? adminData.avatarUrl : clientData.avatarUrl) ? (
                        <img src={isAdmin ? adminData.avatarUrl : clientData.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1e3a5f]/20">
                          <CameraIcon className="w-10 h-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#1e3a5f]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Alterar</span>
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-medium text-[#1e3a5f] mb-2">{isAdmin ? 'Logo da Loja' : 'Foto de Perfil'}</p>
                      <label className="inline-flex items-center gap-2 bg-white border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20 px-4 py-2.5 rounded-xl font-medium text-sm text-[#1e3a5f] cursor-pointer transition-all hover:shadow-md">
                        <UploadIcon />
                        Escolher imagem
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField label={isAdmin ? "Nome da Loja" : "Nome Completo"} value={isAdmin ? adminData.storeName : clientData.name} onChange={(e) => isAdmin ? setAdminData({ ...adminData, storeName: e.target.value }) : setClientData({ ...clientData, name: e.target.value })} required />
                    <InputField label="Telefone" value={isAdmin ? adminData.phone : clientData.phone} onChange={(e) => handlePhoneChange(e, isAdmin)} placeholder="(00) 00000-0000" />
                    {!isAdmin && (
                      <>
                        <InputField label="E-mail" value={clientData.email} disabled className="bg-[#faf8f5]" />
                        <InputField label="Data de Nascimento" type="date" value={clientData.birthDate} onChange={(e) => setClientData({ ...clientData, birthDate: e.target.value })} />
                      </>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="pt-6 border-t border-[#1e3a5f]/10">
                      <h4 className="font-semibold text-[#1e3a5f] mb-5 flex items-center gap-2">
                        <LocationIcon className="w-5 h-5 text-[#1e3a5f]" />
                        Endereço de Retirada
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputField label="CEP" value={adminAddressForm.zipCode} onChange={(e) => handleCepChange(e, 'ADMIN')} placeholder="00000-000" maxLength="9" loading={isCepLoading} className="md:col-span-1" />
                        <InputField label="Rua" value={adminAddressForm.street} onChange={(e) => setAdminAddressForm({ ...adminAddressForm, street: e.target.value })} className="md:col-span-2" />
                        <InputField label="Número" id="adminAddressNumber" value={adminAddressForm.number} onChange={(e) => setAdminAddressForm({ ...adminAddressForm, number: e.target.value })} />
                        <InputField label="Bairro" value={adminAddressForm.neighborhood} onChange={(e) => setAdminAddressForm({ ...adminAddressForm, neighborhood: e.target.value })} />
                        <InputField label="Cidade" value={adminAddressForm.city} onChange={(e) => setAdminAddressForm({ ...adminAddressForm, city: e.target.value })} />
                        <InputField label="Estado" value={adminAddressForm.state} onChange={(e) => setAdminAddressForm({ ...adminAddressForm, state: e.target.value })} maxLength="2" className="uppercase" />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-4 px-8 rounded-xl transition-all shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl flex items-center justify-center gap-2">
                    <SaveIcon />
                    Salvar alterações
                  </button>
                </form>
              </div>
            )}

            {/* Horários de Funcionamento (admin) */}
            {activeTab === 'BUSINESS_HOURS' && isAdmin && (
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1e3a5f]/10">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-[#1e3a5f]">Horários de Funcionamento</h3>
                    <p className="text-[#1e3a5f]/40 text-sm mt-1">Defina quando sua loja estará aberta</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(DAY_LABELS).map(([day, label]) => (
                    <div key={day} className={`p-5 rounded-2xl border-2 transition-all ${businessHours[day]?.isOpen ? 'border-[#1e3a5f]/20 bg-gradient-to-r from-[#1e3a5f]/5 to-transparent' : 'border-[#1e3a5f]/10 bg-[#faf8f5]'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4 min-w-[180px]">
                          <button type="button" onClick={() => handleDayChange(day, 'isOpen', !businessHours[day]?.isOpen)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${businessHours[day]?.isOpen ? 'bg-[#1e3a5f]' : 'bg-[#1e3a5f]/20'}`}>
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${businessHours[day]?.isOpen ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                          <span className={`font-semibold ${businessHours[day]?.isOpen ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/40'}`}>{label}</span>
                        </div>

                        {businessHours[day]?.isOpen && (
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm text-[#1e3a5f]/50">Abre</span>
                            <input type="time" value={businessHours[day]?.openTime || '18:00'} onChange={(e) => handleDayChange(day, 'openTime', e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 focus:ring-2 focus:ring-[#1e3a5f]/10 outline-none text-[#1e3a5f] font-medium" />
                            <span className="text-sm text-[#1e3a5f]/50">Fecha</span>
                            <input type="time" value={businessHours[day]?.closeTime || '23:00'} onChange={(e) => handleDayChange(day, 'closeTime', e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 focus:ring-2 focus:ring-[#1e3a5f]/10 outline-none text-[#1e3a5f] font-medium" />
                            <button type="button" onClick={() => handleApplyToAll(day)} className="ml-2 text-xs text-[#1e3a5f] hover:text-[#1e3a5f]/70 hover:bg-[#1e3a5f]/10 px-3 py-2 rounded-lg transition-all flex items-center gap-1 font-medium border border-[#1e3a5f]/20">
                              <EditIcon className="w-4 h-4" />
                              Aplicar em todos
                            </button>
                          </div>
                        )}

                        {!businessHours[day]?.isOpen && (<span className="text-sm text-[#1e3a5f]/30 italic">Fechado</span>)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-[#faf8f5] rounded-2xl border border-[#1e3a5f]/5">
                  <h4 className="font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-[#1e3a5f]" />
                    Resumo da Semana
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(DAY_SHORT_LABELS).map(([day, shortLabel]) => (
                      <div key={day} className={`px-4 py-3 rounded-xl text-center min-w-[70px] ${businessHours[day]?.isOpen ? 'bg-[#1e3a5f] text-white' : 'bg-[#1e3a5f]/10 text-[#1e3a5f]/40'}`}>
                        <div className="text-xs font-bold">{shortLabel}</div>
                        {businessHours[day]?.isOpen && (<div className="text-[10px] opacity-80 mt-1">{businessHours[day]?.openTime}</div>)}
                      </div>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={handleSaveBusinessHours} disabled={savingHours} className="mt-8 w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-4 px-8 rounded-xl transition-all shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70">
                  {savingHours ? <><SpinnerIcon className="w-5 h-5" /> Salvando...</> : <><SaveIcon /> Salvar horários</>}
                </button>
              </div>
            )}

            {/* ==================== CASHBACK ==================== */}
            {activeTab === 'CASHBACK' && !isAdmin && (
              <div className="space-y-6">
                
                {/* Card Principal - Saldo de Cashback */}
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/10 overflow-hidden">
                  {/* Header com gradiente */}
                  <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] p-6 lg:p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <WalletIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white">Meu Cashback</h3>
                            <p className="text-white/60 text-sm">Saldo disponível para uso</p>
                          </div>
                        </div>
                        {cashbackSettings?.isEnabled && (
                          <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <ShieldCheckIcon className="w-4 h-4 text-white" />
                            <span className="text-xs font-medium text-white">Ativo</span>
                          </div>
                        )}
                      </div>

                      {loadingCashback ? (
                        <div className="flex items-center justify-center py-8">
                          <SpinnerIcon className="w-8 h-8 text-white" />
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-white/60 text-sm mb-2">Você tem</p>
                          <p className="text-5xl lg:text-6xl font-black text-white tracking-tight">
                            R$ {cashbackData.balance.toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-white/60 text-sm mt-2">disponíveis para usar</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estatísticas */}
                  {!loadingCashback && (
                    <div className="p-6 lg:p-8 bg-[#faf8f5]">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl p-4 text-center border border-[#1e3a5f]/5 shadow-sm">
                          <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <TrendingUpIcon className="w-5 h-5 text-[#1e3a5f]" />
                          </div>
                          <p className="text-xl font-bold text-[#1e3a5f]">R$ {cashbackData.totalEarned.toFixed(2).replace('.', ',')}</p>
                          <p className="text-[#1e3a5f]/50 text-xs mt-1">Total ganho</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 text-center border border-[#1e3a5f]/5 shadow-sm">
                          <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <TagIcon className="w-5 h-5 text-[#1e3a5f]" />
                          </div>
                          <p className="text-xl font-bold text-[#1e3a5f]">R$ {cashbackData.totalUsed.toFixed(2).replace('.', ',')}</p>
                          <p className="text-[#1e3a5f]/50 text-xs mt-1">Total usado</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 text-center border border-[#1e3a5f]/5 shadow-sm">
                          <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                            <ClockIcon className="w-5 h-5 text-[#1e3a5f]" />
                          </div>
                          <p className="text-xl font-bold text-[#1e3a5f]">R$ {cashbackData.totalExpired.toFixed(2).replace('.', ',')}</p>
                          <p className="text-[#1e3a5f]/50 text-xs mt-1">Expirado</p>
                        </div>
                      </div>

                      {/* Alerta de Expiração - CORRIGIDO */}
                      {cashbackData.pendingExpiration > 0 && cashbackData.nextExpirationDate && (
                        <button 
                          onClick={scrollToTransactions}
                          className="mt-4 w-full bg-white border-2 border-[#1e3a5f]/20 rounded-xl p-4 flex items-center gap-4 hover:border-[#1e3a5f]/40 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertIcon className="w-6 h-6 text-[#1e3a5f]" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-[#1e3a5f]">
                              R$ {cashbackData.pendingExpiration.toFixed(2).replace('.', ',')} expirando em breve
                            </p>
                            <p className="text-xs text-[#1e3a5f]/60 mt-0.5 flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              Válido até {formatExpirationDate(cashbackData.nextExpirationDate) || 'data indisponível'}
                            </p>
                          </div>
                          <ArrowRightIcon className="w-5 h-5 text-[#1e3a5f]/40" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Campanha Ativa */}
                {cashbackData.currentCampaign && (
                  <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/10 p-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1e3a5f]/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#1e3a5f]/20">
                        <SparklesIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#1e3a5f] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Campanha Ativa</span>
                        </div>
                        <h4 className="text-lg font-bold text-[#1e3a5f]">{cashbackData.currentCampaign.name}</h4>
                        {cashbackData.currentCampaign.description && (
                          <p className="text-[#1e3a5f]/60 text-sm mt-1">{cashbackData.currentCampaign.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                          {cashbackData.currentCampaign.multiplier && (
                            <div className="flex items-center gap-1.5 bg-[#1e3a5f]/5 px-3 py-1.5 rounded-lg">
                              <TrendingUpIcon className="w-4 h-4 text-[#1e3a5f]" />
                              <span className="text-[#1e3a5f] font-bold">{cashbackData.currentCampaign.multiplier}x cashback</span>
                            </div>
                          )}
                          {cashbackData.currentCampaign.fixedPercentage && (
                            <div className="flex items-center gap-1.5 bg-[#1e3a5f]/5 px-3 py-1.5 rounded-lg">
                              <GiftIcon className="w-4 h-4 text-[#1e3a5f]" />
                              <span className="text-[#1e3a5f] font-bold">{cashbackData.currentCampaign.fixedPercentage}% de volta</span>
                            </div>
                          )}
                          {cashbackData.currentCampaign.endDate && (
                            <div className="flex items-center gap-1.5 text-[#1e3a5f]/50 text-sm">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Até {formatExpirationDate(cashbackData.currentCampaign.endDate) || 'data indisponível'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Como funciona */}
                <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/10 p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                      <InfoIcon className="w-5 h-5 text-[#1e3a5f]" />
                    </div>
                    <h4 className="text-lg font-bold text-[#1e3a5f]">Como funciona</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <div className="bg-[#faf8f5] rounded-xl p-5 text-center border border-[#1e3a5f]/5 h-full">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">1</div>
                        <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                          <ShoppingBagIcon className="w-7 h-7 text-[#1e3a5f]" />
                        </div>
                        <h5 className="font-bold text-[#1e3a5f] mb-2">Faça um pedido</h5>
                        <p className="text-[#1e3a5f]/60 text-sm">
                          Ganhe {cashbackSettings?.defaultPercentage || 5}% de cashback em cada compra realizada
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="bg-[#faf8f5] rounded-xl p-5 text-center border border-[#1e3a5f]/5 h-full">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">2</div>
                        <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                          <CurrencyIcon className="w-7 h-7 text-[#1e3a5f]" />
                        </div>
                        <h5 className="font-bold text-[#1e3a5f] mb-2">Acumule saldo</h5>
                        <p className="text-[#1e3a5f]/60 text-sm">
                          O cashback é creditado automaticamente após a confirmação do pedido
                        </p>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="bg-[#faf8f5] rounded-xl p-5 text-center border border-[#1e3a5f]/5 h-full">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">3</div>
                        <div className="w-14 h-14 bg-[#1e3a5f]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-2">
                          <GiftIcon className="w-7 h-7 text-[#1e3a5f]" />
                        </div>
                        <h5 className="font-bold text-[#1e3a5f] mb-2">Use no próximo</h5>
                        <p className="text-[#1e3a5f]/60 text-sm">
                          Utilize seu saldo como desconto na próxima compra
                        </p>
                      </div>
                    </div>
                  </div>

                  {cashbackSettings && (
                    <div className="mt-6 pt-5 border-t border-[#1e3a5f]/10">
                      <div className="flex items-center justify-center gap-2 flex-wrap text-[#1e3a5f]/50 text-xs">
                        <span className="flex items-center gap-1">
                          <TagIcon className="w-3.5 h-3.5" />
                          Mínimo para resgate: R$ {cashbackSettings.minRedeemValue?.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>Máximo: {cashbackSettings.maxRedeemPercentage}% do pedido</span>
                        {cashbackSettings.maxRedeemValue && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>ou R$ {cashbackSettings.maxRedeemValue.toFixed(2).replace('.', ',')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Histórico de Transações - CORRIGIDO */}
                <div ref={transactionsRef} className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/10 p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e3a5f]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                        <ReceiptIcon className="w-5 h-5 text-[#1e3a5f]" />
                      </div>
                      <h4 className="text-lg font-bold text-[#1e3a5f]">Histórico de Transações</h4>
                    </div>
                    <span className="bg-[#1e3a5f]/5 text-[#1e3a5f] text-xs font-medium px-3 py-1.5 rounded-full">
                      {cashbackData.transactions.length} transações
                    </span>
                  </div>

                  {cashbackData.transactions.length === 0 ? (
                    <div className="text-center py-12 bg-[#faf8f5] rounded-2xl border border-dashed border-[#1e3a5f]/10">
                      <div className="w-16 h-16 bg-[#1e3a5f]/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <WalletIcon className="w-8 h-8 text-[#1e3a5f]/30" />
                      </div>
                      <p className="text-[#1e3a5f]/50 font-medium">Nenhuma transação ainda</p>
                      <p className="text-[#1e3a5f]/30 text-sm mt-1">Faça um pedido para começar a ganhar cashback!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {cashbackData.transactions
                        .sort((a, b) => {
                          const dateA = parseTimestamp(a.createdAt);
                          const dateB = parseTimestamp(b.createdAt);
                          if (!dateA || !dateB) return 0;
                          return dateB.getTime() - dateA.getTime();
                        })
                        .map((tx) => {
                          const isCredit = tx.type === 'CREDIT' || (tx.type === 'ADJUSTMENT' && tx.amount > 0);
                          const isExpired = tx.type === 'EXPIRED';
                          const formattedDate = formatTransactionDate(tx.createdAt);
                          const formattedExpiration = tx.expiresAt ? formatExpirationDate(tx.expiresAt) : null;
                          
                          return (
                            <div
                              key={tx.id}
                              className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                                isCredit 
                                  ? 'bg-[#1e3a5f]/5 border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20' 
                                  : isExpired 
                                    ? 'bg-[#faf8f5] border-[#1e3a5f]/5' 
                                    : 'bg-[#faf8f5] border-[#1e3a5f]/5'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                    isCredit ? 'bg-[#1e3a5f]' : isExpired ? 'bg-[#1e3a5f]/30' : 'bg-[#1e3a5f]/60'
                                  }`}>
                                    {isCredit ? <TrendingUpIcon className="w-5 h-5 text-white" /> : isExpired ? <ClockIcon className="w-5 h-5 text-white" /> : <TrendingDownIcon className="w-5 h-5 text-white" />}
                                  </div>
                                  <div>
                                    <p className={`font-semibold text-sm ${isCredit ? 'text-[#1e3a5f]' : isExpired ? 'text-[#1e3a5f]/50' : 'text-[#1e3a5f]/70'}`}>
                                      {tx.description || (isCredit ? 'Cashback recebido' : isExpired ? 'Cashback expirado' : 'Cashback utilizado')}
                                    </p>
                                    <p className="text-[#1e3a5f]/40 text-xs mt-0.5 flex items-center gap-1">
                                      <CalendarIcon className="w-3 h-3" />
                                      {formattedDate}
                                    </p>
                                    {formattedExpiration && isCredit && (
                                      <p className="text-[#1e3a5f]/50 text-xs mt-1 flex items-center gap-1">
                                        <AlertIcon className="w-3 h-3" />
                                        Expira em {formattedExpiration}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className={`font-bold text-lg ${isCredit ? 'text-[#1e3a5f]' : isExpired ? 'text-[#1e3a5f]/40' : 'text-[#1e3a5f]/60'}`}>
                                  {isCredit ? '+' : '-'}R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Endereços */}
            {activeTab === 'ADDRESSES' && (
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1e3a5f]/10">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-[#1e3a5f]">Meus Endereços</h3>
                    <p className="text-[#1e3a5f]/40 text-sm mt-1">{addresses.length} endereço(s) salvo(s)</p>
                  </div>
                  <button onClick={() => openAddressModal()} className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm">
                    <PlusIcon />
                    <span className="hidden sm:inline">Novo endereço</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-16 bg-[#faf8f5] rounded-2xl border border-dashed border-[#1e3a5f]/10">
                    <LocationIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                    <p className="text-[#1e3a5f]/40 font-medium">Nenhum endereço cadastrado</p>
                    <p className="text-[#1e3a5f]/30 text-sm mt-1">Adicione um endereço para facilitar suas entregas</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className={`p-5 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-[#1e3a5f] bg-gradient-to-br from-[#1e3a5f]/5 to-transparent' : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/20'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1e3a5f]">{addr.label || 'Endereço'}</span>
                            {addr.isDefault && (<span className="bg-[#1e3a5f] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Principal</span>)}
                          </div>
                        </div>
                        <p className="text-sm text-[#1e3a5f]/60 leading-relaxed">
                          {addr.street}, {addr.number}
                          {addr.complement && ` - ${addr.complement}`}<br />
                          {addr.neighborhood} • {addr.city}/{addr.state}<br />
                          <span className="text-[#1e3a5f]/40">CEP: {addr.zipCode}</span>
                        </p>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-[#1e3a5f]/5">
                          <button onClick={() => openAddressModal(addr)} className="text-sm font-medium text-[#1e3a5f] hover:text-[#1e3a5f]/70 transition-colors">Editar</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm font-medium text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60 transition-colors">Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pedidos */}
            {activeTab === 'ORDERS' && (
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1e3a5f]/10">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-[#1e3a5f]">Histórico de Pedidos</h3>
                    <p className="text-[#1e3a5f]/40 text-sm mt-1">{orders.length} pedido(s)</p>
                  </div>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-[#faf8f5] rounded-2xl border border-dashed border-[#1e3a5f]/10">
                    <OrderIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                    <p className="text-[#1e3a5f]/40 font-medium">Nenhum pedido realizado</p>
                    <p className="text-[#1e3a5f]/30 text-sm mt-1">Seus pedidos aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const status = getStatusDisplay(order.status);
                      const isFinished = order.status === 'DELIVERED' || order.status === 'COMPLETED';
                      
                      return (
                        <div key={order.id} className="p-5 rounded-2xl border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20 transition-all hover:shadow-md">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#1e3a5f]">#{order.id.slice(-6).toUpperCase()}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>{status.label}</span>
                            </div>
                            <span className="text-sm text-[#1e3a5f]/40">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-sm text-[#1e3a5f]/70">
                                <span className="font-semibold text-[#1e3a5f]">{item.quantity}x</span> {item.product?.name || item.name}
                              </p>
                            ))}
                          </div>
                          
                          {order.cashbackEarned > 0 && (
                            <div className="flex items-center gap-2 py-2 px-3 bg-[#1e3a5f]/5 rounded-lg mb-4">
                              <SparklesIcon className="w-4 h-4 text-[#1e3a5f]" />
                              <span className="text-xs text-[#1e3a5f] font-medium">
                                +R$ {order.cashbackEarned.toFixed(2).replace('.', ',')} de cashback
                              </span>
                            </div>
                          )}
                          
                          <div className="pt-4 border-t border-[#1e3a5f]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[#1e3a5f]/40">Total</span>
                              <span className="text-xl font-bold text-[#1e3a5f]">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                            
                            {isFinished && (
                              <button className="flex items-center justify-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-md text-sm">
                                <ReceiptIcon className="w-4 h-4" />
                                Gerar Nota Fiscal
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Pagamentos */}
            {activeTab === 'PAYMENTS' && (
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1e3a5f]/10">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-[#1e3a5f]">Formas de Pagamento</h3>
                    <p className="text-[#1e3a5f]/40 text-sm mt-1">Gerencie seus métodos de pagamento</p>
                  </div>
                </div>
                <div className="text-center py-16 bg-[#faf8f5] rounded-2xl border border-dashed border-[#1e3a5f]/10">
                  <CardIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                  <p className="text-[#1e3a5f]/40 font-medium">Em breve</p>
                  <p className="text-[#1e3a5f]/30 text-sm mt-1">Você poderá salvar seus cartões aqui</p>
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* Modal de Endereço */}
      {isAddressModalOpen && (
        <Modal onClose={() => setIsAddressModalOpen(false)} title={editingAddressId ? 'Editar Endereço' : 'Novo Endereço'}>
          <form onSubmit={handleSaveAddress} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField label="Identificação" value={addressForm.label} onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })} placeholder="Ex: Casa, Trabalho" className="md:col-span-2" autoFocus />
              <InputField label="CEP" value={addressForm.zipCode} onChange={(e) => handleCepChange(e, 'CLIENT')} placeholder="00000-000" maxLength="9" loading={isCepLoading} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <InputField label="Rua" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} className="md:col-span-3" required />
              <InputField id="addressNumber" label="Número" value={addressForm.number} onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label="Complemento" value={addressForm.complement} onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })} placeholder="Apto, Bloco..." />
              <InputField label="Bairro" value={addressForm.neighborhood} onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField label="Cidade" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} className="md:col-span-2" required />
              <InputField label="Estado" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value.toUpperCase() })} maxLength="2" required />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} className="w-5 h-5 rounded border-[#1e3a5f]/20 text-[#1e3a5f] focus:ring-[#1e3a5f]/20" />
              <label htmlFor="isDefault" className="text-sm text-[#1e3a5f]/70">Definir como endereço principal</label>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setIsAddressModalOpen(false)} className="flex-1 py-3 rounded-xl bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f] font-medium transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-3 rounded-xl bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium transition-colors">{editingAddressId ? 'Atualizar' : 'Adicionar'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Botão de logout mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#1e3a5f]/10 lg:hidden z-40">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm text-[#1e3a5f]/60 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 transition-all">
          <LogoutIcon />
          Sair da conta
        </button>
      </div>

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}