"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  walletAddress: string | null;
  balance: number;
  isRechargeModalOpen: boolean;
  setWalletAddress: (address: string | null) => void;
  setBalance: (balance: number) => void;
  setIsRechargeModalOpen: (open: boolean) => void;
  handleConnectWallet: () => void;
  handleRecharge: (amount: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  const handleConnectWallet = () => {
    if (!walletAddress) {
      // Simulate connection
      setTimeout(() => {
        setWalletAddress('0x71C...9A21');
        setBalance(5.00); // Initial welcome bonus
      }, 500);
    } else {
      setIsRechargeModalOpen(true);
    }
  };

  const handleRecharge = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        balance,
        isRechargeModalOpen,
        setWalletAddress,
        setBalance,
        setIsRechargeModalOpen,
        handleConnectWallet,
        handleRecharge,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

