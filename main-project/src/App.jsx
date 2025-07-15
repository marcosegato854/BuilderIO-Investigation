import { useState } from "react";
import "./App.css";
import ProductsList from "./components/ProductsList";
import SearchBar from "./components/SearchBar";

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log("Searching for:", query);
    // Add your search logic here
  };

  return (
    <div className="app">
      <header className="app-header">
        <SearchBar
          onSearch={handleSearch}
          placeholder="What are you looking for?"
        />
      </header>
      <main className="app-main">
        <ProductsList searchQuery={searchQuery} />
      </main>
    </div>
  );
}

export default App;
