import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Redireciona para tela de login
  return <Redirect href="/(public)/login" />;
}
