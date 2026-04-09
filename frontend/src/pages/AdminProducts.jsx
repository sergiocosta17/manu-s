import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('BURGER');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', price: '', promotionalPrice: '', description: '', category: 'BURGER', imageUrl: '' });

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

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: `query { products { id name price promotionalPrice description category imageUrl } }` })
      });
      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      setProducts(Array.isArray(result.data?.products) ? result.data.products : []);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mutation = editingProduct ? `mutation Update($id: ID!, $input: ProductInput!) { updateProduct(id: $id, input: $input) { id } }` : `mutation Create($input: ProductInput!) { createProduct(input: $input) { id } }`;
    const variables = { input: { ...formData, price: parseFloat(formData.price), promotionalPrice: formData.promotionalPrice ? parseFloat(formData.promotionalPrice) : null } };
    if (editingProduct) variables.id = editingProduct.id;

    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: mutation, variables })
      });
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este produto?')) return;
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ query: `mutation { deleteProduct(id: "${id}") }` })
      });
      fetchProducts();
    } catch (err) {}
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({ ...product, price: product.price.toString(), promotionalPrice: product.promotionalPrice?.toString() || '' });
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0 font-sans selection:bg-[#EBCB6C]">
      
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md p-4 shadow-sm border-b border-[#EBCB6C]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-black text-[#FDF9EB] tracking-tighter leading-none">MANU´S</h1>
            <p className="text-[9px] font-bold text-[#EBCB6C] tracking-[0.3em] uppercase mt-1">Smash Burguer</p>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/promotions')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg> Ofertas
            </button>
            <button onClick={() => navigate('/profile')} className="text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> Meu Perfil
            </button>
            <button onClick={() => navigate('/admin')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Gestão
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-end mb-8 px-2 md:px-0">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1A1A1A] to-[#C1704D] tracking-tight">Catálogo Geral</h2>
            <p className="text-[#1A1A1A]/60 font-semibold mt-1">Gira os produtos visíveis para os clientes.</p>
          </div>
          <button onClick={() => { setEditingProduct(null); setFormData({name:'', price:'', promotionalPrice:'', description:'', category: activeCategory, imageUrl: ''}); setIsModalOpen(true); }} className="bg-gradient-to-br from-[#1A1A1A] to-[#333333] text-[#EBCB6C] font-black py-4 px-8 rounded-2xl shadow-lg flex items-center gap-3 uppercase text-xs">
            Novo Produto
          </button>
        </div>

        <nav className="mb-10 flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-2">
          {categories.map((cat) => (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value)} className={`flex-shrink-0 px-8 py-3.5 rounded-2xl font-black transition-all ${activeCategory === cat.value ? 'bg-gradient-to-br from-[#C1704D] to-[#A35C3E] text-white shadow-md' : 'bg-white text-[#1A1A1A]/60 border border-gray-200'}`}>
              <span className="text-xs uppercase">{cat.label}</span>
            </button>
          ))}
        </nav>

        {loading ? (
           <div className="flex justify-center items-center py-32 opacity-50"><svg className="w-12 h-12 animate-spin text-[#C1704D]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col group">
                <div className="h-44 bg-gray-100 relative">
                  {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : null}
                  {p.promotionalPrice && <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase">Oferta</div>}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-black text-lg text-[#1A1A1A] mb-2">{p.name}</h3>
                  <div className="mt-auto mb-6">
                    {p.promotionalPrice ? <><p className="text-gray-400 line-through text-[10px]">R$ {p.price.toFixed(2)}</p><p className="text-3xl font-black text-red-500">R$ {p.promotionalPrice.toFixed(2)}</p></> : <p className="text-3xl font-black text-[#C1704D]">R$ {p.price.toFixed(2)}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)} className="flex-1 bg-gray-50 border border-gray-200 font-black py-3 rounded-xl uppercase text-[10px]">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="w-12 bg-red-50 text-red-500 border border-red-100 rounded-xl flex items-center justify-center"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in">
             {/* O conteúdo do formulário mantém-se exatamente o mesmo do seu código antigo */}
             <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-black mb-8 border-b pb-4">{editingProduct ? 'Atualizar Produto' : 'Novo Produto'}</h2>
                <div className="grid grid-cols-2 gap-4">
                   <input required className="border p-4 rounded-xl font-bold" placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                   <select className="border p-4 rounded-xl font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input required type="number" step="0.01" className="border p-4 rounded-xl font-bold" placeholder="Preço Original" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                   <input type="number" step="0.01" className="border p-4 rounded-xl font-bold text-red-500 border-red-200" placeholder="Preço de Promoção" value={formData.promotionalPrice} onChange={e => setFormData({...formData, promotionalPrice: e.target.value})} />
                </div>
                <input className="border p-4 rounded-xl font-bold w-full" placeholder="URL da Imagem" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                <textarea className="border p-4 rounded-xl font-medium w-full" rows="3" placeholder="Descrição" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <div className="flex gap-4">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="w-1/3 py-4 rounded-xl font-black bg-gray-100 uppercase">Cancelar</button>
                   <button type="submit" className="w-2/3 py-4 rounded-xl font-black bg-[#1A1A1A] text-[#EBCB6C] uppercase">Salvar</button>
                </div>
             </form>
          </div>
        </div>
      )}

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-lg p-2 px-6 border-t border-white/10 pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">LOJA</span>
          </button>
          <button onClick={() => navigate('/promotions')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">OFERTAS</span>
          </button>
          <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1.5 text-[#EBCB6C] p-2 relative -mt-4">
            <div className="bg-[#EBCB6C] text-[#1A1A1A] p-3 rounded-full shadow-lg border-4 border-[#1A1A1A]"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div>
            <span className="text-[9px] font-black tracking-[0.2em] mt-1">PAINEL</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg><span className="text-[9px] font-black tracking-[0.2em]">PERFIL</span>
          </button>
        </div>
      </footer>
    </div>
  );
}