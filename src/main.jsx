import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import './styles/tokens.css'
import './styles/global.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider value={defaultSystem}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)