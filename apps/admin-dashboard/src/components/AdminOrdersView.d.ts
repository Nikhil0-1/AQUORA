import React from 'react';
import { Order } from '@aquora/shared-types';
interface Props {
    orders: Order[];
    onRefresh: () => void;
}
export declare function AdminOrdersView({ orders, onRefresh }: Props): React.JSX.Element;
export {};
