CREATE TABLE ai_insights (
    id UUID CONSTRAINT pk_ai_insights PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    insight_type insight_type NOT NULL,
    priority notification_priority NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ
);
CREATE INDEX idx_ai_user ON ai_insights(user_id);
CREATE INDEX idx_ai_priority ON ai_insights(priority);
CREATE INDEX idx_ai_user_priority ON ai_insights(user_id, priority);

CREATE TABLE ai_conversations (
    id UUID CONSTRAINT pk_ai_conversations PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    role VARCHAR NOT NULL,
    message TEXT NOT NULL,
    model VARCHAR,
    token_usage INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_embeddings (
    id UUID CONSTRAINT pk_ai_embeddings PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);