import React from 'react'
import Home from './Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ImportWallet from './ImportWallet';
import Landing from './Landing';

const App = () => {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
      </Routes>
      <Routes>
        <Route path="/createwallet" element={<Home />} />
      </Routes>
      <Routes>
        <Route path="/importwallet" element={<ImportWallet />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App