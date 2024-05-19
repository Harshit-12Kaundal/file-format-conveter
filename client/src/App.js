import './App.css';
import Footer from './components/Footer.jsx';
import Home from './components/Home.jsx';
import Navbar from  "./components/Navbar.jsx"

function App() {
  return (
<div className="flex flex-col min-h-screen">
      <header>
        <Navbar />
      </header>
      <main className="flex-grow flex items-center justify-center">
        <Home />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
