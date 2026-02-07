import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Apply logged-in class based on token (keeps UI consistent after login)
function applyLoggedInClass() {
  const token = localStorage.getItem('token');
  if (token) document.body.classList.add('logged-in');
  else document.body.classList.remove('logged-in');
}

// Initialize
applyLoggedInClass();

// Listen for storage changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key === 'token') applyLoggedInClass();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
