import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Trainees.css";

const API = "http://localhost:5001";
const PAGE_SIZE = 15;

/* ───────────── helpers ───────────── */
const authConfig = (extra = {}) => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  ...extra,
});

const errorText = (err, fallback) =>
  err?.response?.data?.message || fallback;

const initial = (name) => (name || "?").charAt(0).toUpperCase();

const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fmtDateTime = (value) => {
  if (!value) return "No deadline";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "No deadline";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const imageSrc = (path) => {
  if (!path) return "";
  return /^https?:\/\//i.test(path) ? path : `${API}${path}`;
};

const percent = (done, total) => (total ? Math.round((done / total) * 100) : 0);

const STATUS_LABEL = { completed: "Completed", pending: "Pending", overdue: "Overdue" };

/* ───────────── small components ───────────── */
const Avatar = ({ name, large }) => (
  <span className={`tm-avatar ${large ? "tm-avatar--lg" : ""}`}>{initial(name)}</span>
);

const EmptyState = ({ icon, title, text }) => (
  <div className="tm-empty">
    <span className="tm-empty-icon">{icon}</span>
    <p className="tm-empty-title">{title}</p>
    {text && <p className="tm-empty-text">{text}</p>}
  </div>
);

const PlanList = ({ plans, icon, emptyTitle, emptyText }) =>
  plans.length === 0 ? (
    <EmptyState icon={icon} title={emptyTitle} text={emptyText} />
  ) : (
    <div className="tm-plan-grid">
      {plans.map((plan) => (
        <article key={plan._id} className="tm-plan">
          <h4 className="tm-plan-title">
            <span>{icon}</span> {plan.title}
          </h4>
          <p className="tm-plan-desc">{plan.description || "No details provided."}</p>
          <div className="tm-plan-foot">
            <span>Assigned by {plan.assignedBy}</span>
            <span>{fmtDate(plan.createdAt)}</span>
          </div>
        </article>
      ))}
    </div>
  );

/* ───────────── main page ───────────── */
const Trainees = () => {
  const navigate = useNavigate();

  // list
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState({ trainees: [], total: 0, pages: 1 });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");

  // detail
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("tasks");
  const [taskFilter, setTaskFilter] = useState("all");
  const [preview, setPreview] = useState(null);

  // wait 300 ms after typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // load the trainee list
  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    setListError("");

    axios
      .get(
        `${API}/api/trainer/trainees`,
        authConfig({ params: { search: debouncedSearch, page, limit: PAGE_SIZE } })
      )
      .then(({ data }) => {
        if (!cancelled) setList(data);
      })
      .catch((err) => {
        if (!cancelled) setListError(errorText(err, "Could not load trainees."));
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, page]);

  // load the selected trainee
  useEffect(() => {
    if (!selectedId) return undefined;
    let cancelled = false;
    setDetailLoading(true);
    setDetailError("");

    axios
      .get(`${API}/api/trainer/trainees/${selectedId}`, authConfig())
      .then(({ data }) => {
        if (!cancelled) setDetail(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setDetail(null);
          setDetailError(errorText(err, "Could not load this trainee."));
        }
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, reloadKey]);

  // close the image viewer with Esc
  useEffect(() => {
    if (!preview) return undefined;
    const onKey = (e) => e.key === "Escape" && setPreview(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  const selectTrainee = (id) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setDetail(null);
    setTab("tasks");
    setTaskFilter("all");
  };

  const backToList = () => {
    setSelectedId(null);
    setDetail(null);
  };

  /* derived values for the detail panel */
  const tasks = detail?.tasks || [];
  const taskCounts = {
    all: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  };
  const visibleTasks =
    taskFilter === "all" ? tasks : tasks.filter((t) => t.status === taskFilter);

  const summary = detail?.summary;
  const progress = summary ? percent(summary.tasksCompleted, summary.tasksTotal) : 0;

  const tabs = [
    { key: "tasks", label: "Tasks", count: summary?.tasksTotal ?? 0 },
    { key: "diet", label: "Diet plans", count: summary?.dietPlans ?? 0 },
    { key: "workout", label: "Workout plans", count: summary?.workoutPlans ?? 0 },
  ];

  return (
    <div className="tm-root">
      {/* Header */}
      <header className="tm-header">
        <div className="tm-header-left">
          <div className="tm-header-icon">👥</div>
          <div>
            <h1 className="tm-title">Trainees</h1>
            <p className="tm-subtitle">
              Select a trainee to see their tasks, proof uploads, diet and workout plans
            </p>
          </div>
        </div>
        <button className="tm-back-btn" onClick={() => navigate("/TrainerDashboard")}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M10 7H4M7 4L4 7l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to dashboard
        </button>
      </header>

      <div className={`tm-layout ${selectedId ? "tm-layout--detail" : ""}`}>
        {/* ───────── Left: list ───────── */}
        <section className="tm-panel tm-list-panel">
          <div className="tm-list-top">
            <div className="tm-list-heading">
              <h2>All trainees</h2>
              <span className="tm-count">{list.total}</span>
            </div>
            <div className="tm-search">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email"
                aria-label="Search trainees"
              />
              {search && (
                <button className="tm-search-clear" onClick={() => setSearch("")} aria-label="Clear search">
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="tm-list-body">
            {listLoading && list.trainees.length === 0 ? (
              <div className="tm-center">
                <div className="tm-spinner" />
              </div>
            ) : listError ? (
              <EmptyState icon="⚠️" title="Something went wrong" text={listError} />
            ) : list.trainees.length === 0 ? (
              <EmptyState
                icon="🔍"
                title={debouncedSearch ? "No trainees found" : "No trainees yet"}
                text={
                  debouncedSearch
                    ? `Nothing matches "${debouncedSearch}".`
                    : "Trainees appear here after they sign up."
                }
              />
            ) : (
              <ul className={`tm-list ${listLoading ? "tm-list--loading" : ""}`}>
                {list.trainees.map((t) => {
                  const pct = percent(t.tasksCompleted, t.tasksTotal);
                  return (
                    <li key={t._id}>
                      <button
                        className={`tm-item ${selectedId === t._id ? "tm-item--active" : ""}`}
                        onClick={() => selectTrainee(t._id)}
                      >
                        <Avatar name={t.name} />
                        <span className="tm-item-info">
                          <span className="tm-item-name">{t.name}</span>
                          <span className="tm-item-email">{t.email}</span>
                          <span className="tm-item-progress">
                            <span className="tm-bar">
                              <span className="tm-bar-fill" style={{ width: `${pct}%` }} />
                            </span>
                            <span className="tm-item-progress-text">
                              {t.tasksCompleted}/{t.tasksTotal} tasks
                            </span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {list.pages > 1 && (
            <div className="tm-pager">
              <button
                className="tm-pager-btn"
                disabled={page <= 1 || listLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹ Prev
              </button>
              <span className="tm-pager-text">
                Page {page} of {list.pages}
              </span>
              <button
                className="tm-pager-btn"
                disabled={page >= list.pages || listLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next ›
              </button>
            </div>
          )}
        </section>

        {/* ───────── Right: detail ───────── */}
        <section className="tm-panel tm-detail-panel">
          {!selectedId ? (
            <EmptyState
              icon="👈"
              title="Select a trainee"
              text="Pick a name from the list to see their tasks, proof images and plans."
            />
          ) : detailLoading && !detail ? (
            <div className="tm-center">
              <div className="tm-spinner" />
            </div>
          ) : detailError ? (
            <div className="tm-detail-error">
              <button className="tm-mobile-back" onClick={backToList}>‹ All trainees</button>
              <EmptyState icon="⚠️" title="Something went wrong" text={detailError} />
            </div>
          ) : detail ? (
            <>
              {/* Detail header */}
              <div className="tm-detail-head">
                <button className="tm-mobile-back" onClick={backToList}>‹ All trainees</button>

                <div className="tm-person">
                  <Avatar name={detail.trainee.name} large />
                  <div className="tm-person-info">
                    <h2 className="tm-person-name">{detail.trainee.name}</h2>
                    <p className="tm-person-email">{detail.trainee.email}</p>
                  </div>
                  <button
                    className="tm-refresh"
                    onClick={() => setReloadKey((k) => k + 1)}
                    disabled={detailLoading}
                    title="Reload latest data"
                  >
                    {detailLoading ? "Refreshing…" : "↻ Refresh"}
                  </button>
                </div>

                <div className="tm-stats">
                  <div className="tm-stat">
                    <span className="tm-stat-num">
                      {summary.tasksCompleted}/{summary.tasksTotal}
                    </span>
                    <span className="tm-stat-label">Tasks completed</span>
                  </div>
                  <div className="tm-stat tm-stat--danger">
                    <span className="tm-stat-num">{summary.tasksOverdue}</span>
                    <span className="tm-stat-label">Overdue</span>
                  </div>
                  <div className="tm-stat tm-stat--green">
                    <span className="tm-stat-num">{summary.dietPlans}</span>
                    <span className="tm-stat-label">Diet plans</span>
                  </div>
                  <div className="tm-stat tm-stat--amber">
                    <span className="tm-stat-num">{summary.workoutPlans}</span>
                    <span className="tm-stat-label">Workout plans</span>
                  </div>
                </div>

                <div className="tm-progress">
                  <div className="tm-progress-row">
                    <span>Task completion</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div className="tm-bar tm-bar--lg">
                    <span className="tm-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="tm-tabs" role="tablist">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      role="tab"
                      aria-selected={tab === t.key}
                      className={`tm-tab ${tab === t.key ? "tm-tab--active" : ""}`}
                      onClick={() => setTab(t.key)}
                    >
                      {t.label}
                      <span className="tm-tab-count">{t.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail body */}
              <div className="tm-detail-body">
                {tab === "tasks" && (
                  <>
                    <div className="tm-filters">
                      {["all", "completed", "pending", "overdue"].map((f) => (
                        <button
                          key={f}
                          className={`tm-filter ${taskFilter === f ? "tm-filter--active" : ""}`}
                          onClick={() => setTaskFilter(f)}
                        >
                          {f === "all" ? "All" : STATUS_LABEL[f]} ({taskCounts[f]})
                        </button>
                      ))}
                    </div>

                    {visibleTasks.length === 0 ? (
                      <EmptyState
                        icon="📋"
                        title={tasks.length === 0 ? "No tasks assigned" : "No tasks in this filter"}
                        text={
                          tasks.length === 0
                            ? "Tasks you assign to this trainee will show up here."
                            : "Try a different filter."
                        }
                      />
                    ) : (
                      <div className="tm-task-list">
                        {visibleTasks.map((task) => (
                          <article key={task._id} className={`tm-task tm-task--${task.status}`}>
                            <div className="tm-task-head">
                              <h4 className="tm-task-title">📌 {task.title}</h4>
                              <span className={`tm-badge tm-badge--${task.status}`}>
                                {STATUS_LABEL[task.status]}
                              </span>
                            </div>

                            <p className="tm-task-desc">{task.description || "No description."}</p>

                            <div className="tm-task-meta">
                              <span>Assigned {fmtDate(task.createdAt)}</span>
                              <span>Deadline {fmtDateTime(task.deadline)}</span>
                            </div>

                            <div className="tm-proofs">
                              <p className="tm-proofs-title">
                                Proof uploads ({task.submissions.length})
                              </p>
                              {task.submissions.length === 0 ? (
                                <p className="tm-proofs-empty">No proof uploaded yet.</p>
                              ) : (
                                <div className="tm-proof-grid">
                                  {task.submissions.map((s) => (
                                    <button
                                      key={s._id}
                                      className="tm-proof"
                                      onClick={() =>
                                        setPreview({
                                          src: imageSrc(s.imageUrl),
                                          title: task.title,
                                          time: fmtDateTime(s.uploadedAt),
                                          late: s.late,
                                        })
                                      }
                                      title="Click to enlarge"
                                    >
                                      <img src={imageSrc(s.imageUrl)} alt={`Proof for ${task.title}`} loading="lazy" />
                                      <span className="tm-proof-time">{fmtDateTime(s.uploadedAt)}</span>
                                      {s.late && <span className="tm-proof-late">Late</span>}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {tab === "diet" && (
                  <PlanList
                    plans={detail.dietPlans}
                    icon="🥗"
                    emptyTitle="No diet plans yet"
                    emptyText="Diet plans you assign to this trainee will show up here."
                  />
                )}

                {tab === "workout" && (
                  <PlanList
                    plans={detail.workoutPlans}
                    icon="🏋️"
                    emptyTitle="No workout plans yet"
                    emptyText="Workout plans you assign to this trainee will show up here."
                  />
                )}
              </div>
            </>
          ) : null}
        </section>
      </div>

      {/* Image viewer */}
      {preview && (
        <div className="tm-lightbox" onClick={() => setPreview(null)} role="dialog" aria-modal="true">
          <div className="tm-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <div className="tm-lightbox-bar">
              <div className="tm-lightbox-text">
                <p className="tm-lightbox-title">{preview.title}</p>
                <p className="tm-lightbox-time">
                  Uploaded {preview.time}
                  {preview.late ? " · Late" : ""}
                </p>
              </div>
              <div className="tm-lightbox-actions">
                <a href={preview.src} target="_blank" rel="noopener noreferrer" className="tm-lightbox-link">
                  Open original
                </a>
                <button className="tm-lightbox-close" onClick={() => setPreview(null)} aria-label="Close">
                  ✕
                </button>
              </div>
            </div>
            <div className="tm-lightbox-img-wrap">
              <img src={preview.src} alt={`Proof for ${preview.title}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trainees;
