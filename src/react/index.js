import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';

const rootElement = document.getElementById('root');
const root = ReactDOM.createPortal(rootElement);

root.render(
    <React.StrictMode>
    <app/>
    </React.StrictMode>
);