import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';
import HeaderBar from '../components/HeaderBar';

function MainLayout() {
  return (
    <div className="layout">
      <header className="main-header">
        <Navigation />
      </header>
      <HeaderBar />
      <main className='main--container'>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;