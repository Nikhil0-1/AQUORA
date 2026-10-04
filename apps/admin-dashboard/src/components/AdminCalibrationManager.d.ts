import React from 'react';
import { Machine } from '@aquora/shared-types';
interface Props {
    machine: Machine | null;
    initialChannel?: number;
    onRefresh: () => void;
}
export declare function AdminCalibrationManager({ machine, initialChannel, onRefresh }: Props): React.JSX.Element;
export {};
