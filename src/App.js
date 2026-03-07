import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './hooks/useAuthContext';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import LoadScreen from './components/LoadScreen';
import './App.css';

// Ленивая загрузка страниц
const Home = lazy(() => import('./pages/Home'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  return (
    <Router>
      <AuthProvider> {/* AuthProvider на самом верхнем уровне */}
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="news/:id" element={<NewsDetail />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;