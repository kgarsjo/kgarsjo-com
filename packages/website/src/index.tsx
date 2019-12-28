import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

const rootElement = document.getElementById('root');
const render = rootElement?.hasChildNodes() ? ReactDOM.hydrate : ReactDOM.render;
render(<App />, rootElement);