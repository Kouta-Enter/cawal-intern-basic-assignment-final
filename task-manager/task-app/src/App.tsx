'use client';
import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Api } from "./api";

type A_Task = { completed: number; id: number; title: string; }
type Tasks = A_Task[]

export default function TodoUI(): JSX.Element {
  const [tasks, setTasks] = useState<Tasks>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const [newTitle, setNewTitle] = useState("");
  // 初期データ取得
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data: Tasks = await Api.get("/"); // あなたのエンドポイントに合わせてください
        if (!mounted) return;
        setTasks(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error("fetch error", e);
        setError(e?.message ?? "Failed to load tasks");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const ordered = useMemo(() => {
    const open = tasks.filter((t) => !t.completed);
    const done = tasks.filter((t) => t.completed);
    return [...open, ...done];
  }, [tasks]);

  // Toggle completed — API 呼んで成功したらローカル更新
  const toggleComplete = async (id: number) => {
    const found = tasks.find(t => t.id === id);
    if (!found) return;
    const nextCompleted = found.completed == 0 ? 1 : 0;
    try {
      await Api.post(`/update`, { ...found, completed: nextCompleted });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: nextCompleted } : t));
    } catch (e: any) {
      console.error("toggle error", e);
      setError(e?.message ?? "Failed to update task");
    }
  };

  const removeTask = async (id: number) => {
    try {
      await Api.post(`/delete`, { id: id });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e: any) {
      console.error("delete error", e);
      setError(e?.message ?? "Failed to delete task");
    }
  };

  const startEdit = (id: number) => {
    setEditingId(id);
    requestAnimationFrame(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    });
  };

  const confirmEdit = async (id: number, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) { cancelEdit(); return; }
    try {
      await Api.post(`/update`, { id: id, title: trimmed });
      setTasks(prev => prev.map(t => (t.id === id ? { ...t, title: trimmed } : t)));
      setEditingId(null);
    } catch (e: any) {
      console.error("edit error", e);
      setError(e?.message ?? "Failed to edit task");
    }
  };

  const cancelEdit = () => setEditingId(null);

  const addTask = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const created = await Api.post<A_Task>("/insert", { title, completed: 0 });
      // サーバが作成済のオブジェクトを返すならそれを使う
      if (created && typeof created.id === "number") {
        setTasks(prev => [created, ...prev]);
      }
      setNewTitle("");
    } catch (e: any) {
      console.error("add error", e);
      setError(e?.message ?? "Failed to add task");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {loading ? <div>Loading...</div> : null}
        {error ? <div style={{ color: "salmon", marginBottom: 12 }}>{error}</div> : null}

        {!loading && ordered.length === 0 ? <div>タスクがありません</div> : null}

        {ordered.map((t) => (
          <div key={t.id} style={styles.row}>
            <label style={styles.radioWrap}>
              <input type="checkbox" checked={t.completed != 0} onChange={() => toggleComplete(t.id)} style={styles.radio} />
              <span style={{ ...styles.fakeRadio, ...(t.completed ? styles.fakeRadioOn : {}) }} />
            </label>

            <div style={styles.titleWrap}>
              {editingId === t.id ? (
                <input
                  ref={editInputRef}
                  defaultValue={t.title}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmEdit(t.id, e.currentTarget.value);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  onBlur={(e) => confirmEdit(t.id, e.currentTarget.value)}
                  style={styles.input}
                />
              ) : (
                <div style={{ ...styles.title, ...(t.completed ? styles.titleDone : {}) }}>{t.title}</div>
              )}
            </div>

            <div style={styles.actions}>
              <button title="削除" onClick={() => removeTask(t.id)} style={{ ...styles.btn, ...styles.btnCircle }}>×</button>
              <button title="編集" onClick={() => startEdit(t.id)} style={{ ...styles.btn, ...styles.btnEdit }}>編集</button>
            </div>
          </div>
        ))}

        <div style={styles.divider} />

        <div style={styles.addRow}>
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="追加したいタスク名を入力" style={styles.input} />
          <button onClick={addTask} style={{ ...styles.btn, ...styles.btnAdd }}>＋</button>
        </div>
      </div>
    </div>
  );
}

/* styles: 省略可。既存の styles をそのまま流用してください */
const styles = /** @type {const} */ ({
  /* ... 省略: 既存 styles を使ってください ... */
  page: { minHeight: "100vh", background: "#0b0b0c", color: "#e8e8ea", display: "grid", placeItems: "start center", padding: "40px 16px", fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, sans-serif" },
  container: { width: "min(920px, 96vw)", border: "1px solid #2a2a2c", borderRadius: 12, padding: 16, background: "#101113", boxShadow: "0 10px 30px rgba(0,0,0,.35)" },
  row: { display: "grid", gridTemplateColumns: "44px 1fr 180px", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: "1px solid #1b1c1f" },
  radioWrap: { position: "relative" as const, width: 44, height: 44, display: "grid" as const, placeItems: "center" as const },
  radio: { opacity: 0, position: "absolute" as const, inset: 0, margin: 0, cursor: "pointer" as const },
  fakeRadio: { width: 18, height: 18, borderRadius: 9999, border: "2px solid #caa6a6", boxShadow: "0 0 0 2px #2b1919 inset", background: "transparent", transition: "all .15s ease" },
  fakeRadioOn: { borderColor: "#fcb0b0", background: "#fcb0b0", boxShadow: "0 0 0 3px #4a1b1b inset" },
  titleWrap: { width: "100%" },
  title: { padding: "10px 12px", background: "#121317", border: "1px solid #22242a", borderRadius: 8 },
  titleDone: { textDecoration: "line-through", opacity: 0.65 },
  actions: { display: "flex", gap: 10, justifyContent: "flex-end" },
  btn: { padding: "10px 14px", borderRadius: 12, border: "1px solid #2a2d34", background: "#17191e", color: "#e8e8ea", cursor: "pointer", fontWeight: 600, letterSpacing: 1, transition: "transform .08s ease, background .15s ease, border .15s ease" },
  btnCircle: { width: 44, height: 44, borderRadius: 9999, fontSize: 20, lineHeight: 1 },
  btnEdit: { width: 72 },
  btnAdd: { width: 56, height: 56, borderRadius: 12, fontSize: 28, lineHeight: 1 },
  input: { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #2a2d34", background: "#0f1013", color: "#e8e8ea", outline: "none" },
  divider: { height: 40, borderLeft: "2px dashed #2a2d34", margin: "24px auto", width: 0 },
  addRow: { display: "grid", gridTemplateColumns: "1fr 64px", gap: 12, alignItems: "center", padding: 8 }
});
