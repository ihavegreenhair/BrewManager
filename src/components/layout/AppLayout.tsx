import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Zap, Book, Plus } from 'lucide-react';
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
            to="/recipes" 
            end
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
            }
          >
            <Book size={20} /> My Recipes
          </NavLink>
          <NavLink 
            to="/recipes/new" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeNavLink : ''}`
            }
          >
            <Plus size={20} /> New Recipe
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
