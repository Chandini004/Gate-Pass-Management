import React, { useState, useEffect } from 'react';
import './styles/Home.css';
const Home = () => {
  // Image array with source links
  const images = [
    "https://gmrit.edu.in/images/facilities/Facilities-2-BHostel1.jpg",
    "https://gmrit.edu.in/images/facilities/Facilities-2-BHostel2.jpg",
    "https://gmrit.edu.in/images/facilities/Facilities-2-BHostel3.jpg",
    "https://gmrit.edu.in/images/facilities/Facilities-2-GHostel1.jpg",
    "https://gmrit.edu.in/images/facilities/Facilities-2-GHostel2.jpg"
  ];
  const initialColors = ['#0000FF', '#FF0000', '#FFFF00']; // Blue, Red, Yellow
  const [colors, setColors] = useState(initialColors);
  // State to track the current slide
  const [currentSlide, setCurrentSlide] = useState(0);

  // Function to go to the next slide
  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
  };

  // Auto-scroll every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 2000);
    return () => clearInterval(interval);
  }, []);



  useEffect(() => {
    const colorInterval = setInterval(() => {
      setColors((prevColors) => {
        // Cycle the colors
        return [
          prevColors[2], // Move R to G
          prevColors[0], // Move G to M
          prevColors[1], // Move M to R
        ];
      });
    }, 1000);
    return () => clearInterval(colorInterval);
  }, []);


  const prevSlide = () => {
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? images.length - 1 : prevSlide - 1
    );
  };

  const goToSlide = (slideIndex) => {
    setCurrentSlide(slideIndex);
  };

  return (
    <div className=" h-screen w-full overflow-hidden fixed">
      {/* Carousel Container */}
      <div className="relative h-full w-full">
        <div
          className="flex transition-transform duration-700"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((src, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <img
                src={src}
                alt={`Slide ${index + 1}`}
                className="images"
              />
              
            </div>
            
          ))}
        </div>

        {/* Welcome Box */}
        <div className=" welcome absolute inset-0 flex items-center  justify-center z-20">
          <div className="bg-opacity-60 p-4 rounded text-center">
            <h1 className="text-white text-3xl font-bold" style={{fontSize:"35px" , marginBottom:"10px"}}>Welcome to <span style={{ color: colors[0],opacity:0.8 }}>G</span><span style={{ color: colors[1],opacity:0.8 }}>M</span><span style={{ color: colors[2],opacity:0.8 }}>R</span> Institute of Technology</h1>
            <h2 className="text-white text-3xl font-bold" >GatePass Generation</h2>
          </div>

        </div>

        {/* Slider controls */}
        <button
          type="button"
          className="buttons absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          onClick={prevSlide}
          data-carousel-prev
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
            <span className="sr-only">Previous</span>
          </span>
        </button>
        <button
          type="button"
          className="buttons absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer group focus:outline-none"
          onClick={nextSlide}
          data-carousel-next
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
            <svg
              className="w-4 h-4 text-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 9l4-4-4-4"
              />
            </svg>
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div>
      {/* Footer with Marquee */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
          fontSize: '18px',
          zIndex: 50,
        }}
      >
        <marquee behavior="scroll" direction="left">
          Designed and Developed by Dr.K.Lakshman Rao ,Associate Professor , GMRIT.
        </marquee>
      </footer>
    </div>
  );
};

export default Home;
