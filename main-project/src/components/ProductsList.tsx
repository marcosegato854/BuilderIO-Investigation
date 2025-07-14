import React, { useState, useEffect } from 'react';
import fetchProducts from '../api/products';
import Typography from '@mui/material/Typography';

// Definiamo un tipo per il prodotto
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // Stato per la lista dei prodotti
  const [loading, setLoading] = useState<boolean>(true); // Stato per il caricamento
  const [error, setError] = useState<string | null>(null); // Stato per gli errori

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []); // Il vuoto array significa che questo effetto verrà eseguito solo una volta (all'inizio)

  if (loading) return <div>Loading...</div>; // Mostra "Loading..." mentre carica
  if (error) return <div>Error: {error}</div>; // Mostra l'errore

  return (
    <div>
      <h1>Lista Prodotti</h1>
      {products.map((product) => (
        <Typography key={product.id}>
          {product.name} Prezzo: € {product.price} Categoria: {product.category}
        </Typography>
      ))}
    </div>
  );
};

export default ProductsList;
