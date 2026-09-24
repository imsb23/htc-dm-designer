import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Activity, BookOpen, X, PenTool, Calculator, Network, BookOpen as BookIcon, Database } from 'lucide-react';
import { SearchResult } from '../types';

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
  onOpenGuide?: () => void;
  onSearch?: (query: string) => void;
  searchResults?: SearchResult[];
  onSelectResult?: (result: SearchResult) => void;
}

const getIconForType = (type: string) => {
    switch(type) {
        case 'request': return PenTool;
        case 'estimator': return Calculator;
        case 'architecture': return Network;
        case 'describer': return BookIcon;
        case 'dictionary': return Database;
        default: return PenTool;
    }
};

const Header: React.FC<HeaderProps> = ({ title, toggleSidebar, onOpenGuide, onSearch, searchResults = [], onSelectResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onSearch) {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [searchTerm, onSearch]);

  useEffect(() => {
      setShowResults(searchTerm.length > 0 && searchResults.length > 0);
  }, [searchResults, searchTerm]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowResults(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
      if (onSelectResult) {
          onSelectResult(result);
          setShowResults(false);
          setSearchTerm('');
      }
  };

  const clearSearch = () => {
      setSearchTerm('');
      setShowResults(false);
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 z-20 relative shrink-0">
      <div className="flex items-center gap-4 w-full justify-between">
          <div className="flex items-center gap-4">
            <button 
                onClick={toggleSidebar} 
                className="lg:hidden text-slate-500 hover:text-indigo-600 transition-colors"
            >
                <Menu size={20} />
            </button>
            <h1 className="text-sm font-bold text-slate-800 truncate tracking-tight uppercase">{title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block group" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={14} />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="pl-9 pr-10 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white w-48 focus:w-64 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowResults(searchTerm.length > 0 && searchResults.length > 0)}
                />
                {searchTerm && (
                    <button 
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <X size={12} />
                    </button>
                )}

                {showResults && (
                    <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden max-h-[400px] overflow-y-auto z-50">
                        <div className="p-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {searchResults.length} Results
                        </div>
                        {searchResults.map((result) => {
                            const Icon = getIconForType(result.type);
                            return (
                                <button 
                                    key={result.id} 
                                    onClick={() => handleResultClick(result)}
                                    className="w-full text-left p-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group flex items-start gap-3"
                                >
                                    <div className="p-2 bg-slate-100 text-slate-500 rounded group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors shrink-0">
                                        <Icon size={14} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-slate-800 text-xs truncate">{result.title}</div>
                                        <div className="text-[10px] text-slate-400">
                                            {result.subtitle}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {onOpenGuide && (
                <button onClick={onOpenGuide} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  < BookOpen size={14} /> <span className="hidden sm:inline">Guide</span>
                </button>
            )}
            <button className="p-2 text-slate-400 hover:text-indigo-600 relative">
                <Activity size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
          </div>
      </div>
    </header>
  );
};

export default Header;