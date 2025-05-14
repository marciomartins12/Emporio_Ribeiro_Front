import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash } from 'lucide-react';
import { SaleItem as SaleItemType } from '@/context/SaleContext';

interface SaleItemProps {
  item: SaleItemType;
  index: number;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
}

const SaleItem = ({
  item,
  index,
  onUpdateQuantity,
  onRemove
}: SaleItemProps) => {
  return (
    <tr className="border-b">
      <td className="p-3">
        <div className="font-medium">{item.productName}</div>
        <div className="text-sm text-gray-500">
          R$ {(item.price || 0).toFixed(2)}
        </div>
      </td>
      <td className="p-3">
        <div className="flex justify-center items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onUpdateQuantity(index, item.quantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-6 text-center">{item.quantity}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onUpdateQuantity(index, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </td>
      <td className="p-3 text-right font-medium">
        R$ {(item.total || 0).toFixed(2)}
      </td>


      <td className="p-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onRemove(index)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

export default SaleItem;
