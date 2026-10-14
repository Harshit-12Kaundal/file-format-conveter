import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

// 🔥 Redux imports
import { Provider } from 'react-redux';
import { store } from './app/store';

axios.defaults.withCredentials = true;  

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>      {/*  Redux wrapper */}
      <App />
    </Provider>
  </React.StrictMode>
);

// Performance monitoring
reportWebVitals();
