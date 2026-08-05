CREATE TABLE payment_intents (
    id UUID CONSTRAINT pk_payment_intents PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    merchant_name VARCHAR NOT NULL,
    upi_id VARCHAR NOT NULL,
    status payment_intent_status NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR NOT NULL CONSTRAINT uq_payment_reference UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payment_user ON payment_intents(user_id);
CREATE INDEX idx_payment_status ON payment_intents(status);