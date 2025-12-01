import React from 'react';
import { Redirect } from 'expo-router';

export default function PublicHome() {
  // Redireciona para a tela de login
  return <Redirect href="/(public)/login" />;
}
