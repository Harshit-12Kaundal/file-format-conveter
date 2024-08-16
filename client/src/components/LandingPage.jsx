import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import Card from './cardsdata/Cards'; // Importing the correct Card component
import conversions from './cardsdata/CardConversions';

const LandingPage = () => {
  return (
    <div>
      <Navbar />
      <div className="pt-16 pb-16 flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-6 space-y-8">
        <div className="flex-grow">
          <h2 className="text-4xl font-bold mb-4">Welcome to Our Website</h2>
          <p className="text-lg mb-6 max-w-xl mx-auto">
            We provide a suite of powerful PDF tools to help you manage your documents easily. Whether you need to merge, split, or compress PDFs, our tools are designed to be user-friendly and efficient.
          </p>
          <Link to="/login">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition duration-300 mb-8">
              Start Using It
            </button>
          </Link>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-2xl font-semibold mb-4">Most Popular PDF Tools</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {conversions.map(conversion => (
              <Card key={conversion.id} conversion={conversion} />
            ))}
          </div>
        </div>

        <div className="flex-grow mt-8 mb-16">
          <h3 className="text-2xl font-semibold mb-4">Explore All Our Tools</h3>
          <p className="text-lg max-w-xl mx-auto mb-6">
            Discover a comprehensive collection of PDF tools designed to simplify your document management tasks. From merging and splitting to compressing PDFs, everything you need is available right here.
          </p>
          <Link to="/tools">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition duration-300">
              Explore Tools
            </button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;
