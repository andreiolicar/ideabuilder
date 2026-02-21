import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import api from "../lib/api.js";

function Admin() {
  const [users, setUsers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [error, setError] = useState("");
  const [deltaByUser, setDeltaByUser] = useState({});

  const fetchUsers = async (nextPage = page, nextSearch = search) => {
    setLoadingUsers(true);
    setError("");
    try {
      const { data } = await api.get("/admin/users", {
        params: { page: nextPage, search: nextSearch || undefined }
      });
      setUsers(data.items || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Falha ao listar usuarios.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchLedger = async (nextPage = ledgerPage) => {
    setLoadingLedger(true);
    setError("");
    try {
      const { data } = await api.get("/admin/credits/ledger", {
        params: { page: nextPage }
      });
      setLedger(data.items || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Falha ao listar ledger.");
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchLedger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyUserSearch = (event) => {
    event.preventDefault();
    setPage(1);
    fetchUsers(1, search);
  };

  const adjustUser = async (userId) => {
    const delta = Number(deltaByUser[userId]);
    if (!delta || Number.isNaN(delta)) {
      return;
    }

    await api.patch(`/admin/users/${userId}/credits`, { delta });
    setDeltaByUser((current) => ({ ...current, [userId]: "" }));
    fetchUsers(page, search);
    fetchLedger(ledgerPage);
  };

  return (
    <main className="app-shell space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Painel Admin
        </h1>
        <Link to="/">
          <Button variant="ghost">Voltar</Button>
        </Link>
      </header>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Card className="space-y-4">
        <form className="flex gap-2" onSubmit={applyUserSearch}>
          <Input
            id="admin-search"
            label="Buscar usuario"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nome ou e-mail"
          />
          <Button type="submit" className="self-end">
            Buscar
          </Button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="pb-3 font-medium">Nome</th>
                <th className="pb-3 font-medium">E-mail</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Saldo</th>
                <th className="pb-3 font-medium">Ajuste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loadingUsers
                ? Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td className="py-3" colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : users.map((user) => (
                    <tr key={user.id}>
                      <td className="py-3 text-zinc-800">{user.name}</td>
                      <td className="py-3 text-zinc-600">{user.email}</td>
                      <td className="py-3 text-zinc-600">{user.role}</td>
                      <td className="py-3 text-zinc-900">{user.balance}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={deltaByUser[user.id] || ""}
                            onChange={(event) =>
                              setDeltaByUser((current) => ({
                                ...current,
                                [user.id]: event.target.value
                              }))
                            }
                            className="h-10 w-28 rounded-xl border border-zinc-200/80 px-3 text-sm"
                            placeholder="+5 ou -2"
                          />
                          <Button variant="secondary" onClick={() => adjustUser(user.id)}>
                            Salvar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const next = Math.max(page - 1, 1);
              setPage(next);
              fetchUsers(next, search);
            }}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const next = page + 1;
              setPage(next);
              fetchUsers(next, search);
            }}
          >
            Proxima
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Historico de creditos</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="pb-3 font-medium">Usuario</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Motivo</th>
                <th className="pb-3 font-medium">Valor</th>
                <th className="pb-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {loadingLedger
                ? Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td className="py-3" colSpan={5}>
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : ledger.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 text-zinc-700">{item.userId}</td>
                      <td className="py-3 text-zinc-700">{item.type}</td>
                      <td className="py-3 text-zinc-700">{item.reason}</td>
                      <td className="py-3 text-zinc-700">{item.amount}</td>
                      <td className="py-3 text-zinc-500">
                        {new Date(item.createdAt).toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              const next = Math.max(ledgerPage - 1, 1);
              setLedgerPage(next);
              fetchLedger(next);
            }}
            disabled={ledgerPage <= 1}
          >
            Anterior
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const next = ledgerPage + 1;
              setLedgerPage(next);
              fetchLedger(next);
            }}
          >
            Proxima
          </Button>
        </div>
      </Card>
    </main>
  );
}

export default Admin;
