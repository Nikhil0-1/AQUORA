import React from 'react';
import { Machine } from '@aquora/shared-types';
interface MachineContextType {
    machineCode: string;
    machineId: string;
    machine: Machine | null;
    isLoading: boolean;
    error: string | null;
    selectMachine: (code: string) => void;
}
export declare const MachineProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useMachine: () => MachineContextType;
export {};
