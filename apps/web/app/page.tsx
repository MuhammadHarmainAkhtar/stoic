import React from 'react'
import VintageButtons from './components/vintage-button'

const page = () => {
  return (
    <>
      <main className='w-full h-full'>
        <h1 style={{ fontFamily: 'MorrisRoman' }} className='text-8xl text-[#5C3810] font-bold font-[bruneyFont] text-center mt-20'>Welcome to the Page</h1>
        <h2 className=' text-8xl text-[#5C3810] font-bold text-center mt-20'>Welcome to the Bruney</h2>
      <VintageButtons className='mt-10 font-MorrisRoman' name="GET STARTED"/>
      <VintageButtons className='mt-10' name="LEARN MORE"/>
      </main>
    </>
  )
}

export default page
