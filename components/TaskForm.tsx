import React, { useState, useRef } from 'react';
import { Sparkles, Upload, X, Loader2, Camera } from 'lucide-react';
import { Priority, Task, ExtractedTaskData } from '../types';
import { extractTaskFromInput } from '../services/geminiService';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ExtractedTaskData> & { imageUrl?: string }>({
    title: '',
    teacher: '',
    deadline: '',
    description: '',
    priority: Priority.Medium,
    imageUrl: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMagicFill = async () => {
    if (!formData.description && !formData.imageUrl) {
      alert("Please enter some messy notes or upload an image for the AI to analyze!");
      return;
    }

    setLoading(true);
    try {
      const extracted = await extractTaskFromInput(formData.description || "Analyze the image attached", formData.imageUrl);
      
      setFormData(prev => ({
        ...prev,
        ...extracted,
        // Keep the original description if the AI one is too short, or append? 
        // Let's overwrite for now as the AI usually summarizes better.
        // But if the user typed text, we might want to keep it as context. 
        // For this demo, we trust the AI extraction.
      }));
    } catch (error) {
      console.error(error);
      alert("Failed to extract details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!formData.title || !formData.teacher) return;

    onSubmit({
      title: formData.title,
      teacher: formData.teacher,
      deadline: formData.deadline || new Date().toISOString().split('T')[0],
      description: formData.description || '',
      priority: formData.priority as Priority,
      imageUrl: formData.imageUrl,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Add New Assignment</h2>
          <p className="text-sm text-slate-500">Enter details manually or use AI to extract from notes/photos.</p>
        </div>
        <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto p-6 space-y-6">
        {/* AI Section */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
            <Sparkles size={16} />
            <span>AI Auto-Fill</span>
          </div>
          <p className="text-xs text-indigo-600/80">
            Paste rough notes below or upload a photo of the whiteboard, then click "Magic Fill".
          </p>
          
          <div className="flex gap-3">
             <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <Camera size={16} />
              {formData.imageUrl ? 'Change Image' : 'Add Photo'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            
            <button 
              type="button"
              onClick={handleMagicFill}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Analyzing...' : 'Magic Fill'}
            </button>
          </div>
           {formData.imageUrl && (
            <div className="relative w-full h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
               <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
               <button 
                 type="button"
                 onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                 className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
               >
                 <X size={12} />
               </button>
            </div>
          )}
        </div>

        <form id="taskForm" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Subject / Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Calculus Midterm"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Teacher</label>
              <input
                name="teacher"
                value={formData.teacher}
                onChange={handleInputChange}
                placeholder="e.g. Prof. Smith"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
              >
                <option value={Priority.High}>High Priority</option>
                <option value={Priority.Medium}>Medium Priority</option>
                <option value={Priority.Low}>Low Priority</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Description / Details</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter assignment details or paste messy notes here for AI to clean up..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            />
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          form="taskForm"
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all transform active:scale-95"
        >
          Save Assignment
        </button>
      </div>
    </div>
  );
};
