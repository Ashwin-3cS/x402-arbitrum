"use client";

import React from 'react';
import RechargeModal from './RechargeModal';
import { useWallet } from '../contexts/WalletContext';

const WalletModalWrapper: React.FC = () => {
  const { isRechargeModalOpen, setIsRechargeModalOpen, handleRecharge } = useWallet();

  return (
    <RechargeModal 
      isOpen={isRechargeModalOpen} 
      onClose={() => setIsRechargeModalOpen(false)}
      onRecharge={handleRecharge}
    />
  );
};

export default WalletModalWrapper;

