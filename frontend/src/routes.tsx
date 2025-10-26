import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import DashboardPage from './pages/DashboardPage';
import TrackPage from './pages/TrackPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'track',
        element: <TrackPage />
      }
    ]
  }
]);
