
import React from "react";

const QRCodeImage = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg border">
        <img src="/placeholder.svg" alt="QR Code PIX" className="w-64 h-64" />
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Escaneie o QR Code para pagar via PIX
      </p>
    </div>
  );
};

export default QRCodeImage;
