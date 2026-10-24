-- Optional backfill; review and run separately after approval. No schema change is needed.
-- Live is a migration default, NOT a successful verification. Existing values are untouched.
UPDATE portfolio_projects
SET content = JSON_SET(content, '$.websiteAvailability', 'live'), updated_at = updated_at
WHERE JSON_CONTAINS_PATH(content, 'one', '$.websiteAvailability') = 0;
