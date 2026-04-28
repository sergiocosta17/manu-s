// components/ConfirmModal.jsx
import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Remover item?",
  message = "Tem certeza que deseja remover este item do carrinho?",
  product = null,
  confirmText = "Remover",
  cancelText = "Manter"
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-[#1e3a5f]/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl p-6 max-w-[400px] w-full shadow-2xl animate-slideUp border border-[#1e3a5f]/10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
            <AlertIcon className="w-6 h-6 text-[#1e3a5f]" />
          </div>
          <h3 className="text-lg font-bold text-[#1e3a5f]">
            {title}
          </h3>
        </div>

        {/* Info do Produto */}
        {product && (
          <div className="flex items-center gap-3 p-3 bg-[#faf8f5] rounded-xl mb-4 border border-[#1e3a5f]/5">
            {product.imageUrl && (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-14 h-14 rounded-xl object-cover shadow-sm"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1e3a5f] truncate">
                {product.name}
              </p>
              {product.quantity && (
                <p className="text-xs text-[#1e3a5f]/50 mt-0.5">
                  Qtd: {product.quantity}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mensagem */}
        <p className="text-sm text-[#1e3a5f]/60 mb-6 leading-relaxed">
          {message}
        </p>

        {/* Botões */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-[#faf8f5] text-[#1e3a5f] hover:bg-[#f0eeeb] transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-[#1e3a5f]/10"
          >
            <CloseIcon className="w-4 h-4" />
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-[#1e3a5f] text-white hover:bg-[#162d4a] transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#1e3a5f]/20"
          >
            <TrashIcon className="w-4 h-4" />
            {confirmText}
          </button>
        </div>
      </div>

      {/* Estilos de animação inline */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.25s ease-out;
        }
      `}</style>
    </div>
  );
};

// Ícones SVG

const AlertIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const CloseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default ConfirmModal;