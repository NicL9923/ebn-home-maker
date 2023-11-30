import { RootRoute, Route, Router, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import App from './App';
import FamilyBoard from './pages/FamilyBoard';
import Finances from './pages/Finances';
import GroceryList from './pages/GroceryList';
import Home from './pages/Home';
import Login from './pages/Login';
import ProfilePage from './pages/Profile';
import SignUp from './pages/Signup';
import JoinFamily from './pages/joinFamily/[familyId]';
import Maintenance from './pages/maintenance/Maintenance';
import ResidenceView from './pages/maintenance/ResidenceView';
import VehicleView from './pages/maintenance/VehicleView';

const rootRoute = new RootRoute({
  component: App,
});

const rootIndexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const signupRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUp,
});

const profileRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const financesRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/finances',
  component: Finances,
});

const familyBoardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/familyboard',
  component: FamilyBoard,
});

const maintenanceRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/maintenance',
  component: Maintenance,
});

const vehicleRoute = new Route({
  getParentRoute: () => maintenanceRoute,
  path: '$vehicleId',
  component: VehicleView,
});

const residenceRoute = new Route({
  getParentRoute: () => maintenanceRoute,
  path: '$residenceId',
  component: ResidenceView,
});

const groceryListRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/grocerylist',
  component: GroceryList,
});

// TODO: Confirm if this works, or if we need to follow the same pattern as /maintenance above
const joinFamilyRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/joinFamily/$familyId',
  component: JoinFamily,
});

const catchAllRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => <div>404 Not Found</div>,
});

const routeTree = rootRoute.addChildren([rootIndexRoute, loginRoute, signupRoute, profileRoute, financesRoute, familyBoardRoute, maintenanceRoute, vehicleRoute, residenceRoute, groceryListRoute, joinFamilyRoute, catchAllRoute]);
const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(<RouterProvider router={router} />);
