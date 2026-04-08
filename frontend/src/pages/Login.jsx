import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TbUserShare } from "react-icons/tb";
import "./Login.css";
import logo from "../assets/adtag.png";
import API_BASE from "../config/api"; // ✅ importa do arquivo centralizado

const API = `${API_BASE}/api/auth`;

const NIVEL_MAPA = {
  USER: "Usuário",
  PASTOR: "Pastor",
  VICE: "Vice",
  DIRIGENTE: "Dirigente",
  ADM: "Administrador",
};

const NIVEL_OPTIONS = Object.entries(NIVEL_MAPA);
const CADASTRO_INICIAL = { nome: "", email: "", senha: "", nivel: "USER" };

const fetchComTimeout = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
};

export default function Login() {
  const navigate = useNavigate();

  // — Auth —
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);

  // — Feedback —
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  // — Nível —
  const [nivelUsuario, setNivelUsuario] = useState("");
  const [loadingNivel, setLoadingNivel] = useState(false);

  // — Cadastro —
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [cadastro, setCadastro] = useState(CADASTRO_INICIAL);
  const [loadingCadastro, setLoadingCadastro] = useState(false);

  const limparFeedback = () => {
    setErro("");
    setMensagem("");
  };

  // 🔁 Redireciona se já logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/home", { replace: true });
  }, [navigate]);

  // 🔎 Busca nível com debounce
  useEffect(() => {
    if (!email || email.length < 5) {
      setNivelUsuario("");
      return;
    }

    setLoadingNivel(true);
    const delay = setTimeout(async () => {
      try {
        const res = await fetchComTimeout(`${API}/nivel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json().catch(() => ({}));
        setNivelUsuario(res.ok ? (data?.nivel || "") : "");
      } catch {
        setNivelUsuario("");
      } finally {
        setLoadingNivel(false);
      }
    }, 500);

    return () => clearTimeout(delay);
  }, [email]);

  // 🔐 Login
  const handleLogin = async (e) => {
    e.preventDefault();
    limparFeedback();
    setLoadingLogin(true);

    try {
      const res = await fetchComTimeout(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.erro || "Email ou senha inválidos.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));
      navigate("/home", { replace: true });
    } catch (err) {
      setErro(
        err.name === "AbortError"
          ? "Servidor demorou para responder."
          : "Erro de conexão com o servidor."
      );
    } finally {
      setLoadingLogin(false);
    }
  };

  // 🔁 Recuperar senha
  const recuperarSenha = async () => {
    limparFeedback();

    if (!email) {
      setErro("Digite seu email antes de solicitar a recuperação.");
      return;
    }

    try {
      const res = await fetchComTimeout(`${API}/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.erro || "Erro ao recuperar senha.");
        return;
      }

      setMensagem("Email de recuperação enviado! Verifique sua caixa de entrada.");
    } catch {
      setErro("Erro ao solicitar reset de senha.");
    }
  };

  // 👤 Cadastro
  const handleCadastrarUsuario = async () => {
    limparFeedback();

    const { nome, email: emailCad, senha: senhaCad, nivel } = cadastro;

    if (!nome.trim() || !emailCad.trim() || !senhaCad) {
      setErro("Preencha todos os campos do cadastro.");
      return;
    }

    if (senhaCad.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoadingCadastro(true);

    try {
      const res = await fetchComTimeout(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email: emailCad, senha: senhaCad, nivel }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.erro || "Erro ao cadastrar usuário.");
        return;
      }

      setMensagem("Usuário cadastrado com sucesso!");
      setCadastro(CADASTRO_INICIAL);
      setMostrarCadastro(false);
    } catch {
      setErro("Erro de conexão ao cadastrar.");
    } finally {
      setLoadingCadastro(false);
    }
  };

  const handleCadastroChange = (field) => (e) =>
    setCadastro((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="login-container">
      <div className="login-card">

        <h1 className="logo-title">
          <img
            src={logo}
            alt="ADTAG Logo"
            className="logo"
            onError={(e) => (e.target.style.display = "none")}
          />
          ADTAG
        </h1>

        <h2>LOGIN</h2>

        {erro && <p className="erro">{erro}</p>}
        {mensagem && <p className="sucesso">{mensagem}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          {loadingNivel && (
            <p style={{ fontSize: "12px", color: "#888" }}>Verificando nível...</p>
          )}

          {nivelUsuario && !loadingNivel && (
            <p style={{ color: "#e02020" }}>
              <TbUserShare /> <strong>{NIVEL_MAPA[nivelUsuario] ?? nivelUsuario}</strong>
            </p>
          )}

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" className="btn-login" disabled={loadingLogin}>
            {loadingLogin ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button
          type="button"
          className="btn-login"
          onClick={recuperarSenha}
          disabled={loadingLogin}
        >
          Esqueci minha senha
        </button>

        <button
          type="button"
          className="btn-register"
          onClick={() => {
            setMostrarCadastro((v) => !v);
            limparFeedback();
          }}
        >
          {mostrarCadastro ? "Cancelar" : "Cadastrar Usuário"}
        </button>

        {mostrarCadastro && (
          <div className="cadastro-box">
            <input
              type="text"
              placeholder="Nome completo"
              value={cadastro.nome}
              onChange={handleCadastroChange("nome")}
              autoComplete="name"
            />
            <input
              type="email"
              placeholder="Email"
              value={cadastro.email}
              onChange={handleCadastroChange("email")}
              autoComplete="off"
            />
            <input
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              value={cadastro.senha}
              onChange={handleCadastroChange("senha")}
              autoComplete="new-password"
            />
            <select
              value={cadastro.nivel}
              onChange={handleCadastroChange("nivel")}
            >
              {NIVEL_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCadastrarUsuario}
              className="btn-login"
              disabled={loadingCadastro}
            >
              {loadingCadastro ? "Salvando..." : "Salvar Usuário"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}