
import React from 'react';
import BarcodeScanner from '@/components/BarcodeScanner';
import BarcodeInput from '@/components/BarcodeInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScannerSectionProps {
  onScan: (barcode: string) => void;
}

const ScannerSection = ({ onScan }: ScannerSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Código de Barras</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <BarcodeInput onSubmit={onScan} />
          <div className="flex items-center gap-2">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <BarcodeScanner onScan={onScan} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ScannerSection;