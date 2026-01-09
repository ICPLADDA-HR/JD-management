import { Link } from 'react-router-dom';

export const RouteTest = () => {
  const routes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/job-descriptions', name: 'Job Descriptions List' },
    { path: '/jd/create', name: 'Create JD' },
    { path: '/users', name: 'Users' },
    { path: '/activity-log', name: 'Activity Log' },
    { path: '/settings', name: 'Settings' },
    { path: '/profile', name: 'Profile' },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Route Test</h2>
      <div className="grid grid-cols-2 gap-2">
        {routes.map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded border"
          >
            {route.name}
          </Link>
        ))}
      </div>
    </div>
  );
};