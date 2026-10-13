'use client';

import React from 'react';
import { useShop } from '@/context/ShopContext';
import { SupabaseKeyModal } from './SupabaseKeyModal';

export const SupabaseKeyModalWrapper: React.FC = () => {
  const { isSupabaseModalOpen, closeSupabaseModal } = useShop();

  return (
    <SupabaseKeyModal
      isOpen={isSupabaseModalOpen}
      onClose={closeSupabaseModal}
    />
  );
};
