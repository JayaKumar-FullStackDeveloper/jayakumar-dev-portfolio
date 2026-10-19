import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

// The admin area is loaded only when /admin is opened, so visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
 <BrowserRouter>
 <Routes>
 <Route
 path="/admin/*"
 element={
 <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
 <AdminApp />
 </Suspense>
 }
 />
 <Route path="*" element={<App />} />
 </Routes>
 </BrowserRouter>
);
