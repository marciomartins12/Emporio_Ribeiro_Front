/// <reference types="vite/client" />

declare module 'html5-qrcode';

// Add USB API definitions if not already available in the TypeScript lib
interface Navigator {
  usb: {
    getDevices(): Promise<USBDevice[]>;
    requestDevice(options: { filters: Array<{classCode?: number; subclassCode?: number; protocolCode?: number}> }): Promise<USBDevice>;
  }
}

interface USBDevice {
  deviceId: number;
  productName?: string;
  manufacturerName?: string;
  opened: boolean;
  configuration?: USBConfiguration;
  configurations: USBConfiguration[];
  
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
}

interface USBConfiguration {
  configurationValue: number;
  configurationName?: string;
  interfaces: USBInterface[];
}

interface USBInterface {
  interfaceNumber: number;
  alternate: USBAlternateInterface;
  alternates: USBAlternateInterface[];
  claimed: boolean;
}

interface USBAlternateInterface {
  alternateSetting: number;
  interfaceClass: number;
  interfaceSubclass: number;
  interfaceProtocol: number;
  endpoints: USBEndpoint[];
}

interface USBEndpoint {
  endpointNumber: number;
  direction: "in" | "out";
  type: "bulk" | "interrupt" | "isochronous" | "control";
  packetSize: number;
}

interface USBInTransferResult {
  data: DataView;
  status: "ok" | "stall" | "babble";
}

interface USBOutTransferResult {
  status: "ok" | "stall";
}