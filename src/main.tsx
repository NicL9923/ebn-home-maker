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
import JoinFamily from './pages/JoinFamily';
import Maintenance from './pages/maintenance/Maintenance';
import ResidenceView from './pages/maintenance/ResidenceView';
import VehicleView from './pages/maintenance/VehicleView';
import Activities from './pages/Activities';
import Checkout from './pages/activities/Checkout';

const rootRoute = new RootRoute({
    component: App,
});

export const rootIndexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
});

export const loginRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: Login,
});

export const signupRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/signup',
    component: SignUp,
});

export const profileRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/profile',
    component: ProfilePage,
});

export const financesRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/finances',
    component: Finances,
});

export const familyBoardRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/familyboard',
    component: FamilyBoard,
});

export const maintenanceRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/maintenance',
    component: Maintenance,
});

export const vehicleRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/maintenance/vehicles/$vehicleId',
    component: VehicleView,
});

export const residenceRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/maintenance/residences/$residenceId',
    component: ResidenceView,
});

export const groceryListRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/grocerylist',
    component: GroceryList,
});

export const activitiesRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/activities',
    component: Activities,
});

export const checkoutRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/activities/checkout',
    component: Checkout,
});

export const joinFamilyRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '/joinfamily/$familyId',
    component: JoinFamily,
});

const catchAllRoute = new Route({
    getParentRoute: () => rootRoute,
    path: '*',
    component: () => <div>404 Not Found</div>,
});

const routeTree = rootRoute.addChildren([
    rootIndexRoute,
    loginRoute,
    signupRoute,
    profileRoute,
    financesRoute,
    familyBoardRoute,
    maintenanceRoute,
    vehicleRoute,
    residenceRoute,
    groceryListRoute,
    activitiesRoute,
    checkoutRoute,
    joinFamilyRoute,
    catchAllRoute,
]);
const router = new Router({ routeTree });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);

root.render(<RouterProvider router={router} />);
