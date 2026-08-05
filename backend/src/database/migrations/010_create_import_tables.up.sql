CREATE TABLE csv_imports (
    id UUID CONSTRAINT pk_csv_imports PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR NOT NULL,
    bank_name VARCHAR,
    total_records INTEGER DEFAULT 0,
    imported_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    status import_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_csv_user ON csv_imports(user_id);
CREATE INDEX idx_csv_status ON csv_imports(status);

CREATE TABLE sms_imports (
    id UUID CONSTRAINT pk_sms_imports PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender VARCHAR,
    message TEXT,
    parsed BOOLEAN DEFAULT false,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    sms_count INTEGER,
    detected_transactions INTEGER,
    imported_transactions INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sms_user ON sms_imports(user_id);