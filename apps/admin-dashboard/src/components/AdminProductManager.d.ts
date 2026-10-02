import React from 'react';
import { Product } from '@aquora/shared-types';
interface Props {
    products: Product[];
    onRefresh: () => void;
}
export declare function AdminProductManager({ products, onRefresh }: Props): React.JSX.Element;
export {};
