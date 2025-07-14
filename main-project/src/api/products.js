const fetchProducts = async () => {
  const response = await fetch('/products.json');
  if (!response.ok) {
    throw new Error('Impossibile caricare i prodotti');
  }
  return response.json();
};

export default fetchProducts;
