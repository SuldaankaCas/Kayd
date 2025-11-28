import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { TaskCard } from './components/TaskCard';
import { TaskForm } from './components/TaskForm';
import { Task, Priority } from './types';

// Initial dummy data to populate if empty
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Physics Lab Report',
    teacher: 'Mr. Heisenberg',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString(),
    description: 'Complete the write-up for the projectile motion experiment. Include all graphs.',
    priority: Priority.High,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: '2',
    title: 'History Essay Draft',
    teacher: 'Ms. Antony',
    deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    description: 'First draft about the Industrial Revolution impact on urbanization.',
    priority: Priority.Medium,
    completed: true,
    createdAt: Date.now() - 100000,
  }
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('classSync_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('classSync_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const task: Task = {
      ...newTask,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      completed: false,
    };
    setTasks(prev => [task, ...prev]);
    setIsModalOpen(false);
  };

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    if(confirm('Are you sure you want to delete this task?')) {
        setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const filteredTasks = tasks
    .filter(t => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .filter(t => 
      t.title.toLowerCase().includes(search.toLowerCase()) || 
      t.teacher.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
       // Sort by completed status first (active first), then deadline
       if (a.completed === b.completed) {
         return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
       }
       return a.completed ? 1 : -1;
    });

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Assignments</h2>
            <p className="text-slate-500 mt-1">Keep track of your group's upcoming deadlines.</p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-200 transition-all active:scale-95 md:order-last"
          >
            <Plus size={20} />
            <span>New Task</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
           <div className="relative flex-1">
             <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search tasks, teachers..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
             />
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
             {(['all', 'active', 'completed'] as const).map((f) => (
               <button
                 key={f}
                 onClick={() => setFilter(f)}
                 className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                   filter === f 
                     ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                     : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                 }`}
               >
                 {f}
               </button>
             ))}
           </div>
        </div>

        {/* Task Grid */}
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onToggleComplete={toggleComplete} 
                onDelete={deleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No tasks found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">
              {search ? "Try adjusting your search terms." : "You're all caught up! Click 'New Task' to add more assignments."}
            </p>
          </div>
        )}
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl z-10 animate-in fade-in zoom-in duration-200">
            <TaskForm 
              onSubmit={addTask} 
              onCancel={() => setIsModalOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
