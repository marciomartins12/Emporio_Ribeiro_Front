import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet } from 'lucide-react';

export type PaymentMethod = 'cash' | 'card' | 'pix';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

const PaymentMethodSelector = ({ selectedMethod, onSelectMethod }: PaymentMethodSelectorProps) => {
  return (
    <div className="space-y-4">
      <h4 className="font-medium mb-2">Método de Pagamento</h4>
      
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={(value) => onSelectMethod(value as PaymentMethod)}
        className="grid grid-cols-1 gap-3"
      >
        <div className={`flex items-center space-x-2 rounded-md border p-3 ${selectedMethod === 'cash' ? 'bg-muted border-primary' : ''}`}>
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash" className="flex items-center cursor-pointer">
            <Wallet className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Dinheiro</p>
              <p className="text-xs text-muted-foreground">Pagamento em espécie</p>
            </div>
          </Label>
        </div>

        <div className={`flex items-center space-x-2 rounded-md border p-3 ${selectedMethod === 'card' ? 'bg-muted border-primary' : ''}`}>
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card" className="flex items-center cursor-pointer">
            <CreditCard className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Cartão</p>
              <p className="text-xs text-muted-foreground">Via leitor USB</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PaymentMethodSelector;