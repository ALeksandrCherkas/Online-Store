import { useState, useEffect } from 'react'
import type { Product } from './types/Product'
import { Route, Routes, Link, BrowserRouter } from 'react-router-dom'
import Catalog from './pages/Catalog'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Basket from './pages/Basket'
import Orders from './pages/Orders'
import { BasketProvider } from './context/BasketContext'
import ProductPage from './pages/ProductPage'


function App() {
  return (
    <AuthProvider>
      <BasketProvider>
        <BrowserRouter>
          <Navbar/>
          <Routes>
            <Route path='/catalog' element={<Catalog/>}/>
            <Route path='/basket' element={<Basket/>}/>
            <Route path='/orders' element={<Orders/>}/>
            <Route path='/product/:id' element={<ProductPage/>}/>
          </Routes>
        </BrowserRouter>
      </BasketProvider>
      
    </AuthProvider>
    
    
  )
}

export default App
