# Job Description Management - Job Description Management System

A modern, full-featured web application for managing job descriptions with role-based access control, built with React, TypeScript, Vite, Tailwind CSS, and Supabase.

## Features

### Core Functionality
- ✅ **Job Description Management**: Create, edit, view, and manage job descriptions
- ✅ **Role-Based Access Control**: Admin, Manager, and Viewer roles with different permissions
- ✅ **Master Data Management**: Manage departments, teams, locations, and competencies
- ✅ **Competency Scoring**: Color-coded slider-based competency assessment (1-5 scale)
- ✅ **Risk Management**: Track external and internal risks with severity levels
- ✅ **Version Control**: Track JD versions and compare changes
- ✅ **Activity Logging**: Complete audit trail of user management actions
- ✅ **Export/Import**: PDF export and Excel/CSV import functionality

### User Interface
- 🎨 Modern, eye-catching design with yellow-green color scheme
- 📱 Fully responsive layout
- 🎯 Intuitive navigation with sidebar
- 🔔 Toast notifications for user feedback
- ✅ Confirmation dialogs for destructive actions
- 📊 Radar charts for competency visualization

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **PDF Export**: jsPDF
- **Notifications**: React Hot Toast

## Project Structure

\`\`\`
jd-management/
├── src/
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components (sidebar, navbar)
│   │   ├── jd/            # JD-specific components
│   │   ├── settings/      # Settings page components
│   │   └── users/         # User management components
│   ├── contexts/          # React contexts (Auth)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Third-party library configurations
│   ├── pages/             # Page components
│   │   ├── auth/          # Login, forgot password, reset password
│   │   ├── dashboard/     # Dashboard
│   │   ├── jd/            # JD pages (browse, create, edit, view)
│   │   ├── settings/      # Settings pages
│   │   └── users/         # User management pages
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── database-schema.sql    # Supabase database schema
└── package.json
\`\`\`

## Setup Instructions

### 1. Install Dependencies

\`\`\`bash
cd jd-management
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the \`database-schema.sql\` file
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a \`.env\` file in the root directory:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at \`http://localhost:5173\`

### 5. Create Initial Admin User

After running the database schema, you'll need to create your first admin user through Supabase:

1. Go to Supabase Dashboard > Authentication > Users
2. Add a new user with email and password
3. Copy the user's UUID
4. In the SQL Editor, run:

\`\`\`sql
INSERT INTO users (id, email, full_name, role)
VALUES ('user-uuid-here', 'admin@example.com', 'Admin Name', 'admin');
\`\`\`

## Implementation Status

### ✅ Completed
- Project setup with React, TypeScript, Vite
- Tailwind CSS configuration with custom theme
- Supabase configuration
- Complete database schema with RLS policies
- Authentication system with AuthContext
- Protected routes
- Main layout with responsive sidebar
- Login, Forgot Password, Reset Password pages
- Placeholder pages for all routes

### 🚧 To Be Implemented

The following components need to be built:

1. **JD Management**
   - Create/Edit JD form with all sections
   - Core Competencies slider with color coding
   - Browse JD with filtering and search
   - JD Detail view with radar chart
   - PDF export functionality

2. **Settings / Master Data**
   - CRUD for Departments, Teams, Locations, Competencies
   - Drag & drop reordering
   - Delete confirmations

3. **User Management (Admin)**
   - User list with CRUD operations
   - Role assignment
   - Team assignment
   - Password management
   - Activity log viewer

4. **Profile & Settings**
   - User profile page
   - Password change functionality

5. **Advanced Features**
   - Version control and comparison
   - Import/Export (Excel/CSV)
   - Dashboard analytics

## Database Schema

See [database-schema.sql](./database-schema.sql) for the complete schema. Key tables:

- \`users\` - User accounts with roles
- \`departments\` - Department master data
- \`teams\` - Teams within departments
- \`locations\` - Office locations
- \`competencies\` - Core competencies
- \`job_descriptions\` - JD main table
- \`jd_responsibilities\` - JD responsibilities by category
- \`jd_risks\` - External and internal risks
- \`jd_competencies\` - Competency scores for each JD
- \`activity_logs\` - Audit trail for user actions

## User Roles

- **Admin**: Full access to all features including user management and settings
- **Manager**: Can manage JDs for their assigned team
- **Viewer**: Read-only access to published JDs

## Color Scheme

- **Primary Green**: #22c55e (buttons, active states, success)
- **Background**: #fffbeb (soft light yellow)
- **Competency Score Colors**:
  - 1-2: Red (#ef4444)
  - 3: Yellow/Orange (#facc15)
  - 4-5: Green (#22c55e)

## Build for Production

\`\`\`bash
npm run build
\`\`\`

## Contributing

When implementing new features:
1. Follow the existing code structure
2. Use TypeScript for type safety
3. Maintain the established design system
4. Test thoroughly before committing
5. Update documentation as needed

## License

Proprietary - Internal Use Only
