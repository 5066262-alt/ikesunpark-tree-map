export type TreeHistoryEntry = {
  id: string; // 履歴ID
  date: string; // 調査日
  photoUrl: string;
  height: number;
  girth: number;
  co2Sequestration: number;
  co2EquivalentNow?: number; // CO2等量 (kg)
  avoidedMiles?: number; // 回避走行マイル (miles)
  notes: string;
};

export type TreeData = {
  id: string;
  species: string; // 樹種名
  area: string; // 属するマップのエリアID (A〜I)
  location: { x: number; y: number }; // 画像のピクセル座標
  height: number; // 樹高 (m)
  girth: number; // 幹周 (cm)
  photoUrl: string; // 写真のURL
  co2Sequestration: number; // 年間CO2吸収量 (kg/year)
  co2EquivalentNow?: number; // i-Tree MyTree: CO2等量 (kg)
  avoidedMiles?: number; // i-Tree MyTree: 回避走行マイル (miles)
  createdDate: string; // データ追加日 (YYYY-MM-DD)
  lastSurveyDate: string; // 調査日 (ISO形式)
  notes: string; // メモ
  history?: TreeHistoryEntry[]; // 成長記録（履歴）
};
