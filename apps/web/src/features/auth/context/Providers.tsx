"use client";

import React from 'react';
import { AuthProvider } from './AuthContext';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Component that wraps all necessary providers for the application
 * This can be expanded to include other providers as the app grows
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}