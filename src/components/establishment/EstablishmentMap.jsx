import { Box } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// Mapa que será colocado nos detalhes da clinica normalmente
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function EstablishmentMap({
  establishments = [],
  zoom = 14,
  label = "Mapa das clínicas",
}) {
  const withCoords = establishments.filter((e) => e.lat != null && e.lng != null);
  if (withCoords.length === 0) return null;
  const center = [withCoords[0].lat, withCoords[0].lng];

  return (
    <Box
      role="region"
      aria-label={label}
      h="var(--map-height)"
      overflow="hidden"
      borderWidth="var(--border-width)"
      borderStyle="solid"
      borderColor="var(--color-border-soft)"
      borderRadius="var(--radius-lg)"
      boxShadow="var(--shadow-sm)"
      position="relative"
      zIndex="var(--z-base)"
    >
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
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
    </Box>
  );
}
