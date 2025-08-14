"use client";
import { useEffect, useState } from "react";

// Helper function to call our proxied backend API. It prefixes the path
// with /api/b/ and throws an error if the response is not ok. Generics
// allow type inference for the returned JSON.
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api/b/${path}`, init);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// Generate a new UUID for idempotency keys. crypto.randomUUID is widely
// supported in modern browsers.
const newIdemKey = () => crypto.randomUUID();

// Contact type definition matching the backend schema. Optional fields
// correspond to nullable columns in the database.
type Contact = {
  id: number;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  tags?: string | null;
};

/**
 * Contacts page shows a list of contacts with simple search, create, update
 * and delete operations. All interactions go through the proxy API so
 * authentication and idempotency headers are handled automatically.
 */
export default function ContactsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", tags: "" });
  const [err, setErr] = useState<string | null>(null);

  // Load contacts from the backend. Optionally filter by query q.
  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await api<Contact[]>(`contacts${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      setItems(data);
    } catch (e: any) {
      setErr(e.message);
    }
    setLoading(false);
  };

  // Load contacts on initial render
  useEffect(() => {
    load();
  }, []);

  // Create a new contact with an idempotency key to avoid duplicates
  const createContact = async () => {
    setErr(null);
    const idem = newIdemKey();
    await api<Contact>("contacts", {
      method: "POST",
      headers: { "content-type": "application/json", "Idempotency-Key": idem },
      body: JSON.stringify(form),
    });
    setForm({ name: "", email: "", phone: "", tags: "" });
    await load();
  };

  // Delete a contact
  const remove = async (id: number) => {
    await api(`contacts/${id}`, { method: "DELETE" });
    await load();
  };

  // Update a contact. Accepts a partial patch of fields to change.
  const update = async (id: number, patch: Partial<Contact>) => {
    await api<Contact>(`contacts/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    await load();
  };

  return (
    <main style={{ maxWidth: 900, margin: "30px auto", padding: 16 }}>
      <header style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <h1 style={{ marginRight: "auto" }}>Contacts</h1>
        <input
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load}>Find</button>
        <form action="/api/auth/logout" method="POST">
          <button>Logout</button>
        </form>
      </header>

      {err && <div style={{ color: "crimson", marginTop: 8 }}>{err}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Name</th>
              <th align="left">Email</th>
              <th align="left">Phone</th>
              <th align="left">Tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name || ""}</td>
                <td>{c.email || ""}</td>
                <td>{c.phone || ""}</td>
                <td>{c.tags || ""}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    onClick={() =>
                      update(c.id, {
                        tags: (c.tags || "") + (c.tags ? "," : "") + "vip",
                      })
                    }
                  >
                    Mark VIP
                  </button>{" "}
                  <button onClick={() => remove(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <section style={{ marginTop: 24 }}>
        <h3>New contact</h3>
        <div style={{ display: "grid", gap: 8, maxWidth: 480 }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
          <button onClick={createContact}>Create</button>
        </div>
      </section>
    </main>
  );
}
