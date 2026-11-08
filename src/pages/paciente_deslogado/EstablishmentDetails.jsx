import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getEstablishment, getEstablishmentReviews } from "../../services/api";

export default function EstablishmentDetails() {
  const { id } = useParams();
  const [establishment, setEstablishment] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    Promise.all([getEstablishment(id), getEstablishmentReviews(id)])
      .then(([establishmentData, reviewsData]) => {
        setEstablishment(establishmentData);
        setReviews(reviewsData);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <p>Carregando...</p>;
  if (status === "error" || !establishment) return <p role="alert">Estabelecimento não encontrado.</p>;

  return (
    <section>
      <h1>{establishment.name}</h1>
      <p>{establishment.address}</p>
      <p>
        <strong>R$ {establishment.price.toFixed(2)}</strong> ·  {establishment.rating} (
        {establishment.reviewsCount} avaliações)
      </p>
      <p>Convênios: {establishment.insurances.join(", ")}</p>

      {/* TODO: plugar mapa aqui usando establishment.lat / establishment.lng (Google Maps + GeoAmbiente) */}
      <div style={{ background: "#f1f5f9", padding: "2rem", textAlign: "center", borderRadius: 8 }}>
        [Mapa entra aqui]
      </div>

      <h2>Avaliações</h2>
      <ul>
        {reviews.map((review) => (
          <li key={review.id}>
            <strong>{review.author}</strong> —  {review.rating}
            <p>{review.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
