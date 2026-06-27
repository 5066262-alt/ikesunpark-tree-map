'use client';

import { X, Leaf, Calendar, Ruler, NotebookText, Edit2, Trash2, Camera, History, Car, Globe, HeartPulse, Sun } from 'lucide-react';
import { TreeData } from '../../types';

interface TreeCardProps {
  tree: TreeData;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddRecord?: () => void;
}

export default function TreeCard({ tree, onClose, onEdit, onDelete, onAddRecord }: TreeCardProps) {
  
  const handleDelete = () => {
    if (window.confirm(`「${tree.species}」のデータを削除してもよろしいですか？`)) {
      onDelete?.();
    }
  };

  // 履歴を最新順にソートして、最新データと結合したタイムライン用の配列を作る
  const timeline = [
    {
      id: 'current',
      date: tree.lastSurveyDate,
      photoUrl: tree.photoUrl,
      height: tree.height,
      girth: tree.girth,
      co2Sequestration: tree.co2Sequestration,
      co2EquivalentNow: tree.co2EquivalentNow,
      avoidedMiles: tree.avoidedMiles,
      condition: tree.condition || 'Excellent', // 💡 追加：現在の状態
      sunlight: tree.sunlight || 'Full',        // 💡 追加：現在の日当たり
      isCurrent: true
    },
    ...(tree.history || []).map(h => ({
      id: h.id,
      date: h.date,
      photoUrl: h.photoUrl,
      height: h.height,
      girth: h.girth,
      co2Sequestration: h.co2Sequestration,
      co2EquivalentNow: h.co2EquivalentNow,
      avoidedMiles: h.avoidedMiles,
      condition: h.condition || 'Excellent', // 💡 追加：過去の状態
      sunlight: h.sunlight || 'Full',        // 💡 追加：過去の日当たり
      isCurrent: false
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  ];

  // 💡 追加：Conditionに合わせた色を決定するヘルパー関数
  const getConditionColor = (cond?: string) => {
    switch (cond) {
      case 'Excellent': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Good': return 'bg-green-100 text-green-800 border-green-200';
      case 'Fair': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Poor': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Dying': return 'bg-red-100 text-red-800 border-red-200';
      case 'Dead': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // 💡 追加：Sunlightに合わせた色を決定するヘルパー関数
  const getSunlightColor = (sun?: string) => {
    switch (sun) {
      case 'Full': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Partial': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'Shade': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-t-3xl md:rounded-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] md:shadow-xl overflow-hidden flex flex-col h-[85vh] md:h-auto max-h-[850px] border border-white/40">
      {/* Photo header */}
      <div className="relative h-48 md:h-56 shrink-0 group">
        <img 
          src={tree.photoUrl} 
          alt={tree.species} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Header Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="bg-white/80 hover:bg-white backdrop-blur-md text-gray-700 p-2 rounded-full transition-colors shadow-sm"
              title="編集"
            >
              <Edit2 size={20} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={handleDelete}
              className="bg-white/80 hover:bg-red-50 hover:text-red-600 backdrop-blur-md text-gray-700 p-2 rounded-full transition-colors shadow-sm"
              title="削除"
            >
              <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="bg-black/20 hover:bg-black/40 backdrop-blur-md text-white p-2 rounded-full transition-colors"
            title="閉じる"
          >
            <X size={20} />
          </button>
        </div>

        <div className="absolute bottom-4 left-5 right-5 text-white flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1.5 drop-shadow-md">{tree.species}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/90 text-xs drop-shadow-sm font-semibold">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>最終調査: {tree.lastSurveyDate}</span>
              </div>
              <div className="flex items-center gap-1 opacity-90">
                <Calendar size={12} className="text-green-300" />
                <span>追加日: {tree.createdDate}</span>
              </div>
            </div>
          </div>
          {onAddRecord && (
            <button 
              onClick={onAddRecord}
              className="bg-green-500 hover:bg-green-400 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
              title="成長記録を追加する"
            >
              <Camera size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Content scroll area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* 💡 追加項目：Tree Condition と Sunlight のバッジ表示 */}
        <div className="flex gap-2">
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${getConditionColor(tree.condition)} shadow-sm flex-1 justify-center`}>
            <HeartPulse size={14} />
            <span>Condition: {tree.condition || 'Excellent'}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${getSunlightColor(tree.sunlight)} shadow-sm flex-1 justify-center`}>
            <Sun size={14} />
            <span>Sunlight: {tree.sunlight || 'Full'}</span>
          </div>
        </div>

        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50/80 rounded-xl p-4 flex flex-col items-center justify-center border border-green-100">
            <Ruler className="text-green-600 mb-1" size={24} />
            <span className="text-xs text-green-800 font-medium">樹高</span>
            <span className="text-xl font-bold text-green-900">{tree.height}<span className="text-sm font-normal ml-1">m</span></span>
          </div>
          <div className="bg-emerald-50/80 rounded-xl p-4 flex flex-col items-center justify-center border border-emerald-100">
            <div className="w-6 h-6 rounded-full border-2 border-emerald-600 mb-1 flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
            </div>
            <span className="text-xs text-emerald-800 font-medium">幹周</span>
            <span className="text-xl font-bold text-emerald-900">{tree.girth}<span className="text-sm font-normal ml-1">cm</span></span>
          </div>
        </div>

        {/* Environmental Value (i-Tree data) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">環境価値 (年間)</h3>
            {(tree.co2EquivalentNow !== undefined || tree.avoidedMiles !== undefined) && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Globe size={10} /> i-Tree MyTree 評価
              </span>
            )}
          </div>
          <div className="space-y-4">
            {/* CO2 Section */}
            {tree.co2EquivalentNow !== undefined ? (
              <div className="bg-emerald-50/50 rounded-xl p-4 shadow-sm border border-emerald-100/50">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Leaf size={18} />
                    <span className="font-semibold text-sm">CO2等量 (Now)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-800">{tree.co2EquivalentNow}</span>
                    <span className="text-emerald-600 text-xs ml-1 font-semibold">kg</span>
                  </div>
                </div>
                <div className="w-full bg-emerald-100/50 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${Math.min((tree.co2EquivalentNow / 50) * 100, 100)}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Leaf size={18} />
                    <span className="font-semibold">CO2吸収量 (簡易評価)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-800">{tree.co2Sequestration}</span>
                    <span className="text-gray-500 text-sm ml-1">kg</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min((tree.co2Sequestration / 50) * 100, 100)}%` }}></div>
                </div>
              </div>
            )}

            {/* Avoided Miles Section */}
            {tree.avoidedMiles !== undefined && (
              <div className="bg-blue-50/40 rounded-xl p-4 shadow-sm border border-blue-100/30 flex items-start gap-3">
                <div className="bg-blue-100/80 p-2 text-blue-600 rounded-xl shrink-0 mt-0.5">
                  <Car size={20} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-blue-800 font-bold">1年後のケアによる効果</span>
                    <span className="text-xs text-gray-400 font-medium">走行削減</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-extrabold text-blue-900">
                      {(tree.avoidedMiles * 1.60934).toFixed(1)}
                      <span className="text-xs font-bold ml-0.5">km</span>
                    </span>
                    <span className="text-xs text-blue-700/70 font-semibold">
                      ({tree.avoidedMiles} miles 相当)
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-800/70 leading-relaxed font-medium">
                    この木を1年間適切に管理・育成することで、ガソリン車が約{(tree.avoidedMiles * 1.60934).toFixed(1)}km走行した際と同等量のCO2排出を回避できます。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 成長記録（タイムライン） */}
        {timeline.length > 1 && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
              <History size={16} /> 成長記録（タイムライン）
            </h3>
            <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar -mx-5 px-5">
              {timeline.map((item) => (
                <div key={item.id} className="shrink-0 w-44 snap-start bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm relative flex flex-col justify-between">
                  {item.isCurrent && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-sm">
                      最新
                    </div>
                  )}
                  <div>
                    <div className="h-28 w-full relative">
                      <img src={item.photoUrl} alt={item.date} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 space-y-1.5">
                      <p className="text-xs text-gray-500 font-bold flex items-center gap-1">
                        <Calendar size={10} /> {item.date}
                      </p>
                      <div className="flex justify-between text-[11px] text-gray-700 font-medium">
                        <span>高: <span className="font-bold">{item.height}</span>m</span>
                        <span>周: <span className="font-bold">{item.girth}</span>cm</span>
                      </div>
                      
                      {/* 💡 追加：タイムライン内の各カードに当時のConditionとSunlightを極小表示 */}
                      <div className="grid grid-cols-2 gap-1 text-[9px] font-bold">
                        <div className={`px-1 py-0.5 rounded border text-center truncate ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </div>
                        <div className={`px-1 py-0.5 rounded border text-center truncate ${getSunlightColor(item.sunlight)}`}>
                          {item.sunlight}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 pt-0">
                    <div className="text-[9px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/60 flex items-center justify-between gap-0.5">
                      <span className="flex items-center gap-0.5 shrink-0"><Leaf size={8} /> CO2:</span>
                      <span className="truncate">
                        {item.co2EquivalentNow !== undefined ? item.co2EquivalentNow : item.co2Sequestration} kg
                        {item.co2EquivalentNow !== undefined && <span className="text-[7px] bg-emerald-200 text-emerald-900 px-0.5 rounded font-bold ml-0.5 scale-90">My</span>}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {tree.notes && (
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <NotebookText size={16} /> メモ
            </h3>
            <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl">
              {tree.notes}
            </p>
          </div>
        )}
        
        {/* Spacing for mobile scroll */}
        <div className="h-6"></div>
      </div>
    </div>
  );
}