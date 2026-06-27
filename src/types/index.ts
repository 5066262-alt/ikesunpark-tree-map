export type TreeHistoryEntry = {
  id: string; // 履歴ID
  date: string; // 調査日
  photoUrl: string;
  height: number;
  girth: number;
  co2Sequestration: number;
  co2EquivalentNow?: number; // CO2等量 (kg)
  avoidedMiles?: number; // 回避走行マイル (miles)
  condition?: string; // 💡 追加：樹木の状態 (例：健全、衰退、枯死)
  sunlight?: string; // 💡 追加：日当たり (例：日向、半日陰、日陰)
  notes: string;
};

export type TreeData = {
  id: string;
  species: string; // 樹種名
  area: string; // 属するマップのエリアID
  location: { x: number; y: number }; // 画像のピクセル座標
  height: number; // 樹高 (m)
  girth: number; // 幹周 (cm)
  photoUrl: string; // 写真のURL
  co2Sequestration: number; // 年間CO2吸収量 (kg/year)
  co2EquivalentNow?: number; // i-Tree MyTree: CO2等量 (kg)
  avoidedMiles?: number; // i-Tree MyTree: 回避走行マイル (miles)
  condition?: string; // 💡 追加：樹木の状態
  sunlight?: string; // 💡 追加：日当たり
  createdDate: string; // データ追加日 (YYYY-MM-DD)
  lastSurveyDate: string; // 調査日 (ISO形式)
  notes: string; // メモ
  history?: TreeHistoryEntry[]; // 成長記録（履歴）
};