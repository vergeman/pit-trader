import { BrowserRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders demo link', () => {
  render(
      <BrowserRouter>
      <App />
      </BrowserRouter>
  );
  const linkElement = screen.getByText("demo");
  expect(linkElement).toBeInTheDocument();
});
