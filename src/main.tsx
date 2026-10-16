import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';
import './design-system.css';

createRoot(document.getElementById('root')!).render(
	<>
		<App />
		<PwaInstallPrompt />
	</>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
			console.error('MLIMA service worker registration failed:', error);
		});
	});
}
