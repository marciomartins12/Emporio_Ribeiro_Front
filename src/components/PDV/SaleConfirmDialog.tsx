import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useCardReader, PaymentResult } from '@/hooks/use-card-reader';
import { CreditCard, Loader2 } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import type { PaymentMethod } from './PaymentMethodSelector';

interface SaleConfirmDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  itemCount: number;
  totalAmount: number;
  onConfirm: () => void;
}

const SaleConfirmDialog = ({
  isOpen,
  setIsOpen,
  itemCount,
  totalAmount,
  onConfirm
}: SaleConfirmDialogProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  const {
    isConnected,
    isProcessing: isCardProcessing,
    requestDeviceAccess,
    processPayment
  } = useCardReader();

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setPaymentResult(null);
  };

  const handleConnectCardReader = async () => {
    const result = await requestDeviceAccess();
    if (!result) {
      toast({
        title: "Falha na conexão",
        description: "Não foi possível conectar ao leitor de cartão. Verifique se está conectado via USB.",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    if (paymentMethod === 'card') {
      if (!isConnected) {
        toast({
          title: "Leitor não conectado",
          description: "Por favor, conecte o leitor de cartão antes de prosseguir.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const result = await processPayment(totalAmount);
      setPaymentResult(result);

      if (result.success) {
        toast({
          title: "Pagamento aprovado",
          description: `Transação ${result.transactionId} concluída com sucesso.`,
        });
        onConfirm();
        setIsOpen(false);
      } else {
        toast({
          title: "Pagamento recusado",
          description: result.errorMessage || "A transação foi recusada. Tente novamente.",
          variant: "destructive",
        });
      }
    } else {
      // For cash payments, simply complete the sale
      toast({
        title: "Venda finalizada",
        description: "Pagamento em dinheiro registrado com sucesso.",
      });
      onConfirm();
      setIsOpen(false);
    }

    setIsProcessing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Resumo da venda:</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <span>Total de itens:</span>
              <span className="font-medium">{itemCount}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Valor total:</span>
              <span className="text-emporio-600">R$ {totalAmount !== undefined ?
                (typeof totalAmount === 'number' ?
                  totalAmount.toFixed(2) :
                  parseFloat(String(totalAmount)).toFixed(2)
                ) :
                '0.00'
              }</span>

            </div>
          </div>

          <div className="mt-6">
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={handlePaymentMethodChange}
            />

            {paymentMethod === 'card' && !isConnected && (
              <div className="mt-4">
                <Button
                  onClick={handleConnectCardReader}
                  variant="outline"
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Conectar Leitor de Cartão
                </Button>
              </div>
            )}

            {paymentMethod === 'card' && isConnected && (
              <div className="mt-4 bg-muted/50 p-3 rounded-md">
                <p className="text-sm text-center text-green-600">
                  Leitor de cartão conectado e pronto para uso
                </p>
              </div>
            )}

            {paymentResult && (
              <div className={`mt-4 p-3 rounded-md ${paymentResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="text-sm">
                  {paymentResult.success
                    ? `Pagamento aprovado. Transação: ${paymentResult.transactionId}`
                    : `Pagamento recusado: ${paymentResult.errorMessage}`}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-gray-600">
            Esta ação não pode ser desfeita.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            onClick={handlePayment}
            className="emporio-btn-primary"
            disabled={isProcessing || (paymentMethod === 'card' && !isConnected)}
          >
            {isProcessing || isCardProcessing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Pagamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaleConfirmDialog;