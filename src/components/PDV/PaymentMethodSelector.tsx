import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet } from 'lucide-react';
import { useSales } from "@/context/SaleContext";

export type PaymentMethod = 'cash' | 'card' | 'pix';

const PaymentMethodSelector = () => {
  const { setPaymentMethod, paymentMethod } = useSales();

  return (
    <div className="space-y-4">
      <h4 className="font-medium mb-2">Método de Pagamento</h4>

      <RadioGroup
        value={paymentMethod ?? ''}
        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
        className="grid grid-cols-1 gap-3"
      >
        <div className={`flex items-center space-x-2 rounded-md border p-3 ${paymentMethod === 'cash' ? 'bg-muted border-primary' : ''}`}>
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash" className="flex items-center cursor-pointer">
            <Wallet className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Dinheiro</p>
              <p className="text-xs text-muted-foreground">Pagamento em espécie</p>
            </div>
          </Label>
        </div>

        <div className={`flex items-center space-x-2 rounded-md border p-3 ${paymentMethod === 'card' ? 'bg-muted border-primary' : ''}`}>
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card" className="flex items-center cursor-pointer">
            <CreditCard className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Cartão</p>
              <p className="text-xs text-muted-foreground">Via leitor USB</p>
            </div>
          </Label>
        </div>

        <div className={`flex items-center space-x-2 rounded-md border p-3 ${paymentMethod === 'pix' ? 'bg-muted border-primary' : ''}`}>
          <RadioGroupItem value="pix" id="pix" />
          <Label htmlFor="pix" className="flex items-center cursor-pointer">
            <img src="/icons/pix.svg" alt="PIX" className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Pix</p>
              <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;
