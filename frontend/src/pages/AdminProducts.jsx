import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
    imageUrl: ''
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
  
  const navigate = useNavigate();

  const categories = [
    { value: 'ALL', label: 'Todos' },
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
          query: `query { products(onlyAvailable: false) { id name price promotionalPrice description category imageUrl isAvailable isFeatured } }`
        })
      });
      
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      setProducts(result.data.products || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  // Processa upload de imagem e abre modal de ajuste
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecione apenas arquivos de imagem.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
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

  // Quando a imagem carrega, calcula as dimensões
  const handleImageLoad = useCallback(() => {
    if (imageRef.current && cropContainerRef.current) {
      const container = cropContainerRef.current;
      const img = imageRef.current;
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Calcula o tamanho da imagem para caber no container
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
      
      // Centraliza a área de crop inicial (quadrado)
      const cropSize = Math.min(displayWidth, displayHeight) * 0.8;
      setCropArea({
        x: (displayWidth - cropSize) / 2,
        y: (displayHeight - cropSize) / 2,
        width: cropSize,
        height: cropSize
      });
    }
  }, []);

  // Inicia o arrasto da área de crop
  const handleMouseDown = (e) => {
    e.preventDefault();
    const rect = cropContainerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - cropArea.x,
      y: e.clientY - rect.top - cropArea.y
    });
  };

  // Move a área de crop
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !cropContainerRef.current) return;
    
    const rect = cropContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;
    
    // Limita aos bounds da imagem
    const maxX = imageSize.width * zoom - cropArea.width;
    const maxY = imageSize.height * zoom - cropArea.height;
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    }));
  }, [isDragging, dragStart, imageSize, cropArea.width, cropArea.height, zoom]);

  // Finaliza o arrasto
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events para mobile
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

  // Aplica zoom
  const handleZoomChange = (newZoom) => {
    const oldZoom = zoom;
    setZoom(newZoom);
    
    // Ajusta a posição do crop para manter centralizado
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

  // Confirma o crop e salva a imagem
  const handleCropConfirm = () => {
    if (!imageRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    
    // Tamanho de saída (quadrado)
    const outputSize = 800;
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    // Calcula a área de crop na imagem original
    const scaleX = img.naturalWidth / (imageSize.width * zoom);
    const scaleY = img.naturalHeight / (imageSize.height * zoom);
    
    const sourceX = cropArea.x * scaleX;
    const sourceY = cropArea.y * scaleY;
    const sourceWidth = cropArea.width * scaleX;
    const sourceHeight = cropArea.height * scaleY;
    
    // Desenha a imagem recortada
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, outputSize, outputSize
    );
    
    // Converte para base64
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
    setProductForm({ ...productForm, imageUrl: croppedImageUrl });
    setIsCropModalOpen(false);
    setOriginalImage(null);
  };

  // Cancela o crop
  const handleCropCancel = () => {
    setIsCropModalOpen(false);
    setOriginalImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const input = {
      name: productForm.name,
      price: parseFloat(productForm.price),
      description: productForm.description || '',
      category: productForm.category,
      imageUrl: productForm.imageUrl || '',
      promotionalPrice: productForm.promotionalPrice ? parseFloat(productForm.promotionalPrice) : null
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
      if (result.errors) { alert('Erro: ' + result.errors[0].message); return; }
      
      setIsModalOpen(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: '', promotionalPrice: '', description: '', category: 'BURGER', imageUrl: '' });
      fetchProducts();
    } catch (err) {
      alert('Erro ao salvar produto');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este produto?')) return;
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ 
          query: `mutation DeleteProduct($id: ID!) { deleteProduct(id: $id) }`,
          variables: { id }
        })
      });
      const result = await response.json();
      if (result.errors) { alert('Erro: ' + result.errors[0].message); return; }
      fetchProducts();
    } catch (err) {}
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setProductForm({ 
      name: product.name || '',
      price: product.price?.toString() || '', 
      promotionalPrice: product.promotionalPrice?.toString() || '', 
      description: product.description || '',
      category: product.category || 'BURGER',
      imageUrl: product.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', promotionalPrice: '', description: '', category: activeCategory === 'ALL' ? 'BURGER' : activeCategory, imageUrl: '' });
    setIsModalOpen(true);
  };

  const filteredProducts = products
    .filter(p => activeCategory === 'ALL' || p.category === activeCategory);

  const stats = {
    total: products.length,
    promos: products.filter(p => p.promotionalPrice).length,
    byCategory: categories.slice(1).map(c => ({ ...c, count: products.filter(p => p.category === c.value).length }))
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col relative pb-28 md:pb-0 font-sans selection:bg-[#1e3a5f] selection:text-white">
      
      <div className="h-20"></div>

      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        
        {/* Cabeçalho da página */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1e3a5f] rounded-xl flex items-center justify-center">
                <BoxIcon className="w-5 h-5 text-[#d4a853]" />
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-[#1e3a5f]/5">
            <p className="text-[#1e3a5f]/40 text-xs font-medium mb-1">Total de Produtos</p>
            <p className="text-3xl font-bold text-[#1e3a5f]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-[#1e3a5f]/5">
            <p className="text-[#1e3a5f]/40 text-xs font-medium mb-1">Em Promoção</p>
            <p className="text-3xl font-bold text-red-500">{stats.promos}</p>
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
              {cat.label}
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
            <BoxIcon className="w-12 h-12 text-[#1e3a5f]/20 mx-auto mb-4" />
            <p className="text-[#1e3a5f]/40 font-medium">Nenhum produto nesta categoria</p>
            <p className="text-[#1e3a5f]/30 text-sm mt-1">Clique em "Novo Produto" para adicionar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(p => (
              <div 
                key={p.id} 
                className="bg-white rounded-2xl shadow-sm border border-[#1e3a5f]/5 overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-1 transition-all relative"
              >
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                  {p.promotionalPrice && (
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      Oferta
                    </span>
                  )}
                  {!p.isAvailable && (
                    <span className="bg-gray-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Indisponível
                    </span>
                  )}
                  {p.isFeatured && (
                    <span className="bg-[#d4a853] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      Destaque
                    </span>
                  )}
                </div>
                
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
                  <span className="text-[9px] font-semibold text-[#1e3a5f]/30 uppercase tracking-wider mb-1">
                    {categories.find(c => c.value === p.category)?.label}
                  </span>
                  <h3 className="font-bold text-[#1e3a5f] mb-2 line-clamp-2">{p.name}</h3>
                  {p.description && (
                    <p className="text-[#1e3a5f]/40 text-xs mb-4 line-clamp-2">{p.description}</p>
                  )}
                  <div className="mt-auto mb-4">
                    {p.promotionalPrice ? (
                      <div className="flex items-baseline gap-2">
                        <p className="text-[#1e3a5f]/30 line-through text-sm">R$ {p.price.toFixed(2)}</p>
                        <p className="text-xl font-bold text-red-500">R$ {p.promotionalPrice.toFixed(2)}</p>
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
                      onClick={() => handleDelete(p.id)} 
                      className="w-11 bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl flex items-center justify-center transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
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
                        {/* Botão para ajustar a imagem novamente */}
                        <label className="bg-white hover:bg-gray-100 text-[#1e3a5f] w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors cursor-pointer">
                          <CropIcon className="w-4 h-4" />
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                        {/* Botão para remover a imagem */}
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, imageUrl: '' })}
                          className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors"
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
                    {categories.slice(1).map(c => (
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
                  <label className="block text-xs font-medium text-red-400 mb-2">Preço Promocional</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3.5 rounded-xl bg-red-50 border border-red-100 focus:border-red-200 outline-none text-red-500 placeholder-red-300"
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

              <div className="flex gap-3 pt-4">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCropCancel}></div>
          <div className="relative bg-[#1e3a5f] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
            {/* Header */}
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
            
            {/* Área de crop */}
            <div 
              ref={cropContainerRef}
              className="relative w-full h-80 bg-black/50 overflow-hidden cursor-move select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {/* Imagem */}
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
              
              {/* Overlay escuro fora da área de crop */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top */}
                <div 
                  className="absolute bg-black/60"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    height: `calc(50% - ${cropArea.height / 2}px + ${cropArea.y - imageSize.height * zoom / 2 + cropArea.height / 2}px)`
                  }}
                />
                {/* Bottom */}
                <div 
                  className="absolute bg-black/60"
                  style={{
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `calc(50% - ${cropArea.height / 2}px - ${cropArea.y - imageSize.height * zoom / 2 + cropArea.height / 2}px)`
                  }}
                />
                {/* Left */}
                <div 
                  className="absolute bg-black/60"
                  style={{
                    top: `calc(50% - ${imageSize.height * zoom / 2 - cropArea.y}px)`,
                    left: 0,
                    width: `calc(50% - ${imageSize.width * zoom / 2 - cropArea.x}px)`,
                    height: cropArea.height
                  }}
                />
                {/* Right */}
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
              
              {/* Área de crop interativa */}
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
                {/* Cantos */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-white rounded-full shadow-md"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-md"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white rounded-full shadow-md"></div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full shadow-md"></div>
                
                {/* Grid de terços */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30"></div>
                  <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30"></div>
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30"></div>
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30"></div>
                </div>
              </div>
            </div>
            
            {/* Controle de zoom */}
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
              
              {/* Botões */}
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
                  className="flex-1 py-3.5 rounded-xl font-medium bg-[#d4a853] hover:bg-[#c49a4a] text-[#1e3a5f] shadow-lg transition-all flex items-center justify-center gap-2"
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
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

// COMPONENTES AUXILIARES

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

// ÍCONES SVG

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
