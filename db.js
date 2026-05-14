const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "db.json");

const DEFAULT_DB = {
  users: [],
  jobs: [
    {
      id: "job-1",
      title: "Senior Frontend Developer",
      company: "TechCorp India",
      location: "Hyderabad, TS",
      type: "Full-time",
      salary: "₹18–25 LPA",
      category: "Engineering",
      logo: "TC",
      logoColor: "#1e40af",
      description: "We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and modern web technologies. You'll lead UI architecture and mentor junior devs.",
      requirements: ["5+ years React", "TypeScript proficiency", "GraphQL knowledge", "Team leadership"],
      employerId: "seed",
      applicants: [],
      postedDate: "2025-05-10",
      featured: true
    },
    {
      id: "job-2",
      title: "Product Designer",
      company: "DesignStudio",
      location: "Bengaluru, KA",
      type: "Full-time",
      salary: "₹12–18 LPA",
      category: "Design",
      logo: "DS",
      logoColor: "#7c3aed",
      description: "Join our world-class design team to craft beautiful, user-centric product experiences. You'll work closely with PMs and engineers across the full product lifecycle.",
      requirements: ["Figma expert", "3+ years UI/UX", "Design systems", "User research"],
      employerId: "seed",
      applicants: [],
      postedDate: "2025-05-08",
      featured: true
    },
    {
      id: "job-3",
      title: "Data Scientist",
      company: "AnalyticsPro",
      location: "Mumbai, MH",
      type: "Remote",
      salary: "₹20–30 LPA",
      category: "Data",
      logo: "AP",
      logoColor: "#0f766e",
      description: "Drive data-driven decisions at scale. You'll build ML models, conduct experiments, and translate insights into product improvements.",
      requirements: ["Python & ML", "SQL proficiency", "Statistics background", "Communication skills"],
      employerId: "seed",
      applicants: [],
      postedDate: "2025-05-05",
      featured: true
    },
    {
      id: "job-4",
      title: "DevOps Engineer",
      company: "CloudBase",
      location: "Pune, MH",
      type: "Hybrid",
      salary: "₹15–22 LPA",
      category: "Engineering",
      logo: "CB",
      logoColor: "#b45309",
      description: "Own our cloud infrastructure, CI/CD pipelines, and reliability systems. You'll work with Kubernetes, AWS, and modern IaC tools.",
      requirements: ["AWS/GCP", "Kubernetes", "Terraform", "CI/CD pipelines"],
      employerId: "seed",
      applicants: [],
      postedDate: "2025-05-01",
      featured: false
    },
    {
      id: "job-5",
      title: "Marketing Manager",
      company: "GrowthLab",
      location: "Delhi, DL",
      type: "Full-time",
      salary: "₹10–16 LPA",
      category: "Marketing",
      logo: "GL",
      logoColor: "#dc2626",
      description: "Lead growth initiatives, brand campaigns, and performance marketing across channels. You'll own the full funnel from awareness to conversion.",
      requirements: ["SEO/SEM", "Campaign analytics", "Content strategy", "Budget management"],
      employerId: "seed",
      applicants: [],
      postedDate: "2025-04-28",
      featured: false
    },
    {
      id: "job-6",
      title: "Backend Engineer",
      company: "TechCorp India",
      location: "Hyderabad, TS",
      type: "Full-time",
      salary: "₹14–20 LPA",
      category: "Engineering",
      logo: "TC",
      logoColor: "#1e40af",
      description: "Build scalable backend systems powering millions of users. Experience with Node.js, PostgreSQL, and distributed systems is a must.",
      requirements: ["Node.js / Go", "PostgreSQL", "REST & GraphQL APIs", "Microservices"],
      employerId: "seed",
      applicants: [],
      postedDate: "2025-04-25",
      featured: false
    }
  ]
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
    return DEFAULT_DB;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
