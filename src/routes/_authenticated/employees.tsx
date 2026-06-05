import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  listEmployees,
  setEmployeeActive,
  setEmployeeRole,
  resetEmployeePassword,
  updateEmployeeProfile,
  deleteEmployee,
} from "@/lib/employees.functions";
import { createEmployee } from "@/lib/admin.functions";
import {
  Loader2,
  ShieldCheck,
  UserPlus,
  Lock,
  Trash2,
  PauseCircle,
  PlayCircle,
  Save,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/employees")({
  head: () => ({ meta: [{ title: "Employees — Elimi Trust" }] }),
  component: EmployeesPage,
});

type Emp = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  roles: ("super_admin" | "employee")[];
};

function EmployeesPage() {
  const list = useServerFn(listEmployees);
  const q = useQuery({ queryKey: ["employees"], queryFn: () => list() });
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState<Emp | null>(null);
  const [resetting, setResetting] = useState<Emp | null>(null);

  if (q.isLoading)
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    );
  if (q.isError)
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-destructive">
        {(q.error as Error).message}
      </div>
    );

  const employees = (q.data?.employees ?? []) as Emp[];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs tracking-[0.3em] text-[var(--gold)] mb-2">SUPER ADMIN</div>
          <h1 className="text-4xl font-display">Employee management</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Create, suspend, and reset passwords for staff accounts.
          </p>
        </div>
        <button
          onClick={() => setOpenCreate(true)}
          className="btn-gold px-4 py-2.5 rounded-lg font-semibold text-sm inline-flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> New employee
        </button>
      </div>

      <div className="luxury-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--surface)] text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">Name / Email</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <EmpRow
                key={e.id}
                e={e}
                onEdit={() => setEditing(e)}
                onReset={() => setResetting(e)}
              />
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  No employees yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openCreate && <CreateDialog onClose={() => setOpenCreate(false)} />}
      {editing && <EditDialog emp={editing} onClose={() => setEditing(null)} />}
      {resetting && <ResetDialog emp={resetting} onClose={() => setResetting(null)} />}
    </div>
  );
}

