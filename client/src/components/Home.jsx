import React from 'react';
import { useLocation } from 'react-router-dom';
import conversions from './cardsdata/CardConversions'; // Importing the conversions data
import Navbar from './Navbar';
import Footer from './Footer';
import Card from './cardsdata/Cards';

const Home = () => {
  const location = useLocation();
  const { uploadedFile } = location.state || {};

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="px-10 flex-grow pt-16 pb-16 bg-gray-900">
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-4 justify-center">
            {conversions.map(conversion => (
              <Card key={conversion.id} conversion={conversion} uploadedFile={uploadedFile} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
