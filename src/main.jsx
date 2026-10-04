import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/base.css';
import './styles/sections.css';
import { App } from './App.jsx';

const root = document.getElementById('root');
// en producción el HTML llega prerenderizado: se hidrata; en desarrollo se monta
if (root.firstElementChild) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