function EmpRow({
  e,
  onEdit,
  onReset,
}: {
  e: Emp;
  onEdit: () => void;
  onReset: () => void;
}) {
  const qc = useQueryClient();
  const active = useServerFn(setEmployeeActive);
  const del = useServerFn(deleteEmployee);
  const refetch = () => qc.invalidateQueries({ queryKey: ["employees"] });
  const role = e.roles.includes("super_admin") ? "super_admin" : "employee";

  const toggle = useMutation({
    mutationFn: () => active({ data: { user_id: e.id, is_active: !e.is_active } }),
    onSuccess: refetch,
    onError: (err: Error) => alert(err.message),
  });
  const remove = useMutation({
    mutationFn: () => del({ data: { user_id: e.id } }),
    onSuccess: refetch,
    onError: (err: Error) => alert(err.message),
  });

  return (
    <tr className="border-t border-border">
      <td className="p-3">
        <div className="font-medium">{e.full_name ?? "—"}</div>
        <div className="text-xs text-muted-foreground">{e.email}</div>
      </td>
      <td className="p-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
            role === "super_admin"
              ? "bg-[var(--gold)]/15 text-[var(--gold)]"
              : "bg-blue-500/15 text-blue-400"
          }`}
        >
          {role === "super_admin" && <ShieldCheck className="w-3 h-3" />}
          {role}
        </span>
      </td>
      <td className="p-3">
        <span
          className={`px-2 py-0.5 rounded text-xs ${
            e.is_active
              ? "bg-green-500/15 text-green-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {e.is_active ? "active" : "suspended"}
        </span>
        {e.must_change_password && (
          <span className="ml-2 px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-xs">
            password change due
          </span>
        )}
      </td>
      <td className="p-3 text-xs text-muted-foreground">
        {new Date(e.created_at).toLocaleDateString()}
      </td>
      <td className="p-3 text-right">
        <div className="inline-flex gap-1">
          <button onClick={onEdit} className="p-2 rounded-md hover:bg-accent" title="Edit">
            <Save className="w-4 h-4" />
          </button>
          <button onClick={onReset} className="p-2 rounded-md hover:bg-accent" title="Reset password">
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggle.mutate()}
            disabled={toggle.isPending}
            className="p-2 rounded-md hover:bg-accent"
            title={e.is_active ? "Suspend" : "Activate"}
          >
            {e.is_active ? (
              <PauseCircle className="w-4 h-4 text-amber-400" />
            ) : (
              <PlayCircle className="w-4 h-4 text-green-400" />
            )}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${e.email}? This cannot be undone.`)) remove.mutate();
            }}
            disabled={remove.isPending}
            className="p-2 rounded-md hover:bg-destructive/15 text-destructive"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="luxury-card rounded-xl p-6 max-w-md w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-accent"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

function CreateDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const create = useServerFn(createEmployee);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      create({
        data: { email, password, full_name: fullName, phone: phone || null },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-xl gold-text mb-4">New employee</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          mut.mutate();
        }}
        className="space-y-3"
      >
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className={modalInput}
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={modalInput}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone (optional)"
          className={modalInput}
        />
        <input
          required
          type="text"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Temporary password (min 8 chars)"
          className={modalInput}
        />
        <p className="text-xs text-muted-foreground">
          The employee will be required to change this password on first login.
        </p>
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button
          type="submit"
          disabled={mut.isPending}
          className="w-full btn-gold py-2.5 rounded-md font-semibold text-sm"
        >
          {mut.isPending ? "Creating…" : "Create employee"}
        </button>
      </form>
    </Modal>
  );
}

function EditDialog({ emp, onClose }: { emp: Emp; onClose: () => void }) {
  const qc = useQueryClient();
  const updateProf = useServerFn(updateEmployeeProfile);
  const setRole = useServerFn(setEmployeeRole);
  const [fullName, setFullName] = useState(emp.full_name ?? "");
  const [phone, setPhone] = useState(emp.phone ?? "");
  const [role, setRoleVal] = useState<"super_admin" | "employee">(
    emp.roles.includes("super_admin") ? "super_admin" : "employee",
  );
  const [err, setErr] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: async () => {
      await updateProf({
        data: { user_id: emp.id, full_name: fullName, phone: phone || null },
      });
      const currentRole = emp.roles.includes("super_admin") ? "super_admin" : "employee";
      if (role !== currentRole) {
        await setRole({ data: { user_id: emp.id, role } });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-xl gold-text mb-4">Edit employee</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          mut.mutate();
        }}
        className="space-y-3"
      >
        <div className="text-xs text-muted-foreground">{emp.email}</div>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className={modalInput}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
          className={modalInput}
        />
        <select
          value={role}
          onChange={(e) => setRoleVal(e.target.value as "super_admin" | "employee")}
          className={modalInput}
        >
          <option value="employee">Employee</option>
          <option value="super_admin">Super Admin</option>
        </select>
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button
          type="submit"
          disabled={mut.isPending}
          className="w-full btn-gold py-2.5 rounded-md font-semibold text-sm"
        >
          {mut.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </Modal>
  );
}

function ResetDialog({ emp, onClose }: { emp: Emp; onClose: () => void }) {
  const qc = useQueryClient();
  const reset = useServerFn(resetEmployeePassword);
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => reset({ data: { user_id: emp.id, password } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["employees"] });
      onClose();
    },
    onError: (e: Error) => setErr(e.message),
  });

  return (
    <Modal onClose={onClose}>
      <h2 className="font-display text-xl gold-text mb-2">Reset password</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Set a new temporary password for <span className="text-foreground">{emp.email}</span>. They
        will be asked to change it on next sign-in.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          mut.mutate();
        }}
        className="space-y-3"
      >
        <input
          required
          type="text"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 chars)"
          className={modalInput}
        />
        {err && <div className="text-sm text-destructive">{err}</div>}
        <button
          type="submit"
          disabled={mut.isPending}
          className="w-full btn-gold py-2.5 rounded-md font-semibold text-sm"
        >
          {mut.isPending ? "Resetting…" : "Reset password"}
        </button>
      </form>
    </Modal>
  );
}

const modalInput =
  "w-full px-3 py-2.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:border-[var(--gold)]";
