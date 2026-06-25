'use client';

import { useEffect, useState } from 'react';
import { MapContainer, ImageOverlay, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { TreeData } from '../../types';
import { MapArea } from '../../data/mapAreas';

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface TreeMapClientProps {
  trees: TreeData[];
  currentArea: MapArea;
  onSelectTree: (tree: TreeData) => void;
  isAddMode?: boolean;
  onMapClick?: (x: number, y: number) => void;
}

// MapEvents component to handle clicks
function MapEvents({ isAddMode, onMapClick }: { isAddMode?: boolean, onMapClick?: (x: number, y: number) => void }) {
  useMapEvents({
    click(e) {
      if (isAddMode && onMapClick) {
        // L.CRS.Simple maps (lat, lng) to (y, x)
        onMapClick(e.latlng.lng, e.latlng.lat);
      }
    },
  });
  return null;
}

// Helper to dynamically update map bounds when area changes
function MapUpdater({ area }: { area: MapArea }) {
  const map = useMap();
  useEffect(() => {
    const bounds: L.LatLngBoundsExpression = [[0, 0], [area.height, area.width]];
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
  }, [area, map]);
  return null;
}

export default function TreeMapClient({ trees, currentArea, onSelectTree, isAddMode, onMapClick }: TreeMapClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-gray-100" />;

  const bounds: L.LatLngBoundsExpression = [[0, 0], [currentArea.height, currentArea.width]];

  // 現在のエリアに属する樹木のみをフィルタリング
  const areaTrees = trees.filter(tree => tree.area === currentArea.id);

  return (
    <div className={`h-full w-full ${isAddMode ? 'cursor-crosshair' : ''}`}>
      <MapContainer
        crs={L.CRS.Simple}
        bounds={bounds}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        minZoom={-2}
        maxZoom={2}
        zoomControl={false} // UIをすっきりさせるためズームコントロールは非表示か、必要に応じてtrueに
        className="h-full w-full bg-[#f0f0f0]" // 画像の背景色
      >
        <MapUpdater area={currentArea} />
        <MapEvents isAddMode={isAddMode} onMapClick={onMapClick} />
        
        <ImageOverlay
          url={currentArea.url}
          bounds={bounds}
        />

        {areaTrees.map((tree) => (
          <Marker 
            key={tree.id} 
            position={[tree.location.y, tree.location.x]} // Leaflet position is [lat(y), lng(x)]
            icon={customIcon}
            eventHandlers={{
              click: () => onSelectTree(tree),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
