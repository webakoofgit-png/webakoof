-- Additive, idempotent; no existing project JSON, URLs, media or publication state is changed.
-- The persistent Node worker also creates this table on first use when it has CREATE permission.
CREATE TABLE IF NOT EXISTS portfolio_website_checks (
 project_id INT UNSIGNED PRIMARY KEY,
 url VARCHAR(1000) NOT NULL,
 state ENUM('unknown','healthy','unavailable') NOT NULL DEFAULT 'unknown',
 failures INT UNSIGNED NOT NULL DEFAULT 0,
 successes INT UNSIGNED NOT NULL DEFAULT 0,
 last_checked_at DATETIME(3) NULL,
 next_check_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 changed_at DATETIME(3) NULL,
 lease_until DATETIME(3) NULL,
 lease_token VARCHAR(36) NULL,
 http_status SMALLINT UNSIGNED NULL,
 last_result TEXT NOT NULL,
 FOREIGN KEY(project_id) REFERENCES portfolio_projects(id) ON DELETE CASCADE
);
