import { createBrowserRouter } from 'react-router';
import Root from './Root';
import Auth from './pages/Auth';
import Home from './pages/Home';
import RecipeDetail from './pages/RecipeDetail';
import CookingMode from './pages/CookingMode';
import Calendar from './pages/Calendar';
import Grocery from './pages/Grocery';
import AddRecipe from './pages/AddRecipe';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/auth',
    Component: Auth,
  },
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'recipe/:id', Component: RecipeDetail },
      { path: 'recipe/:id/cook', Component: CookingMode },
      { path: 'calendar', Component: Calendar },
      { path: 'grocery', Component: Grocery },
      { path: 'add', Component: AddRecipe },
      { path: 'profile', Component: Profile },
      { path: '*', Component: NotFound },
    ],
  },
]);