import React from 'react';
import { ToastContainer } from 'react-toastify';
import './App.css';
import Routes from './routes';
import GlobalStyle from './styles/global';
import 'react-virtualized/styles.css';

function App() {
  return (
    <React.Fragment>
      <GlobalStyle />
      <ToastContainer style={{borderRadius: '20px'}}/>
      <Routes />
    </React.Fragment>
  );
}

export default App;
