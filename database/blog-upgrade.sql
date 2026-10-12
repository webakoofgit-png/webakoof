-- Run once before deploying the new blog code. Re-running is safe.
SET time_zone = '+00:00';
SET @blog_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='blog_posts' AND column_name='published_at');
SET @blog_ddl = IF(@blog_column_exists=0, 'ALTER TABLE blog_posts ADD COLUMN published_at DATETIME NULL', 'SELECT 1');
PREPARE blog_migration FROM @blog_ddl;
EXECUTE blog_migration;
DEALLOCATE PREPARE blog_migration;
CREATE TABLE IF NOT EXISTS media_blobs (
 media_id INT UNSIGNED PRIMARY KEY, bytes LONGBLOB NOT NULL,
 FOREIGN KEY(media_id) REFERENCES media(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS blog_redirects (
 old_slug VARCHAR(220) PRIMARY KEY, new_slug VARCHAR(220) NOT NULL
);
CREATE TABLE IF NOT EXISTS blog_seed_history (
 slug VARCHAR(220) PRIMARY KEY, imported_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS blog_demo_backup (
 source_id INT UNSIGNED PRIMARY KEY, original_record JSON NOT NULL,
 backed_up_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
