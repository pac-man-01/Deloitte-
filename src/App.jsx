import { Outlet } from 'react-router-dom';
import './App.css';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { HeaderProvider } from './context/HeaderContext'; 

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <HeaderProvider>
          <Outlet />
        </HeaderProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
