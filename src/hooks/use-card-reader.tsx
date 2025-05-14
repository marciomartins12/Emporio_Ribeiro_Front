import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface CardReaderDevice {
  device: USBDevice;
  name: string;
  connected: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  amount?: number;
  cardType?: string;
  errorMessage?: string;
}

export function useCardReader() {
  const [devices, setDevices] = useState<CardReaderDevice[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Request access to USB devices
  const requestDeviceAccess = useCallback(async () => {
    try {
      // USB card readers typically use the standard USB class for point-of-sale devices
      const device = await navigator.usb.requestDevice({
        filters: [
          // Common USB classes for POS devices
          { classCode: 0x0B }, // Smart Card class
          { classCode: 0x02 }  // Communications class (some readers use this)
        ]
      });
      
      await connectDevice(device);
      return true;
    } catch (error) {
      console.error('Error requesting USB device access:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível acessar o dispositivo USB. Verifique se está conectado.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  const connectDevice = useCallback(async (device: USBDevice) => {
    try {
      if (!device.opened) {
        await device.open();
      }
      
      // Configure the device
      try {
        // Select configuration #1 (most devices use this)
        await device.selectConfiguration(1);
        
        // Claim the first interface
        const interfaceNumber = 0;
        if (device.configuration?.interfaces[interfaceNumber]) {
          await device.claimInterface(interfaceNumber);
        }
        
        setDevices(prev => [...prev, { device, name: device.productName || 'Card Reader', connected: true }]);
        setIsConnected(true);
        
        toast({
          title: "Dispositivo conectado",
          description: `Leitor de cartão "${device.productName || 'Card Reader'}" conectado com sucesso.`,
        });
        
        return true;
      } catch (configError) {
        console.error('Error configuring device:', configError);
        return false;
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao dispositivo. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  // Process payment through the connected device
  const processPayment = useCallback(async (amount: number): Promise<PaymentResult> => {
    if (!isConnected || devices.length === 0) {
      toast({
        title: "Dispositivo não conectado",
        description: "Por favor, conecte o leitor de cartão antes de processar o pagamento.",
        variant: "destructive",
      });
      return { 
        success: false, 
        errorMessage: "Dispositivo não conectado" 
      };
    }

    setIsProcessing(true);
    
    try {
      // In a real implementation, this would send commands to the card reader
      // and wait for a response. For now, we'll simulate a payment processing delay
      
      // Simulate payment processing
      return await new Promise<PaymentResult>((resolve) => {
        setTimeout(() => {
          const success = Math.random() > 0.2; // 80% success rate for demo
          
          if (success) {
            resolve({
              success: true,
              transactionId: `TX-${Date.now().toString().slice(-8)}`,
              amount: amount,
              cardType: ['Visa', 'Mastercard', 'Elo'][Math.floor(Math.random() * 3)]
            });
          } else {
            resolve({
              success: false,
              errorMessage: "Transação recusada pela operadora"
            });
          }
          setIsProcessing(false);
        }, 2000); // 2-second processing time simulation
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setIsProcessing(false);
      return {
        success: false,
        errorMessage: "Erro ao processar o pagamento"
      };
    }
  }, [isConnected, devices]);

  // Disconnect from a device
  const disconnectDevice = useCallback(async (deviceId: number) => {
    const deviceToDisconnect = devices.find(d => d.device.deviceId === deviceId);
    
    if (!deviceToDisconnect) return false;
    
    try {
      await deviceToDisconnect.device.close();
      setDevices(prev => prev.filter(d => d.device.deviceId !== deviceId));
      
      if (devices.length <= 1) {
        setIsConnected(false);
      }
      
      toast({
        title: "Dispositivo desconectado",
        description: `Leitor de cartão "${deviceToDisconnect.name}" desconectado.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error disconnecting device:', error);
      return false;
    }
  }, [devices]);

  // Check for already connected devices when the component mounts
  useEffect(() => {
    const checkExistingDevices = async () => {
      try {
        const connectedDevices = await navigator.usb.getDevices();
        
        if (connectedDevices.length > 0) {
          for (const device of connectedDevices) {
            await connectDevice(device);
          }
        }
      } catch (error) {
        console.error('Error checking existing devices:', error);
      }
    };
    
    checkExistingDevices();
    
    return () => {
      // Clean up by disconnecting devices
      devices.forEach(d => {
        try {
          d.device.close().catch(console.error);
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
    };
  }, []);

  return {
    isConnected,
    isProcessing,
    devices,
    requestDeviceAccess,
    processPayment,
    disconnectDevice
  };
}