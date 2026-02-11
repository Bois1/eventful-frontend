interface QRCodeDisplayProps {
  qrCode: string;
  eventName: string;
}

export default function QRCodeDisplay({ qrCode, eventName }: QRCodeDisplayProps) {

  const qrImageData = qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`;

  return (
    <div className="text-center">
      <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
        <img 
          src={qrImageData} 
          alt={`QR code for ${eventName}`} 
          className="w-48 h-48 object-contain"
        />
      </div>
      <p className="mt-2 text-sm font-medium text-gray-700">Event: {eventName}</p>
      <p className="text-xs text-gray-500">Scan at entrance</p>
    </div>
  );
}