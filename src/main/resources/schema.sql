CREATE TABLE IF NOT EXISTS dynamic_records (
                                               id BIGSERIAL PRIMARY KEY,
                                               data JSONB NOT NULL,
                                               created_at TIMESTAMP NOT NULL
);