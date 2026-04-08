import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GiPadlock } from "react-icons/gi";

const API_URL = import.meta.env.VITE_API_URL || 
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [novaSenha, setNovaSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const redefinirSenha = async () => {
    if (loading) return;

    if (!token) return alert("Token inválido ou expirado.");
    if (!novaSenha) return alert("Digite a nova senha");
    if (novaSenha.length < 6) return alert("A senha deve ter pelo menos 6 caracteres");

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json().catch(() => {
        throw new Error("Resposta inválida do servidor.");
      });

      if (!res.ok) throw new Error(data.erro || "Erro ao redefinir senha");

      alert("Senha redefinida com sucesso!");
      navigate("/");
    } catch (err) {
      console.error("Erro:", err.message);
      alert(err.message || "Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={{ ...styles.title, color: "#e02020" }}>
            <GiPadlock color="#e02020" /> Link inválido
          </h2>
          <p style={styles.subtitle}>Esse link expirou ou não é válido.</p>
          <button style={styles.button} onClick={() => navigate("/")}>
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          <GiPadlock color="#e02020" /> Redefinir Senha
        </h2>
        <p style={styles.subtitle}>Digite sua nova senha abaixo</p>

        <input
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          style={styles.input}
          disabled={loading}
        />

        <button
          onClick={redefinirSenha}
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Redefinindo..." : "Redefinir Senha"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  title: {
    marginBottom: "10px",
    color: "#333",
  },
  subtitle: {
    marginBottom: "20px",
    color: "#555",
    fontSize: "14px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#e02020",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
  },
};
