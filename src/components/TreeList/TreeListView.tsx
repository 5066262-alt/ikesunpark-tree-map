'use client';

import { TreeData } from '../../types';
import { Leaf, Calendar, Car, Globe } from 'lucide-react';

interface TreeListViewProps {
  trees: TreeData[];
  onSelectTree: (tree: TreeData) => void;
}

export default function TreeListView({ trees, onSelectTree }: TreeListViewProps) {
  if (trees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 pt-20">
        <Leaf size={48} className="text-gray-300 mb-4" />
        <p>該当する樹木が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-50 pt-24 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-4">
        {trees.map((tree, index) => (
          <div 
            key={tree.id}
            onClick={() => onSelectTree(tree)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-row cursor-pointer"
          >
            {/* Thumbnail */}
            <div className="w-24 md:w-32 h-24 md:h-auto shrink-0 relative">
              <img 
                src={tree.photoUrl} 
                alt={tree.species} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-full">
                #{index + 1}
              </div>
            </div>

            {/* Content */}
            <div className="p-3 md:p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{tree.species}</h3>
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-sm shrink-0 border border-gray-200">
                    エリア{tree.area}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-gray-500 text-xs mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    <span>最終調査: {tree.lastSurveyDate}</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Calendar size={11} />
                    <span>追加: {tree.createdDate}</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 mt-3 flex-wrap">
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/50">
                  <Leaf size={14} />
                  <span className="font-semibold text-sm">
                    {tree.co2EquivalentNow !== undefined ? tree.co2EquivalentNow : tree.co2Sequestration} 
                    <span className="text-xs font-normal ml-0.5">kg</span>
                  </span>
                  {tree.co2EquivalentNow !== undefined && (
                    <span className="text-[9px] bg-emerald-200 text-emerald-800 px-1 rounded font-bold ml-1 flex items-center gap-0.5 shrink-0">
                      <Globe size={8} /> MyTree
                    </span>
                  )}
                </div>
                {tree.avoidedMiles !== undefined && (
                  <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100/50">
                    <Car size={14} />
                    <span className="font-semibold text-sm">
                      {(tree.avoidedMiles * 1.60934).toFixed(1)} 
                      <span className="text-xs font-normal ml-0.5">km</span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium ml-1">({tree.avoidedMiles}mi)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
