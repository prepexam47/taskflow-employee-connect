
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// This file remains at the root level as the entry point
createRoot(document.getElementById("root")!).render(<App />);
