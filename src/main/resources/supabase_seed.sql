-- ============================================================
-- RecruitLens — Supabase Seed Data
-- Run this in: Supabase Dashboard → SQL Editor
--
-- HOW TO RUN:
--   Copy ONLY the block you want to run.
--   Do NOT run all at once — run each STEP separately.
--   Wait for "Success" before moving to the next step.
-- ============================================================


-- ============================================================
-- STEP 1: ORGANISATIONS  ← Run this first, alone
-- ============================================================
INSERT INTO organisation (name, industry, website, created_at, updated_at) VALUES
('TechCorp',    'Software',         'https://techcorp.com',   NOW(), NOW()),
('DataSystems', 'Data & Analytics', 'https://datasystems.io', NOW(), NOW()),
('FinanceHub',  'Fintech',          'https://financehub.com', NOW(), NOW());


-- ============================================================
-- STEP 2: USERS
-- !! DO NOT INSERT USERS VIA SQL !!
-- Passwords must be BCrypt hashed by Spring at runtime.
-- Register each user via your deployed API:
--
--   POST https://recruitlens.onrender.com/api/auth/register
--   Content-Type: application/json
--
-- Run these 5 requests in order (use Postman or curl):
--
-- 1. Admin
--    { "email": "admin@techcorp.com", "password": "Admin@123", "role": "ADMIN", "organisationId": 1 }
--
-- 2. TechCorp Recruiter
--    { "email": "recruiter@techcorp.com", "password": "Recruiter@123", "role": "RECRUITER", "organisationId": 1 }
--
-- 3. DataSystems Recruiter
--    { "email": "recruiter@datasystems.io", "password": "Recruiter@123", "role": "RECRUITER", "organisationId": 2 }
--
-- 4. Candidate John
--    { "email": "john.doe@gmail.com", "password": "Candidate@123", "role": "CANDIDATE" }
--
-- 5. Candidate Jane
--    { "email": "jane.smith@gmail.com", "password": "Candidate@123", "role": "CANDIDATE" }
--
-- After all 5 are registered, verify IDs:
--    SELECT id, email, role, organisation_id FROM users ORDER BY id;
--
-- Expected:
--   id=1  admin@techcorp.com        ADMIN      org=1
--   id=2  recruiter@techcorp.com    RECRUITER  org=1
--   id=3  recruiter@datasystems.io  RECRUITER  org=2
--   id=4  john.doe@gmail.com        CANDIDATE  org=null
--   id=5  jane.smith@gmail.com      CANDIDATE  org=null
-- ============================================================


-- ============================================================
-- STEP 3: JOB POSTINGS  (run after Step 2)
-- ============================================================
INSERT INTO job_postings (organisation_id, title, job_description, job_requirements, employment_type, job_status, location, created_at, updated_at) VALUES

(1, 'Java Backend Developer',
 'We are looking for an experienced Java backend developer to design and build scalable REST APIs using Spring Boot.',
 'Java, Spring Boot, Spring Security, PostgreSQL, REST APIs, JWT, Maven, Git, Docker',
 'FULL_TIME', 'OPEN', 'Remote', NOW(), NOW()),

(1, 'DevOps Engineer',
 'Seeking a DevOps engineer to manage CI/CD pipelines and cloud infrastructure on AWS.',
 'Docker, Kubernetes, AWS, Jenkins, Terraform, Linux, Bash scripting',
 'FULL_TIME', 'OPEN', 'Pune, India', NOW(), NOW()),

(2, 'Python Data Engineer',
 'Looking for a data engineer to build and maintain robust data pipelines with large datasets.',
 'Python, Apache Spark, AWS S3, PostgreSQL, Pandas, Airflow, SQL',
 'FULL_TIME', 'OPEN', 'Bangalore, India', NOW(), NOW()),

(2, 'Machine Learning Engineer',
 'Join our ML team to build and deploy predictive models at scale.',
 'Python, TensorFlow, Scikit-learn, Docker, REST APIs, SQL, Git',
 'CONTRACT', 'OPEN', 'Remote', NOW(), NOW()),

(3, 'React Frontend Developer',
 'We need a React developer to build responsive UIs for our fintech platform.',
 'React, TypeScript, HTML, CSS, REST APIs, Git, Jest',
 'FULL_TIME', 'CLOSED', 'Mumbai, India', NOW(), NOW());

-- Verify:
SELECT id, title, job_status, organisation_id FROM job_postings ORDER BY id;


-- ============================================================
-- STEP 4: RESUMES  (run after Step 2)
-- Uses candidate IDs: john.doe = 4, jane.smith = 5
-- If your IDs differ, update candidate_id values below.
-- Check with: SELECT id, email FROM users ORDER BY id;
-- ============================================================
INSERT INTO resumes (candidate_id, file_path, extracted_text, created_at, updated_at) VALUES

