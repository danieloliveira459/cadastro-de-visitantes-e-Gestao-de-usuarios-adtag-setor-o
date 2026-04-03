import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";
export default function Admin() {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nivel, setNivel] = useState("USER");

  // CARREGAR USUÁRIOS
  useEffect(() => {
    const lista = JSON.parse(localStorage.getItem("usuarios") || "[]");
    setUsuarios(lista);
  }, []);

  const salvarUsuarios = (lista) => {
    localStorage.setItem("usuarios", JSON.stringify(lista));
    setUsuarios(lista);
  };

  // CADASTRAR
  const cadastrar = () => {
    if (!nome || !email || !senha) {
      alert("Preencha todos os campos");
      return;
    }

    const existe = usuarios.some((u) => u.email === email);

    if (existe) {
      alert("Usuário já existe");
      return;
    }

    const novo = {
      id: Date.now(),
      nome,
      email,
      senha,
      nivel,
    };

    const listaAtualizada = [...usuarios, novo];
    salvarUsuarios(listaAtualizada);

    setNome("");
    setEmail("");
    setSenha("");
    setNivel("USER");
  };

  // EXCLUIR
  const deletar = (id) => {
    if (!window.confirm("Deseja excluir este usuário?")) return;

    const lista = usuarios.filter((u) => u.id !== id);
    salvarUsuarios(lista);
  };

  return (
    <div className="admin-container">

      <h2>Gerenciamento de Usuários</h2>

      <button className="btn-voltar" onClick={() => navigate("/home")}>
        Voltar
      </button>

      {/* FORMULÁRIO */}
      <div className="form-box">
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
          <option value="USER">Usuário</option>
          <option value="DIRIGENTE">Dirigente</option>
          <option value="PASTOR">Pastor</option>
          <option value="VICE">Vice</option>
          <option value="ADM">ADM</option>
        </select>

        <button className="btn-add" onClick={cadastrar}>
          Cadastrar
        </button>
      </div>

      {/* TABELA */}
      <table className="tabela">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Nível</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.nivel}</td>
              <td>
                <button className="btn-delete" onClick={() => deletar(u.id)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}