import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';  // <-- assure-toi de l'import ici ou globalement
import App from './App';

test('renders Accueil', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByText(/Accueil/i)).toBeInTheDocument();
});
