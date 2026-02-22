import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import Skeleton from "../components/ui/Skeleton.jsx";
import api from "../lib/api.js";

function Admin() {
  const [users, setUsers] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerUserId, setLedgerUserId] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLedger, setLoadingLedger] = useState(true);
  const [error, setError] = useState("");
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [delta, setDelta] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState("");

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

  const fetchLedger = async (nextPage = ledgerPage, nextUserId = ledgerUserId) => {
    setLoadingLedger(true);
    setError("");
    try {
      const { data } = await api.get("/admin/credits/ledger", {
        params: { page: nextPage, userId: nextUserId || undefined }
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

  const openAdjustModal = (user) => {
    setSelectedUser(user);
    setDelta("");
    setAdjustError("");
    setAdjustModalOpen(true);
  };

  const closeAdjustModal = () => {
    setAdjustModalOpen(false);
    setSelectedUser(null);
    setDelta("");
    setAdjustError("");
  };

  const submitAdjustCredits = async (event) => {
    event.preventDefault();

    const parsedDelta = Number(delta);
    if (!parsedDelta || Number.isNaN(parsedDelta)) {
      setAdjustError("Informe um valor inteiro diferente de zero.");
      return;
    }

    setAdjustLoading(true);
    setAdjustError("");

    try {
      await api.patch(`/admin/users/${selectedUser.id}/credits`, { delta: parsedDelta });
      closeAdjustModal();
      fetchUsers(page, search);
      fetchLedger(ledgerPage, ledgerUserId);
    } catch (requestError) {
      setAdjustError(requestError?.response?.data?.message || "Falha ao ajustar creditos.");
    } finally {
      setAdjustLoading(false);
    }
  };

  const applyLedgerFilter = (userId = "") => {
    setLedgerPage(1);
    setLedgerUserId(userId);
    fetchLedger(1, userId);
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
                <th className="pb-3 font-medium">Acoes</th>
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
                          <Button variant="secondary" onClick={() => openAdjustModal(user)}>
                            Ajustar creditos
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => applyLedgerFilter(user.id)}
                          >
                            Ver ledger
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
        <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3">
          <div className="min-w-[260px] flex-1">
            <Input
              id="ledger-user-id"
              label="Filtro por userId"
              value={ledgerUserId}
              onChange={(event) => setLedgerUserId(event.target.value)}
              placeholder="UUID do usuario"
            />
          </div>
          <Button variant="secondary" onClick={() => applyLedgerFilter(ledgerUserId)}>
            Aplicar
          </Button>
          <Button variant="ghost" onClick={() => applyLedgerFilter("")}>
            Limpar
          </Button>
        </div>
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
              fetchLedger(next, ledgerUserId);
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
              fetchLedger(next, ledgerUserId);
            }}
          >
            Proxima
          </Button>
        </div>
      </Card>

      <Modal open={adjustModalOpen} onClose={closeAdjustModal} title="Ajustar creditos">
        <form className="space-y-4" onSubmit={submitAdjustCredits}>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-zinc-900">Ajustar creditos</h3>
            <p className="text-sm text-zinc-500">
              Usuario: <span className="font-medium text-zinc-700">{selectedUser?.name}</span>
            </p>
            <p className="text-xs text-zinc-500">Use valor positivo para credito e negativo para debito.</p>
          </div>

          <Input
            id="credits-delta"
            label="Delta"
            type="number"
            value={delta}
            onChange={(event) => setDelta(event.target.value)}
            placeholder="+5 ou -2"
            required
          />

          {adjustError ? <p className="text-sm text-rose-600">{adjustError}</p> : null}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeAdjustModal} disabled={adjustLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={adjustLoading}>
              {adjustLoading ? "Salvando..." : "Salvar ajuste"}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}

export default Admin;
