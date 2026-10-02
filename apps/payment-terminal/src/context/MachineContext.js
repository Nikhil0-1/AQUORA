import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AquoraApiClient } from '@aquora/api-client';
const MachineContext = createContext(undefined);
const apiUrl = import.meta.env?.VITE_API_URL || 'http://localhost:3001';
const apiClient = new AquoraApiClient(apiUrl);
export const MachineProvider = ({ children }) => {
    const [searchParams] = useSearchParams();
    const urlMachine = searchParams.get('machine');
    const [machineCode, setMachineCode] = useState(urlMachine || localStorage.getItem('aquora_machine_code') || 'AQ-VM-001');
    const [machine, setMachine] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (urlMachine && urlMachine !== machineCode) {
            setMachineCode(urlMachine);
            localStorage.setItem('aquora_machine_code', urlMachine);
        }
    }, [urlMachine]);
    useEffect(() => {
        let isMounted = true;
        const loadMachine = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await apiClient.getMachineByCode(machineCode);
                if (isMounted) {
                    setMachine(data);
                    localStorage.setItem('aquora_machine_code', machineCode);
                }
            }
            catch (err) {
                if (isMounted) {
                    setError(err.message || 'Could not load machine');
                }
            }
            finally {
                if (isMounted)
                    setIsLoading(false);
            }
        };
        loadMachine();
        return () => {
            isMounted = false;
        };
    }, [machineCode]);
    const selectMachine = (code) => {
        setMachineCode(code);
        localStorage.setItem('aquora_machine_code', code);
    };
    return (_jsx(MachineContext.Provider, { value: {
            machineCode,
            machineId: machineCode,
            machine,
            isLoading,
            error,
            selectMachine,
        }, children: children }));
};
export const useMachine = () => {
    const context = useContext(MachineContext);
    if (!context)
        throw new Error('useMachine must be used within MachineProvider');
    return context;
};
