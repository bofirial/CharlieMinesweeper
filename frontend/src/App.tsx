import { useState, useEffect } from 'react';
import { Minesweeper } from './components/Minesweeper';
import { ColorTestPage } from './components/ColorTestPage';
import './App.css';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(this, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  if (currentPath === '/test' && import.meta.env.DEV) {
    return <ColorTestPage />;
  }

  return <Minesweeper />;
}

export default App;
