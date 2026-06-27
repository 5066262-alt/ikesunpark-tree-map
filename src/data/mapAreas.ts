export interface MapArea {
  id: string;
  name: string;
  width: number;
  height: number;
  url: string;
}

export const MAP_AREAS: Record<string, MapArea> = {
  MAP: { id: 'MAP', name: 'N.IKE_TreeMap', width: 1024, height: 791, url: '/maps/N.IKE_TreeMap.png' },
};
