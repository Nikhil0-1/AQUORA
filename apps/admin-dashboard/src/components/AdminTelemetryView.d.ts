import React from 'react';
import { Machine } from '@aquora/shared-types';
interface Props {
    machine: Machine | null;
    onRefresh: () => void;
}
export declare function AdminTelemetryView({ machine, onRefresh }: Props): React.JSX.Element;
export {};
