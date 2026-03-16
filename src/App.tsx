import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { Dashboard, Recipes, RecipeBuilder, Sessions, Calculators, Inventory } from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/new" element={<RecipeBuilder />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
