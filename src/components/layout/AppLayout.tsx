import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Zap, Book, Calculator, LayoutDashboard, History, Package } from 'lucide-react';
import styles from './AppLayout.module.css';

const AppLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Zap size={24} />
          <span>Brewprint</span>
        </div>
        
        <nav className={styles.nav}>
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
            }
          >
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink 
            to="/recipes" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
            }
          >
            <Book size={20} /> Recipes
          </NavLink>
          <NavLink 
            to="/sessions" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
            }
          >
            <History size={20} /> Brew Sessions
          </NavLink>
          <NavLink 
            to="/calculators" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
            }
          >
            <Calculator size={20} /> Calculators
          </NavLink>
          <NavLink 
            to="/inventory" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
            }
          >
            <Package size={20} /> Inventory
          </NavLink>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
