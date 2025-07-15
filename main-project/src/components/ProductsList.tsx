import React, { useState, useEffect } from "react";
import fetchProducts from "../api/products";
import ProductCard, { Product } from "./ProductCard";
import ProductModal from "./ProductModal";
import "./ProductsList.css";
import SearchBar from "./SearchBar";

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]); // Stato per la lista dei prodotti
  const [loading, setLoading] = useState<boolean>(true); // Stato per il caricamento
  const [error, setError] = useState<string | null>(null); // Stato per gli errori
  const [searchQuery, setSearchQuery] = useState<string>(""); // Stato per la ricerca
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Stato per il prodotto selezionato
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // Stato per il modal

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Errore sconosciuto");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []); // Il vuoto array significa che questo effetto verrà eseguito solo una volta (all'inizio)

  // Function to handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Function to handle product click
  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Function to close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Filter products based on search query
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return product.name.toLowerCase().includes(query);
  });

  if (loading) return <div className="loading">Loading...</div>; // Mostra "Loading..." mentre carica
  if (error) return <div className="error">Error: {error}</div>; // Mostra l'errore

  return (
    <div className="products-container">
      <h1 className="products-title">
        Lista Prodotti
        {searchQuery && (
          <span className="search-results-info">
            {filteredProducts.length > 0
              ? filteredProducts.length > 1
                ? ` - ${filteredProducts.length} risultati per "${searchQuery}"`
                : ` - ${filteredProducts.length} risultato per "${searchQuery}"`
              : ` - Nessun risultato per "${searchQuery}"`}
          </span>
        )}
      </h1>
      <SearchBar
        onSearch={handleSearch}
        placeholder="What are you looking for?"
      />
      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))
        ) : searchQuery ? (
          <div className="no-results">
            <p>Nessun prodotto trovato per la ricerca "{searchQuery}"</p>
            <p>Prova con termini diversi o controlla l'ortografia.</p>
          </div>
        ) : null}
      </div>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ProductsList;
