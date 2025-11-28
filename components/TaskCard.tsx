import React from 'react';
import { Calendar, User, AlertCircle, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggleComplete, onDelete }) => {
  const isExpired = new Date(task.deadline) < new Date() && !task.completed;

  const priorityColor = {
    [Priority.High]: 'text-rose-600 bg-rose-50 border-rose-200',
    [Priority.Medium]: 'text-amber-600 bg-amber-50 border-amber-200',
    [Priority.Low]: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };

  return (
    <div className={`group relative bg-white rounded-xl border transition-all duration-300 hover:shadow-lg ${task.completed ? 'border-slate-100 opacity-75' : 'border-slate-200 shadow-sm'}`}>
      
      {/* Image Preview Banner */}
      {task.imageUrl && (
        <div className="h-32 w-full overflow-hidden rounded-t-xl bg-slate-100 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
          <img src={task.imageUrl} alt="Task attachment" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <span className="absolute bottom-2 left-3 z-20 text-white text-xs font-medium px-2 py-1 bg-black/30 backdrop-blur-sm rounded-full">
            Attachment
          </span>
        </div>
      )}

      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start gap-3">
          <div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColor[task.priority]}`}>
              {task.priority}
            </span>
            <h3 className={`mt-2 text-lg font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {task.title}
            </h3>
          </div>
          <button
            onClick={() => onToggleComplete(task.id)}
            className={`flex-shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-500'}`}
          >
            {task.completed ? <CheckCircle2 size={24} className="fill-emerald-50" /> : <Circle size={24} />}
          </button>
        </div>

        <p className={`text-sm ${task.completed ? 'text-slate-400' : 'text-slate-600'} line-clamp-2`}>
          {task.description}
        </p>

        <div className="pt-4 border-t border-slate-50 flex flex-wrap gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1.5">
            <User size={14} className="text-slate-400" />
            <span>{task.teacher}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isExpired ? 'text-rose-600 font-medium' : ''}`}>
            {isExpired ? <AlertCircle size={14} /> : <Calendar size={14} className="text-slate-400" />}
            <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
