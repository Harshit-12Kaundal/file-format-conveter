import { BrowserRouter, Routes , Route} from 'react-router-dom';
import './App.css';
import Footer from './components/Footer.jsx';
import Home from './components/Home.jsx';
import Navbar from  "./components/Navbar.jsx"
import Main from './components/Main.jsx';

function App() {
  return (
<div className="flex flex-col min-h-screen">
    <BrowserRouter>
        <header>
          <Navbar />
        </header>
        <div className='pb-80 mb-96'>
          <Routes>
            <Route path="/" element={<Main/>}/>
            <Route path="/convert/:id" element={<Home/>}/>
          </Routes>
        </div>
        <footer>
          <Footer />
        </footer>
    </BrowserRouter>
  </div>
  );  
}

export default App;
