import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/hamburgueres-de-fundo-16x9.png';

// Página de administração para gerenciar o catálogo de produtos
export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    promotionalPrice: '',
    description: '',
    category: 'BURGER',
    imageUrl: '',
    isFeatured: false,
    addonGroups: []
  });

  // Estados para o modal de ajuste de imagem
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [originalImage, setOriginalImage] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const cropContainerRef = useRef(null);
  const imageRef = useRef(null);

  // Estados para feedback visual (toast e confirm modal)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, data: null });
  
  // Estado para controlar qual grupo de opcionais está expandido
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const navigate = useNavigate();

  // Função para mostrar toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  }, []);

  // Função para mostrar modal de confirmação
  const showConfirm = useCallback((title, message, onConfirm, data = null) => {
    setConfirmModal({ show: true, title, message, onConfirm, data });
  }, []);

  // Função para fechar modal de confirmação
  const closeConfirm = useCallback(() => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null, data: null });
  }, []);

  // Bloqueia scroll do body quando qualquer modal está aberto
  useEffect(() => {
    if (isModalOpen || isCropModalOpen || confirmModal.show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isCropModalOpen, confirmModal.show]);

  const categories = [
    { value: 'ALL', label: 'Todos' },
    { value: 'FEATURED', label: 'Destaques' },
    { value: 'BURGER', label: 'Burgers' },
    { value: 'CHICKEN', label: 'Frango' },
    { value: 'COMBO', label: 'Combos' },
    { value: 'SIDE', label: 'Batata-Frita' },
    { value: 'DRINK', label: 'Bebidas' },
    { value: 'DESSERT', label: 'Doces' }
  ];

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query: `query { 
            products(onlyAvailable: false) { 
              id 
              name 
              price 
              promotionalPrice 
              description 
              category 
              imageUrl 
              isAvailable 
              isFeatured 
              addonGroups {
                id
                name
                description
                selectionType
                minSelection
                maxSelection
                isRequired
                addons {
                  id
                  name
                  price
                  isAvailable
                }
              }
            } 
          }`
        })
      });
      
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      setProducts(result.data.products || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      showToast('Erro ao carregar produtos', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar grupo de opicionais

  const generateId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addAddonGroup = () => {
    const newGroup = {
      id: generateId(),
      name: '',
      description: '',
      selectionType: 'MULTIPLE',
      minSelection: 0,
      maxSelection: 10,
      isRequired: false,
      addons: []
    };
    setProductForm(prev => ({
      ...prev,
      addonGroups: [...prev.addonGroups, newGroup]
    }));
    setExpandedGroups(prev => ({ ...prev, [newGroup.id]: true }));
  };

  const updateAddonGroup = (groupId, field, value) => {
    setProductForm(prev => ({
      ...prev,
      addonGroups: prev.addonGroups.map(group => 
        group.id === groupId ? { ...group, [field]: value } : group
      )
    }));
  };

  const removeAddonGroup = (groupId) => {
    setProductForm(prev => ({
      ...prev,
      addonGroups: prev.addonGroups.filter(group => group.id !== groupId)
    }));
  };

  const addAddonToGroup = (groupId) => {
    const newAddon = {
      id: generateId(),
      name: '',
      price: 0,
      isAvailable: true
    };
    setProductForm(prev => ({
      ...prev,
      addonGroups: prev.addonGroups.map(group => 
        group.id === groupId 
          ? { ...group, addons: [...group.addons, newAddon] }
          : group
      )
    }));
  };

  const updateAddon = (groupId, addonId, field, value) => {
    setProductForm(prev => ({
      ...prev,
      addonGroups: prev.addonGroups.map(group => 
        group.id === groupId 
          ? {
              ...group,
              addons: group.addons.map(addon =>
                addon.id === addonId ? { ...addon, [field]: value } : addon
              )
            }
          : group
      )
    }));
  };

  const removeAddon = (groupId, addonId) => {
    setProductForm(prev => ({
      ...prev,
      addonGroups: prev.addonGroups.map(group => 
        group.id === groupId 
          ? { ...group, addons: group.addons.filter(addon => addon.id !== addonId) }
          : group
      )
    }));
  };

  const toggleGroupExpanded = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Processa upload de imagem e abre modal de ajuste
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Selecione apenas arquivos de imagem', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 5MB', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target.result);
      setZoom(1);
      setCropArea({ x: 0, y: 0, width: 100, height: 100 });
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageLoad = useCallback(() => {
    if (imageRef.current && cropContainerRef.current) {
      const container = cropContainerRef.current;
      const img = imageRef.current;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const containerRatio = containerWidth / containerHeight;
      
      let displayWidth, displayHeight;
      
      if (imgRatio > containerRatio) {
        displayWidth = containerWidth;
        displayHeight = containerWidth / imgRatio;
      } else {
        displayHeight = containerHeight;
        displayWidth = containerHeight * imgRatio;
      }
      
      setImageSize({ 
        width: displayWidth, 
        height: displayHeight,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      });
      
      const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
      setCropArea({
        x: (displayWidth - cropSize) / 2,
        y: (displayHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize
      });
    }
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = cropContainerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !cropContainerRef.current) return;
    
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;
    
    const maxX = imageSize.width * zoom - cropArea.width;
    const maxY = imageSize.height * zoom - cropArea.height;
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    }));
  }, [isDragging, dragStart, imageSize, cropArea.width, cropArea.height, zoom]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = cropContainerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - rect.left - cropArea.x,
      y: touch.clientY - rect.top - cropArea.y
    });
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !cropContainerRef.current) return;
    
    const touch = e.touches[0];
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - dragStart.x;
    const y = touch.clientY - rect.top - dragStart.y;
    
    const maxX = imageSize.width * zoom - cropArea.width;
    const maxY = imageSize.height * zoom - cropArea.height;
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    }));
  }, [isDragging, dragStart, imageSize, cropArea.width, cropArea.height, zoom]);

  const handleZoomChange = (newZoom) => {
    const oldZoom = zoom;
    setZoom(newZoom);
    
    const zoomRatio = newZoom / oldZoom;
    setCropArea(prev => {
      const centerX = prev.x + prev.width / 2;
      const centerY = prev.y + prev.height / 2;
      
      const newCenterX = centerX * zoomRatio;
      const newCenterY = centerY * zoomRatio;
      
      const newX = newCenterX - prev.width / 2;
      const newY = newCenterY - prev.height / 2;
      
      const maxX = imageSize.width * newZoom - prev.width;
      const maxY = imageSize.height * newZoom - prev.height;
      
      return {
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      };
    });
  };

  const handleCropConfirm = () => {
    if (!imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    const outputSize = 800;
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    const scaleX = img.naturalWidth / (imageSize.width * zoom);
    const scaleY = img.naturalHeight / (imageSize.height * zoom);
    
    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;
    
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, outputSize, outputSize
    );
    
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
    setProductForm({ ...productForm, imageUrl: croppedImageUrl });
    setIsCropModalOpen(false);
    setOriginalImage(null);
    showToast('Imagem ajustada com sucesso!', 'success');
  };

  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setOriginalImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar grupos de opcionais
    for (const group of productForm.addonGroups) {
      if (!group.name.trim()) {
        showToast('Todos os grupos de opcionais devem ter um nome', 'error');
        return;
      }
      if (group.addons.length === 0) {
        showToast(`O grupo "${group.name}" deve ter pelo menos um opcional`, 'error');
        return;
      }
      for (const addon of group.addons) {
        if (!addon.name.trim()) {
          showToast(`Todos os opcionais do grupo "${group.name}" devem ter um nome`, 'error');
          return;
        }
      }
    }

    // Preparar os grupos de opcionais para envio
    const addonGroupsForSubmit = productForm.addonGroups.map(group => ({
      id: group.id.startsWith('temp_') ? undefined : group.id,
      name: group.name,
      description: group.description || '',
      selectionType: group.selectionType,
      minSelection: parseInt(group.minSelection) || 0,
      maxSelection: parseInt(group.maxSelection) || 10,
      isRequired: group.isRequired,
      addons: group.addons.map(addon => ({
        id: addon.id.startsWith('temp_') ? undefined : addon.id,
        name: addon.name,
        price: parseFloat(addon.price) || 0,
        isAvailable: addon.isAvailable !== false
      }))
    }));

    const input = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      description: productForm.description || '',
      category: productForm.category,
      imageUrl: productForm.imageUrl || '',
      promotionalPrice: productForm.promotionalPrice ? parseFloat(productForm.promotionalPrice) : null,
      isFeatured: productForm.isFeatured,
      addonGroups: addonGroupsForSubmit
    };

    const mutation = editingProduct 
      ? `mutation UpdateProduct($id: ID!, $input: ProductInput!) { updateProduct(id: $id, input: $input) { id } }` 
      : `mutation CreateProduct($input: ProductInput!) { createProduct(input: $input) { id } }`;
    
    const variables = editingProduct ? { id: editingProduct.id, input } : { input };

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: mutation, variables })
      });
      
      const result = await response.json();
      if (result.errors) { 
        showToast('Erro: ' + result.errors[0].message, 'error'); 
        return; 
      }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      setProductForm({ 
        name: '', 
        price: '', 
        promotionalPrice: '', 
        description: '', 
        category: 'BURGER', 
        imageUrl: '', 
        isFeatured: false,
        addonGroups: []
      });
      setExpandedGroups({});
      fetchProducts();
      showToast(editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!', 'success');
    } catch (err) {
      showToast('Erro ao salvar produto', 'error');
    }
  };

  const handleDelete = (product) => {
    showConfirm(
      'Excluir produto',
      `Tem certeza que deseja excluir "${product.name}"? Esta ação não pode ser desfeita.`,
      async () => {
        try {
          const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({ 
              query: `mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) }`,
              variables: { id: product.id }
            })
          });
          const result = await response.json();
          if (result.errors) { 
            showToast('Erro: ' + result.errors[0].message, 'error'); 
            closeConfirm();
            return; 
          }
          closeConfirm();
          fetchProducts();
          showToast('Produto excluído com sucesso!', 'success');
        } catch (err) {
          showToast('Erro ao excluir produto', 'error');
          closeConfirm();
        }
      },
      product
    );
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setProductForm({ 
      name: product.name || '',
      price: product.price?.toString() || '', 
      promotionalPrice: product.promotionalPrice?.toString() || '', 
      description: product.description || '',
      category: product.category || 'BURGER',
      imageUrl: product.imageUrl || '',
      isFeatured: product.isFeatured || false,
      addonGroups: product.addonGroups?.map(group => ({
        ...group,
        addons: group.addons?.map(addon => ({ ...addon })) || []
      })) || []
    });
    // Expandir todos os grupos existentes
    const expanded = {};
    product.addonGroups?.forEach(group => {
      expanded[group.id] = true;
    });
    setExpandedGroups(expanded);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setProductForm({ 
      name: '', 
      price: '', 
      promotionalPrice: '', 
      description: '', 
      category: activeCategory === 'ALL' || activeCategory === 'FEATURED' ? 'BURGER' : activeCategory, 
      imageUrl: '',
      isFeatured: activeCategory === 'FEATURED',
      addonGroups: []
    });
    setExpandedGroups({});
    setIsModalOpen(true);
  };

  // Toggle rápido de destaque
  const toggleFeatured = async (product) => {
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          query: `mutation UpdateProduct($id: ID!, $input: ProductInput!) { updateProduct(id: $id, input: $input) { id isFeatured } }`,
          variables: { 
            id: product.id, 
            input: { 
              name: product.name,
              price: product.price,
              category: product.category,
              isFeatured: !product.isFeatured 
            } 
          }
        })
      });
      const result = await response.json();
      if (result.errors) { 
        showToast('Erro: ' + result.errors[0].message, 'error'); 
        return; 
      }
      fetchProducts();
      showToast(
        product.isFeatured ? 'Produto removido dos destaques' : 'Produto adicionado aos destaques!', 
        'success'
      );
    } catch (err) {
      showToast('Erro ao atualizar destaque', 'error');
    }
  };

  const filteredProducts = products.filter(p => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'FEATURED') return p.isFeatured === true;
    return p.category === activeCategory;
  });

  const stats = {
    total: products.length,
    promos: products.filter(p => p.promotionalPrice).length,
    featured: products.filter(p => p.isFeatured).length,
    byCategory: categories.slice(2).map(c => ({ ...c, count: products.filter(p => p.category === c.value).length }))
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative pb-28 md:pb-0 font-sans selection:bg-[#1e3a5f] selection:text-white"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-[#faf8f5]/85 pointer-events-none"></div>
      
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast({ ...toast, show: false })} />

      {/* Confirm Modal */}
      <ConfirmModal 
        isOpen={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirm}
        productName={confirmModal.data?.name}
      />
      
      <div className="relative z-10 h-20"></div>

      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* Cabeçalho da página */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                <BoxIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f]">Catálogo de Produtos</h1>
            </div>
            <p className="text-[#1e3a5f]/50 text-sm">Gerencie todos os produtos do cardápio</p>
          </div>
          
          <button 
            onClick={openCreate}
            className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-medium py-3 px-5 rounded-xl shadow-lg shadow-[#1e3a5f]/20 flex items-center justify-center gap-2 text-sm transition-all"
          >
            <PlusIcon className="w-4 h-4" />
            Novo Produto
          </button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#1e3a5f]/5">
            <p className="text-[#1e3a5f]/40 text-xs font-medium mb-1">Total de Produtos</p>
            <p className="text-3xl font-bold text-[#1e3a5f]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#1e3a5f]/5">
            <p className="text-[#1e3a5f]/40 text-xs font-medium mb-1">Em Promoção</p>
            <p className="text-3xl font-bold text-[#1e3a5f]">{stats.promos}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1e3a5f]/10 to-[#1e3a5f]/5 rounded-2xl p-5 border border-[#1e3a5f]/20">
            <p className="text-[#1e3a5f] text-xs font-medium mb-1 flex items-center gap-1">
              <StarIcon className="w-3 h-3" />
              Em Destaque
            </p>
            <p className="text-3xl font-bold text-[#1e3a5f]">{stats.featured}</p>
          </div>
          <div className="col-span-2 bg-white rounded-2xl p-5 border border-[#1e3a5f]/5">
            <p className="text-[#1e3a5f]/40 text-xs font-medium mb-3">Por Categoria</p>
            <div className="flex flex-wrap gap-2">
              {stats.byCategory.map(c => (
                <span key={c.value} className="bg-[#faf8f5] text-[#1e3a5f] px-3 py-1.5 rounded-lg text-xs font-medium">
                  {c.label}: {c.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Filtro por categorias */}
        <nav className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button 
              key={cat.value} 
              onClick={() => setActiveCategory(cat.value)} 
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all text-sm ${
                activeCategory === cat.value 
                  ? 'bg-[#1e3a5f] text-white shadow-lg shadow-[#1e3a5f]/20' 
                  : 'bg-white text-[#1e3a5f]/60 border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5'
              }`}
            >
              {cat.value === 'FEATURED' && (
                <StarIcon className={`w-4 h-4 ${activeCategory === cat.value ? 'text-white' : 'text-[#1e3a5f]'}`} />
              )}
              {cat.label}
              {cat.value === 'FEATURED' && stats.featured > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.value 
                    ? 'bg-white/20 text-white' 
                    : 'bg-[#1e3a5f]/10 text-[#1e3a5f]'
                }`}>
                  {stats.featured}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Grid de produtos */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
            </div>
            <p className="mt-6 text-[#1e3a5f]/40 font-medium text-sm">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#1e3a5f]/5">
            {activeCategory === 'FEATURED' ? (
              <>
                <StarIcon className="w-12 h-12 text-[#1e3a5f]/30 mx-auto mb-4" />
                <p className="text-[#1e3a5f]/40 font-medium">Nenhum produto em destaque</p>
                <p className="text-[#1e3a5f]/30 text-sm mt-1">Edite um produto e marque como destaque</p>
              </>
            ) : (
              <>
                <BoxIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
                <p className="text-[#1e3a5f]/40 font-medium">Nenhum produto nesta categoria</p>
                <p className="text-[#1e3a5f]/30 text-sm mt-1">Clique em "Novo Produto" para adicionar</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl shadow-sm border border-[#1e3a5f]/5 overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all relative"
              >
                {/* Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                  {p.promotionalPrice && (
                    <span className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      Oferta
                    </span>
                  )}
                  {!p.isAvailable && (
                    <span className="bg-[#1e3a5f]/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Indisponível
                    </span>
                  )}
                  {p.addonGroups && p.addonGroups.length > 0 && (
                    <span className="bg-[#1e3a5f]/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <SettingsIcon className="w-3 h-3" />
                      {p.addonGroups.length} {p.addonGroups.length === 1 ? 'opcional' : 'opcionais'}
                    </span>
                  )}
                </div>

                {/* Botão de toggle destaque no canto superior direito */}
                <button
                  onClick={() => toggleFeatured(p)}
                  className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-md ${
                    p.isFeatured 
                      ? 'bg-[#1e3a5f] text-white hover:bg-[#162d4a]' 
                      : 'bg-white/90 text-[#1e3a5f]/30 hover:text-[#1e3a5f] hover:bg-white'
                  }`}
                  title={p.isFeatured ? 'Remover dos destaques' : 'Adicionar aos destaques'}
                >
                  <StarIcon className="w-4 h-4" />
                </button>
                
                <div className="h-40 bg-gradient-to-br from-[#f5f3f0] to-[#ebe8e4] relative overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-[#1e3a5f]/20" />
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[9px] font-semibold text-[#1e3a5f]/30 uppercase tracking-wider">
                      {categories.find(c => c.value === p.category)?.label}
                    </span>
                    {p.isFeatured && (
                      <span className="text-[9px] font-semibold text-[#1e3a5f] uppercase tracking-wider flex items-center gap-1">
                        <StarIcon className="w-3 h-3" />
                        Destaque
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#1e3a5f] mb-2 line-clamp-2">{p.name}</h3>
                  {p.description && (
                    <p className="text-[#1e3a5f]/40 text-xs mb-4 line-clamp-2">{p.description}</p>
                  )}
                  <div className="mt-auto mb-4">
                    {p.promotionalPrice ? (
                      <div className="flex items-baseline gap-2">
                        <p className="text-[#1e3a5f]/30 line-through text-sm">R$ {p.price.toFixed(2)}</p>
                        <p className="text-xl font-bold text-[#1e3a5f]">R$ {p.promotionalPrice.toFixed(2)}</p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-[#1e3a5f]">R$ {p.price.toFixed(2)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEdit(p)} 
                      className="flex-1 bg-[#faf8f5] hover:bg-[#f0eeeb] border border-[#1e3a5f]/10 font-medium py-2.5 rounded-xl text-sm text-[#1e3a5f] transition-colors flex items-center justify-center gap-2"
                    >
                      <EditIcon className="w-4 h-4" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(p)} 
                      className="w-11 bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10 text-[#1e3a5f]/50 hover:text-[#1e3a5f] border border-[#1e3a5f]/10 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de criação/edição de produto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-[#1e3a5f]/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-[#1e3a5f]/10 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#1e3a5f]">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-xl bg-[#faf8f5] hover:bg-[#f0eeeb] flex items-center justify-center text-[#1e3a5f]/50 hover:text-[#1e3a5f] transition-all"
              >
                <CloseIcon />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Upload de imagem com ajuste */}
              <div>
                <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2">Imagem do Produto</label>
                <div className={`border-2 border-dashed rounded-2xl transition-all relative ${
                  productForm.imageUrl ? 'border-[#1e3a5f]/20' : 'border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20'
                }`}>
                  {productForm.imageUrl ? (
                    <div className="relative">
                      <img src={productForm.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <label className="bg-white hover:bg-gray-100 text-[#1e3a5f] w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors cursor-pointer">
                          <CropIcon className="w-4 h-4" />
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, imageUrl: '' })}
                          className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors"
                        >
                          <CloseIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                      <ImageIcon className="w-10 h-10 text-[#1e3a5f]/20 mb-2" />
                      <span className="text-sm font-medium text-[#1e3a5f]/40">Clique para enviar</span>
                      <span className="text-xs text-[#1e3a5f]/30 mt-1">PNG, JPG (máx. 5MB)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] placeholder-[#1e3a5f]/30"
                    placeholder="Ex: Smash Duplo"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2">Categoria</label>
                  <select 
                    className="w-full px-4 py-3.5 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] font-medium"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categories.slice(2).map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-4 py-3.5 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] placeholder-[#1e3a5f]/30"
                    placeholder="0,00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2">Preço Promocional</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#1e3a5f]/5 border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/20 outline-none text-[#1e3a5f] placeholder-[#1e3a5f]/30"
                    placeholder="Opcional"
                    value={productForm.promotionalPrice}
                    onChange={(e) => setProductForm({ ...productForm, promotionalPrice: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2">Descrição</label>
                <textarea
                  className="w-full px-4 py-3.5 rounded-xl bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] placeholder-[#1e3a5f]/30 resize-none"
                  rows="3"
                  placeholder="Descreva o produto..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              {/* Checkbox para Destaque */}
              <div 
                onClick={() => setProductForm({ ...productForm, isFeatured: !productForm.isFeatured })}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  productForm.isFeatured 
                    ? 'bg-[#1e3a5f]/10 border-[#1e3a5f]/30' 
                    : 'bg-[#faf8f5] border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  productForm.isFeatured 
                    ? 'bg-[#1e3a5f] border-[#1e3a5f]' 
                    : 'border-[#1e3a5f]/20'
                }`}>
                  {productForm.isFeatured && (
                    <CheckIcon className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-grow">
                  <p className={`font-medium ${productForm.isFeatured ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]'}`}>
                    Adicionar aos Destaques
                  </p>
                  <p className="text-xs text-[#1e3a5f]/40 mt-0.5">
                    Este produto aparecerá na seção de destaques do cardápio
                  </p>
                </div>
                <StarIcon className={`w-5 h-5 ${productForm.isFeatured ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/20'}`} />
              </div>

              {/* Seção de opicionais */}

              <div className="border-t border-[#1e3a5f]/10 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[#1e3a5f] flex items-center gap-2">
                      <SettingsIcon className="w-5 h-5" />
                      Opcionais do Produto
                    </h3>
                    <p className="text-xs text-[#1e3a5f]/40 mt-0.5">
                      Adicione grupos de opcionais como adicionais, tamanhos, etc.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addAddonGroup}
                    className="bg-[#1e3a5f]/10 hover:bg-[#1e3a5f]/20 text-[#1e3a5f] text-sm font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Novo Grupo
                  </button>
                </div>

                {productForm.addonGroups.length === 0 ? (
                  <div className="bg-[#faf8f5] rounded-xl p-6 text-center border border-dashed border-[#1e3a5f]/20">
                    <SettingsIcon className="w-10 h-10 text-[#1e3a5f]/20 mx-auto mb-2" />
                    <p className="text-[#1e3a5f]/40 text-sm">Nenhum grupo de opcionais</p>
                    <p className="text-[#1e3a5f]/30 text-xs mt-1">Clique em "Novo Grupo" para adicionar</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productForm.addonGroups.map((group, groupIndex) => (
                      <div 
                        key={group.id} 
                        className="bg-[#faf8f5] rounded-xl border border-[#1e3a5f]/10 overflow-hidden"
                      >
                        {/* Header do grupo */}
                        <div 
                          className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#1e3a5f]/5 transition-colors"
                          onClick={() => toggleGroupExpanded(group.id)}
                        >
                          <div className="w-8 h-8 bg-[#1e3a5f]/10 rounded-lg flex items-center justify-center text-[#1e3a5f] font-semibold text-sm">
                            {groupIndex + 1}
                          </div>
                          <div className="flex-grow">
                            <p className="font-medium text-[#1e3a5f]">
                              {group.name || 'Novo Grupo'}
                            </p>
                            <p className="text-xs text-[#1e3a5f]/40">
                              {group.addons.length} {group.addons.length === 1 ? 'opcional' : 'opcionais'}
                              {group.isRequired && ' • Obrigatório'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAddonGroup(group.id);
                            }}
                            className="w-8 h-8 rounded-lg text-[#1e3a5f]/30 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <ChevronIcon 
                            className={`w-5 h-5 text-[#1e3a5f]/40 transition-transform ${
                              expandedGroups[group.id] ? 'rotate-180' : ''
                            }`} 
                          />
                        </div>

                        {/* Conteúdo expandido do grupo */}
                        {expandedGroups[group.id] && (
                          <div className="px-4 pb-4 space-y-4 border-t border-[#1e3a5f]/10">
                            {/* Configurações do grupo */}
                            <div className="grid grid-cols-2 gap-3 pt-4">
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-1.5">Nome do Grupo</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] text-sm"
                                  placeholder="Ex: Adicionais, Tamanho, Ponto da Carne..."
                                  value={group.name}
                                  onChange={(e) => updateAddonGroup(group.id, 'name', e.target.value)}
                                />
                              </div>
                              <div className="col-span-2">
                                <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-1.5">Descrição (opcional)</label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] text-sm"
                                  placeholder="Ex: Escolha seus adicionais favoritos"
                                  value={group.description || ''}
                                  onChange={(e) => updateAddonGroup(group.id, 'description', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-1.5">Tipo de Seleção</label>
                                <select
                                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] text-sm"
                                  value={group.selectionType}
                                  onChange={(e) => updateAddonGroup(group.id, 'selectionType', e.target.value)}
                                >
                                  <option value="MULTIPLE">Múltipla escolha</option>
                                  <option value="SINGLE">Escolha única</option>
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-1.5">Mín.</label>
                                  <input
                                    type="number"
                                    min="0"
                                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] text-sm"
                                    value={group.minSelection}
                                    onChange={(e) => updateAddonGroup(group.id, 'minSelection', parseInt(e.target.value) || 0)}
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-1.5">Máx.</label>
                                  <input
                                    type="number"
                                    min="1"
                                    className="w-full px-3 py-2.5 rounded-lg bg-white border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] text-sm"
                                    value={group.maxSelection}
                                    onChange={(e) => updateAddonGroup(group.id, 'maxSelection', parseInt(e.target.value) || 1)}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Checkbox obrigatório */}
                            <div 
                              onClick={() => updateAddonGroup(group.id, 'isRequired', !group.isRequired)}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                group.isRequired 
                                  ? 'bg-[#1e3a5f]/10 border border-[#1e3a5f]/20' 
                                  : 'bg-white border border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                group.isRequired 
                                  ? 'bg-[#1e3a5f] border-[#1e3a5f]' 
                                  : 'border-[#1e3a5f]/20'
                              }`}>
                                {group.isRequired && <CheckIcon className="w-3 h-3 text-white" />}
                              </div>
                              <span className="text-sm text-[#1e3a5f]">Seleção obrigatória</span>
                            </div>

                            {/* Lista de opcionais */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-xs font-medium text-[#1e3a5f]/50">Opcionais</label>
                                <button
                                  type="button"
                                  onClick={() => addAddonToGroup(group.id)}
                                  className="text-xs text-[#1e3a5f] hover:text-[#162d4a] font-medium flex items-center gap-1"
                                >
                                  <PlusIcon className="w-3 h-3" />
                                  Adicionar
                                </button>
                              </div>

                              {group.addons.length === 0 ? (
                                <div className="bg-white rounded-lg p-4 text-center border border-dashed border-[#1e3a5f]/10">
                                  <p className="text-[#1e3a5f]/30 text-xs">Clique em "Adicionar" para criar opcionais</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {group.addons.map((addon, addonIndex) => (
                                    <div 
                                      key={addon.id}
                                      className="flex items-center gap-2 bg-white rounded-lg p-3 border border-[#1e3a5f]/10"
                                    >
                                      <span className="text-xs text-[#1e3a5f]/30 w-5">{addonIndex + 1}.</span>
                                      <input
                                        type="text"
                                        className="flex-grow px-2 py-1.5 rounded-md bg-[#faf8f5] border border-[#1e3a5f]/10 focus:border-[#1e3a5f]/30 outline-none text-[#1e3a5f] text-sm"
                                        placeholder="Nome do opcional"
                                        value={addon.name}
                                        onChange={(e) => updateAddon(group.id, addon.id, 'name', e.target.value)}
                                      />
                                      <div className="flex items-center gap-1 bg-[#faf8f5] rounded-md border border-[#1e3a5f]/10 px-2">
                                        <span className="text-xs text-[#1e3a5f]/40">R$</span>
                                        <input
                                          type="number"
                                          step="0.01"
                                          min="0"
                                          className="w-16 py-1.5 bg-transparent outline-none text-[#1e3a5f] text-sm text-right"
                                          placeholder="0,00"
                                          value={addon.price || ''}
                                          onChange={(e) => updateAddon(group.id, addon.id, 'price', e.target.value)}
                                        />
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => updateAddon(group.id, addon.id, 'isAvailable', !addon.isAvailable)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                          addon.isAvailable !== false
                                            ? 'bg-green-50 text-green-500'
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                        title={addon.isAvailable !== false ? 'Disponível' : 'Indisponível'}
                                      >
                                        {addon.isAvailable !== false ? (
                                          <CheckIcon className="w-4 h-4" />
                                        ) : (
                                          <CloseIcon className="w-4 h-4" />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => removeAddon(group.id, addon.id)}
                                        className="w-8 h-8 rounded-lg text-[#1e3a5f]/30 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#1e3a5f]/10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3.5 rounded-xl font-medium bg-[#faf8f5] hover:bg-[#f0eeeb] text-[#1e3a5f] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3.5 rounded-xl font-medium bg-[#1e3a5f] hover:bg-[#162d4a] text-white shadow-lg shadow-[#1e3a5f]/20 transition-all"
                >
                  {editingProduct ? 'Atualizar' : 'Criar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de ajuste/crop de imagem */}
      {isCropModalOpen && originalImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={handleCropCancel}></div>
          <div className="relative bg-[#1e3a5f] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-white">Ajustar Imagem</h2>
                <p className="text-white/50 text-xs mt-0.5">Arraste para posicionar</p>
              </div>
              <button
                onClick={handleCropCancel}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <CloseIcon />
              </button>
            </div>
            
            <div 
              ref={cropContainerRef}
              className="relative w-full h-80 bg-black/50 overflow-hidden cursor-move select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={originalImage}
                alt="Para ajustar"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none pointer-events-none"
                style={{ 
                  width: imageSize.width * zoom,
                  height: imageSize.height * zoom
                }}
                onLoad={handleImageLoad}
                draggable={false}
              />
              
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="absolute bg-black/60"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `calc(50% - ${cropArea.height / 2}px + ${cropArea.y - imageSize.height * zoom / 2 + cropArea.height / 2}px)`
                  }}
                />
                <div 
                  className="absolute bg-black/60"
                  style={{
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `calc(50% - ${cropArea.height / 2}px - ${cropArea.y - imageSize.height * zoom / 2 + cropArea.height / 2}px)`
                  }}
                />
                <div 
                  className="absolute bg-black/60"
                  style={{
                    top: `calc(50% - ${imageSize.height * zoom / 2 - cropArea.y}px)`,
                    left: 0,
                    width: `calc(50% - ${imageSize.width * zoom / 2 - cropArea.x}px)`,
                    height: cropArea.height
                  }}
                />
                <div 
                  className="absolute bg-black/60"
                  style={{
                    top: `calc(50% - ${imageSize.height * zoom / 2 - cropArea.y}px)`,
                    right: 0,
                    width: `calc(50% - ${imageSize.width * zoom / 2 - (imageSize.width * zoom - cropArea.x - cropArea.width)}px)`,
                    height: cropArea.height
                  }}
                />
              </div>
              
              <div
                className="absolute border-2 border-white rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
                style={{
                  left: `calc(50% - ${imageSize.width * zoom / 2 - cropArea.x}px)`,
                  top: `calc(50% - ${imageSize.height * zoom / 2 - cropArea.y}px)`,
                  width: cropArea.width,
                  height: cropArea.height,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full shadow-md"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-md"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full shadow-md"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full shadow-md"></div>
                
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30"></div>
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30"></div>
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30"></div>
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30"></div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-white/10">
              <div className="flex items-center gap-4 mb-5">
                <ZoomOutIcon className="w-5 h-5 text-white/50" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="flex-grow h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                />
                <ZoomInIcon className="w-5 h-5 text-white/50" />
              </div>
              
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={handleCropCancel} 
                  className="flex-1 py-3.5 rounded-xl font-medium bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleCropConfirm}
                  className="flex-1 py-3.5 rounded-xl font-medium bg-white hover:bg-gray-100 text-[#1e3a5f] shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckIcon className="w-5 h-5" />
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé de navegação mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#1e3a5f]/10 pb-safe">
        <div className="flex justify-around items-center py-2 px-4">
          <NavBtn onClick={() => navigate('/menu')} icon={<HomeIcon />} label="Loja" />
          <NavBtn onClick={() => navigate('/admin')} icon={<ChartIcon />} label="Painel" />
          <NavBtn onClick={() => {}} icon={<BoxIcon />} label="Produtos" active />
          <NavBtn onClick={() => navigate('/profile')} icon={<UserIcon />} label="Perfil" />
        </div>
      </footer>

      {/* Estilos de animação */}
      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Componentes auxiliares

// Componente de notificação
const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const typeStyles = {
    success: 'bg-[#1e3a5f] text-white',
    error: 'bg-[#1e3a5f]/90 text-white border-2 border-white/20',
    info: 'bg-[#1e3a5f]/80 text-white'
  };

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5" />,
    error: <ErrorIcon className="w-5 h-5" />,
    info: <InfoIcon className="w-5 h-5" />
  };

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
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

// Modal de confirmação
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, productName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[#1e3a5f]/70 backdrop-blur-md" onClick={onCancel}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
            <AlertIcon className="w-6 h-6 text-[#1e3a5f]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#1e3a5f]">{title}</h3>
          </div>
        </div>
        <p className="text-[#1e3a5f]/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-medium text-[#1e3a5f] bg-[#faf8f5] hover:bg-[#f0eeeb] transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-medium text-white bg-[#1e3a5f] hover:bg-[#162d4a] transition-all shadow-lg shadow-[#1e3a5f]/20"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

const NavBtn = ({ onClick, icon, label, active }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 p-2 transition-all ${
      active ? 'text-[#1e3a5f]' : 'text-[#1e3a5f]/40 hover:text-[#1e3a5f]/60'
    }`}
  >
    {icon}
    <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
  </button>
);

// ícones svg

const BoxIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
  </svg>
);

const HomeIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const ChartIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
  </svg>
);

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
  </svg>
);

const EditIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
  </svg>
);

const TrashIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
  </svg>
);

const ImageIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
);

const CropIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4M4 12h16"></path>
  </svg>
);

const ZoomInIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"></path>
  </svg>
);

const ZoomOutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"></path>
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);

const StarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const CheckCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const ErrorIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const InfoIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const AlertIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
  </svg>
);

const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
  </svg>
);

const ChevronIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
  </svg>
);