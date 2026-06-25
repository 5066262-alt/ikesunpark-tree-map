import dynamic from 'next/dynamic';
import { TreeData } from '../../types';
import { MapArea } from '../../data/mapAreas';

const TreeMapClient = dynamic(
  () => import('./TreeMapClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 font-medium">地図を読み込み中...</p>
      </div>
    )
  }
);

interface TreeMapProps {
  trees: TreeData[];
  currentArea: MapArea;
  onSelectTree: (tree: TreeData) => void;
  isAddMode?: boolean;
  onMapClick?: (x: number, y: number) => void;
}

export default function TreeMap(props: TreeMapProps) {
  return <TreeMapClient {...props} />;
}
