'use client';

import { Search, Map, List, ArrowDownWideNarrow } from 'lucide-react';

export type SortType = 'default' | 'co2';
export type ViewMode = 'map' | 'list';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  viewMode, 
  onViewModeChange 
}: SearchBarProps) {
  
  const toggleSort = () => {
    if (sortBy === 'default') onSortChange('co2');
    else onSortChange('default');
  };

  const getSortLabel = () => {
    if (sortBy === 'co2') return 'CO2吸収量順';
    return '登録順';
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto pointer-events-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="樹種名で検索..."
          className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-md border border-white/50 shadow-lg rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-gray-800"
        />
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center px-1">
        
        {/* Sort Button */}
        <button 
          onClick={toggleSort}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-gray-600 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <ArrowDownWideNarrow size={14} className={sortBy !== 'default' ? 'text-green-600' : ''} />
          {getSortLabel()}
        </button>

        {/* View Toggle */}
        <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-full shadow-sm border border-gray-100">
          <button 
            onClick={() => onViewModeChange('map')}
            className={`flex items-center justify-center p-1.5 rounded-full transition-colors ${viewMode === 'map' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <Map size={16} />
          </button>
          <button 
            onClick={() => onViewModeChange('list')}
            className={`flex items-center justify-center p-1.5 rounded-full transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
