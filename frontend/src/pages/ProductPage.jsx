import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

// ============ ÍCONES ============
const Icons = {
  ArrowLeft: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Plus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Minus: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
    </svg>
  ),
  Cart: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Check: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Burger: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 10H2c0-2.76 4.48-5 10-5s10 2.24 10 5zM2 12h20v2c0 1.1-.9 2-2 2h-.67c.44-.58.67-1.27.67-2 0-1.65-1.35-3-3-3s-3 1.35-3 3c0 .73.23 1.42.67 2h-5.34c.44-.58.67-1.27.67-2 0-1.65-1.35-3-3-3s-3 1.35-3 3c0 .73.23 1.42.67 2H4c-1.1 0-2-.9-2-2v-2zm0 6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2H2z"/>
    </svg>
  ),
  Fire: ({ className = "w-5 h-5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 23c-3.866 0-7-3.134-7-7 0-2.277 1.09-4.34 2.75-5.65.276-.218.675-.078.753.26.107.462.243.893.405 1.29.081.199.021.424-.14.564-.47.406-.768.998-.768 1.536 0 1.105.895 2 2 2s2-.895 2-2c0-.014 0-.027-.001-.041.008-.576.073-1.141.205-1.688.084-.347.466-.489.756-.278C15.91 13.827 17 15.89 17 18c0 3.866-3.134 7-7 7zm0-14c-.552 0-1-.448-1-1V4c0-.552.448-1 1-1s1 .448 1 1v4c0 .552-.448 1-1 1z"/>
    </svg>
  ),
};

// Query GraphQL para buscar produto
const GET_PRODUCT = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      description
      price
      promotionalPrice
      imageUrl
      category
    }
  }
