import React, { useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import Card from './cardsdata/Cards'; 
import conversions from './cardsdata/CardConversions';
import image1 from '../Images/image1.png'; 
import image2 from '../Images/image2.png'; 
import image3 from '../Images/image3.png'; 

const LandingPage = () => {
  const imageContainerRef = useRef(null);
  const headingRef = useRef(null);

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const rotationDegree1 = scrollPosition * 0.05; 
    const rotationDegree2 = scrollPosition * -0.05;
    const rotationDegree3 = scrollPosition * 0.05;

    const translateX1 = scrollPosition * -2; 
    const translateX2 = scrollPosition * 2;
    const translateX3 = 0; 

    if (imageContainerRef.current) {
      const images = imageContainerRef.current.children;
      images[0].style.transform = `rotate(${rotationDegree1}deg) translateX(${translateX1}px)`;
      images[1].style.transform = `rotate(${rotationDegree2}deg) translateX(${translateX2}px)`;
      images[2].style.transform = `rotate(${rotationDegree3}deg) scale(1.05)`; 
    }

    if (headingRef.current) {
      if (scrollPosition < 300) {
        headingRef.current.style.position = 'fixed';
        headingRef.current.style.top = '20px';
      } else {
        headingRef.current.style.position = 'absolute';
        headingRef.current.style.top = '300px';
      }
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <Navbar />
      
      <div className="relative pt-16 pb-16 bg-gray-100 text-center min-h-screen overflow-hidden">
        <h1
          className="text-black text-5xl font-bold mt-96 z-10"
          ref={headingRef}
          style={{ position: 'fixed', top: '20px', width: '100%' }}
        >
          Experience the Best PDF Tools
        </h1>
        <div 
          className="image-container relative"
          ref={imageContainerRef}
          style={{
            width: '900px',
            height: '900px',
            margin: '0 auto',
            position: 'relative',
            overflow: 'visible', // Make sure the overflow is visible
          }}
        >
          <img
            src={image1}
            alt="Image 1"
            className="absolute top-0 left-0 w-screen h-screen"
            style={{ transition: 'transform 0.5s ease-out' }}
          />
          <img
            src={image2}
            alt="Image 2"
            className="absolute top-0 left-0 w-screen h-screen"
            style={{ transition: 'transform 0.5s ease-out' }}
          />
          <img
            src={image3}
            alt="Image 3"
            className="absolute top-0 left-0 w-screen h-screen"
            style={{ transition: 'transform 0.5s ease-out' }}
          />
        </div>
      </div>

      <div className="pt-16 pb-16 flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-6 space-y-8">
        <div className="flex-grow flex items-center justify-center space-x-8">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold mb-4">Welcome to Our Website</h2>
            <p className="text-lg mb-6">
              We provide a suite of powerful PDF tools to help you manage your documents easily. Whether you need to merge, split, or compress PDFs, our tools are designed to be user-friendly and efficient.
            </p>
            <Link to="/login">
              <button className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition duration-300 mb-8">
                Start Using It
              </button>
            </Link>
          </div>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-4xl font-bold mb-4">Most Popular PDF Tools</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {conversions.map(conversion => (
              <Card key={conversion.id} conversion={conversion} />
            ))}
          </div>
        </div>

        <div className="flex-grow mt-8 mb-16">
          <h3 className="text-4xl font-bold mb-4">Explore All Our Tools</h3>
          <p className="text-lg max-w-xl mx-auto mb-6">
            Discover a comprehensive collection of PDF tools designed to simplify your document management tasks. From merging and splitting to compressing PDFs, everything you need is available right here.
          </p>
          <Link to="/tools">
            <button className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 transition duration-300">
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
