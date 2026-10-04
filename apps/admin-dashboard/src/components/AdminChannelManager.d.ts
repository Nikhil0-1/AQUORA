import React from 'react';
import { Machine, Product } from '@aquora/shared-types';
interface Props {
    machines: Machine[];
    products: Product[];
    onRefresh: () => void;
    onNavigateToCalibration?: (channelNum: number) => void;
}
export declare function AdminChannelManager({ machines, products, onRefresh, onNavigateToCalibration }: Props): React.JSX.Element;
export {};
