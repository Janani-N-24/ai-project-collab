import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Settings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Settings">
      <div className="glass rounded-2xl p-8 max-w-lg">
        <h3 className="font-semibold text-gray-800 mb-4">Account</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium text-gray-800">Name:</span> {user?.name}
          </p>
          <p>
            <span className="font-medium text-gray-800">Email:</span> {user?.email}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
