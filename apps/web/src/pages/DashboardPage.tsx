import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";

const serviceCards = [
  {
    title: "AI Logic Layer",
    body: "Analiza guiones y convierte beats narrativos en prompts visuales listos para pipelines 3D."
  },
  {
    title: "The Vault",
    body: "Relaciona vocabulario, escenas y assets visuales para reforzar memoria audiovisual."
  },
  {
    title: "User Progress Dashboard",
    body: "Monitorea sincronización, avance por escenas y densidad de vocabulario aprendido."
  }
];

export function DashboardPage() {
  const { user } = useAuth();
  const [syncStats, setSyncStats] = useState([
    { label: "Nivel de Sincronización", value: "68%" },
    { label: "Tokens etiquetados", value: "0" },
    { label: "Escenas en memoria", value: "0" }
  ]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const vocabulary = await api.listVocabulary();
        const uniqueScenes = new Set(
          vocabulary.map((item) => item.sceneId ?? item.id)
        ).size;

        setSyncStats([
          {
            label: "Nivel de Sincronización",
            value: `${user?.syncLevel ?? 0}%`
          },
          {
            label: "Tokens etiquetados",
            value: String(vocabulary.length)
          },
          {
            label: "Escenas en memoria",
            value: String(uniqueScenes)
          }
        ]);
      } catch (_error) {
        setSyncStats((current) => current);
      }
    };

    void loadDashboard();
  }, [user]);

  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Dashboard</p>
          <h2 className="hero-title">
            Plataforma educativa centrada en guiones, memoria visual e IA.
          </h2>
          <p className="lede">
            Base inicial para operar el frontend en Netlify y el backend en
            Render con una arquitectura ligera de microservicios.
          </p>
        </div>

        <aside className="sync-panel">
          <p className="panel-kicker">User Progress Dashboard</p>
          <div className="sync-ring">
            <span>{syncStats[0]?.value ?? "0%"}</span>
          </div>
          <div className="sync-stats">
            {syncStats.map((stat) => (
              <div key={stat.label} className="sync-stat">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="services-grid">
        {serviceCards.map((card) => (
          <article key={card.title} className="service-card">
            <p className="panel-kicker">Microservice</p>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </section>
    </>
  );
}
