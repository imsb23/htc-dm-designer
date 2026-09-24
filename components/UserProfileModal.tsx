
import React, { useState } from 'react';
import { User, Settings, Save, X, Layers, Cloud, Server } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const PRODUCTS = ["Informatica", "Talend", "Azure Data Factory", "Matillion", "AWS Glue", "Profisee", "BigID", "Ataccama", "Databricks", "HTC Enterprise Data Management"];

const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative border border-slate-200">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
        
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">User Profile</h2>
              <p className="text-sm text-slate-500">Customize your AI Architect experience</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-4">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 border-2 border-slate-200 flex-shrink-0">
                <User size={40} />
             </div>
             <div className="flex-1 space-y-3">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                   <input 
                     type="text" 
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role / Title</label>
                   <input 
                     type="text" 
                     value={formData.role}
                     onChange={(e) => setFormData({...formData, role: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                </div>
             </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
             <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers size={16} className="text-purple-500"/> Architect Preferences</h4>
             <p className="text-xs text-slate-500 mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                These settings will bias the AI to prioritize your preferred tech stack and deployment models when generating designs.
             </p>

             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Data Product</label>
                   <select 
                      value={formData.preferences.defaultProduct}
                      onChange={(e) => setFormData({...formData, preferences: {...formData.preferences, defaultProduct: e.target.value}})}
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                   >
                      <option value="">No Preference</option>
                      {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Default Deployment Model</label>
                   <div className="grid grid-cols-3 gap-3">
                      {['Cloud', 'On-Premise', 'Hybrid'].map(mode => (
                         <button
                           key={mode}
                           type="button"
                           onClick={() => setFormData({...formData, preferences: {...formData.preferences, defaultDeployment: mode as any}})}
                           className={`py-2 px-3 rounded-lg text-sm font-medium border flex items-center justify-center gap-2 transition-all ${formData.preferences.defaultDeployment === mode ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                         >
                            {mode === 'Cloud' ? <Cloud size={14} /> : <Server size={14} />} {mode}
                         </button>
                      ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
             <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition-all">
                <Save size={16} /> Save Profile
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfileModal;
