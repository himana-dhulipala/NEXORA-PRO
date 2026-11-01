
import { useEffect, useState } from "react";
import "./App.css";

const initialProjects = [
  {
    id: 1,
    title: "NEXORA Portfolio",
    category: "Web Development",
    description: "A modern portfolio management platform with admin and user modules.",
    tech: "React, JavaScript, CSS",
    status: "Completed",
  },
  {
    id: 2,
    title: "SUREKSHA CONNECT",
    category: "Social Impact",
    description: "A disaster management and community safety platform.",
    tech: "HTML, CSS, JavaScript",
    status: "In Progress",
  },
  {
    id: 3,
    title: "Student Portal",
    category: "Web Development",
    description: "A student dashboard for managing academic information and courses.",
    tech: "React, JavaScript",
    status: "Completed",
  },
  {
    id: 4,
    title: "Bank Management System",
    category: "Programming",
    description: "A programming project demonstrating basic banking operations.",
    tech: "C",
    status: "Completed",
  },
];

const initialProfile = {
  name: "Himana Dhulipala",
  role: "Computer Science Engineering Student",
  university: "KL University, Vijayawada",
  degree: "B.Tech · Computer Science and Engineering",
  year: "Second Year",
  bio: "Aspiring software developer interested in building meaningful digital experiences through technology.",
  email: "himana@example.com",
  location: "Vijayawada, India",
  github: "",
  linkedin: "",
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(() =>
    readStorage("nexora_session", null)
  );
  const [users, setUsers] = useState(() =>
    readStorage("nexora_users", [])
  );
  const [projects, setProjects] = useState(() =>
    readStorage("nexora_projects", initialProjects)
  );
  const [profile, setProfile] = useState(() =>
    readStorage("nexora_profile", initialProfile)
  );
  const [messages, setMessages] = useState(() =>
    readStorage("nexora_messages", [])
  );
  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("nexora_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("nexora_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("nexora_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("nexora_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("nexora_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("nexora_session");
    }
  }, [user]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function navigate(destination) {
    setPage(destination);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function login(email, password) {
    if (
      email.trim().toLowerCase() === "admin@nexora.com" &&
      password === "Admin@123"
    ) {
      setUser({ name: "NEXORA Administrator", email, role: "admin" });
      navigate("admin");
      notify("Welcome back, Administrator!");
      return true;
    }

    const account = users.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.password === password
    );

    if (!account) {
      notify("Invalid email or password.");
      return false;
    }

    setUser({
      name: account.name,
      email: account.email,
      role: "user",
    });
    navigate("user");
    notify("Login successful. Welcome to NEXORA!");
    return true;
  }

  function signup(name, email, password) {
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanEmail || password.length < 6) {
      notify("Complete all fields. Password must have 6 characters.");
      return false;
    }

    if (
      cleanEmail === "admin@nexora.com" ||
      users.some((item) => item.email.toLowerCase() === cleanEmail)
    ) {
      notify("This email is already registered.");
      return false;
    }

    const newAccount = {
      id: Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password,
      role: "user",
    };

    setUsers((previous) => [...previous, newAccount]);
    setUser({
      name: newAccount.name,
      email: newAccount.email,
      role: "user",
    });
    navigate("user");
    notify("Your NEXORA account has been created!");
    return true;
  }

  function logout() {
    setUser(null);
    navigate("home");
    notify("You have been logged out.");
  }

  function addProject(project) {
    setProjects((previous) => [
      { ...project, id: Date.now() },
      ...previous,
    ]);
    notify("Project added successfully.");
  }

  function deleteProject(id) {
    setProjects((previous) => previous.filter((item) => item.id !== id));
    notify("Project deleted.");
  }

  function sendMessage(message) {
    setMessages((previous) => [
      { ...message, id: Date.now(), date: new Date().toLocaleString() },
      ...previous,
    ]);
    notify("Your message has been sent!");
  }

  return (
    <div className="app-shell">
      <Navbar
        page={page}
        user={user}
        navigate={navigate}
        logout={logout}
      />

      {page === "home" && (
        <Home
          profile={profile}
          projects={projects}
          navigate={navigate}
          sendMessage={sendMessage}
        />
      )}

      {page === "login" && (
        <AuthPage
          mode="login"
          navigate={navigate}
          login={login}
        />
      )}

      {page === "signup" && (
        <AuthPage
          mode="signup"
          navigate={navigate}
          signup={signup}
        />
      )}

      {page === "user" && user?.role === "user" && (
        <UserDashboard
          user={user}
          profile={profile}
          setProfile={setProfile}
          projects={projects}
          navigate={navigate}
          logout={logout}
        />
      )}

      {page === "admin" && user?.role === "admin" && (
        <AdminDashboard
          users={users}
          projects={projects}
          messages={messages}
          addProject={addProject}
          deleteProject={deleteProject}
          profile={profile}
          setProfile={setProfile}
          logout={logout}
        />
      )}

      {(page === "user" || page === "admin") && !user && (
        <AuthRequired navigate={navigate} />
      )}

      {page === "admin" && user?.role !== "admin" && user && (
        <AuthRequired navigate={navigate} />
      )}

      <Footer navigate={navigate} />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Navbar({ page, user, navigate, logout }) {
  return (
    <header className="navbar">
      <button className="brand" onClick={() => navigate("home")}>
        <span className="brand-symbol">N</span>
        <span>NEXORA<span className="brand-dot">.</span></span>
      </button>

      <nav className="nav-links">
        <button onClick={() => navigate("home")}>Home</button>
        <a href="#about" onClick={() => navigate("home")}>About</a>
        <a href="#projects" onClick={() => navigate("home")}>Projects</a>
        <a href="#contact" onClick={() => navigate("home")}>Contact</a>
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <button
              className="nav-dashboard"
              onClick={() => navigate(user.role === "admin" ? "admin" : "user")}
            >
              Dashboard
            </button>
            <button className="nav-login" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <button className="nav-login" onClick={() => navigate("login")}>
              Log in
            </button>
            <button className="primary-btn nav-cta" onClick={() => navigate("signup")}>
              Get Started <span>↗</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function Home({ profile, projects, navigate, sendMessage }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [filter, setFilter] = useState("All");

  const categories = ["All", ...new Set(projects.map((item) => item.category))];
  const visibleProjects = filter === "All"
    ? projects
    : projects.filter((item) => item.category === filter);

  function handleContact(event) {
    event.preventDefault();
    sendMessage(form);
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <main>
      <section className="hero section-container">
        <div className="hero-content">
          <div className="availability">
            <span className="availability-dot" />
            OPEN TO OPPORTUNITIES
          </div>

          <p className="eyebrow">HELLO, I'M {profile.name.toUpperCase()}</p>

          <h1>
            Building ideas
            <br />
            into <span className="gradient-text">digital reality.</span>
          </h1>

          <p className="hero-description">
            {profile.bio} I enjoy exploring technology, solving problems
            and creating experiences that make a difference.
          </p>

          <div className="hero-buttons">
            <a href="#projects" className="primary-btn">
              Explore my work <span>↗</span>
            </a>
            <a href="#contact" className="secondary-btn">
              Let's connect <span>→</span>
            </a>
          </div>

          <div className="hero-social">
            <span>BASED IN {profile.location.toUpperCase()}</span>
            <span className="social-divider" />
            <span>COMPUTER SCIENCE & ENGINEERING</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-glow" />
          <div className="profile-card">
            <div className="profile-card-top">
              <span>PORTFOLIO / 2026</span>
              <span className="live-indicator">● LIVE</span>
            </div>
            <div className="profile-avatar">H</div>
            <h2>{profile.name}</h2>
            <p>{profile.role}</p>
            <div className="profile-card-line" />
            <div className="profile-stats">
              <div><strong>{projects.length.toString().padStart(2, "0")}</strong><span>PROJECTS</span></div>
              <div><strong>06</strong><span>INTERESTS</span></div>
              <div><strong>02</strong><span>YEAR</span></div>
            </div>
            <div className="card-watermark">N.</div>
          </div>
          <div className="floating-tag tag-top">✦ Creative thinking</div>
          <div className="floating-tag tag-bottom">⌘ Developer mindset</div>
        </div>
      </section>

      <section className="tech-strip">
        <div className="section-container tech-strip-inner">
          <span>EXPLORING TECHNOLOGY</span>
          <strong>JavaScript</strong>
          <strong>React</strong>
          <strong>Python</strong>
          <strong>Java</strong>
          <strong>HTML / CSS</strong>
        </div>
      </section>

      <section className="about-section section-container" id="about">
        <div className="section-heading">
          <div><span className="eyebrow">01 / ABOUT ME</span><h2>A little about <span>my journey.</span></h2></div>
          <p>Curiosity drives innovation. I'm learning, building and growing one project at a time.</p>
        </div>

        <div className="about-grid">
          <article className="about-main glass-card">
            <span className="card-icon">✳</span>
            <h3>Technology with purpose.</h3>
            <p>{profile.bio}</p>
            <p>My goal is to develop practical solutions, strengthen my technical foundation and turn creative ideas into useful products.</p>
          </article>

          <article className="about-detail glass-card">
            <span className="detail-label">EDUCATION</span>
            <h3>{profile.degree}</h3>
            <p>{profile.university}</p>
            <span className="detail-tag">{profile.year}</span>
          </article>

          <article className="about-detail glass-card">
            <span className="detail-label">CURRENT FOCUS</span>
            <h3>Learning by building.</h3>
            <p>Web development · AI/ML · Programming · Problem solving</p>
            <span className="detail-tag">ALWAYS LEARNING</span>
          </article>
        </div>
      </section>

      <section className="projects-section section-container" id="projects">
        <div className="section-heading">
          <div><span className="eyebrow">02 / SELECTED WORK</span><h2>Things I've <span>created.</span></h2></div>
          <span className="project-count">{projects.length} PROJECTS</span>
        </div>

        <div className="filter-row">
          {categories.map((category) => (
            <button
              key={category}
              className={filter === category ? "filter-btn active" : "filter-btn"}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {visibleProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </section>

      <section className="contact-section section-container" id="contact">
        <div className="contact-copy">
          <span className="eyebrow">03 / GET IN TOUCH</span>
          <h2>Have an idea?<br /><span>Let's talk.</span></h2>
          <p>Have a question, an opportunity or an interesting project in mind? Send me a message.</p>
          <div className="contact-note">✦ Always open to learning and collaboration.</div>
        </div>

        <form className="contact-form glass-card" onSubmit={handleContact}>
          <label>Your name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your name" /></label>
          <label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
          <label>Your message<textarea required rows="4" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell me what's on your mind..." /></label>
          <button className="primary-btn" type="submit">Send message <span>↗</span></button>
        </form>
      </section>
    </main>
  );
}

function ProjectCard({ project, index }) {
  return (
    <article className="project-card">
      <div className={`project-art art-${index % 4}`}>
        <span className="project-art-mark">N<span>.</span></span>
        <span className="project-art-number">0{index + 1}</span>
        <span className="project-art-category">{project.category}</span>
      </div>
      <div className="project-card-body">
        <div className="project-card-heading">
          <h3>{project.title}</h3>
          <span>↗</span>
        </div>
        <p>{project.description}</p>
        <div className="project-meta">
          <span>{project.tech}</span>
          <span className="status-label">{project.status}</span>
        </div>
      </div>
    </article>
  );
}

function AuthPage({ mode, navigate, login, signup }) {
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit(event) {
    event.preventDefault();
    if (isLogin) login(email, password);
    else signup(name, email, password);
  }

  return (
    <main className="auth-page">
      <div className="auth-decoration">
        <div className="auth-orb" />
        <span className="auth-big-n">N.</span>
        <p>YOUR IDEAS.<br />YOUR WORK.<br /><span>YOUR SPACE.</span></p>
        <small>BUILD YOUR DIGITAL PRESENCE WITH NEXORA.</small>
      </div>

      <div className="auth-panel">
        <span className="eyebrow">{isLogin ? "WELCOME BACK" : "START YOUR JOURNEY"}</span>
        <h1>{isLogin ? "Sign in to NEXORA." : "Create your account."}</h1>
        <p>{isLogin ? "Your workspace is waiting for you." : "Create your account and start exploring."}</p>

        <form onSubmit={submit} className="auth-form">
          {!isLogin && <label>Full name<input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" /></label>}
          <label>Email address<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input required type="password" minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
          <button className="primary-btn auth-submit" type="submit">{isLogin ? "Sign in" : "Create account"} <span>→</span></button>
        </form>

        {isLogin && (
          <div className="admin-hint">
            <strong>Admin demo access</strong>
            <span>Email: admin@nexora.com</span>
            <span>Password: Admin@123</span>
          </div>
        )}

        <p className="auth-switch">
          {isLogin ? "New to NEXORA?" : "Already have an account?"}
          <button onClick={() => navigate(isLogin ? "signup" : "login")}>
            {isLogin ? " Create account" : " Sign in"}
          </button>
        </p>
        <button className="back-home" onClick={() => navigate("home")}>← Back to portfolio</button>
      </div>
    </main>
  );
}

function UserDashboard({ user, profile, setProfile, projects, navigate, logout }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  function saveProfile(event) {
    event.preventDefault();
    setProfile(draft);
    setEditing(false);
  }

  return (
    <main className="dashboard-page">
      <DashboardHeader title="Your workspace" subtitle={`Welcome back, ${user.name}.`} logout={logout} />

      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <span className="sidebar-label">WORKSPACE</span>
          <button className="sidebar-link selected">▦ Overview</button>
          <button className="sidebar-link" onClick={() => navigate("home")}>◈ View portfolio</button>
          <button className="sidebar-link" onClick={() => setEditing(true)}>✎ Edit profile</button>
          <button className="sidebar-link" onClick={logout}>↪ Sign out</button>
        </aside>

        <section className="dashboard-content">
          <div className="dashboard-welcome">
            <div><span className="eyebrow">USER DASHBOARD</span><h2>Your creative space.</h2><p>Manage your profile and explore your portfolio.</p></div>
            <div className="dashboard-avatar">{user.name.charAt(0).toUpperCase()}</div>
          </div>

          <div className="stats-grid">
            <StatCard label="PORTFOLIO PROJECTS" value={projects.length} icon="◈" />
            <StatCard label="ACCOUNT STATUS" value="Active" icon="✓" />
            <StatCard label="ACCOUNT TYPE" value="User" icon="◎" />
          </div>

          <div className="dashboard-panel">
            <div className="panel-heading"><div><span className="eyebrow">PROFILE MANAGEMENT</span><h3>Personal information</h3></div><button className="small-action" onClick={() => { setDraft(profile); setEditing(!editing); }}>{editing ? "Cancel" : "Edit profile"}</button></div>

            {editing ? (
              <form className="profile-edit-form" onSubmit={saveProfile}>
                <label>Full name<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required /></label>
                <label>Role<input value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} /></label>
                <label>Email<input value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label>
                <label>About you<textarea rows="3" value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} /></label>
                <label>GitHub URL<input value={draft.github} onChange={(e) => setDraft({ ...draft, github: e.target.value })} /></label>
                <label>LinkedIn URL<input value={draft.linkedin} onChange={(e) => setDraft({ ...draft, linkedin: e.target.value })} /></label>
                <button className="primary-btn" type="submit">Save changes</button>
              </form>
            ) : (
              <div className="profile-information">
                <p><span>Name</span>{profile.name}</p>
                <p><span>Email</span>{user.email}</p>
                <p><span>Role</span>{profile.role}</p>
                <p><span>Institution</span>{profile.university}</p>
                <p><span>Academic level</span>{profile.year}</p>
                <p><span>About</span>{profile.bio}</p>
              </div>
            )}
          </div>

          <div className="dashboard-panel">
            <div className="panel-heading"><div><span className="eyebrow">PORTFOLIO</span><h3>Featured projects</h3></div><button className="small-action" onClick={() => navigate("home")}>View all ↗</button></div>
            <div className="mini-project-list">
              {projects.slice(0, 4).map((project) => <div className="mini-project" key={project.id}><div><strong>{project.title}</strong><span>{project.category}</span></div><span className="status-label">{project.status}</span></div>)}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminDashboard({ users, projects, messages, addProject, deleteProject, profile, setProfile, logout }) {
  const [tab, setTab] = useState("overview");
  const [projectForm, setProjectForm] = useState({ title: "", category: "Web Development", description: "", tech: "", status: "Completed" });
  const [profileDraft, setProfileDraft] = useState(profile);

  function submitProject(event) {
    event.preventDefault();
    if (!projectForm.title.trim()) return;
    addProject(projectForm);
    setProjectForm({ title: "", category: "Web Development", description: "", tech: "", status: "Completed" });
    setTab("projects");
  }

  function saveAdminProfile(event) {
    event.preventDefault();
    setProfile(profileDraft);
    alert("Portfolio profile updated successfully.");
  }

  return (
    <main className="dashboard-page">
      <DashboardHeader title="Admin control center" subtitle="Manage your NEXORA portfolio platform." logout={logout} />

      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <span className="sidebar-label">ADMINISTRATION</span>
          {[
            ["overview", "▦ Overview"],
            ["projects", "◈ Projects"],
            ["add", "+ Add project"],
            ["users", "◎ Users"],
            ["messages", "✉ Messages"],
            ["settings", "⚙ Portfolio settings"],
          ].map(([id, label]) => (
            <button key={id} className={`sidebar-link ${tab === id ? "selected" : ""}`} onClick={() => setTab(id)}>{label}</button>
          ))}
          <button className="sidebar-link" onClick={logout}>↪ Sign out</button>
        </aside>

        <section className="dashboard-content">
          {tab === "overview" && (
            <>
              <div className="dashboard-welcome"><div><span className="eyebrow">SYSTEM OVERVIEW</span><h2>Good to have you back.</h2><p>Here is what's happening across your platform.</p></div><div className="dashboard-avatar">N</div></div>
              <div className="stats-grid">
                <StatCard label="REGISTERED USERS" value={users.length} icon="◎" />
                <StatCard label="TOTAL PROJECTS" value={projects.length} icon="◈" />
                <StatCard label="CONTACT MESSAGES" value={messages.length} icon="✉" />
              </div>
              <div className="dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">QUICK ACTIONS</span><h3>Manage your platform</h3></div></div><div className="quick-actions"><button onClick={() => setTab("add")}>＋ Add a project</button><button onClick={() => setTab("users")}>◎ View users</button><button onClick={() => setTab("messages")}>✉ View messages</button><button onClick={() => setTab("settings")}>⚙ Edit portfolio</button></div></div>
              <div className="dashboard-panel"><div className="panel-heading"><div><span className="eyebrow">RECENT WORK</span><h3>Latest projects</h3></div><button className="small-action" onClick={() => setTab("projects")}>Manage all ↗</button></div><ProjectTable projects={projects.slice(0, 5)} deleteProject={deleteProject} /></div>
            </>
          )}

          {tab === "projects" && (
            <div className="dashboard-panel">
              <div className="panel-heading"><div><span className="eyebrow">CONTENT MANAGEMENT</span><h3>Project library</h3><p>Manage the projects displayed on your portfolio.</p></div><button className="small-action" onClick={() => setTab("add")}>＋ Add project</button></div>
              <ProjectTable projects={projects} deleteProject={deleteProject} />
            </div>
          )}

          {tab === "add" && (
            <div className="dashboard-panel">
              <div className="panel-heading"><div><span className="eyebrow">NEW CONTENT</span><h3>Add a project</h3><p>Create a new portfolio entry.</p></div></div>
              <form className="profile-edit-form" onSubmit={submitProject}>
                <label>Project title<input required value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} placeholder="Enter project name" /></label>
                <label>Category<select value={projectForm.category} onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}><option>Web Development</option><option>Programming</option><option>AI / Machine Learning</option><option>Social Impact</option><option>Other</option></select></label>
                <label>Description<textarea required rows="3" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="Describe your project" /></label>
                <label>Technologies<input value={projectForm.tech} onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })} placeholder="React, JavaScript, CSS" /></label>
                <label>Status<select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}><option>Completed</option><option>In Progress</option></select></label>
                <button className="primary-btn" type="submit">Publish project ↗</button>
              </form>
            </div>
          )}

          {tab === "users" && (
            <div className="dashboard-panel">
              <div className="panel-heading"><div><span className="eyebrow">ACCOUNT MANAGEMENT</span><h3>Registered users</h3></div><span className="project-count">{users.length} USERS</span></div>
              {users.length === 0 ? <EmptyState text="No registered users yet. New signups will appear here." /> : users.map((item) => <div className="mini-project" key={item.id}><div><strong>{item.name}</strong><span>{item.email}</span></div><span className="status-label">USER</span></div>)}
            </div>
          )}

          {tab === "messages" && (
            <div className="dashboard-panel">
              <div className="panel-heading"><div><span className="eyebrow">INBOX</span><h3>Contact messages</h3></div><span className="project-count">{messages.length} MESSAGES</span></div>
              {messages.length === 0 ? <EmptyState text="Your inbox is empty. Messages sent through the portfolio contact form will appear here." /> : messages.map((item) => <article className="message-card" key={item.id}><div><strong>{item.name}</strong><span>{item.email} · {item.date}</span></div><p>{item.message}</p></article>)}
            </div>
          )}

          {tab === "settings" && (
            <div className="dashboard-panel">
              <div className="panel-heading"><div><span className="eyebrow">PORTFOLIO CONFIGURATION</span><h3>Portfolio settings</h3><p>Update the information shown on your public portfolio.</p></div></div>
              <form className="profile-edit-form" onSubmit={saveAdminProfile}>
                <label>Display name<input value={profileDraft.name} onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })} /></label>
                <label>Professional role<input value={profileDraft.role} onChange={(e) => setProfileDraft({ ...profileDraft, role: e.target.value })} /></label>
                <label>University<input value={profileDraft.university} onChange={(e) => setProfileDraft({ ...profileDraft, university: e.target.value })} /></label>
                <label>Degree<input value={profileDraft.degree} onChange={(e) => setProfileDraft({ ...profileDraft, degree: e.target.value })} /></label>
                <label>Academic year<input value={profileDraft.year} onChange={(e) => setProfileDraft({ ...profileDraft, year: e.target.value })} /></label>
                <label>About<textarea rows="4" value={profileDraft.bio} onChange={(e) => setProfileDraft({ ...profileDraft, bio: e.target.value })} /></label>
                <label>Location<input value={profileDraft.location} onChange={(e) => setProfileDraft({ ...profileDraft, location: e.target.value })} /></label>
                <button className="primary-btn" type="submit">Save portfolio settings</button>
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function ProjectTable({ projects, deleteProject }) {
  if (!projects.length) return <EmptyState text="No projects have been added yet." />;
  return (
    <div className="project-table">
      {projects.map((project) => (
        <div className="project-table-row" key={project.id}>
          <div><strong>{project.title}</strong><span>{project.category} · {project.tech}</span></div>
          <span className="status-label">{project.status}</span>
          <button className="delete-btn" onClick={() => { if (window.confirm(`Delete ${project.title}?`)) deleteProject(project.id); }}>Delete</button>
        </div>
      ))}
    </div>
  );
}

function DashboardHeader({ title, subtitle, logout }) {
  return (
    <div className="dashboard-topbar">
      <div><span className="eyebrow">NEXORA / WORKSPACE</span><h1>{title}</h1><p>{subtitle}</p></div>
      <button className="nav-login" onClick={logout}>Logout ↗</button>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return <article className="stat-card"><div><span>{label}</span><strong>{value}</strong></div><span className="stat-icon">{icon}</span></article>;
}

function EmptyState({ text }) {
  return <div className="empty-state"><span>◈</span><p>{text}</p></div>;
}

function AuthRequired({ navigate }) {
  return <main className="auth-required"><h2>Access your workspace</h2><p>Please sign in to continue.</p><button className="primary-btn" onClick={() => navigate("login")}>Go to login →</button></main>;
}

function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <button className="brand" onClick={() => navigate("home")}><span className="brand-symbol">N</span><span>NEXORA<span className="brand-dot">.</span></span></button>
        <p>Designed with purpose. Built with curiosity.</p>
        <span>© 2026 NEXORA · ALL RIGHTS RESERVED</span>
      </div>
    </footer>
  );
}
