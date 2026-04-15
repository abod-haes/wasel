import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { appRoutes } from '@/app/router/routes';

const router = createBrowserRouter(appRoutes);

export function AppRouter(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
