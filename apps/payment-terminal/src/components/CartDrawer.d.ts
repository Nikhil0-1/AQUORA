import React from 'react';
interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}
export declare function CartDrawer({ isOpen, onClose }: CartDrawerProps): React.JSX.Element | null;
export {};
