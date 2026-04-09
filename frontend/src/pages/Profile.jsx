import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';

const createImage = (url) => new Promise((resolve, reject) => {
  const image = new Image();
  image.addEventListener('load', () => resolve(image));
  image.addEventListener('error', (error) => reject(error));
  image.src = url;
});

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

export default function Profile() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';

  const [activeTab, setActiveTab] = useState(isAdmin ? 'STORE_INFO' : 'INFO');
  
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '', birthDate: '', avatarUrl: '' });
  const [adminData, setAdminData] = useState({ storeName: '', phone: '', email: '', avatarUrl: '' });
  
  const [addresses, setAddresses] = useState([]);
  const [adminAddressForm, setAdminAddressForm] = useState({ cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '' });

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({ title: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', isMain: false });
  const [isCepLoading, setIsCepLoading] = useState(false);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
    
    if (targetForm === 'ADMIN') setAdminAddressForm(prev => ({ ...prev, cep: formattedCep }));
    else setAddressForm(prev => ({ ...prev, cep: formattedCep }));

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
      } catch (err) {} finally { setIsCepLoading(false); }
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        const profileRes = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ query: `query { me { name email phone birthDate avatarUrl storeName pickupAddress addresses } }` })
        });
        const profileJson = await profileRes.json();
        if (profileJson.errors) throw new Error(profileJson.errors[0].message);
        
        const user = profileJson.data.me;
        
        if (isAdmin) {
          setAdminData({
            storeName: user.storeName || user.name,
            phone: formatPhone(user.phone),
            email: user.email || '',
            avatarUrl: user.avatarUrl || ''
          });
          if (user.pickupAddress) {
            try { setAdminAddressForm(JSON.parse(user.pickupAddress)); } 
            catch(e) { setAdminAddressForm(prev => ({...prev, street: user.pickupAddress})); }
          }
        } else {
          setClientData({
            name: user.name || '', email: user.email || '', phone: formatPhone(user.phone), birthDate: user.birthDate || '', avatarUrl: user.avatarUrl || ''
          });
          if (user.addresses) setAddresses(JSON.parse(user.addresses));
        }

        if (!isAdmin) {
          const ordersRes = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ query: `query { orders { id total status createdAt items { quantity product { name } } } }` })
          });
          const ordersJson = await ordersRes.json();
          if (!ordersJson.errors) {
            const safeOrders = Array.isArray(ordersJson.data?.orders) ? ordersJson.data.orders : [];
            setOrders(safeOrders.sort((a, b) => Number(b.createdAt) - Number(a.createdAt)));
          }
        }
      } catch (err) {} finally { setLoading(false); }
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

  const handleSaveCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (isAdmin) setAdminData(prev => ({...prev, avatarUrl: croppedImageBase64}));
      else setClientData(prev => ({...prev, avatarUrl: croppedImageBase64}));
      setCropModalOpen(false);
      setImageToCrop(null);
    } catch (e) { alert('Erro ao processar imagem.'); }
  };

  const syncProfileToBackend = async (dataToUpdate) => {
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          query: `mutation UpdateProfile($name: String, $phone: String, $birthDate: String, $avatarUrl: String, $storeName: String, $pickupAddress: String, $addresses: String) { updateProfile(name: $name, phone: $phone, birthDate: $birthDate, avatarUrl: $avatarUrl, storeName: $storeName, pickupAddress: $pickupAddress, addresses: $addresses) { id } }`,
          variables: dataToUpdate
        })
      });
      return true;
    } catch (err) { alert('Erro ao salvar no banco'); return false; }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const variables = isAdmin 
      ? { name: adminData.storeName, phone: adminData.phone, pickupAddress: JSON.stringify(adminAddressForm), storeName: adminData.storeName, avatarUrl: adminData.avatarUrl }
      : { name: clientData.name, phone: clientData.phone, birthDate: clientData.birthDate, avatarUrl: clientData.avatarUrl };

    if (await syncProfileToBackend(variables)) alert('Perfil atualizado!');
  };

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm(address);
    } else {
      setEditingAddressId(null);
      setAddressForm({ title: '', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', isMain: addresses.length === 0 });
    }
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    let updated = [...addresses];
    if (addressForm.isMain) updated = updated.map(a => ({ ...a, isMain: false }));
    if (editingAddressId) updated = updated.map(a => a.id === editingAddressId ? { ...addressForm, id: a.id } : a);
    else updated.push({ ...addressForm, id: Date.now().toString() });
    if (updated.length === 1) updated[0].isMain = true;

    setAddresses(updated);
    setIsAddressModalOpen(false);
    await syncProfileToBackend({ addresses: JSON.stringify(updated) });
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Excluir este endereço?')) return;
    let updated = addresses.filter(a => a.id !== id);
    if (updated.length > 0 && addresses.find(a => a.id === id).isMain) updated[0].isMain = true; 
    setAddresses(updated);
    await syncProfileToBackend({ addresses: JSON.stringify(updated) });
  };

  const handleLogout = () => {
    if (window.confirm('Terminar sessão?')) { localStorage.clear(); navigate('/'); }
  };

  const getStatusDisplay = (status) => {
    const map = {
      PENDING: { label: 'Aguardando', color: 'text-red-500 bg-red-50' },
      PREPARING: { label: 'Em Produção', color: 'text-[#C1704D] bg-[#C1704D]/10' },
      READY: { label: 'Pronto p/ Entrega', color: 'text-[#EBCB6C] bg-[#1A1A1A]' },
      DELIVERED: { label: 'Entregue', color: 'text-green-600 bg-green-50' },
      CANCELLED: { label: 'Cancelado', color: 'text-gray-500 bg-gray-100' }
    };
    return map[status] || { label: status, color: 'text-gray-500 bg-gray-100' };
  };

  const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const clientTabs = [
    { id: 'INFO', label: 'Dados Pessoais', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> },
    { id: 'ADDRESSES', label: 'Meus Endereços', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> },
    { id: 'ORDERS', label: 'Histórico de Compras', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg> },
    { id: 'PAYMENTS', label: 'Formas de Pagamento', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg> }
  ];

  const adminTabs = [
    { id: 'STORE_INFO', label: 'Dados da Loja', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> }
  ];

  const tabs = isAdmin ? adminTabs : clientTabs;
  const currentAvatar = isAdmin ? adminData.avatarUrl : clientData.avatarUrl;
  const currentName = isAdmin ? adminData.storeName : clientData.name;

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">
      
      {/* CABEÇALHO UNIFICADO */}
      <header className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md p-4 shadow-sm border-b border-[#EBCB6C]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-black text-[#FDF9EB] tracking-tighter leading-none">MANU´S</h1>
            <p className="text-[9px] font-bold text-[#EBCB6C] tracking-[0.3em] uppercase mt-1">
              {isAdmin ? 'Configurações' : 'Minha Conta'}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {isAdmin ? (
              <>
                <button onClick={() => navigate('/promotions')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> Ofertas
                </button>
                <button onClick={() => window.scrollTo(0,0)} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Meu Perfil
                </button>
                <button onClick={() => navigate('/admin')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Gestão
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/promotions')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> Ofertas
                </button>
                <button onClick={() => navigate('/menu')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> Voltar à Loja
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {loading ? (
         <div className="flex-grow flex flex-col justify-center items-center opacity-50">
           <svg className="w-12 h-12 animate-spin text-[#C1704D] mb-4" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
         </div>
      ) : (
        <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR NAVEGAÇÃO */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white/60 p-6 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-[#EBCB6C] overflow-hidden flex-shrink-0">
                  {currentAvatar ? <img src={currentAvatar} className="w-full h-full object-cover" /> : <svg className="w-full h-full p-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                </div>
                <div className="overflow-hidden">
                  <h2 className="text-lg font-black text-[#1A1A1A] truncate">{currentName || 'Bem-vindo(a)'}</h2>
                  <p className="text-xs font-bold text-[#C1704D] mt-1 uppercase">{isAdmin ? 'Gestor Principal' : 'Cliente Vip'}</p>
                </div>
              </div>
              <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 outline-none" style={{ scrollbarWidth: 'none' }}>
                <style>{`nav::-webkit-scrollbar { display: none; }`}</style>
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-sm outline-none whitespace-nowrap lg:whitespace-normal ${activeTab === tab.id ? 'bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-[#EBCB6C] shadow-md lg:scale-[1.02]' : 'text-[#1A1A1A]/60 hover:bg-gray-50'}`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </nav>
              <div className="mt-8 lg:mt-auto pt-8 border-t border-gray-100">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl font-black text-sm text-red-500 bg-red-50 hover:bg-red-100 active:scale-95 border border-red-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg> Sair
                </button>
              </div>
            </div>
          </aside>

          <section className="flex-grow animate-fade-in w-full overflow-hidden">
            
            {isAdmin && activeTab === 'STORE_INFO' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 p-8 md:p-10 w-full">
                <h3 className="text-2xl font-black text-[#1A1A1A] mb-8">Informações da Loja</h3>
                <form className="space-y-6 max-w-2xl" onSubmit={handleUpdateProfile}>
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-gray-100 pb-8">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 shadow-sm overflow-hidden flex-shrink-0 relative">
                      {adminData.avatarUrl ? <img src={adminData.avatarUrl} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-3xl text-gray-400">📷</span>}
                    </div>
                    <div className="flex-grow w-full text-center md:text-left">
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Logo da Loja</label>
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-6 py-3 rounded-xl font-black text-xs hover:bg-gray-100 uppercase text-[#1A1A1A]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Escolher da Galeria <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Nome da Loja</label>
                      <input type="text" required className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" value={adminData.storeName} onChange={e => setAdminData({...adminData, storeName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Telefone</label>
                      <input type="text" required className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" placeholder="(00) 00000-0000" value={adminData.phone} onChange={e => handlePhoneChange(e, true)} />
                    </div>
                  </div>

                  <h4 className="font-black text-sm text-[#1A1A1A] mt-8 mb-4 border-b border-gray-100 pb-2">Endereço de Retirada</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-1">
                      <label className="block text-[10px] font-black text-[#C1704D] mb-2 uppercase flex items-center gap-1">
                        {isCepLoading && <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>} CEP *
                      </label>
                      <input required className="w-full bg-white border border-[#C1704D]/30 px-4 py-3.5 rounded-xl font-black text-[#C1704D] outline-none focus:border-[#C1704D] placeholder-[#C1704D]/30" placeholder="00000-000" value={adminAddressForm.cep} onChange={e => handleCepChange(e, 'ADMIN')} maxLength="9" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Rua / Logradouro *</label>
                      <input required className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl font-bold text-[#1A1A1A] outline-none focus:bg-white focus:border-[#C1704D]" value={adminAddressForm.street} onChange={e => setAdminAddressForm({...adminAddressForm, street: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Número *</label>
                      <input id="adminAddressNumber" required className="w-full bg-white border border-[#E5DCC3] px-4 py-3.5 rounded-xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" value={adminAddressForm.number} onChange={e => setAdminAddressForm({...adminAddressForm, number: e.target.value})} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Bairro *</label>
                      <input required className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl font-bold text-[#1A1A1A] outline-none focus:bg-white focus:border-[#C1704D]" value={adminAddressForm.neighborhood} onChange={e => setAdminAddressForm({...adminAddressForm, neighborhood: e.target.value})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Cidade *</label>
                      <input required className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl font-bold text-[#1A1A1A] outline-none focus:bg-white focus:border-[#C1704D]" value={adminAddressForm.city} onChange={e => setAdminAddressForm({...adminAddressForm, city: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Estado (UF) *</label>
                      <input required className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl font-bold text-[#1A1A1A] outline-none focus:bg-white focus:border-[#C1704D] uppercase" maxLength="2" value={adminAddressForm.state} onChange={e => setAdminAddressForm({...adminAddressForm, state: e.target.value})} />
                    </div>
                  </div>

                  <button type="submit" className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-[#EBCB6C] font-black py-4.5 px-8 rounded-2xl shadow-lg active:scale-95 w-full uppercase text-xs mt-4">Salvar Configurações</button>
                </form>
              </div>
            )}

            {!isAdmin && activeTab === 'INFO' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white/60 p-8 md:p-10 w-full">
                <h3 className="text-2xl font-black text-[#1A1A1A] mb-8">Informações Pessoais</h3>
                <form className="space-y-6 max-w-2xl" onSubmit={handleUpdateProfile}>
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-8 border-b border-gray-100 pb-8">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 shadow-sm overflow-hidden flex-shrink-0 relative">
                      {clientData.avatarUrl ? <img src={clientData.avatarUrl} className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-3xl text-gray-400">📷</span>}
                    </div>
                    <div className="flex-grow w-full text-center md:text-left">
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Sua Foto</label>
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-6 py-3 rounded-xl font-black text-xs hover:bg-gray-100 uppercase text-[#1A1A1A]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        Escolher da Galeria <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Nome Completo</label>
                      <input type="text" required className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Data Nascimento</label>
                      <input type="date" required className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" value={clientData.birthDate} onChange={e => setClientData({...clientData, birthDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Telemóvel</label>
                      <input type="text" required className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" placeholder="(00) 00000-0000" value={clientData.phone} onChange={e => handlePhoneChange(e, false)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">E-mail</label>
                      <input type="email" className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl font-bold text-[#1A1A1A]/60 outline-none cursor-not-allowed" value={clientData.email} disabled />
                    </div>
                  </div>
                  <button type="submit" className="bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-[#EBCB6C] font-black py-4.5 px-8 w-full rounded-2xl shadow-lg active:scale-95 uppercase text-xs mt-6">Salvar Alterações</button>
                </form>
              </div>
            )}

            {!isAdmin && activeTab === 'ADDRESSES' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white/60 p-8 md:p-10 w-full">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-[#1A1A1A]">Meus Endereços</h3>
                  <button onClick={() => openAddressModal()} className="bg-[#1A1A1A] text-[#EBCB6C] font-black text-[10px] px-4 py-2 rounded-xl hover:bg-[#333] uppercase flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg> Novo
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                    <p className="text-[#1A1A1A]/40 font-black text-xs uppercase">Nenhum endereço guardado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {addresses.map(addr => (
                      <div key={addr.id} className={`${addr.isMain ? 'border-2 border-[#EBCB6C] bg-gradient-to-r from-white to-[#FDF9EB]/50' : 'border border-gray-200 bg-white'} p-6 rounded-3xl relative overflow-hidden group`}>
                        {addr.isMain && <div className="absolute top-4 right-4 bg-[#1A1A1A] text-[#EBCB6C] text-[9px] font-black px-3 py-1 rounded-full uppercase">Principal</div>}
                        <h4 className="font-black text-[#1A1A1A] text-lg mb-1">{addr.title || 'Sem título'}</h4>
                        <p className="text-sm font-semibold text-[#1A1A1A]/60 leading-relaxed mb-5 whitespace-pre-wrap">
                          {addr.street}, {addr.number} {addr.complement ? ` - ${addr.complement}` : ''}<br/>
                          {addr.neighborhood} - {addr.city}, {addr.state}<br/>
                          <span className="text-[10px] uppercase opacity-60">CEP: {addr.cep}</span>
                        </p>
                        <div className={`flex gap-4 pt-4 border-t ${addr.isMain ? 'border-[#EBCB6C]/30' : 'border-gray-100'}`}>
                          <button onClick={() => openAddressModal(addr)} className="text-[10px] font-black text-[#1A1A1A] hover:text-[#C1704D] uppercase">Editar</button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase">Remover</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isAdmin && activeTab === 'ORDERS' && (
              <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-sm border border-white/60 p-8 md:p-10 w-full">
                <h3 className="text-2xl font-black text-[#1A1A1A] mb-8">Histórico de Compras</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                    <p className="text-[#1A1A1A]/40 font-black text-sm uppercase">Nenhum pedido realizado.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map(order => {
                      const status = getStatusDisplay(order.status);
                      return (
                        <div key={order.id} className="border border-gray-100 bg-white p-5 md:p-6 rounded-3xl flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <span className="font-black text-[#1A1A1A] text-sm">#{order.id.slice(-6).toUpperCase()}</span>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${status.color}`}>{status.label}</span>
                            </div>
                            <p className="text-xs font-bold text-[#1A1A1A]/50 mb-4">{formatDate(order.createdAt)}</p>
                            <div className="space-y-1">
                              {order.items.map((i, idx) => (
                                <p key={idx} className="text-sm font-semibold text-[#1A1A1A]"><span className="text-[#C1704D] font-black mr-2">{i.quantity}x</span> {i.product?.name || 'Removido'}</p>
                              ))}
                            </div>
                          </div>
                          <div className="md:text-right mt-2 md:mt-0 border-t md:border-0 border-gray-100 pt-4 md:pt-0">
                            <p className="text-[10px] font-black text-[#1A1A1A]/40 uppercase mb-1">Total da Compra</p>
                            <p className="text-2xl font-black text-[#C1704D]">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      )}

      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 flex items-center justify-center z-50 p-4 md:p-6">
          <div className="bg-[#FDF9EB] rounded-[2rem] p-8 md:p-10 w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-[#1A1A1A] border-b border-[#E5DCC3]/50 pb-4 mb-8">Novo Endereço</h2>
            <form onSubmit={handleSaveAddress} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Identificação</label>
                  <input required autoFocus className="w-full bg-white border border-[#E5DCC3] px-4 py-3.5 rounded-xl font-bold outline-none" placeholder="Ex: Casa, Trabalho" value={addressForm.title} onChange={e => setAddressForm({...addressForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#C1704D] mb-2 uppercase">CEP *</label>
                  <input required className="w-full bg-white border border-[#C1704D]/30 px-4 py-3.5 rounded-xl font-black text-[#C1704D] outline-none" placeholder="00000-000" value={addressForm.cep} onChange={e => handleCepChange(e, 'CLIENT')} maxLength="9" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Rua / Logradouro *</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl font-bold outline-none" value={addressForm.street} onChange={e => setAddressForm({...addressForm, street: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Número *</label>
                  <input id="addressNumber" required className="w-full bg-white border border-[#E5DCC3] px-4 py-3.5 rounded-xl font-bold outline-none" value={addressForm.number} onChange={e => setAddressForm({...addressForm, number: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Complemento</label>
                  <input className="w-full bg-white border border-[#E5DCC3] px-4 py-3.5 rounded-xl font-bold outline-none" value={addressForm.complement} onChange={e => setAddressForm({...addressForm, complement: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Bairro *</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl font-bold outline-none" value={addressForm.neighborhood} onChange={e => setAddressForm({...addressForm, neighborhood: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">Cidade *</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl font-bold outline-none" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase">UF *</label>
                  <input required className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 rounded-xl font-bold outline-none uppercase" maxLength="2" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-6 border-t border-[#E5DCC3]/50">
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="w-1/3 bg-white border border-gray-200 py-4 rounded-xl font-black uppercase text-xs">Cancelar</button>
                <button type="submit" className="w-2/3 bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-[#EBCB6C] py-4 rounded-xl font-black uppercase text-xs">Gravar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cropModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/90 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6">
          <div className="bg-[#FDF9EB] rounded-[2rem] w-full max-w-md shadow-2xl flex flex-col h-[80vh] md:h-[600px] animate-fade-in">
            <div className="p-6 border-b border-[#E5DCC3]/50 flex justify-between items-center bg-white/50">
              <h2 className="text-xl font-black">Ajustar Foto</h2>
              <button onClick={() => setCropModalOpen(false)} className="text-gray-500 w-8 h-8 rounded-full bg-gray-200/50">X</button>
            </div>
            <div className="relative flex-grow bg-[#1A1A1A]">
              {imageToCrop && <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(a, pixels) => setCroppedAreaPixels(pixels)} />}
            </div>
            <div className="p-6 bg-white/80 space-y-5">
              <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase">Zoom</span>
                  <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="flex-grow accent-[#C1704D]" />
              </div>
              <button onClick={handleSaveCrop} className="w-full bg-[#C1704D] text-white font-black py-4.5 rounded-xl uppercase text-xs">Confirmar Recorte</button>
            </div>
          </div>
        </div>
      )}

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          {isAdmin ? (
            <>
              <button onClick={() => navigate('/promotions')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                <span className="text-[9px] font-black tracking-[0.2em]">OFERTAS</span>
              </button>
              
              <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 <span className="text-[9px] font-black tracking-[0.2em]">PAINEL</span>
              </button>

              <button onClick={() => navigate('/admin/products')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                 <span className="text-[9px] font-black tracking-[0.2em]">PRODUTOS</span>
              </button>

              <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 transition-all relative">
                <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-[0_4px_15px_rgba(235,203,108,0.4)] border-4 border-[#1A1A1A] -mt-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <span className="text-[9px] font-black tracking-[0.2em] mt-1">CONFIG</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span className="text-[9px] font-black tracking-[0.2em]">LOJA</span>
              </button>
              <button onClick={() => navigate('/promotions')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                <span className="text-[9px] font-black tracking-[0.2em]">OFERTAS</span>
              </button>
              <button onClick={() => window.scrollTo(0,0)} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 transition-all relative">
                <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-[0_4px_15px_rgba(235,203,108,0.4)] border-4 border-[#1A1A1A] -mt-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <span className="text-[9px] font-black tracking-[0.2em] mt-1">PERFIL</span>
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}