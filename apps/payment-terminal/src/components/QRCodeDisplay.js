import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
export function QRCodeDisplay({ token, className = '' }) {
    const [qrDataUrl, setQrDataUrl] = useState('');
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
    if (!qrDataUrl)
        return _jsx("div", { className: "w-[300px] h-[300px] bg-white animate-pulse rounded-xl" });
    return (_jsx("div", { className: `p-4 bg-white rounded-2xl shadow-2xl inline-block ${className}`, children: _jsx("img", { src: qrDataUrl, alt: "Vending QR Code", className: "w-[300px] h-[300px]" }) }));
}
