import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('BURGER');
  const [loading, setLoading] = useState(true);
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
      setProducts(result.data.products);
    } catch (err) {
      console.error(err);
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
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este produto permanentemente?')) return;
    try {
      await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          query: `mutation { deleteProduct(id: "${id}") }`
        })
      });
      fetchProducts();
    } catch (err) {
      alert('Erro ao excluir');
    }
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      promotionalPrice: product.promotionalPrice ? product.promotionalPrice.toString() : '',
      description: product.description || '',
      category: product.category,
      imageUrl: product.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const filteredProducts = products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FDF9EB] flex flex-col relative pb-24 md:pb-0">
      <header className="sticky top-0 z-40 bg-[#1A1A1A] p-4 shadow-lg border-b-4 border-[#EBCB6C]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-center md:text-left flex-grow md:flex-grow-0 cursor-pointer" onClick={() => navigate('/menu')}>
            <h1 className="text-3xl font-extrabold text-[#FDF9EB] tracking-tight leading-none">MANU´S</h1>
            <p className="text-[10px] md:text-xs font-bold text-[#FDF9EB] opacity-60 tracking-widest uppercase">Admin Panel</p>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => navigate('/admin')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">⚙️ Pedidos</button>
            <button onClick={() => navigate('/menu')} className="text-[#EBCB6C] font-bold hover:text-white transition-colors">🏠 Loja</button>
            <button onClick={handleLogout} className="text-red-400 font-bold hover:text-red-300 transition-colors">Sair</button>
          </div>
          
          <div className="md:hidden text-[#EBCB6C] text-2xl font-bold px-4">🍔</div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-2 md:px-0">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A1A1A] uppercase">GERIR PRODUTOS</h2>
          </div>
          <button 
            onClick={() => { setEditingProduct(null); setFormData({name:'', price:'', promotionalPrice:'', description:'', category: activeCategory, imageUrl: ''}); setIsModalOpen(true); }} 
            className="bg-[#C1704D] text-white font-extrabold py-3 px-6 rounded-xl hover:bg-[#A35C3E] transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <span className="text-xl">+</span> NOVO PRODUTO
          </button>
        </div>

        <nav className="mb-8 flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.value 
                ? 'bg-[#1A1A1A] text-white scale-105 shadow-xl border border-[#EBCB6C]' 
                : 'bg-[#E5DCC3] text-[#1A1A1A]/70 hover:bg-[#D4C9AA]'
              }`}
            >
              <span className="text-sm uppercase font-extrabold tracking-wide">{cat.label}</span>
            </button>
          ))}
        </nav>

        {loading ? (
           <div className="flex justify-center items-center py-20">
             <div className="animate-spin text-4xl text-[#C1704D]">🍔</div>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white rounded-3xl shadow-sm border-2 border-[#E5DCC3] overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-100 relative">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🍔</div>
                  )}
                  {p.promotionalPrice && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                      OFERTA
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-[#1A1A1A] text-[#EBCB6C] text-xs font-extrabold px-3 py-1 rounded-full shadow-lg uppercase">
                    {p.category}
                  </div>
                </div>
                
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-extrabold text-xl text-[#1A1A1A] leading-tight mb-2">{p.name}</h3>
                  <p className="text-[#1A1A1A]/60 text-sm mb-4 line-clamp-2">{p.description}</p>
                  
                  <div className="mt-auto flex justify-between items-end mb-4">
                    <div>
                      {p.promotionalPrice ? (
                        <>
                          <p className="text-[#1A1A1A]/40 line-through text-xs font-bold">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                          <p className="text-2xl font-extrabold text-red-600">R$ {p.promotionalPrice.toFixed(2).replace('.', ',')}</p>
                        </>
                      ) : (
                        <p className="text-2xl font-extrabold text-[#C1704D]">R$ {p.price.toFixed(2).replace('.', ',')}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t-2 border-[#E5DCC3] pt-4">
                    <button onClick={() => openEdit(p)} className="bg-[#E5DCC3] hover:bg-[#D4C9AA] text-[#1A1A1A] font-extrabold py-3 rounded-xl transition-colors">EDITAR</button>
                    <button onClick={() => handleDelete(p.id)} className="bg-red-50 hover:bg-red-100 text-red-600 font-extrabold py-3 rounded-xl transition-colors">EXCLUIR</button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-[#E5DCC3]">
                <p className="text-[#1A1A1A]/40 font-extrabold uppercase tracking-widest text-lg">Nenhum produto cadastrado nesta categoria.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FDF9EB] rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl border-2 border-[#E5DCC3] max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-6 uppercase border-b-2 border-[#EBCB6C] pb-2">
              {editingProduct ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">Nome do Produto *</label>
                  <input required className="w-full border-2 border-[#E5DCC3] p-3 rounded-xl bg-white font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">Categoria *</label>
                  <select className="w-full border-2 border-[#E5DCC3] p-3 rounded-xl bg-white font-bold text-[#1A1A1A] outline-none focus:border-[#C1704D]" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-2xl border-2 border-[#E5DCC3]">
                <div>
                  <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">Preço Original (R$) *</label>
                  <input required type="number" step="0.01" className="w-full border-2 border-[#E5DCC3] p-3 rounded-xl bg-gray-50 font-extrabold text-[#1A1A1A] outline-none focus:border-[#C1704D]" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-red-600 mb-1 uppercase tracking-wider">Preço Promocional (R$)</label>
                  <input type="number" step="0.01" placeholder="Opcional" className="w-full border-2 border-red-200 p-3 rounded-xl bg-red-50 font-extrabold text-red-600 outline-none focus:border-red-500 placeholder-red-300" value={formData.promotionalPrice} onChange={e => setFormData({...formData, promotionalPrice: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">Link da Imagem (URL)</label>
                <input type="text" className="w-full border-2 border-[#E5DCC3] p-3 rounded-xl bg-white font-semibold text-[#1A1A1A] outline-none focus:border-[#C1704D] placeholder-gray-300" placeholder="https://..." value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1A1A1A] mb-1 uppercase tracking-wider">Descrição dos ingredientes</label>
                <textarea className="w-full border-2 border-[#E5DCC3] p-3 rounded-xl bg-white font-semibold text-[#1A1A1A] outline-none focus:border-[#C1704D]" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex gap-4 pt-4 border-t-2 border-[#E5DCC3]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-white border-2 border-[#E5DCC3] text-[#1A1A1A] font-extrabold py-4 rounded-xl hover:bg-gray-50 transition-colors uppercase tracking-wider">CANCELAR</button>
                <button type="submit" className="flex-1 bg-[#1A1A1A] text-[#EBCB6C] font-extrabold py-4 rounded-xl hover:bg-[#333] transition-colors shadow-md uppercase tracking-wider">SALVAR PRODUTO</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A1A1A] p-2 px-6 border-t-2 border-[#EBCB6C] pb-safe">
        <div className="flex justify-between items-center w-full max-w-md mx-auto">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2">
            <span className="text-xl">🏠</span>
            <span className="text-[10px] font-bold tracking-wider">LOJA</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-[#EBCB6C] p-2">
            <span className="text-xl">🍔</span>
            <span className="text-[10px] font-bold tracking-wider">PRODUTOS</span>
          </button>
          <button onClick={() => navigate('/admin')} className="flex flex-col items-center gap-1 text-white/50 hover:text-white p-2">
            <span className="text-xl">⚙️</span>
            <span className="text-[10px] font-bold tracking-wider">PEDIDOS</span>
          </button>
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-400/70 hover:text-red-400 p-2">
            <span className="text-xl">🚪</span>
            <span className="text-[10px] font-bold tracking-wider">SAIR</span>
          </button>
        </div>
      </footer>
    </div>
  );
}