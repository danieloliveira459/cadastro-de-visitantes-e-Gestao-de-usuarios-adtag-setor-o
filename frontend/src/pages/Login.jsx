import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TbUserShare } from "react-icons/tb";
import logo from "../assets/image/adtag.png";
import "./Login.css";

const API = `${import.meta.env.VITE_API_URL}/api/auth`;

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

  const [checkedAuth, setCheckedAuth] = useState(false);

  // 🔥 BUSCAR NÍVEL (SEM DELAY)
  useEffect(() => {
    if (!email) {
      setNivelUsuario("");
      return;
    }

    const buscarNivel = async () => {
      setLoadingNivel(true);

      try {
        const res = await fetch(`${API}/nivel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.nivel) {
          setNivelUsuario(data.nivel);
        } else {
          setNivelUsuario("");
        }
      } catch {
        setNivelUsuario("");
      } finally {
        setLoadingNivel(false);
      }
    };

    buscarNivel();
  }, [email]);

  // 🔐 REDIRECIONA SE JÁ LOGADO
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token && !checkedAuth && location.pathname !== "/home") {
      setCheckedAuth(true);
      navigate("/home", { replace: true });
    }
  }, [navigate, location.pathname, checkedAuth]);

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setMensagem("");

    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.erro || "Erro no login");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioLogado", JSON.stringify(data.usuario));

      navigate("/home", { replace: true });
    } catch {
      setErro("Erro ao conectar com servidor");
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
      const res = await fetch(`${API}/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErro(data.erro || "Erro ao recuperar senha");
        return;
      }

      setMensagem("Email de recuperação enviado!");
    } catch {
      setErro("Erro ao solicitar reset");
    }
  };

  // FORMATAR NÍVEL
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

  // CADASTRO
  const handleCadastrarUsuario = async () => {
    setErro("");
    setMensagem("");

    if (!nome || !emailCad || !senhaCad) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      const res = await fetch(`${API}/register`, {
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
        setErro(data.erro || "Erro ao cadastrar");
        return;
      }

      setMensagem("Usuário cadastrado com sucesso!");

      setNome("");
      setEmailCad("");
      setSenhaCad("");
      setNivel("USER");
      setMostrarCadastro(false);
    } catch {
      setErro("Erro ao cadastrar");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        {/* LOGO */}
        <h1 className="logo-title">
          <img src={logo} alt="ADTAG Logo" className="logo" />
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
              <TbUserShare /> <strong>{formatarNivel(nivelUsuario)}</strong>
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
              <option value="USER">Usuário</option>
              <option value="PASTOR">Pastor</option>
              <option value="VICE">Vice</option>
              <option value="DIRIGENTE">Dirigente</option>
              <option value="ADM">Administrador</option>
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