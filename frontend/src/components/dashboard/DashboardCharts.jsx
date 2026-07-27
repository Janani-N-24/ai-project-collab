import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = { 'To Do': '#9ca3af', 'In Progress': '#f59e0b', Done: '#22c55e' };
const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

const DashboardCharts = ({ statusBreakdown, priorityBreakdown }) => {
  const hasData = statusBreakdown.some((s) => s.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tasks by Status</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={statusBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-16">No tasks yet</p>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tasks by Priority</h3>
        {hasData ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityBreakdown} barSize={36}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-16">No tasks yet</p>
        )}
      </div>
    </div>
  );
};

export default DashboardCharts;