`;

// Mapeamento de categorias para exibição
const categoryLabels = {
  BURGER: 'Burger',
  CHICKEN: 'Frango',
  COMBO: 'Combo',
  SIDE: 'Acompanhamento',
  DRINK: 'Bebida',
  DESSERT: 'Sobremesa',
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Ref para prevenir cliques duplos
  const isAddingRef = useRef(false);

  // ✅ CORREÇÃO: Usando 'userRole' conforme seu Login.jsx
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';

  // Buscar produto
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify({
            query: GET_PRODUCT,
            variables: { id },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        if (!result.data?.product) {
          throw new Error('Produto não encontrado');
        }

        setProduct(result.data.product);
      } catch (err) {
        setError(err.message || 'Erro ao carregar produto');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Verificar se tem preço promocional válido
  const hasValidPromoPrice = (p) => {
    if (!p || p.promotionalPrice === null || p.promotionalPrice === undefined) return false;
    const promo = Number(p.promotionalPrice);
    return !isNaN(promo) && promo > 0;
  };

  // Preço atual (promocional ou normal)
  const getCurrentPrice = () => {
    if (!product) return 0;
    return hasValidPromoPrice(product) 
      ? Number(product.promotionalPrice) 
      : Number(product.price);
  };

  // Total
  const getTotal = () => {
    return getCurrentPrice() * quantity;
  };

  // Desconto em porcentagem
  const getDiscountPercent = () => {
    if (!hasValidPromoPrice(product)) return 0;
    const original = Number(product.price);
    const promo = Number(product.promotionalPrice);
    return Math.round(((original - promo) / original) * 100);
  };

  // Adicionar ao carrinho - Com proteção contra cliques duplos
  const handleAddToCart = () => {
    if (!product || isAddingRef.current || addedToCart) return;
    
    isAddingRef.current = true;
    addToCart(product, quantity);
    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
      isAddingRef.current = false;
    }, 2000);
  };

  // Incrementar quantidade
  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10));
  };

  // Decrementar quantidade
  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#1e3a5f]/10 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
          </div>
          <p className="text-[#1e3a5f]/40 font-medium">Carregando produto...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#1e3a5f]/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">Produto não encontrado</h2>
          <p className="text-[#1e3a5f]/50 mb-6">{error || 'O produto que você procura não existe.'}</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#162d4a] transition-all"
          >
            Voltar ao Cardápio
          </button>
        </div>
      </div>
    );
  }

  // Variáveis para renderização condicional do preço
  const showPromoPrice = hasValidPromoPrice(product);
  const displayPrice = Number(product.price || 0).toFixed(2).replace('.', ',');
  const displayPromoPrice = showPromoPrice 
    ? Number(product.promotionalPrice).toFixed(2).replace('.', ',') 
    : null;
  const savings = showPromoPrice 
    ? (Number(product.price) - Number(product.promotionalPrice)).toFixed(2).replace('.', ',')
    : null;

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 md:pb-8">
      {/* Header com botão voltar */}
      <div className="sticky top-0 z-30 bg-[#faf8f5]/95 backdrop-blur-sm border-b border-[#1e3a5f]/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all border border-[#1e3a5f]/10"
          >
            <Icons.ArrowLeft className="w-5 h-5 text-[#1e3a5f]" />
          </button>
          <div className="flex-grow">
            <h1 className="font-bold text-[#1e3a5f] truncate">{product.name}</h1>
            <p className="text-xs text-[#1e3a5f]/40">Detalhes do produto</p>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Imagem do Produto */}
          <div className="relative">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg border border-[#1e3a5f]/5 relative">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f5f3f0] to-[#ebe8e4]">
                  <Icons.Burger className="w-24 h-24 text-[#1e3a5f]/20" />
                </div>
              )}

              {/* Badge de Oferta */}
              {showPromoPrice && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                  <Icons.Fire className="w-4 h-4" />
                  <span>-{getDiscountPercent()}% OFF</span>
                </div>
              )}
            </div>
          </div>

          {/* Informações do Produto */}
          <div className="flex flex-col">
            {/* Categoria */}
            {product.category && (
              <span className="inline-block self-start px-3 py-1 bg-[#1e3a5f]/5 text-[#1e3a5f]/60 text-xs font-medium rounded-full mb-3">
                {categoryLabels[product.category] || product.category}
              </span>
            )}

            {/* Nome */}
            <h1 className="text-2xl md:text-3xl font-bold text-[#1e3a5f] mb-4">
              {product.name}
            </h1>

            {/* Descrição */}
            <p className="text-[#1e3a5f]/60 leading-relaxed mb-6">
              {product.description || 'Delicioso smash burger artesanal, preparado com ingredientes selecionados e muito carinho.'}
            </p>

            {/* Preço */}
            <div className="bg-white rounded-2xl p-5 border border-[#1e3a5f]/5 mb-6">
              <div className="flex items-end gap-3">
                {showPromoPrice ? (
                  <>
                    <span className="text-3xl md:text-4xl font-bold text-red-500">
                      R$ {displayPromoPrice}
                    </span>
                    <span className="text-lg text-[#1e3a5f]/30 line-through mb-1">
                      R$ {displayPrice}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl md:text-4xl font-bold text-[#1e3a5f]">
                    R$ {displayPrice}
                  </span>
                )}
              </div>
              {showPromoPrice && savings && (
                <p className="text-green-600 text-sm font-medium mt-1">
                  Você economiza R$ {savings}
                </p>
              )}
            </div>

            {/* Seletor de Quantidade e Botão - Apenas para clientes (não admin) */}
            {!isAdmin && (
              <>
                <div className="bg-white rounded-2xl p-5 border border-[#1e3a5f]/5 mb-6">
                  <p className="text-sm text-[#1e3a5f]/50 mb-3">Quantidade</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                        className="w-12 h-12 bg-[#faf8f5] rounded-xl flex items-center justify-center border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Icons.Minus className="w-5 h-5 text-[#1e3a5f]" />
                      </button>
                      <span className="text-2xl font-bold text-[#1e3a5f] w-8 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQuantity}
                        disabled={quantity >= 10}
                        className="w-12 h-12 bg-[#faf8f5] rounded-xl flex items-center justify-center border border-[#1e3a5f]/10 hover:bg-[#1e3a5f]/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Icons.Plus className="w-5 h-5 text-[#1e3a5f]" />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#1e3a5f]/40">Total</p>
                      <p className="text-xl font-bold text-[#1e3a5f]">
                        R$ {getTotal().toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botão de Adicionar */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 ${
                    addedToCart
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-[#1e3a5f] text-white hover:bg-[#162d4a] shadow-lg shadow-[#1e3a5f]/20'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Icons.Check className="w-5 h-5" />
                      <span>Adicionado ao Carrinho!</span>
                    </>
                  ) : (
                    <>
                      <Icons.Cart className="w-5 h-5" />
                      <span>Adicionar ao Carrinho</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
