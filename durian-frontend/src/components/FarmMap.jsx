import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on health status
const getMarkerIcon = (status) => {
  const colors = {
    sihat: '#10b981', // green
    sederhana: '#f59e0b', // yellow
    'kurang sihat': '#f97316', // orange
    kritikal: '#ef4444', // red
  };

  const color = colors[status] || '#6b7280'; // default gray

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Component to fit map bounds to markers
const FitBounds = ({ trees }) => {
  const map = useMap();

  useEffect(() => {
    if (trees.length > 0) {
      const bounds = trees.map(tree => [tree.latitude, tree.longitude]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [trees, map]);

  return null;
};

const FarmMap = ({ filterStatus = null, onTreeSelect = null, selectedTreeIds = [] }) => {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState([3.1390, 101.6869]); // Default: Kuala Lumpur
  const [zoom, setZoom] = useState(15);

  useEffect(() => {
    fetchMapData();
  }, [filterStatus]);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) {
        params.status = filterStatus;
      }
      const response = await api.get('/pokok-map-data', { params });
      const treeData = response.data.data;
      setTrees(treeData);

      // Set center to first tree if available
      if (treeData.length > 0) {
        setCenter([treeData[0].latitude, treeData[0].longitude]);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerClick = (tree) => {
    if (onTreeSelect) {
      onTreeSelect(tree);
    }
  };

  const isSelected = (treeId) => {
    return selectedTreeIds.includes(treeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (trees.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No trees with GPS coordinates found</p>
          <p className="text-gray-500 text-sm">Add GPS coordinates to your trees to see them on the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 md:h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds trees={trees} />

        {trees.map((tree) => (
          <Marker
            key={tree.id}
            position={[tree.latitude, tree.longitude]}
            icon={getMarkerIcon(tree.status_kesihatan)}
            eventHandlers={{
              click: () => handleMarkerClick(tree),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className={`font-bold text-lg mb-2 ${isSelected(tree.id) ? 'text-primary-600' : ''}`}>
                  {tree.tag_no}
                  {isSelected(tree.id) && (
                    <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Varieti:</span> {tree.varieti}
                  </div>
                  <div>
                    <span className="font-medium">Lokasi:</span> {tree.lokasi}
                  </div>
                  <div>
                    <span className="font-medium">Umur:</span> {tree.umur} tahun
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`badge badge-${
                      tree.status_kesihatan === 'sihat' ? 'success' :
                      tree.status_kesihatan === 'kritikal' ? 'danger' : 'warning'
                    }`}>
                      {tree.status_kesihatan}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Koordinat:</span>
                    <br />
                    {tree.latitude.toFixed(6)}, {tree.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <div className="text-sm font-semibold mb-2">Status Kesihatan</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
            <span>Sihat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white"></div>
            <span>Sederhana</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
            <span>Kurang Sihat</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
            <span>Kritikal</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
          Total: {trees.length} pokok
        </div>
      </div>
    </div>
  );
};

export default FarmMap;
