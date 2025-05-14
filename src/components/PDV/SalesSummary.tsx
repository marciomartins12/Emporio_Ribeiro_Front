import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SaleItem } from '@/context/SaleContext';
import SaleItemComponent from './SaleItem';

interface SalesSummaryProps {
  currentSale: SaleItem[];
  itemCount: number;
  totalAmount: number;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCompleteSale: () => void;
}

const SalesSummary = ({
  currentSale,
  itemCount,
  totalAmount,
  onUpdateQuantity,
  onRemoveItem,
  onCompleteSale
}: SalesSummaryProps) => {
  return (

    <Card className="sticky top-6">
      <CardHeader className="bg-emporio-500 text-white rounded-t-lg ">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Venda Atual</CardTitle>
          <ShoppingCart className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {currentSale.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="text-left p-3 text-sm">Produto</th>
                  <th className="text-center p-3 text-sm">Qtd</th>
                  <th className="text-right p-3 text-sm">Subtotal</th>
                  <th className="w-10 p-3"></th>
                </tr>
              </thead>
              <tbody>
                {currentSale.map((item, index) => (
                  <SaleItemComponent
                    key={index}
                    item={item}
                    index={index}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemoveItem}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-400">
              <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
              <p className="text-center">Nenhum item adicionado à venda</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 bg-gray-50 p-4">
        <div className="w-full flex justify-between items-center">
          <span className="text-gray-700">Itens:</span>
          <span className="font-medium">{itemCount}</span>
        </div>
        <div className="w-full flex justify-between items-center">
          <span className="text-lg font-bold">Total:</span>
          <span className="text-xl font-bold text-emporio-600">
            R$ {totalAmount !== undefined ?
              (typeof totalAmount === 'number' ?
                totalAmount.toFixed(2) :
                parseFloat(String(totalAmount)).toFixed(2)
              ) :
              '0.00'
            }
          </span>

        </div>
        <Button
          className="w-full emporio-btn-primary py-6 text-lg"
          onClick={onCompleteSale}
          disabled={currentSale.length === 0}
        >
          <Check className="mr-2 h-5 w-5" />
          Finalizar Venda
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SalesSummary;
