const MemberList = ({ members = [] }) => {
  if (members.length === 0) {
    return <p className="text-sm text-gray-500">No members yet.</p>;
  }

  return (
    <ul className="divide-y divide-gray-100">
      {members.map(({ user, role }) => (
        <li key={user._id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-semibold">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              role === 'owner' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {role}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default MemberList;
