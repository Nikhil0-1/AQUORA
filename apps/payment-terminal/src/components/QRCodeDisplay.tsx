import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  token: string;
  className?: string;
}

export function QRCodeDisplay({ token, className = '' }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (token) {
      // Generate standard QR, white background, black foreground for maximum scanner compatibility
      QRCode.toDataURL(token, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H'
      })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating QR', err));
    }
  }, [token]);

  if (!qrDataUrl) return <div className="w-[300px] h-[300px] bg-white animate-pulse rounded-xl"></div>;

  return (
    <div className={`p-4 bg-white rounded-2xl shadow-2xl inline-block ${className}`}>
      <img src={qrDataUrl} alt="Vending QR Code" className="w-[300px] h-[300px]" />
    </div>
  );
}
