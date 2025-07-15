import "./App.css";
import "./styles/themes.css";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProductsList from "./components/ProductsList";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <ThemeProvider>
      <div className="app">
        <header className="app-header">
          <ThemeToggle />
        </header>
        <main className="app-main">
          <ProductsList />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
