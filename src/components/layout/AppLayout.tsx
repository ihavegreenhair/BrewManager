import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Zap, Book, Plus, Menu, X, LayoutDashboard, Calculator, Box, History } from 'lucide-react';
import styles from './AppLayout.module.css';

const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/recipes', label: 'My Recipes', icon: Book },
    { to: '/recipes/new', label: 'New Recipe', icon: Plus },
    { to: '/sessions', label: 'Brew Sessions', icon: History },
    { to: '/calculators', label: 'Calculators', icon: Calculator },
    { to: '/inventory', label: 'Inventory', icon: Box },
  ];

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brand}>
            <Zap size={24} />
            <span>Brewprint</span>
          </div>
          <button className={styles.mobileClose} onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
          {navItems.map((item) => (
            <NavLink 
              key={item.to}
              to={item.to} 
              end={item.end}
              onClick={closeMobileMenu}
              className={({ isActive }) => 
                `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
              }
            >
              <item.icon size={20} /> {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu} />
      )}

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
