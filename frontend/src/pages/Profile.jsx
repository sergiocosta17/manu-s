import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';

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

// Página de perfil do usuário (cliente ou administrador)
export default function Profile() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';

  // Estado para controle da aba ativa
  const [activeTab, setActiveTab] = useState(isAdmin ? 'STORE_INFO' : 'INFO');

  // Estados para dados do cliente
  const [clientData, setClientData] = useState({ name: '', phone: '', email: '', birthDate: '', avatarUrl: '' });
  // Estados para dados do administrador (loja)
  const [adminData, setAdminData] = useState({ storeName: '', phone: '', email: '', avatarUrl: '' });

  // Endereços do cliente
  const [addresses, setAddresses] = useState([]);
  // Endereço da loja (admin)
  const [adminAddressForm, setAdminAddressForm] = useState({
    label: 'Loja',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    isDefault: true
  });

  // Estados do modal de endereço (cliente)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: '',
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    isDefault: false
  });
  const [isCepLoading, setIsCepLoading] = useState(false);

  // Estados para crop de imagem (avatar)
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Pedidos do cliente
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formata telefone para (XX) XXXXX-XXXX
  const formatPhone = (val) => {
    if (!val) return '';
    let v = val.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 2 && v.length <= 7) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length > 7) return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    if (v.length > 0) return `(${v}`;
    return v;
  };

  // Handler para campo de telefone
  const handlePhoneChange = (e, isAdm) => {
    const formatted = formatPhone(e.target.value);
    if (isAdm) setAdminData({ ...adminData, phone: formatted });
    else setClientData({ ...clientData, phone: formatted });
  };

  // Handler para campo CEP (com consulta à API ViaCEP)
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

  // Efeito para carregar todos os dados do perfil ao montar
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/');

        // Busca dados do usuário logado
        const profileRes = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            query: `
              query GetMe {
                me {
                  id name email role phone birthDate avatarUrl storeName
                  storeAddress { id label zipCode street number complement neighborhood city state isDefault }
                  addresses { id label zipCode street number complement neighborhood city state isDefault }
                }
              }
            `
          })
        });

        const profileJson = await profileRes.json();
        if (profileJson.errors) throw new Error(profileJson.errors[0].message);

        const user = profileJson.data.me;

        // Preenche estados de acordo com o tipo de usuário
        if (isAdmin) {
          setAdminData({
            storeName: user.storeName || user.name,
            phone: formatPhone(user.phone),
            email: user.email || '',
            avatarUrl: user.avatarUrl || ''
          });
          if (user.storeAddress) {
            setAdminAddressForm({
              label: user.storeAddress.label || 'Loja',
              zipCode: user.storeAddress.zipCode || '',
              street: user.storeAddress.street || '',
              number: user.storeAddress.number || '',
              complement: user.storeAddress.complement || '',
              neighborhood: user.storeAddress.neighborhood || '',
              city: user.storeAddress.city || '',
              state: user.storeAddress.state || '',
              isDefault: true
            });
          }
        } else {
          setClientData({
            name: user.name || '',
            email: user.email || '',
            phone: formatPhone(user.phone),
            birthDate: user.birthDate || '',
            avatarUrl: user.avatarUrl || ''
          });
          if (user.addresses) setAddresses(user.addresses);
        }

        // Busca pedidos apenas para cliente
        if (!isAdmin) {
          const ordersRes = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              query: `query GetOrders { orders { id total status createdAt items { quantity name product { name } } } }`
            })
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

  // Handler para seleção de arquivo de imagem (abre modal de crop)
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

  // Salva a imagem recortada e fecha o modal
  const handleSaveCrop = async () => {
    try {
      const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (isAdmin) setAdminData(prev => ({ ...prev, avatarUrl: croppedImageBase64 }));
      else setClientData(prev => ({ ...prev, avatarUrl: croppedImageBase64 }));
      setCropModalOpen(false);
      setImageToCrop(null);
    } catch (e) { alert('Erro ao processar imagem.'); }
  };

  // Atualiza perfil (cliente ou admin) via GraphQL
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
            variables: {
              input: {
                storeName: adminData.storeName,
                phone: adminData.phone,
                avatarUrl: adminData.avatarUrl,
                storeAddress: { ...adminAddressForm, isDefault: true }
              }
            }
          })
        });
        const json = await response.json();
        if (json.errors) throw new Error(json.errors[0].message);
        alert('Configurações da loja atualizadas!');
      } else {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            query: `mutation UpdateProfile($input: UpdateProfileInput!) { updateProfile(input: $input) { id name } }`,
            variables: {
              input: {
                name: clientData.name,
                phone: clientData.phone,
                birthDate: clientData.birthDate,
                avatarUrl: clientData.avatarUrl
              }
            }
          })
        });
        const json = await response.json();
        if (json.errors) throw new Error(json.errors[0].message);
        alert('Perfil atualizado!');
      }
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  // Abre modal para adicionar/editar endereço
  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddressId(address.id);
      setAddressForm({ ...address });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        label: '', zipCode: '', street: '', number: '', complement: '',
        neighborhood: '', city: '', state: '', isDefault: addresses.length === 0
      });
    }
    setIsAddressModalOpen(true);
  };

  // Salva endereço (criação ou edição)
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const mutation = editingAddressId
        ? `mutation UpdateAddress($addressId: ID!, $input: AddressInput!) { updateAddress(addressId: $addressId, input: $input) { id addresses { id label zipCode street number complement neighborhood city state isDefault } } }`
        : `mutation AddAddress($input: AddressInput!) { addAddress(input: $input) { id addresses { id label zipCode street number complement neighborhood city state isDefault } } }`;

      const variables = editingAddressId
        ? { addressId: editingAddressId, input: { ...addressForm, complement: addressForm.complement || null } }
        : { input: { ...addressForm, complement: addressForm.complement || null } };

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ query: mutation, variables })
      });

      const json = await response.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setAddresses(editingAddressId ? json.data.updateAddress.addresses : json.data.addAddress.addresses);
      setIsAddressModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar endereço: ' + err.message);
    }
  };

  // Exclui endereço
  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Excluir este endereço?')) return;
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
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  // Logout do usuário
  const handleLogout = () => {
    if (window.confirm('Deseja sair da sua conta?')) {
      localStorage.clear();
      navigate('/');
    }
  };

  // Mapeamento de status para exibição
  const getStatusDisplay = (status) => {
    const map = {
      PLACED: { label: 'Recebido', color: 'bg-blue-50 text-blue-600 border-blue-200' },
      CONFIRMED: { label: 'Confirmado', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
      PREPARING: { label: 'Em Produção', color: 'bg-amber-50 text-amber-600 border-amber-200' },
      OUT_FOR_DELIVERY: { label: 'Saiu p/ Entrega', color: 'bg-purple-50 text-purple-600 border-purple-200' },
      DELIVERED: { label: 'Entregue', color: 'bg-green-50 text-green-600 border-green-200' },
      COMPLETED: { label: 'Concluído', color: 'bg-green-50 text-green-600 border-green-200' },
      CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500 border-gray-200' }
    };
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-500 border-gray-200' };
  };

  // Formata data para exibição
  const formatDate = (timestamp) => new Date(Number(timestamp)).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Definição das abas para cliente
  const clientTabs = [
    { id: 'INFO', label: 'Dados Pessoais', icon: <UserIcon /> },
    { id: 'ADDRESSES', label: 'Endereços', icon: <LocationIcon /> },
    { id: 'ORDERS', label: 'Pedidos', icon: <OrderIcon /> },
    { id: 'PAYMENTS', label: 'Pagamentos', icon: <CardIcon /> }
  ];

  // Definição das abas para admin
  const adminTabs = [
    { id: 'STORE_INFO', label: 'Dados da Loja', icon: <StoreIcon /> }
  ];

  const tabs = isAdmin ? adminTabs : clientTabs;
  const currentAvatar = isAdmin ? adminData.avatarUrl : clientData.avatarUrl;
  const currentName = isAdmin ? adminData.storeName : clientData.name;

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col relative pb-28 md:pb-0 font-sans selection:bg-[#1e3a5f] selection:text-white">
      
      {/* Espaço para o Header fixo */}
      <div className="h-20"></div>

      {loading ? (
        <div className="flex-grow flex flex-col justify-center items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="mt-6 text-[#1e3a5f]/40 font-medium text-sm">Carregando perfil...</p>
        </div>
      ) : (
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Sidebar com navegação entre abas */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-8 flex flex-col h-full">
              
              {/* Cabeçalho do perfil na sidebar */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#1e3a5f]/10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 border-2 border-[#d4a853]/30 overflow-hidden flex-shrink-0 shadow-lg">
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
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <p className="text-xs font-medium text-[#1e3a5f]/50">{isAdmin ? 'Administrador' : 'Cliente'}</p>
                  </div>
                </div>
              </div>

              {/* Navegação entre abas */}
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
                    <span className={activeTab === tab.id ? 'text-[#d4a853]' : ''}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Botão de logout (apenas desktop) */}
              <div className="mt-auto pt-8 border-t border-[#1e3a5f]/10 hidden lg:block">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm text-red-500 bg-red-50 hover:bg-red-100 transition-all"
                >
                  <LogoutIcon />
                  Sair da conta
                </button>
              </div>
            </div>
          </aside>

          {/* Conteúdo principal da aba selecionada */}
          <section className="flex-grow">

            {/* Aba: Informações Pessoais (cliente) ou Dados da Loja (admin) */}
            {(activeTab === 'INFO' || activeTab === 'STORE_INFO') && (
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1e3a5f]/10">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-[#1e3a5f]">
                      {isAdmin ? 'Informações da Loja' : 'Informações Pessoais'}
                    </h3>
                    <p className="text-[#1e3a5f]/40 text-sm mt-1">Gerencie seus dados</p>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Upload de Avatar */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-[#faf8f5] rounded-2xl border border-[#1e3a5f]/5">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 border-2 border-dashed border-[#1e3a5f]/20 overflow-hidden flex-shrink-0 relative group">
                      {(isAdmin ? adminData.avatarUrl : clientData.avatarUrl) ? (
                        <img src={isAdmin ? adminData.avatarUrl : clientData.avatarUrl} className="w-full h-full object-cover" alt="Avatar" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-[#1e3a5f]/20">📷</div>
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

                  {/* Campos do formulário */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label={isAdmin ? "Nome da Loja" : "Nome Completo"}
                      value={isAdmin ? adminData.storeName : clientData.name}
                      onChange={(e) => isAdmin ? setAdminData({ ...adminData, storeName: e.target.value }) : setClientData({ ...clientData, name: e.target.value })}
                      required
                    />
                    <InputField
                      label="Telefone"
                      value={isAdmin ? adminData.phone : clientData.phone}
                      onChange={(e) => handlePhoneChange(e, isAdmin)}
                      placeholder="(00) 00000-0000"
                    />
                    {!isAdmin && (
                      <>
                        <InputField
                          label="E-mail"
                          value={clientData.email}
                          disabled
                          className="bg-[#faf8f5]"
                        />
                        <InputField
                          label="Data de Nascimento"
                          type="date"
                          value={clientData.birthDate}
                          onChange={(e) => setClientData({ ...clientData, birthDate: e.target.value })}
                        />
                      </>
                    )}
                  </div>

                  {/* Endereço da Loja (apenas admin) */}
                  {isAdmin && (
                    <div className="pt-6 border-t border-[#1e3a5f]/10">
                      <h4 className="font-semibold text-[#1e3a5f] mb-5 flex items-center gap-2">
                        <LocationIcon className="w-5 h-5 text-[#d4a853]" />
                        Endereço de Retirada
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <InputField
                          label="CEP"
                          value={adminAddressForm.zipCode}
                          onChange={(e) => handleCepChange(e, 'ADMIN')}
                          placeholder="00000-000"
                          maxLength="9"
                          loading={isCepLoading}
                          className="md:col-span-1"
                        />
                        <InputField
                          label="Rua"
                          value={adminAddressForm.street}
                          onChange={(e) => setAdminAddressForm({ ...adminAddressForm, street: e.target.value })}
                          className="md:col-span-2"
                        />
                        <InputField
                          label="Número"
                          id="adminAddressNumber"
                          value={adminAddressForm.number}
                          onChange={(e) => setAdminAddressForm({ ...adminAddressForm, number: e.target.value })}
                        />
                        <InputField
                          label="Bairro"
                          value={adminAddressForm.neighborhood}
                          onChange={(e) => setAdminAddressForm({ ...adminAddressForm, neighborhood: e.target.value })}
                        />
                        <InputField
                          label="Cidade"
                          value={adminAddressForm.city}
                          onChange={(e) => setAdminAddressForm({ ...adminAddressForm, city: e.target.value })}
                        />
                        <InputField
                          label="Estado"
                          value={adminAddressForm.state}
                          onChange={(e) => setAdminAddressForm({ ...adminAddressForm, state: e.target.value })}
                          maxLength="2"
                          className="uppercase"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-4 px-8 rounded-xl transition-all shadow-lg shadow-[#1e3a5f]/20 hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <SaveIcon />
                    Salvar alterações
                  </button>
                </form>
              </div>
            )}

            {/* Aba: Endereços (cliente) */}
            {activeTab === 'ADDRESSES' && (
              <div className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-[#1e3a5f]/5 p-6 lg:p-10">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#1e3a5f]/10">
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-[#1e3a5f]">Meus Endereços</h3>
                    <p className="text-[#1e3a5f]/40 text-sm mt-1">{addresses.length} endereço(s) salvo(s)</p>
                  </div>
                  <button
                    onClick={() => openAddressModal()}
                    className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-2.5 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 text-sm"
                  >
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
                      <div
                        key={addr.id}
                        className={`p-5 rounded-2xl border-2 transition-all ${
                          addr.isDefault
                            ? 'border-[#d4a853] bg-gradient-to-br from-[#d4a853]/5 to-transparent'
                            : 'border-[#1e3a5f]/10 bg-white hover:border-[#1e3a5f]/20'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#1e3a5f]">{addr.label || 'Endereço'}</span>
                            {addr.isDefault && (
                              <span className="bg-[#d4a853] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Principal
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-[#1e3a5f]/60 leading-relaxed">
                          {addr.street}, {addr.number}
                          {addr.complement && ` - ${addr.complement}`}<br />
                          {addr.neighborhood} • {addr.city}/{addr.state}<br />
                          <span className="text-[#1e3a5f]/40">CEP: {addr.zipCode}</span>
                        </p>
                        <div className="flex gap-3 mt-4 pt-4 border-t border-[#1e3a5f]/5">
                          <button
                            onClick={() => openAddressModal(addr)}
                            className="text-sm font-medium text-[#1e3a5f] hover:text-[#1e3a5f]/70 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Aba: Pedidos (cliente) */}
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
                      return (
                        <div
                          key={order.id}
                          className="p-5 rounded-2xl border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20 transition-all hover:shadow-md"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-[#1e3a5f]">#{order.id.slice(-6).toUpperCase()}</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <span className="text-sm text-[#1e3a5f]/40">{formatDate(order.createdAt)}</span>
                          </div>
                          <div className="space-y-2 mb-4">
                            {order.items.map((item, idx) => (
                              <p key={idx} className="text-sm text-[#1e3a5f]/70">
                                <span className="font-semibold text-[#1e3a5f]">{item.quantity}x</span>{' '}
                                {item.product?.name || item.name}
                              </p>
                            ))}
                          </div>
                          <div className="pt-4 border-t border-[#1e3a5f]/5 flex justify-between items-center">
                            <span className="text-sm text-[#1e3a5f]/40">Total</span>
                            <span className="text-xl font-bold text-[#1e3a5f]">
                              R$ {order.total.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Aba: Pagamentos (placeholder) */}
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

      {/* Modal para adicionar/editar endereço */}
      {isAddressModalOpen && (
        <Modal onClose={() => setIsAddressModalOpen(false)} title={editingAddressId ? 'Editar Endereço' : 'Novo Endereço'}>
          <form onSubmit={handleSaveAddress} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="Identificação"
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                placeholder="Ex: Casa, Trabalho"
                className="md:col-span-2"
                autoFocus
              />
              <InputField
                label="CEP"
                value={addressForm.zipCode}
                onChange={(e) => handleCepChange(e, 'CLIENT')}
                placeholder="00000-000"
                maxLength="9"
                loading={isCepLoading}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <InputField
                label="Rua"
                value={addressForm.street}
                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                className="md:col-span-3"
                required
              />
              <InputField
                id="addressNumber"
                label="Número"
                value={addressForm.number}
                onChange={(e) => setAddressForm({ ...addressForm, number: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField
                label="Complemento"
                value={addressForm.complement}
                onChange={(e) => setAddressForm({ ...addressForm, complement: e.target.value })}
                placeholder="Apto, Bloco..."
              />
              <InputField
                label="Bairro"
                value={addressForm.neighborhood}
                onChange={(e) => setAddressForm({ ...addressForm, neighborhood: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputField
                label="Cidade"
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                className="md:col-span-2"
                required
              />
              <InputField
                label="Estado"
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                maxLength="2"
                className="uppercase"
                required
              />
            </div>
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 hover:bg-[#f5f3f0] transition-all">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                className="w-5 h-5 rounded border-[#1e3a5f]/20 text-[#1e3a5f] focus:ring-[#1e3a5f]"
              />
              <span className="text-sm font-medium text-[#1e3a5f]/70">Definir como endereço principal</span>
            </label>
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl font-medium text-[#1e3a5f] bg-[#faf8f5] hover:bg-[#f0eeeb] transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-8 py-3 rounded-xl font-medium text-white bg-[#1e3a5f] hover:bg-[#162d4a] transition-all shadow-lg shadow-[#1e3a5f]/20"
              >
                Salvar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de recorte de imagem */}
      {cropModalOpen && (
        <Modal onClose={() => setCropModalOpen(false)} title="Ajustar Foto" noPadding>
          <div className="relative h-80 bg-[#1e3a5f]">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(a, pixels) => setCroppedAreaPixels(pixels)}
              />
            )}
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#1e3a5f]/50">Zoom</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-grow accent-[#1e3a5f]"
              />
            </div>
            <button
              onClick={handleSaveCrop}
              className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-4 rounded-xl transition-all shadow-lg"
            >
              Confirmar
            </button>
          </div>
        </Modal>
      )}

      {/* Rodapé de navegação mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#1e3a5f]/10 pb-safe">
        <div className="flex justify-around items-center py-2 px-4">
          <NavBtn onClick={() => navigate('/menu')} icon={<HomeIcon />} label="Início" />
          <NavBtn onClick={() => navigate('/promotions')} icon={<TagIcon />} label="Ofertas" />
          <NavBtn onClick={() => {}} icon={<UserIcon />} label="Perfil" active />
          <NavBtn onClick={handleLogout} icon={<LogoutIcon />} label="Sair" danger />
        </div>
      </footer>
    </div>
  );
}

// COMPONENTES AUXILIARES

// Modal reutilizável
const Modal = ({ onClose, title, children, noPadding }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={onClose}></div>
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between p-6 border-b border-[#1e3a5f]/10">
        <h2 className="text-xl font-bold text-[#1e3a5f]">{title}</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-xl bg-[#faf8f5] hover:bg-[#f0eeeb] flex items-center justify-center text-[#1e3a5f]/50 hover:text-[#1e3a5f] transition-all"
        >
          <CloseIcon />
        </button>
      </div>
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </div>
  </div>
);

// Campo de input estilizado
const InputField = ({ label, loading, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2 flex items-center gap-2">
      {label}
      {loading && (
        <svg className="w-3 h-3 animate-spin text-[#1e3a5f]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      )}
    </label>
    <input
      className={`w-full px-4 py-3.5 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 focus:bg-white focus:ring-4 focus:ring-[#1e3a5f]/5 outline-none transition-all text-[#1e3a5f] placeholder-[#1e3a5f]/30 disabled:opacity-50 disabled:cursor-not-allowed ${props.className || ''}`}
      {...props}
    />
  </div>
);

// Botão da barra de navegação mobile
const NavBtn = ({ onClick, icon, label, active, danger }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${
      danger ? 'text-red-400' : active ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60'
    }`}
  >
    {icon}
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
);

// ÍCONES SVG

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const LocationIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
  </svg>
);

const OrderIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
  </svg>
);

const CardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
  </svg>
);

const StoreIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
  </svg>
);

const LogoutIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
  </svg>
);

const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const TagIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
  </svg>
);

const UploadIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
  </svg>
);

const SaveIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);