import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-gradient text-white px-4 text-center">
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <p className="text-lg mb-6">Page not found</p>
      <Link to="/dashboard" className="px-5 py-2.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
