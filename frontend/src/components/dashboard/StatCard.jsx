const colorMap = {
  indigo: 'from-indigo-500 to-indigo-600',
  green: 'from-green-500 to-green-600',
  amber: 'from-amber-500 to-amber-600',
  gray: 'from-gray-400 to-gray-500',
};

const StatCard = ({ icon: Icon, label, value, color = 'indigo' }) => {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center text-white shrink-0`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
