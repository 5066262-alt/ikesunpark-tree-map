'use client';

import { useState, useRef } from 'react';
import { X, Upload, Leaf, Ruler, Save, Globe, ExternalLink } from 'lucide-react';
import { TreeData } from '../../types';

interface TreeFormProps {
  initialData?: TreeData | null;
  area: string;
  location: { x: number; y: number };
  isHistoryMode?: boolean;
  onSave: (data: TreeData) => void;
  onCancel: () => void;
}

export default function TreeForm({ initialData, area, location, isHistoryMode, onSave, onCancel }: TreeFormProps) {
  const [species, setSpecies] = useState(initialData?.species || '');
  const [height, setHeight] = useState<string>(initialData?.height?.toString() || '');
  const [girth, setGirth] = useState<string>(initialData?.girth?.toString() || '');
  const [notes, setNotes] = useState(isHistoryMode ? '' : (initialData?.notes || ''));
  const [photoUrl, setPhotoUrl] = useState(isHistoryMode ? '' : (initialData?.photoUrl || ''));
  const [co2EquivalentNow, setCo2EquivalentNow] = useState<string>(initialData?.co2EquivalentNow?.toString() || '');
  const [avoidedMiles, setAvoidedMiles] = useState<string>(initialData?.avoidedMiles?.toString() || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // 画像を縮小する (最大幅/高さを800pxに制限)
          const MAX_SIZE = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // JPEGとして品質0.7で圧縮してBase64化
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setPhotoUrl(compressedBase64);
          } else {
            // Canvasが使えない場合のフォールバック
            setPhotoUrl(reader.result as string);
          }
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 簡易的な環境価値の自動計算（モック）
    const numHeight = parseFloat(height) || 0;
    const numGirth = parseFloat(girth) || 0;
    const co2 = Number((numGirth * 0.15 + numHeight * 0.5).toFixed(1));

    const numCo2Eq = co2EquivalentNow ? parseFloat(co2EquivalentNow) : undefined;
    const numMiles = avoidedMiles ? parseFloat(avoidedMiles) : undefined;
    const todayStr = new Date().toISOString().split('T')[0];

    const newData: TreeData = {
      id: initialData?.id || `tree-${Date.now()}`,
      species: species || '不明な樹種',
      area,
      location,
      height: numHeight,
      girth: numGirth,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=400&h=300', // デフォルト画像
      co2Sequestration: initialData?.co2Sequestration || co2,
      co2EquivalentNow: numCo2Eq,
      avoidedMiles: numMiles,
      createdDate: initialData?.createdDate || todayStr,
      lastSurveyDate: todayStr, // 最新の編集・記録日を最終調査日に設定
      notes,
    };

    onSave(newData);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-t-3xl md:rounded-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] md:shadow-xl overflow-hidden flex flex-col h-[85vh] md:h-auto max-h-[800px] border border-white/40">
      <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
        <h2 className="text-xl font-bold text-gray-800">
          {isHistoryMode ? '成長記録を追加' : (initialData ? '樹木データの編集' : '新しい樹木を登録')}
        </h2>
        <button 
          onClick={onCancel}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <form id="tree-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* 写真アップロード */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">写真</label>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center bg-gray-50 cursor-pointer overflow-hidden relative hover:bg-gray-100 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="text-gray-400 mb-2" size={28} />
                  <span className="text-sm text-gray-500 font-medium">タップして写真をアップロード</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
            />
          </div>

          {/* 樹種名 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
              <Leaf size={16} className="text-green-600" /> 樹種名 <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="例: ソメイヨシノ"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            />
          </div>

          {/* サイズ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <Ruler size={16} className="text-green-600" /> 樹高 (m)
              </label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="例: 5.5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                <div className="w-4 h-4 rounded-full border-2 border-green-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div></div> 幹周 (cm)
              </label>
              <input 
                type="number" 
                step="1"
                min="0"
                value={girth}
                onChange={(e) => setGirth(e.target.value)}
                placeholder="例: 120"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              />
            </div>
          </div>

          {/* i-Tree MyTree 計算結果 */}
          <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                <Globe size={16} className="text-emerald-600" /> i-Tree MyTree 計算結果 (任意)
              </h3>
              <a 
                href="https://mytree.itreetools.org/#/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 transition-colors"
              >
                MyTreeで計算する <ExternalLink size={12} />
              </a>
            </div>
            <p className="text-xs text-emerald-700/80 leading-relaxed">
              IKE・SUNパークの位置情報と樹高・幹周をもとにMyTreeサイトで算出した環境価値を入力できます。
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  CO2 Equivalent (Now) (kg)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={co2EquivalentNow}
                  onChange={(e) => setCo2EquivalentNow(e.target.value)}
                  placeholder="例: 15.2"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  回避走行マイル (1年後) (miles)
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={avoidedMiles}
                  onChange={(e) => setAvoidedMiles(e.target.value)}
                  placeholder="例: 38.5"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                {avoidedMiles && !isNaN(parseFloat(avoidedMiles)) && (
                  <span className="text-[10px] text-emerald-700 block mt-1.5 font-semibold bg-emerald-50 border border-emerald-100 p-1 rounded-md">
                    → 約 {(parseFloat(avoidedMiles) * 1.60934).toFixed(2)} km に自動換算
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* メモ */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">メモ・特徴</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="健康状態や特徴的な点を記録..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white resize-none"
            ></textarea>
          </div>
          
          <div className="h-6"></div> {/* Bottom padding */}
        </form>
      </div>

      <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
        >
          キャンセル
        </button>
        <button 
          type="submit"
          form="tree-form"
          className="flex-1 py-3.5 px-4 bg-green-600 text-white font-bold rounded-xl shadow-md hover:bg-green-700 shadow-green-600/20 active:scale-95 transition-all flex justify-center items-center gap-2"
        >
          <Save size={18} /> {isHistoryMode ? '記録を追加する' : (initialData ? '更新する' : '登録する')}
        </button>
      </div>
    </div>
  );
}
