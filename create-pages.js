import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pages = [
  {
    path: 'src/pages/dashboard/DashboardPage.tsx',
    content: `export const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total JDs</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Published</h3>
          <p className="text-3xl font-bold text-primary-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Drafts</h3>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Archived</h3>
          <p className="text-3xl font-bold text-gray-400">0</p>
        </div>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/jd/BrowseJDPage.tsx',
    content: `import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export const BrowseJDPage = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Job Descriptions</h1>
        <Link
          to="/jd/create"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create JD
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">No job descriptions found.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/jd/CreateJDPage.tsx',
    content: `export const CreateJDPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Job Description</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">JD creation form will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/jd/EditJDPage.tsx',
    content: `export const EditJDPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Job Description</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">JD editing form will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/jd/ViewJDPage.tsx',
    content: `export const ViewJDPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Description Details</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">JD details view will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/settings/SettingsPage.tsx',
    content: `import { Link } from 'react-router-dom';
import { Building, Users, MapPin, Award } from 'lucide-react';

export const SettingsPage = () => {
  const settings = [
    { name: 'Departments', icon: Building, href: '/settings/departments' },
    { name: 'Teams', icon: Users, href: '/settings/teams' },
    { name: 'Locations', icon: MapPin, href: '/settings/locations' },
    { name: 'Competencies', icon: Award, href: '/settings/competencies' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting) => (
          <Link
            key={setting.name}
            to={setting.href}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg">
                <setting.icon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{setting.name}</h3>
                <p className="text-sm text-gray-500">Manage {setting.name.toLowerCase()}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/settings/DepartmentsPage.tsx',
    content: `export const DepartmentsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Departments</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Department management will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/settings/TeamsPage.tsx',
    content: `export const TeamsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Teams</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Team management will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/settings/LocationsPage.tsx',
    content: `export const LocationsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Locations</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Location management will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/settings/CompetenciesPage.tsx',
    content: `export const CompetenciesPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Competencies</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Competency management will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/users/UsersPage.tsx',
    content: `export const UsersPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">User Management</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">User management will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/users/ActivityLogPage.tsx',
    content: `export const ActivityLogPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Activity Log</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Activity log will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
  {
    path: 'src/pages/users/ProfilePage.tsx',
    content: `export const ProfilePage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-500">Profile settings will be implemented here.</p>
      </div>
    </div>
  );
};`,
  },
];

pages.forEach((page) => {
  const filePath = path.join(__dirname, page.path);
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(filePath, page.content);
  console.log(`Created: ${page.path}`);
});

console.log('All pages created successfully!');
