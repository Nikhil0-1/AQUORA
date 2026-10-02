import React from 'react';
import { InventoryItem } from '@aquora/shared-types';
interface Props {
    inventory: InventoryItem[];
    onRefresh: () => void;
}
export declare function AdminInventoryManager({ inventory, onRefresh }: Props): React.JSX.Element;
export {};
