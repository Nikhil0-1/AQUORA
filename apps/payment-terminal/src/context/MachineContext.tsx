import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Machine } from '@aquora/shared-types';
import { AquoraApiClient } from '@aquora/api-client';

interface MachineContextType {
  machineCode: string;
  machineId: string;
  machine: Machine | null;
  isLoading: boolean;
  error: string | null;
  selectMachine: (code: string) => void;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);
const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
const apiClient = new AquoraApiClient(apiUrl);

export const MachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const urlMachine = searchParams.get('machine');

  const [machineCode, setMachineCode] = useState<string>(
    urlMachine || localStorage.getItem('aquora_machine_code') || 'AQ-VM-001'
  );
  const [machine, setMachine] = useState<Machine | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Could not load machine');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadMachine();
    return () => {
      isMounted = false;
    };
  }, [machineCode]);

  const selectMachine = (code: string) => {
    setMachineCode(code);
    localStorage.setItem('aquora_machine_code', code);
  };

  return (
    <MachineContext.Provider
      value={{
        machineCode,
        machineId: machineCode,
        machine,
        isLoading,
        error,
        selectMachine,
      }}
    >
      {children}
    </MachineContext.Provider>
  );
};

export const useMachine = () => {
  const context = useContext(MachineContext);
  if (!context) throw new Error('useMachine must be used within MachineProvider');
  return context;
};
