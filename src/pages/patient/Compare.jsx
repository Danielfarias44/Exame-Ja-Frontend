import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { compareEstablishments } from "../../services/api";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const ids = (searchParams.get("ids") ?? "1,2").split(",");
  const [establishments, setEstablishments] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    compareEstablishments(ids)
      .then((data) => {
        setEstablishments(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [searchParams]);

  if (status === "loading") return <p>Carregando comparação...</p>;
  if (status === "error") return <p role="alert">Não foi possível comparar agora.</p>;

  return (
    <section>
      <h1>Comparar estabelecimentos</h1>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Estabelecimento</th>
              <th align="left">Preço</th>
              <th align="left">Avaliação</th>
              <th align="left">Convênios</th>
            </tr>
          </thead>
          <tbody>
            {establishments.map((e) => (
              <tr key={e.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td>{e.name}</td>
                <td>R$ {e.price.toFixed(2)}</td>
                <td>⭐ {e.rating}</td>
                <td>{e.insurances.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
