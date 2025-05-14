import React, { useRef, useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Barcode } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

const BarcodeScanner = ({ onScan }: BarcodeScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);
  const scannerContainerId = "html5qr-code-full-region";

  const startScanner = () => {
    setError(null);
    setIsScanning(true);

    const html5QrCode = new Html5Qrcode(scannerContainerId);
    scannerRef.current = html5QrCode;

    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          stopScanner();
          onScan(decodedText);
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      )
      .catch((err) => {
        setError("Erro ao iniciar a câmera: " + err);
        setIsScanning(false);
      });
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch((err) => {
          console.error("Erro ao parar o scanner:", err);
        });
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {!isScanning && (
          <Button
            onClick={startScanner}
            className="emporio-btn-primary"
            type="button"
          >
            <Barcode className="mr-2 h-5 w-5" />
            Escanear Código de Barras
          </Button>
        )}
        {isScanning && (
          <Button
            onClick={stopScanner}
            variant="destructive"
            type="button"
          >
            Parar Scanner
          </Button>
        )}
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <div
        id={scannerContainerId}
        className={`mt-4 w-full ${!isScanning && "hidden"}`}
        style={{ maxWidth: "500px" }}
      ></div>
    </div>
  );
};

export default BarcodeScanner;