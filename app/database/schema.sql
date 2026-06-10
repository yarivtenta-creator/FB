CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    business_name TEXT NOT NULL,
    contact_name TEXT,
    niche TEXT DEFAULT 'wedding_video',
    country TEXT,
    city TEXT,
    language TEXT DEFAULT 'en',
    website_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    vimeo_url TEXT,
    email TEXT,
    phone TEXT,
    source TEXT DEFAULT 'manual',
    status TEXT DEFAULT 'New',
    lead_score INTEGER DEFAULT 0,
    best_channel TEXT DEFAULT 'email',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lead_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    summary TEXT,
    service_type TEXT,
    opportunities TEXT,
    pain_points TEXT,
    score INTEGER DEFAULT 0,
    recommended_channel TEXT DEFAULT 'email',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    content_type TEXT DEFAULT 'text',
    raw_content TEXT,
    analysis TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outreach_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    channel TEXT DEFAULT 'email',
    tone TEXT DEFAULT 'professional',
    language_code TEXT DEFAULT 'en',
    content TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    draft_id INTEGER NOT NULL REFERENCES outreach_drafts(id) ON DELETE CASCADE,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    decision TEXT,
    edited_content TEXT,
    next_action TEXT,
    opt_out INTEGER DEFAULT 0,
    do_not_contact INTEGER DEFAULT 0,
    lawful_basis_note TEXT,
    first_contact_notice_status TEXT DEFAULT 'pending',
    decided_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER REFERENCES leads(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS browser_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    adspower_profile_id TEXT NOT NULL,
    profile_name TEXT,
    last_opened_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_niche ON leads(niche);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_drafts_lead ON outreach_drafts(lead_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON outreach_drafts(status);
