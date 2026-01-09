import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transacoes from './pages/Transacoes';
import Cartoes from './pages/Cartoes';
import Categorias from './pages/Categorias';
import Tags from './pages/Tags';
import Recorrencias from './pages/Recorrencias';
import Profile from './pages/Profile';
import Config from './pages/Config';
import CategorizadorAutomatico from './pages/CategorizadorAutomatico';
import Metas from './pages/Metas';
import Lembretes from './pages/Lembretes';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { authService } from './services/authService';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/transacoes"
          element={
            <PrivateRoute>
              <Layout>
                <Transacoes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/cartoes"
          element={
            <PrivateRoute>
              <Layout>
                <Cartoes />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <PrivateRoute>
              <Layout>
                <Categorias />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/tags"
          element={
            <PrivateRoute>
              <Layout>
                <Tags />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/recorrencias"
          element={
            <PrivateRoute>
              <Layout>
                <Recorrencias />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/config"
          element={
            <PrivateRoute>
              <Layout>
                <Config />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorizador"
          element={
            <PrivateRoute>
              <Layout>
                <CategorizadorAutomatico />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/metas"
          element={
            <PrivateRoute>
              <Layout>
                <Metas />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/lembretes"
          element={
            <PrivateRoute>
              <Layout>
                <Lembretes />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Default Route - Redireciona baseado em autenticação */}
        <Route
          path="/"
          element={
            authService.isAuthenticated()
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

