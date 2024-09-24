import React from 'react';
import conversions from './cardsdata/CardConversions'; // Importing the conversions data
import Navbar from './Navbar';
import Footer from './Footer';
import Card from './cardsdata/Cards'

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 pb-16 bg-gray-100">
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-4">
            {conversions.map(conversion => (
              <Card key={conversions.id} conversion={conversion} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
