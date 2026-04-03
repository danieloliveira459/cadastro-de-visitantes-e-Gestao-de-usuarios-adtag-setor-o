import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GiPadlock } from "react-icons/gi";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const [novaSenha, setNovaSenha] = useState("");

  const redefinirSenha = async () => {
    if (!novaSenha) {
      return alert("Digite a nova senha");
    }

    const API = import.meta.env.VITE_API_URL;
    const res = await fetch(`${API}/auth/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, novaSenha }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Senha redefinida com sucesso!");
      navigate("/");
    } else {
      alert(data.erro);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}> <GiPadlock color="#e02020"/> Redefinir Senha</h2>

        <p style={styles.subtitle}>
          Digite sua nova senha abaixo
        </p>

        <input
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          style={styles.input}
        />

        <button onClick={redefinirSenha} style={styles.button}>
          Redefinir Senha
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    blockSize: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    inlinesize: "350px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },

  title: {
    insetBlockStart: "10px",
    color: "#333",
  },

  subtitle: {
    insetBlockEnd: "20px",
    color: "#000",
    fontSize: "14px",
  },

  input: {
    inlineSize: "100%",
    padding: "12px",
    insetBlockEnd: "20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  button: {
    inlineSize: "100%",
    padding: "12px",
    background: "#e02020",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
};