-- John's strong resume
(4, 'uploads/john_doe_resume.pdf',
'John Doe | john.doe@gmail.com | +91-9876543210
Summary: Experienced Java backend developer with 3 years of experience building REST APIs using Spring Boot and Spring Security. Strong understanding of JWT authentication, PostgreSQL, and Maven.
Skills: Java, Spring Boot, Spring Security, REST APIs, JWT, PostgreSQL, Maven, Git, Hibernate, JPA
Experience:
  - Software Engineer at StartupX (2022-2024): Built microservices, implemented JWT auth, managed PostgreSQL schemas.
  - Junior Developer at WebAgency (2021-2022): Developed CRUD APIs, integrated third-party REST services.
Education: B.Tech Computer Science, Mumbai University, 2021',
NOW(), NOW()),

-- John's weaker resume
(4, 'uploads/john_doe_resume_v2.pdf',
'John Doe | john.doe@gmail.com
Summary: Java developer with 1 year of experience. Familiar with Spring Boot basics and REST APIs.
Skills: Java, Spring Boot, REST APIs, MySQL, Git
Experience:
  - Junior Developer at WebAgency (2021-2022): Developed basic CRUD endpoints.
Education: B.Tech Computer Science, Mumbai University, 2021',
NOW(), NOW()),

-- Jane's strong resume
(5, 'uploads/jane_smith_resume.pdf',
'Jane Smith | jane.smith@gmail.com | +91-9123456789
Summary: Data engineer with 4 years of experience in Python pipelines and machine learning.
Skills: Python, Pandas, Apache Spark, TensorFlow, Scikit-learn, SQL, PostgreSQL, AWS S3, Airflow, Docker, Git
Experience:
  - Data Engineer at BigData Co (2022-2025): Built ETL pipelines with Airflow and Spark, managed AWS S3 data lakes.
  - ML Intern at AI Startup (2021-2022): Trained classification models using Scikit-learn and TensorFlow.
Education: M.Tech Data Science, IIT Bombay, 2021',
NOW(), NOW());

-- Verify:
SELECT id, candidate_id, file_path FROM resumes ORDER BY id;


-- ============================================================
-- STEP 5: SCREENING RESULTS  (pre-seeded AI evaluations)
-- resume_id 1 = john strong, 2 = john weak, 3 = jane
-- job_posting_id 1 = Java Backend, 2 = DevOps, 3 = Data Engineer, 4 = ML Engineer
-- ============================================================
INSERT INTO screening_results (resume_id, job_posting_id, screening_status, match_score, matched_skills, missing_skills, summary, created_at, updated_at) VALUES

-- John (strong) vs Java Backend → excellent match
(1, 1, 'COMPLETED', 88,
 'Java, Spring Boot, Spring Security, PostgreSQL, REST APIs, JWT, Maven, Git',
 'Docker',
 'Strong candidate with solid Java backend experience. Covers almost all required skills. Missing only Docker experience.',
 NOW(), NOW()),

-- John (strong) vs DevOps → poor match
(1, 2, 'COMPLETED', 22,
 'Git',
 'Docker, Kubernetes, AWS, Jenkins, Terraform, Linux, Bash scripting',
 'Candidate has strong Java skills but lacks DevOps tooling entirely. Only Git is a shared skill. Not recommended for this role.',
 NOW(), NOW()),

-- John (weak) vs Java Backend → partial match
(2, 1, 'COMPLETED', 55,
 'Java, Spring Boot, REST APIs, Git',
 'Spring Security, PostgreSQL, JWT, Maven, Docker',
 'Foundational Java knowledge present but lacks advanced skills. Suitable for junior-level consideration only.',
 NOW(), NOW()),

-- Jane vs Data Engineer → excellent match
(3, 3, 'COMPLETED', 95,
 'Python, Apache Spark, PostgreSQL, Pandas, Airflow, SQL, AWS S3, Docker',
 'None — all core requirements matched',
 'Excellent candidate. Matches all core data engineering requirements with strong hands-on experience. Highly recommended.',
 NOW(), NOW()),

-- Jane vs ML Engineer → strong match
(3, 4, 'COMPLETED', 80,
 'Python, TensorFlow, Scikit-learn, Docker, SQL, Git',
 'REST APIs for model serving',
 'Very strong ML background. Slightly limited on model deployment via REST APIs but otherwise an excellent fit.',
 NOW(), NOW()),

-- Jane vs Java Backend → failed (AI error simulation)
(3, 1, 'FAILED', NULL, NULL, NULL, NULL, NOW(), NOW());


-- ============================================================
-- FINAL VERIFY — Expected counts: 3 | 5 | 5 | 3 | 6
-- ============================================================
SELECT 'organisation'      AS table_name, COUNT(*) AS row_count FROM organisation
UNION ALL
SELECT 'users',             COUNT(*) FROM users
UNION ALL
SELECT 'job_postings',      COUNT(*) FROM job_postings
UNION ALL
SELECT 'resumes',           COUNT(*) FROM resumes
UNION ALL
SELECT 'screening_results', COUNT(*) FROM screening_results;


