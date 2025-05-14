import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface BarcodeInputProps {
  onSubmit: (barcode: string) => void;
}

const BarcodeInput = ({ onSubmit }: BarcodeInputProps) => {
  const [barcode, setBarcode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onSubmit(barcode.trim());
      setBarcode('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        placeholder="Digite o código de barras"
        className="emporio-input"
        autoFocus
      />
      <Button type="submit" className="emporio-btn-primary">
        <Search className="mr-2 h-5 w-5" /> 
        Buscar
      </Button>
    </form>
  );
};

export default BarcodeInput;