import React from "react";
import { PaymentMethod } from "@/types/sale";
import { SaleItem } from "@/types/sale";
import { Product } from "@/types/product";

interface CartItem extends SaleItem {
  product: Product;
}

interface ReceiptProps {
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  change?: number;
  cashReceived?: number;
}

const Receipt = ({ 
  items, 
  total, 
  paymentMethod, 
  change = 0,
  cashReceived = 0
}: ReceiptProps) => {
  const formatPaymentMethod = () => {
    switch (paymentMethod) {
      case 'cash': return 'Dinheiro';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      default: return paymentMethod;
    }
  };

  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = new Date().toLocaleTimeString('pt-BR');

  return (
    <div className="receipt-content">
      <div className="text-center mb-6">
        <h2 className="font-bold text-xl">Empório Ribeiro</h2>
        <p className="text-sm text-muted-foreground">CNPJ: 12.345.678/0001-90</p>
        <p className="text-sm text-muted-foreground">Av. Exemplo, 123 - Centro</p>
      </div>

      <div className="border-t border-b py-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Data:</span>
          <span>{currentDate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Hora:</span>
          <span>{currentTime}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Operador:</span>
          <span>Caixa 01</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">CUPOM NÃO FISCAL</h3>
        
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th>Qtd</th>
              <th>Produto</th>
              <th className="text-right">Valor Unit</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b">
                <td>{item.quantity}</td>
                <td>{item.productName}</td>
                <td className="text-right">
                  {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="text-right">
                  {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t pt-2">
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
        </div>
        
        <div className="text-sm mt-2">
          <div className="flex justify-between">
            <span>Forma de pagamento:</span>
            <span>{formatPaymentMethod()}</span>
          </div>
          
          {paymentMethod === 'cash' && (
            <>
              <div className="flex justify-between">
                <span>Valor recebido:</span>
                <span>R$ {cashReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Troco:</span>
                <span>R$ {change.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm">Obrigado pela preferência!</p>
        <p className="text-xs text-muted-foreground mt-2">
          Não possui valor fiscal
        </p>
      </div>
    </div>
  );
};

export default Receipt;
