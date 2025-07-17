import React,{useState,useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gradient from 'random-gradient'

const Card = ({ conversion, uploadedFile }) => {
  const navigate = useNavigate();
  const [gradientStyle, setGradientStyle] = useState('');

  const handleCardClick = () => {
    navigate(`/convert/${conversion.id}`, { state: { uploadedFile } });
  };
   // used gradient to generate random gradient
    useEffect(() => {
      // Generate a random gradient when the component mounts
      const generatedGradient = gradient('unique-seed-' + Math.random());
      setGradientStyle(generatedGradient);
    }, []); // Empty dependency array ensures this runs only once on reload

  return (
    <div onClick={handleCardClick} className="block cursor-pointer">
      <div className="w-52 p-12 bg-gray-800 shadow-md rounded-lg hover:shadow-xl transition-shadow h-64 flex flex-col items-center justify-center hover:bg-gray-700"
         style={{  backgroundImage: gradientStyle}}
      >
        {conversion.icon}
        <h3 className="text-lg font-semibold mt-4 text-center text-white">{conversion.title}</h3>
      </div>
    </div>
  );
};

export default Card;
