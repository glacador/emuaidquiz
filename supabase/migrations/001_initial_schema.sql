-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Funnels table
CREATE TABLE funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  domain VARCHAR(255) UNIQUE,
  brand_color VARCHAR(20) DEFAULT '#0066CC',
  brand_color_light VARCHAR(20) DEFAULT '#3388DD',
  brand_color_bg VARCHAR(20) DEFAULT '#f0f5ff',
  hook_headline TEXT,
  hook_subheadline TEXT,
  hook_stat VARCHAR(50),
  question_count VARCHAR(50) DEFAULT '12 questions',
  time_estimate VARCHAR(50) DEFAULT '60 seconds',
  cta_text VARCHAR(255) DEFAULT 'Click now to start →',
  social_proof_count INTEGER DEFAULT 0,
  tracking_config JSONB DEFAULT '{}',
  buybox_config JSONB DEFAULT '{}',
  trust_badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conditions table
CREATE TABLE conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  short_name VARCHAR(255),
  results_label VARCHAR(255) DEFAULT 'YOUR RESULTS',
  results_headline TEXT,
  results_intro TEXT,
  results_body TEXT,
  base_weight INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(funnel_id, code),
  UNIQUE(funnel_id, slug)
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('single', 'multi', 'image-grid', 'belief-card', 'social-proof')),
  title TEXT,
  subtitle TEXT,
  help_text TEXT,
  -- For belief cards
  icon VARCHAR(50),
  stat VARCHAR(50),
  headline TEXT,
  subtext TEXT,
  duration INTEGER,
  -- For social proof
  testimonial_name VARCHAR(255),
  testimonial_location VARCHAR(255),
  testimonial_pattern VARCHAR(255),
  testimonial_quote TEXT,
  testimonial_time_ago VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(funnel_id, question_id)
);

-- Question options table
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  label VARCHAR(255) NOT NULL,
  sublabel VARCHAR(255),
  value VARCHAR(50) NOT NULL,
  emoji VARCHAR(50),
  image_url TEXT,
  scores JSONB DEFAULT '{}',
  urgency_add INTEGER,
  percentage INTEGER,
  code VARCHAR(50),
  priority VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Objection content table
CREATE TABLE objection_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  key VARCHAR(10) NOT NULL,
  headline TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(funnel_id, key)
);

-- A/B Tests table
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('theme', 'copy', 'layout', 'offer')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test variants table
CREATE TABLE ab_test_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  weight INTEGER DEFAULT 50 CHECK (weight >= 0 AND weight <= 100),
  config JSONB DEFAULT '{}',
  is_control BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- A/B Test results table
CREATE TABLE ab_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID NOT NULL REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES ab_test_variants(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  condition_code VARCHAR(20),
  converted BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz sessions table for analytics
CREATE TABLE quiz_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  first_name VARCHAR(255),
  condition_code VARCHAR(20),
  urgency_score INTEGER,
  urgency_band VARCHAR(10),
  answers JSONB,
  ab_variant_id UUID REFERENCES ab_test_variants(id),
  converted BOOLEAN DEFAULT FALSE,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_conditions_funnel ON conditions(funnel_id);
CREATE INDEX idx_questions_funnel ON questions(funnel_id);
CREATE INDEX idx_questions_sort ON questions(funnel_id, sort_order);
CREATE INDEX idx_options_question ON question_options(question_id);
CREATE INDEX idx_options_sort ON question_options(question_id, sort_order);
CREATE INDEX idx_ab_tests_funnel ON ab_tests(funnel_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_variants_test ON ab_test_variants(test_id);
CREATE INDEX idx_ab_results_test ON ab_test_results(test_id);
CREATE INDEX idx_ab_results_variant ON ab_test_results(variant_id);
CREATE INDEX idx_sessions_funnel ON quiz_sessions(funnel_id);
CREATE INDEX idx_sessions_created ON quiz_sessions(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON funnels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conditions_updated_at BEFORE UPDATE ON conditions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ab_tests_updated_at BEFORE UPDATE ON ab_tests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE objection_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access for quiz data (anon users can read funnels/questions)
CREATE POLICY "Public read access to funnels" ON funnels FOR SELECT USING (true);
CREATE POLICY "Public read access to conditions" ON conditions FOR SELECT USING (true);
CREATE POLICY "Public read access to questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read access to options" ON question_options FOR SELECT USING (true);
CREATE POLICY "Public read access to objections" ON objection_content FOR SELECT USING (true);
CREATE POLICY "Public read access to active ab_tests" ON ab_tests FOR SELECT USING (status = 'active');
CREATE POLICY "Public read access to ab_variants" ON ab_test_variants FOR SELECT USING (true);

-- Public insert for quiz sessions and results (visitors can create)
CREATE POLICY "Public insert quiz sessions" ON quiz_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update quiz sessions" ON quiz_sessions FOR UPDATE USING (true);
CREATE POLICY "Public insert ab results" ON ab_test_results FOR INSERT WITH CHECK (true);

-- Admin full access (authenticated users)
CREATE POLICY "Admin full access to funnels" ON funnels FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to conditions" ON conditions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to questions" ON questions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to options" ON question_options FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to objections" ON objection_content FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to ab_tests" ON ab_tests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to ab_variants" ON ab_test_variants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to ab_results" ON ab_test_results FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin full access to sessions" ON quiz_sessions FOR ALL USING (auth.role() = 'authenticated');
