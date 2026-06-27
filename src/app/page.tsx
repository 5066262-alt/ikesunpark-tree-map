'use client';

import { useState, useMemo } from 'react';
import { useTrees } from '../hooks/useTrees';
import TreeMap from '../components/Map/TreeMap';
import TreeCard from '../components/TreeDetails/TreeCard';
import TreeForm from '../components/TreeDetails/TreeForm';
import SearchBar, { SortType, ViewMode } from '../components/Controls/SearchBar';
import TreeListView from '../components/TreeList/TreeListView';
import { TreeData } from '../types';
import { MAP_AREAS } from '../data/mapAreas';
import { Plus, Trees, MapPin, Search, X } from 'lucide-react';

export default function Home() {
  const { trees, isLoaded, saveTree, deleteTree } = useTrees();
  
  // エリア管理
  const [currentAreaId, setCurrentAreaId] = useState<string>('MAP');
  const currentArea = MAP_AREAS[currentAreaId];

  // 選択・追加・編集状態
  const [selectedTree, setSelectedTree] = useState<TreeData | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [formLocation, setFormLocation] = useState<{x: number, y: number} | null>(null);
  const [editingTree, setEditingTree] = useState<TreeData | null>(null);
  const [isHistoryMode, setIsHistoryMode] = useState(false);

  // 検索・フィルタ・表示モードの状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  // 検索バーの開閉状態（地図を広く見せるための追加機能）
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // フィルタリング＆ソート処理
  const filteredTrees = useMemo(() => {
    let result = [...trees];
    
    // 1. 検索フィルタ
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(tree => 
        tree.species.toLowerCase().includes(query) || 
        (tree.notes && tree.notes.toLowerCase().includes(query))
      );
    }
    
    // 2. ソート
    if (sortBy === 'co2') {
      result.sort((a, b) => {
        const valA = a.co2EquivalentNow !== undefined ? a.co2EquivalentNow : a.co2Sequestration;
        const valB = b.co2EquivalentNow !== undefined ? b.co2EquivalentNow : b.co2Sequestration;
        return valB - valA;
      });
    }
    
    return result;
  }, [trees, searchQuery, sortBy]);

  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Trees size={48} className="text-green-500" />
          <p className="text-gray-500 font-medium">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  // プラスボタン押下時
  const handleAddClick = () => {
    setIsAddMode(true);
    setSelectedTree(null);
    setEditingTree(null);
    setIsHistoryMode(false);
    setFormLocation(null);
    setViewMode('map');
  };

  // マップクリック時
  const handleMapClick = (x: number, y: number) => {
    if (isAddMode && !editingTree) {
      setFormLocation({ x, y });
    }
  };

  // フォームで保存した時
  const handleSaveTree = (data: TreeData) => {
    if (isHistoryMode && editingTree) {
  const historyEntry = {
        id: `hist-${Date.now()}`,
        date: editingTree.lastSurveyDate,
        photoUrl: editingTree.photoUrl,
        height: editingTree.height,
        girth: editingTree.girth,
        co2Sequestration: editingTree.co2Sequestration,
        co2EquivalentNow: editingTree.co2EquivalentNow,
        avoidedMiles: editingTree.avoidedMiles,
        condition: editingTree.condition || 'Excellent', // 💡 追加
        sunlight: editingTree.sunlight || 'Full',       // 💡 追加
        notes: editingTree.notes,
      };
      
      const newHistory = [...(editingTree.history || []), historyEntry];
      data.history = newHistory;
      data.id = editingTree.id;
      data.createdDate = editingTree.createdDate;
    }

    saveTree(data);
    setIsAddMode(false);
    setFormLocation(null);
    setEditingTree(null);
    setIsHistoryMode(false);
    setSelectedTree(data);
  };

  // フォームをキャンセルした時
  const handleCancelForm = () => {
    setIsAddMode(false);
    setFormLocation(null);
    if (editingTree) {
      setSelectedTree(editingTree);
    }
    setEditingTree(null);
    setIsHistoryMode(false);
  };

  // 編集ボタン押下時
  const handleEditClick = (tree: TreeData) => {
    setEditingTree(tree);
    setIsHistoryMode(false);
    setFormLocation(tree.location);
    setSelectedTree(null);
  };

  // 成長記録を追加ボタン押下時
  const handleAddRecordClick = (tree: TreeData) => {
    setEditingTree(tree);
    setIsHistoryMode(true);
    setFormLocation(tree.location);
    setSelectedTree(null);
  };

  // リストから樹木を選択した時
  const handleListSelectTree = (tree: TreeData) => {
    setCurrentAreaId(tree.area);
    setViewMode('map');
    setSelectedTree(tree);
  };

  // 樹木の削除処理
  const handleDeleteTree = (id: string) => {
    deleteTree(id);
    setSelectedTree(null);
  };

  return (
    // 縦横比崩れ対策：強制h-screenを解除し、背景で満たす形に修正
    <main className="relative w-full min-h-screen bg-gray-100 font-sans flex items-center justify-center overflow-x-hidden">
      
      {/* Header (Floating) */}
      <div className="absolute top-0 left-0 right-0 z-[400] p-4 md:p-6 pointer-events-none flex flex-col gap-4">
        <div className="flex justify-between items-start">
          
          {/* 左上: タイトル */}
          <div className="flex flex-col items-start gap-2">
            <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-white/50 pointer-events-auto flex items-center gap-3">
              <div className="bg-green-100 p-1.5 rounded-xl text-green-700">
                <Trees size={20} />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 leading-tight text-sm">IKE・SUNパーク</h1>
                <p className="text-[10px] text-gray-500 font-medium">樹木マップ</p>
              </div>
            </div>
          </div>
          
          {/* 右上: アクションボタン（検索と追加） */}
          <div className="flex gap-2 pointer-events-auto">
            {/* 検索窓を開閉するトグルボタン */}
            {!isAddMode && (
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`${
                  isSearchOpen ? 'bg-gray-800 shadow-gray-800/30' : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                } text-white shadow-lg w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-[401]`}
              >
                {isSearchOpen ? <X size={20} className="text-white" /> : <Search size={20} className="text-gray-700" />}
              </button>
            )}

            <button 
              onClick={isAddMode ? handleCancelForm : handleAddClick}
              className={`${
                isAddMode 
                  ? 'bg-gray-800 hover:bg-gray-900 shadow-gray-800/30 rotate-45' 
                  : 'bg-green-600 hover:bg-green-700 shadow-green-600/30'
              } text-white shadow-lg w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-[401] shrink-0`}
            >
              <Plus size={24} />
            </button>
          </div>
        </div>

        {/* 検索・フィルタバー（開閉状態に合わせて表示） */}
        {!isAddMode && isSearchOpen && (
          <div className="w-full flex justify-center mt-[-10px] animate-in fade-in slide-in-from-top-2 duration-200">
            <SearchBar 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        )}
      </div>

      {/* 追加モード時の案内バナー */}
      {isAddMode && !formLocation && !editingTree && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-[400] pointer-events-none animate-in fade-in slide-in-from-top-4 duration-300 w-full max-w-sm px-4">
          <div className="bg-gray-800/90 backdrop-blur-sm text-white px-5 py-3 rounded-full shadow-lg flex items-center justify-center gap-2 font-medium text-sm">
            <MapPin size={18} className="animate-bounce shrink-0" />
            地図上の追加したい場所をクリック
          </div>
        </div>
      )}

      {/* View Container */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {viewMode === 'map' ? (
          <TreeMap 
            trees={filteredTrees} 
            currentArea={currentArea}
            onSelectTree={(tree) => !isAddMode && setSelectedTree(tree)} 
            isAddMode={isAddMode && !editingTree}
            onMapClick={handleMapClick}
          />
        ) : (
          <TreeListView 
            trees={filteredTrees}
            onSelectTree={handleListSelectTree}
          />
        )}
      </div>

      {/* フォーム (Bottom Sheet / Modal) */}
      <div className={`absolute bottom-0 left-0 right-0 z-[500] md:bottom-auto md:top-24 md:right-6 md:left-auto md:w-[450px] transition-transform duration-500 ease-out ${
        (formLocation || editingTree) ? 'translate-y-0' : 'translate-y-full md:translate-x-[120%] md:translate-y-0'
      }`}>
        {(formLocation || editingTree) && (
          <TreeForm 
            initialData={editingTree}
            area={editingTree?.area || currentArea.id}
            location={formLocation!}
            isHistoryMode={isHistoryMode}
            onSave={handleSaveTree}
            onCancel={handleCancelForm}
          />
        )}
      </div>

      {/* Tree Detail Card (Bottom Sheet / Modal) */}
      <div className={`absolute bottom-0 left-0 right-0 z-[500] md:bottom-auto md:top-24 md:right-6 md:left-auto md:w-[400px] transition-transform duration-500 ease-out ${
        selectedTree && !formLocation && !editingTree ? 'translate-y-0' : 'translate-y-full md:translate-x-[120%] md:translate-y-0'
      }`}>
        {selectedTree && !formLocation && !editingTree && (
          <TreeCard 
            tree={selectedTree} 
            onClose={() => setSelectedTree(null)} 
            onEdit={() => handleEditClick(selectedTree)}
            onDelete={() => handleDeleteTree(selectedTree.id)}
            onAddRecord={() => handleAddRecordClick(selectedTree)}
          />
        )}
      </div>
    </main>
  );
}