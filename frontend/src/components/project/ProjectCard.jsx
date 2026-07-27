import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const createdDate = new Date(project.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link
      to={`/projects/${project._id}`}
      className="glass rounded-2xl p-5 flex flex-col justify-between hover:shadow-glass hover:-translate-y-0.5 transition-all"
    >
      <div>
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{project.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description provided.'}
        </p>
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar size={13} />
          {createdDate}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
          Open <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
};

export default ProjectCard;
