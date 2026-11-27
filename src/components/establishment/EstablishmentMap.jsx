import { Link } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
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
  center: centerProp,
  altura = "var(--map-height)",
  rotuloCentro = "Localização da busca",
  rotaDetalhes,
}) {
  const withCoords = establishments.filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lng));
  const possuiCentro = Number.isFinite(centerProp?.latitude) && Number.isFinite(centerProp?.longitude);
  if (withCoords.length === 0 && !possuiCentro) return null;
  const center = possuiCentro ? [centerProp.latitude, centerProp.longitude] : [withCoords[0].lat, withCoords[0].lng];

  return (
    <Box
      role="region"
      aria-label={label}
      h={altura}
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
        {possuiCentro && <CircleMarker center={center} radius={8} pathOptions={{ className: "marcador-usuario", weight: 3, fillOpacity: 1 }}><Popup>{rotuloCentro}</Popup></CircleMarker>}
        {withCoords.map((e) => (
          <Marker key={e.id} position={[e.lat, e.lng]}>
            <Popup>
              <strong>{e.name}</strong>
              <br />
              {e.address}
              {rotaDetalhes && (
                <>
                  <br />
                  <Link to={rotaDetalhes(e)}>Ver clínica</Link>
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
