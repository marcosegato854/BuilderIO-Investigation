import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ProductsList from './components/ProductsList';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ProductsList />
    </>
  );
}

export default App;
