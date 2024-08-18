import React from 'react'

const Navbar = () => {
  return (
    <>
    <div className="max-w-screen-full mx px-6 py-3 md:px-40 shadow-lg h-16 flex items-center justify-between">
      <h1 className="text-2xl cursor-pointer font-bold">File<span className="text-4xl text-green-500">Format</span>Converter</h1>
      <h1 className="text-2xl cursor-pointer font-bold hover:scale-125 duration-300">Home</h1>
    </div>
    </>
  )
}

export default Navbar