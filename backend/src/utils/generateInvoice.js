// src/utils/generateInvoice.js

export const generateInvoice = (order, storeInfo = {}) => {
  const {
    storeName = "Manu's Smash Burger",
    storeAddress = '',
    storeCNPJ = '',
    storePhone = '',
  } = storeInfo;

  const formatDate = (timestamp) => {
    return new Date(Number(timestamp)).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value) => {
    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Cria o conteúdo HTML da nota fiscal
  const invoiceHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nota Fiscal - Pedido #${order.id.slice(-6).toUpperCase()}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
          padding: 20px;
          color: #1e3a5f;
        }
        
        .invoice {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .header {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .header h1 {
          font-size: 28px;
          margin-bottom: 5px;
        }
        
        .header p {
          opacity: 0.8;
          font-size: 14px;
        }
        
        .invoice-title {
          background: #f8f9fa;
          padding: 20px 30px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .invoice-title h2 {
          font-size: 20px;
          color: #1e3a5f;
        }
        
        .invoice-number {
          background: #1e3a5f;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 14px;
        }
        
        .content {
          padding: 30px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .info-box {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #1e3a5f;
        }
        
        .info-box h3 {
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        
        .info-box p {
          font-size: 16px;
          font-weight: 600;
          color: #1e3a5f;
        }
        
        .info-box .small {
          font-size: 13px;
          font-weight: normal;
          color: #666;
          margin-top: 4px;
        }
        
        .items-section h3 {
          font-size: 16px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #1e3a5f;
          color: #1e3a5f;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th {
          background: #f8f9fa;
          padding: 12px 15px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          color: #666;
          letter-spacing: 0.5px;
        }
        
        .items-table td {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .items-table tr:last-child td {
          border-bottom: none;
        }
        
        .item-name {
          font-weight: 600;
          color: #1e3a5f;
        }
        
        .item-obs {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
          font-style: italic;
        }
        
        .text-right {
          text-align: right;
        }
        
        .text-center {
          text-align: center;
        }
        
        .totals {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          margin-top: 20px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        
        .total-row.final {
          border-top: 2px solid #1e3a5f;
          margin-top: 10px;
          padding-top: 15px;
          font-size: 20px;
          font-weight: bold;
          color: #1e3a5f;
        }
        
        .delivery-info {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px 20px;
          border-radius: 12px;
          margin-top: 20px;
        }
        
        .delivery-info h4 {
          font-size: 14px;
          color: #856404;
          margin-bottom: 8px;
        }
        
        .delivery-info p {
          font-size: 14px;
          color: #856404;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #eee;
        }
        
        .footer p {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .footer .thanks {
          font-size: 16px;
          font-weight: 600;
          color: #1e3a5f;
          margin-top: 10px;
        }
        
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status-delivered {
          background: #d4edda;
          color: #155724;
        }
        
        .status-pending {
          background: #fff3cd;
          color: #856404;
        }
        
        .status-cancelled {
          background: #f8d7da;
          color: #721c24;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .invoice {
            box-shadow: none;
            border-radius: 0;
          }
          
          .no-print {
            display: none !important;
          }
        }
        
        .print-btn {
          display: block;
          width: 100%;
          max-width: 800px;
          margin: 20px auto;
          padding: 15px 30px;
          background: #1e3a5f;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .print-btn:hover {
          background: #162d4a;
        }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <h1>${storeName}</h1>
          ${storeCNPJ ? `<p>CNPJ: ${storeCNPJ}</p>` : ''}
          ${storeAddress ? `<p>${storeAddress}</p>` : ''}
          ${storePhone ? `<p>Tel: ${storePhone}</p>` : ''}
        </div>
        
        <div class="invoice-title">
          <h2>Comprovante de Pedido</h2>
          <span class="invoice-number">Pedido #${order.id.slice(-6).toUpperCase()}</span>
        </div>
        
        <div class="content">
          <div class="info-grid">
            <div class="info-box">
              <h3>Cliente</h3>
              <p>${order.user?.name || 'Cliente'}</p>
              ${order.user?.email ? `<p class="small">${order.user.email}</p>` : ''}
            </div>
            
            <div class="info-box">
              <h3>Data do Pedido</h3>
              <p>${formatDate(order.createdAt)}</p>
            </div>
            
            <div class="info-box">
              <h3>Tipo</h3>
              <p>${order.deliveryType === 'PICKUP' ? '🏪 Retirada no Local' : '🛵 Entrega'}</p>
            </div>
            
            <div class="info-box">
              <h3>Status</h3>
              <span class="status-badge ${
                order.status === 'DELIVERED' || order.status === 'COMPLETED' 
                  ? 'status-delivered' 
                  : order.status === 'CANCELLED' 
                    ? 'status-cancelled' 
                    : 'status-pending'
              }">
                ${getStatusLabel(order.status)}
              </span>
            </div>
          </div>
          
          <div class="items-section">
            <h3>Itens do Pedido</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="text-center">Qtd</th>
                  <th class="text-right">Preço Unit.</th>
                  <th class="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.items.map(item => `
                  <tr>
                    <td>
                      <div class="item-name">${item.name || item.product?.name || 'Item'}</div>
                      ${item.observations ? `<div class="item-obs">Obs: ${item.observations}</div>` : ''}
                    </td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatCurrency(item.price)}</td>
                    <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${formatCurrency(order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0))}</span>
              </div>
              ${order.deliveryFee ? `
                <div class="total-row">
                  <span>Taxa de Entrega</span>
                  <span>${formatCurrency(order.deliveryFee)}</span>
                </div>
              ` : ''}
              <div class="total-row final">
                <span>Total</span>
                <span>${formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
          
          ${order.deliveryType === 'DELIVERY' && order.address ? `
            <div class="delivery-info">
              <h4>📍 Endereço de Entrega</h4>
              <p>${order.address}</p>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
          <p>Este documento não possui valor fiscal</p>
          <p class="thanks">Obrigado pela preferência! 🍔</p>
        </div>
      </div>
      
      <button class="print-btn no-print" onclick="window.print()">
        🖨️ Imprimir Comprovante
      </button>
    </body>
    </html>
  `;

  // Abre em nova janela para impressão
  const printWindow = window.open('', '_blank');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};

const getStatusLabel = (status) => {
  const labels = {
    PLACED: 'Novo',
    PENDING: 'Pendente',
    CONFIRMED: 'Confirmado',
    PREPARING: 'Preparando',
    READY: 'Pronto',
    OUT_FOR_DELIVERY: 'Em Entrega',
    DELIVERED: 'Entregue',
    COMPLETED: 'Finalizado',
    CANCELLED: 'Cancelado',
  };
  return labels[status] || status;
};

export default generateInvoice;