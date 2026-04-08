import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('BURGER');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    promotionalPrice: '',
    description: '',
    category: 'BURGER',
    imageUrl: ''
  });

  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const categories = [
    { value: 'BURGER', label: 'Bovinos' },
    { value: 'CHICKEN', label: 'Frango' },
    { value: 'COMBO', label: 'Combos' },
    { value: 'SIDE', label: 'Lanches' },
    { value: 'DRINK', label: 'Bebidas' },
    { value: 'DESSERT', label: 'Doces' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          query: `query { products { id name price promotionalPrice description category imageUrl } }`
        })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      setProducts(Array.isArray(result.data?.products) ? result.data.products : []);
    } catch (err) {
      console.error('Erro no GraphQL:', err);
      setError('Erro de comunicação com o servidor: ' + err.message);
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mutation = editingProduct 
      ? `mutation Update($id: ID!, $input: ProductInput!) { updateProduct(id: $id, input: $input) { id } }`
      : `mutation Create($input: ProductInput!) { createProduct(input: $input) { id } }`;

    const variables = {
      input: {
        name: formData.name,
        price: parseFloat(formData.price),
        promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null,
        description: formData.description,
        category: formData.category,
        imageUrl: formData.imageUrl || ''
      }
    };

    if (editingProduct) variables.id = editingProduct.id;

    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ query: mutation, variables })
      });
      const res = await response.json();
      if(res.errors) throw new Error(res.errors[0].message);

      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: '', promotionalPrice: '', description: '', category: 'BURGER', imageUrl: '' });
      fetchProducts();
    } catch (err) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Atenção: Tem a certeza que deseja excluir este produto do sistema?')) return;
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ query: `mutation { deleteProduct(id: "${id}") }` })
      });
      const res = await response.json();
      if (res.errors) throw new Error(res.errors[0].message);
      
      fetchProducts();
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price ? product.price.toString() : '',
      promotionalPrice: product.promotionalPrice ? product.promotionalPrice.toString() : '',
      description: product.description || '',
      category: product.category || 'BURGER',
      imageUrl: product.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C] selection:text-[#1A1A1A]">
      <header className="sticky top-0 z-30 bg-[#1A1A1A]/95 backdrop-blur-md p-4 shadow-sm border-b border-[#EBCB6C]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center md:text-left flex-grow md:flex-grow-0 cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-black text-[#FDF9EB] tracking-tighter leading-none">MANU´S</h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[#EBCB6C] tracking-[0.3em] uppercase mt-1">Admin Panel</p>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/admin')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              Painel Central
            </button>
            <button onClick={() => navigate('/menu')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Ver Loja
            </button>
            <button onClick={handleLogout} className="text-red-400 font-bold hover:text-red-300 transition-colors text-sm">Sair da Conta</button>
          </div>
          
          <div className="md:hidden text-[#EBCB6C] bg-white/5 p-2.5 rounded-xl border border-white/10 opacity-80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-2 md:px-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#C1704D] tracking-tight">Catálogo Geral</h2>
            <p className="text-[#1A1A1A]/60 font-semibold mt-1">Gira os produtos visíveis para os clientes.</p>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setFormData({name:'', price:'', promotionalPrice:'', description:'', category: activeCategory, imageUrl: ''}); setIsModalOpen(true); }} 
            className="bg-gradient-to-br from-[#1A1A1A] to-[#333333] hover:from-[#333333] hover:to-[#1A1A1A] text-[#EBCB6C] font-black py-4 px-8 rounded-2xl shadow-[0_8px_25px_rgba(26,26,26,0.3)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
            Novo Produto
          </button>
        </div>

        <nav className="mb-10 flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-8 py-3.5 rounded-2xl font-black whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeCategory === cat.value 
                ? 'bg-gradient-to-br from-[#C1704D] to-[#A35C3E] text-white scale-[1.02] shadow-[0_8px_25px_rgba(193,112,77,0.3)]' 
                : 'bg-white text-[#1A1A1A]/60 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <span className="text-xs uppercase tracking-widest">{cat.label}</span>
            </button>
          ))}
        </nav>

        {loading ? (
           <div className="flex flex-col justify-center items-center py-32 opacity-50">
             <svg className="w-12 h-12 animate-spin text-[#C1704D] mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <p className="font-black tracking-widest text-[#1A1A1A] uppercase text-sm">A Carregar Cardápio...</p>
           </div>
        ) : error ? (
           <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-sm mt-10">
             <p className="text-red-600 font-black mb-2 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
               Alerta de Sistema
             </p>
             <p className="text-red-500 font-medium">{error}</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 overflow-hidden flex flex-col hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group">
                <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <svg className="w-12 h-12 text-gray-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                  )}
                  {p.promotionalPrice && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(239,68,68,0.4)] tracking-widest uppercase">
                      Oferta
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-[#1A1A1A]/80 backdrop-blur-sm text-[#EBCB6C] text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                    {categories.find(c => c.value === p.category)?.label || p.category}
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col bg-white">
                  <h3 className="font-black text-lg text-[#1A1A1A] leading-tight mb-2 line-clamp-2">{p.name}</h3>
                  <p className="text-[#1A1A1A]/50 text-xs font-medium mb-6 line-clamp-2 leading-relaxed">{p.description || 'Sem descrição.'}</p>
                  
                  <div className="mt-auto flex justify-between items-end mb-6">
                    <div>
                      {p.promotionalPrice ? (
                        <>
                          <p className="text-[#1A1A1A]/30 line-through text-[10px] font-bold tracking-wider mb-0.5">R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}</p>
                          <p className="text-3xl font-black text-red-500 tracking-tight">R$ {Number(p.promotionalPrice || 0).toFixed(2).replace('.', ',')}</p>
                        </>
                      ) : (
                        <p className="text-3xl font-black text-[#C1704D] tracking-tight">R$ {Number(p.price || 0).toFixed(2).replace('.', ',')}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#1A1A1A] font-black py-3.5 rounded-xl transition-colors text-[10px] uppercase tracking-widest active:scale-95">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="w-14 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 border border-red-100 rounded-xl transition-colors active:scale-95">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/60 shadow-sm">
                <svg className="w-16 h-16 text-[#1A1A1A] opacity-20 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                <p className="text-[#1A1A1A]/40 font-black text-sm uppercase tracking-[0.2em]">Categoria Vazia.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DE EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6">
          <div className="bg-[#FDF9EB] rounded-[2rem] p-8 md:p-10 w-full max-w-3xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-[#E5DCC3]/50">
              <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">
                {editingProduct ? 'Atualizar Produto' : 'Novo Produto'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-200/50 hover:bg-gray-200 text-gray-500 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Nome do Item *</label>
                  <input required className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D] focus:ring-4 focus:ring-[#C1704D]/10 transition-all placeholder-gray-300" placeholder="Ex: Smash Clássico" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Categoria *</label>
                  <select className="w-full appearance-none bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D] focus:ring-4 focus:ring-[#C1704D]/10 transition-all cursor-pointer" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-[#E5DCC3]/50 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm">
                <div>
                  <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Preço Original (R$) *</label>
                  <input required type="number" step="0.01" className="w-full bg-gray-50 border border-gray-200 px-5 py-4 rounded-2xl font-black text-[#1A1A1A] text-lg outline-none focus:bg-white focus:border-[#C1704D] transition-all" placeholder="0.00" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-red-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Preço de Promoção (R$)
                  </label>
                  <input type="number" step="0.01" className="w-full bg-red-50 border border-red-100 px-5 py-4 rounded-2xl font-black text-red-600 text-lg outline-none focus:bg-white focus:border-red-400 transition-all placeholder-red-200" placeholder="0.00 (Opcional)" value={formData.promotionalPrice} onChange={e => setFormData({...formData, promotionalPrice: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">URL da Imagem (Apresentação)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <input type="text" className="w-full bg-white border border-[#E5DCC3] pl-12 pr-5 py-4 rounded-2xl font-medium text-[#1A1A1A] outline-none focus:border-[#C1704D] focus:ring-4 focus:ring-[#C1704D]/10 transition-all placeholder-gray-300" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#1A1A1A]/50 mb-2 uppercase tracking-widest">Descrição dos ingredientes</label>
                <textarea className="w-full bg-white border border-[#E5DCC3] px-5 py-4 rounded-2xl font-medium text-[#1A1A1A] outline-none focus:border-[#C1704D] focus:ring-4 focus:ring-[#C1704D]/10 transition-all placeholder-gray-300 resize-none" rows="3" placeholder="Detalhe o que compõe este produto..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-4 pt-6 border-t border-[#E5DCC3]/50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="md:w-1/3 bg-white border border-gray-200 text-[#1A1A1A] font-black py-4.5 rounded-2xl hover:bg-gray-50 transition-colors uppercase tracking-widest text-xs active:scale-95">Cancelar</button>
                <button type="submit" className="md:w-2/3 bg-gradient-to-r from-[#1A1A1A] to-[#333333] hover:from-[#333333] hover:to-[#1A1A1A] text-[#EBCB6C] font-black py-4.5 rounded-2xl shadow-[0_8px_25px_rgba(26,26,26,0.3)] transition-all uppercase tracking-widest text-xs active:scale-95">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RODAPÉ MOBILE (PADRÃO PARA TODAS AS PÁGINAS) */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">LOJA</span>
          </button>
          <button onClick={() => navigate('/orders')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">COMPRAS</span>
          </button>
          <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 transition-all -mt-4 relative">
             <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-[0_4px_15px_rgba(235,203,108,0.4)] border-4 border-[#1A1A1A]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
             </div>
            <span className="text-[9px] font-black tracking-[0.2em] mt-1">ADMIN</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-red-400/50 hover:text-red-400 p-2 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            <span className="text-[9px] font-black tracking-[0.2em]">SAIR</span>
          </button>
        </div>
      </footer>
    </div>
  );
}