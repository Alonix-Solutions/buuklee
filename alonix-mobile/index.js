import { registerRootComponent } from 'expo';
// Force theme to load first to prevent "Cannot read property 'small' of undefined" errors
import { COLORS, SIZES, FONTS, SHADOWS } from './src/constants/theme';
console.log('🟢 Theme loaded in index.js:', { COLORS, SIZES, FONTS, SHADOWS });
import App from './App';

registerRootComponent(App);
