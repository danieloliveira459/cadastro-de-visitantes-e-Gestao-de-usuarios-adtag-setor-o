import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TbUserShare } from "react-icons/tb";
import "./Login.css";
import logo from "../assets/adtag.png";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

if (!import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL não definida. Usando fallback.");
}

const API = `${BASE_URL}/api/auth`;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [emailCad, setEmailCad] = useState("");
  const [senhaCad, setSenhaCad] = useState("");
  const [nivel, setNivel] = useState("USER");

  const [nivelUsuario, setNivelUsuario] = useState("");
  const [loadingNivel, setLoadingNivel] = useState(false);

  const fetchComTimeout = async (url, options = {}, timeout = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
    }
  };

  //  BUSCAR NÍVEL
  useEffect(() => {
    if (!email || email.length < 5) {
      setNivelUsuario("");
      return;
    }

    const buscarNivel = async () => {
      setLoadingNivel(true);
      try {
        const res = await fetchComTimeout(`${API}/nivel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!res.ok) {
          setNivelUsuario("");
          return;
        }

        const data = await res.json().catch(() => ({}));
        setNivelUsuario(data?.nivel || "");
      } catch (err) {
        if (err.name === "AbortError") {
          setErro("Servidor demorou para responder.");
        }
        setNivelUsuario("");
      } finally {
        setLoadingNivel(false);
      }
    };

    const delay = setTimeout(buscarNivel, 500);
    return () => clearTimeout(delay);
  }, [email]);

  //  REDIRECIONAMENTO CORRIGIDO (SEM LOOP)
  useEffect(() => {
    const token = localStorage.getItem("token");

    //  Se veio de logout, NÃO redireciona
    if (location.state?.logout) {
      return;
    }

    //  Se já está logado, vai pra home
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [navigate, location.state]);

  //  LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    try {
      const res = await fetchComTimeout(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.erro || "Email ou senha inválidos");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));

      navigate("/home", { replace: true });
    } catch (err) {
      if (err.name === "AbortError") {
        setErro("Servidor demorou para responder.");
      } else {
        setErro("Erro de conexão (CORS ou servidor offline)");
      }
    }
  };

  // RECUPERAR SENHA
  const recuperarSenha = async () => {
    setErro("");
    setMensagem("");

    if (!email) {
      setErro("Digite seu email");
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
        setErro(data?.erro || "Erro ao recuperar senha");
        return;
      }

      setMensagem("Email de recuperação enviado!");
    } catch (err) {
      setErro("Erro ao solicitar reset");
    }
  };

  const formatarNivel = (nivel) => {
    const mapa = {
      USER: "Usuário",
      PASTOR: "Pastor",
      VICE: "Vice",
      DIRIGENTE: "Dirigente",
      ADM: "Administrador",
    };
    return mapa[nivel] || nivel;
  };

  // 👤 CADASTRO
  const handleCadastrarUsuario = async () => {
    setErro("");
    setMensagem("");

    if (!nome || !emailCad || !senhaCad) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetchComTimeout(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email: emailCad,
          senha: senhaCad,
          nivel,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data?.erro || "Erro ao cadastrar");
        return;
      }

      setMensagem("Usuário cadastrado com sucesso!");
      setNome("");
      setEmailCad("");
      setSenhaCad("");
      setNivel("USER");
      setMostrarCadastro(false);
    } catch (err) {
      setErro("Erro ao cadastrar");
    }
  };

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
            required
          />

          {loadingNivel && (
            <p style={{ fontSize: "12px" }}>Verificando nível...</p>
          )}

          {nivelUsuario && !loadingNivel && (
            <p style={{ color: "#e02020" }}>
              <TbUserShare />{" "}
              <strong>{formatarNivel(nivelUsuario)}</strong>
            </p>
          )}

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>

        <button className="btn-login" onClick={recuperarSenha}>
          Esqueci minha senha
        </button>

        <button
          className="btn-register"
          onClick={() => setMostrarCadastro(!mostrarCadastro)}
        >
          Cadastrar Usuário
        </button>

        {mostrarCadastro && (
          <div className="cadastro-box">
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              value={emailCad}
              onChange={(e) => setEmailCad(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha"
              value={senhaCad}
              onChange={(e) => setSenhaCad(e.target.value)}
            />

            <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option value="Diácono">Diácono</option>
              <option value="Diaconisa">Diaconisa</option>
              <option value="PASTOR">Pastor</option>
              <option value="VICE PASTOR">Vice Pastor</option>
              <option value="PASTOR DIRIGENTE">Pastor Dirigente</option>
              <option value="ADM">Administrador</option>
              <option value="RECEPCIONISTA">Recepcionista</option>
              <option value="SECRETÁRIO">Secretário</option>
              <option value="TESOUREIRO">Tesoureiro</option>
            </select>

            <button onClick={handleCadastrarUsuario} className="btn-login">
              Salvar Usuário
            </button>
          </div>
        )}
      </div>
    </div>
  );
}