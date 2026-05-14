const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readDB, writeDB } = require("../db");
const { authMiddleware, optionalAuth } = require("../middleware");

const router = express.Router();

const LOGO_COLORS = ["#1e40af", "#7c3aed", "#0f766e", "#b45309", "#dc2626", "#0369a1", "#15803d"];
const logoFromTitle = (t) =>
  t.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "JB";

// GET /api/jobs — list all jobs (with optional filters)
router.get("/", optionalAuth, (req, res) => {
  const db = readDB();
  let { search, category, type, sort } = req.query;

  let jobs = db.jobs;

  if (search) {
    const q = search.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q)
    );
  }
  if (category && category !== "All") {
    jobs = jobs.filter((j) => j.category === category);
  }
  if (type && type !== "All") {
    jobs = jobs.filter((j) => j.type === type);
  }

  jobs = [...jobs].sort((a, b) =>
    sort === "popular"
      ? b.applicants.length - a.applicants.length
      : new Date(b.postedDate) - new Date(a.postedDate)
  );

  res.json(jobs);
});

// GET /api/jobs/:id — single job
router.get("/:id", optionalAuth, (req, res) => {
  const db = readDB();
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// POST /api/jobs — create job (employer only)
router.post("/", authMiddleware, (req, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ error: "Only employers can post jobs" });
  }
  const { title, company, location, type, salary, category, description, requirements } = req.body;
  if (!title || !company || !location || !salary || !description) {
    return res.status(400).json({ error: "Please fill all required fields" });
  }

  const db = readDB();
  const newJob = {
    id: uuidv4(),
    title,
    company,
    location,
    type: type || "Full-time",
    salary,
    category: category || "Engineering",
    description,
    requirements: Array.isArray(requirements)
      ? requirements
      : (requirements || "").split(",").map((r) => r.trim()).filter(Boolean),
    employerId: req.user.id,
    applicants: [],
    postedDate: new Date().toISOString().split("T")[0],
    featured: false,
    logo: logoFromTitle(title),
    logoColor: LOGO_COLORS[Math.floor(Math.random() * LOGO_COLORS.length)],
  };
  db.jobs.push(newJob);
  writeDB(db);
  res.status(201).json(newJob);
});

// PUT /api/jobs/:id — update job (employer only, must own it)
router.put("/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ error: "Only employers can edit jobs" });
  }
  const db = readDB();
  const idx = db.jobs.findIndex((j) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Job not found" });
  if (db.jobs[idx].employerId !== req.user.id) {
    return res.status(403).json({ error: "You don't own this job" });
  }

  const { title, company, location, type, salary, category, description, requirements } = req.body;
  db.jobs[idx] = {
    ...db.jobs[idx],
    ...(title && { title }),
    ...(company && { company }),
    ...(location && { location }),
    ...(type && { type }),
    ...(salary && { salary }),
    ...(category && { category }),
    ...(description && { description }),
    ...(requirements !== undefined && {
      requirements: Array.isArray(requirements)
        ? requirements
        : requirements.split(",").map((r) => r.trim()).filter(Boolean),
    }),
  };
  writeDB(db);
  res.json(db.jobs[idx]);
});

// DELETE /api/jobs/:id — delete job (employer only, must own it)
router.delete("/:id", authMiddleware, (req, res) => {
  if (req.user.role !== "employer") {
    return res.status(403).json({ error: "Only employers can delete jobs" });
  }
  const db = readDB();
  const job = db.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.employerId !== req.user.id) {
    return res.status(403).json({ error: "You don't own this job" });
  }

  db.jobs = db.jobs.filter((j) => j.id !== req.params.id);
  writeDB(db);
  res.json({ message: "Job deleted" });
});

// POST /api/jobs/:id/apply — candidate applies
router.post("/:id/apply", authMiddleware, (req, res) => {
  if (req.user.role !== "candidate") {
    return res.status(403).json({ error: "Only candidates can apply" });
  }
  const db = readDB();
  const jobIdx = db.jobs.findIndex((j) => j.id === req.params.id);
  if (jobIdx === -1) return res.status(404).json({ error: "Job not found" });

  const alreadyApplied = db.jobs[jobIdx].applicants.some((a) => a.userId === req.user.id);
  if (alreadyApplied) return res.status(409).json({ error: "Already applied to this job" });

  db.jobs[jobIdx].applicants.push({
    userId: req.user.id,
    name: req.user.name,
    email: req.user.email,
    appliedDate: new Date().toISOString().split("T")[0],
  });

  const userIdx = db.users.findIndex((u) => u.id === req.user.id);
  if (userIdx !== -1) {
    db.users[userIdx].appliedJobs = db.users[userIdx].appliedJobs || [];
    db.users[userIdx].appliedJobs.push(req.params.id);
  }

  writeDB(db);
  res.json({ message: "Application submitted!", job: db.jobs[jobIdx] });
});

// POST /api/jobs/:id/save — candidate saves/unsaves
router.post("/:id/save", authMiddleware, (req, res) => {
  const db = readDB();
  const userIdx = db.users.findIndex((u) => u.id === req.user.id);
  if (userIdx === -1) return res.status(404).json({ error: "User not found" });

  const saved = db.users[userIdx].savedJobs || [];
  if (saved.includes(req.params.id)) {
    db.users[userIdx].savedJobs = saved.filter((id) => id !== req.params.id);
    writeDB(db);
    return res.json({ saved: false, message: "Job removed from saved" });
  } else {
    db.users[userIdx].savedJobs = [...saved, req.params.id];
    writeDB(db);
    return res.json({ saved: true, message: "Job saved!" });
  }
});

module.exports = router;
