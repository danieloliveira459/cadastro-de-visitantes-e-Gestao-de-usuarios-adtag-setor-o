import { useNavigate } from "react-router-dom";
import { usePermissao } from "../hooks/usePermissao";

export default function SemAcesso() {
  const navigate = useNavigate();
  const { nivel } = usePermissao();

  const formatarNivel = (n) => {
    const mapa = {
      "user": "Usuário",
      "pastor": "Pastor",
      "vice pastor": "Vice Pastor",
      "pastor dirigente": "Pastor Dirigente",
      "secretário": "Secretário",
      "tesoureiro": "Tesoureiro",
      "adm": "Administrador",
      "recepcionista": "Recepcionista",
      "diácono": "Diácono",
      "diaconisa": "Diaconisa",
    };
    return mapa[n?.toLowerCase()] || n || "Desconhecido";
  };

  // ✅ Se tem usuário logado → /home | Se não tem → /login (evita loop)
  const handleVoltar = () => {
    const token = localStorage.getItem("token");
    const data = localStorage.getItem("usuarioLogado");
    const logado = token && data && data !== "undefined" && data !== "null";

    if (logado) {
      navigate("/home", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>⛔</div>
        <h2 style={styles.titulo}>Acesso Negado</h2>
        <p style={styles.texto}>
          Seu nível de acesso (<strong>{formatarNivel(nivel)}</strong>) não tem
          permissão para visualizar esta página.
        </p>
        <p style={styles.subtexto}>
          Caso acredite que isso é um erro, entre em contato com o administrador.
        </p>
        <button style={styles.botao} onClick={handleVoltar}>
          ← Voltar ao Início
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "1rem",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "2.5rem 2rem",
    maxWidth: "400px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  icon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  titulo: {
    fontSize: "1.5rem",
    color: "#cc0000",
    marginBottom: "0.75rem",
  },
  texto: {
    fontSize: "1rem",
    color: "#333",
    marginBottom: "0.5rem",
  },
  subtexto: {
    fontSize: "0.85rem",
    color: "#888",
    marginBottom: "1.5rem",
  },
  botao: {
    backgroundColor: "#e02020",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.6rem 1.5rem",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
};
