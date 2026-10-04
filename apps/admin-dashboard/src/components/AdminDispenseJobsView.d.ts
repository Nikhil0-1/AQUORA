import React from 'react';
import { Product } from '@aquora/shared-types';
interface Props {
    products: Product[];
    onRefresh: () => void;
}
export declare function AdminDispenseJobsView({ products, onRefresh }: Props): React.JSX.Element;
export {};
