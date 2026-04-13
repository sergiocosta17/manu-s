import React, { useState, useEffect } from 'react';
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
  
  const navigate = useNavigate();

  // Lista de categorias disponíveis para filtro e seleção
  const categories = [
    { value: 'ALL', label: 'Todos' },
    { value: 'BURGER', label: 'Burgers' },
    { value: 'CHICKEN', label: 'Frango' },
    { value: 'COMBO', label: 'Combos' },
    { value: 'SIDE', label: 'Batata-Frita' },
    { value: 'DRINK', label: 'Bebidas' },
    { value: 'DESSERT', label: 'Doces' }
  ];

  // Carrega produtos ao montar o componente
  useEffect(() => { fetchProducts(); }, []);

  // Busca todos os produtos via GraphQL
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

  // Processa upload de imagem, redimensiona e converte para base64
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
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        setProductForm({ ...productForm, imageUrl: canvas.toDataURL('image/jpeg', 0.8) });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Submete formulário para criar ou atualizar produto
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

  // Exclui um produto após confirmação
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

  // Abre modal para edição de produto existente
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

  // Abre modal para criação de novo produto
  const openCreate = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', promotionalPrice: '', description: '', category: activeCategory === 'ALL' ? 'BURGER' : activeCategory, imageUrl: '' });
    setIsModalOpen(true);
  };

  // Filtra produtos pela categoria ativa
  const filteredProducts = products
    .filter(p => activeCategory === 'ALL' || p.category === activeCategory);

  // Estatísticas para exibição nos cards
  const stats = {
    total: products.length,
    promos: products.filter(p => p.promotionalPrice).length,
    byCategory: categories.slice(1).map(c => ({ ...c, count: products.filter(p => p.category === c.value).length }))
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col relative pb-28 md:pb-0 font-sans selection:bg-[#1e3a5f] selection:text-white">
      
      {/* Espaço reservado para o header fixo */}
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

        {/* Conteúdo principal: grid de produtos ou estados de loading/vazio */}
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
                {/* (Oferta, Indisponível, Destaque) */}
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
                
                {/* Imagem do produto */}
                <div className="h-40 bg-gradient-to-br from-[#f5f3f0] to-[#ebe8e4] relative overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-[#1e3a5f]/20" />
                    </div>
                  )}
                </div>
                
                {/* Informações do produto */}
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
                  {/* Ações: Editar e Excluir */}
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
            {/* Cabeçalho do modal */}
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
            
            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Upload de imagem */}
              <div>
                <label className="block text-xs font-medium text-[#1e3a5f]/50 mb-2">Imagem do Produto</label>
                <div className={`border-2 border-dashed rounded-2xl transition-all relative ${
                  productForm.imageUrl ? 'border-[#1e3a5f]/20' : 'border-[#1e3a5f]/10 hover:border-[#1e3a5f]/20'
                }`}>
                  {productForm.imageUrl ? (
                    <div className="relative">
                      <img src={productForm.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, imageUrl: '' })}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors"
                      >
                        <CloseIcon className="w-4 h-4" />
                      </button>
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

      {/* Rodapé de navegação mobile */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#1e3a5f]/10 pb-safe">
        <div className="flex justify-around items-center py-2 px-4">
          <NavBtn onClick={() => navigate('/menu')} icon={<HomeIcon />} label="Loja" />
          <NavBtn onClick={() => navigate('/admin')} icon={<ChartIcon />} label="Painel" />
          <NavBtn onClick={() => {}} icon={<BoxIcon />} label="Produtos" active />
          <NavBtn onClick={() => navigate('/profile')} icon={<UserIcon />} label="Perfil" />
        </div>
      </footer>
    </div>
  );
}

// COMPONENTES AUXILIARES

// Botão da barra de navegação mobile
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