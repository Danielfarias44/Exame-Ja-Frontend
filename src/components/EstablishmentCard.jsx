import { Link } from "react-router-dom";

export default function EstablishmentCard({ establishment }) {
  const { id, name, address, price, rating, reviewsCount, insurances } = establishment;

  return (
    <article style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem" }}>
      <h3>{name}</h3>
      <p>{address}</p>
      <p>
        <strong>R$ {price.toFixed(2)}</strong> · ⭐ {rating} ({reviewsCount} avaliações)
      </p>
      <p>Convênios: {insurances.join(", ")}</p>
      <Link to={`/estabelecimento/${id}`}>Ver detalhes</Link>
    </article>
  );
}
