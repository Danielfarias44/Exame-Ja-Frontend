import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function EstablishmentMap({ establishments, zoom = 14 }) {
  const withCoords = establishments.filter((e) => e.lat && e.lng);
  if (withCoords.length === 0) return null;
  const center = [withCoords[0].lat, withCoords[0].lng];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "320px", width: "100%", borderRadius: 8 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {withCoords.map((e) => (
        <Marker key={e.id} position={[e.lat, e.lng]}>
          <Popup>
            <strong>{e.name}</strong>
            <br />
            {e.address}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}