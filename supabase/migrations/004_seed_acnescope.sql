-- Seed data for AcneScope funnel
-- Run this in Supabase SQL Editor to populate initial data

-- Insert AcneScope funnel
INSERT INTO funnels (
  id, name, tagline, domain, brand_color, brand_color_light, brand_color_bg,
  hook_headline, hook_subheadline, hook_stat, question_count, time_estimate,
  cta_text, social_proof_count, tracking_config, buybox_config
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'AcneScope',
  'Acne Skin Assessment',
  'acnescope.com',
  '#0066CC',
  '#3388DD',
  '#f0f5ff',
  'Your Acne Treatment Might Be Making It Worse.',
  '68% of "Acne" Cases Aren''t Actually Acne.',
  '68%',
  '12 questions',
  '60 seconds',
  'Click now to start →',
  3847,
  '{"klaviyoPublicKey": "YOUR_KLAVIYO_KEY", "metaPixelId": "YOUR_PIXEL_ID"}',
  '{}'
) ON CONFLICT (domain) DO NOTHING;

-- Insert conditions
INSERT INTO conditions (funnel_id, code, name, slug, short_name, results_label, results_headline, results_intro, results_body, base_weight, sort_order) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A1', 'Inflammatory Acne', 'inflammatory', 'Inflammatory Pattern', 'YOUR RESULTS', 'your answers fit an inflammatory acne pattern', 'Your answers show red, inflamed bumps—papules and pustules that are actively irritated. This isn''t just clogged pores.', '**Why spot treatments alone don''t work**

Inflammatory acne involves bacterial overgrowth AND immune response. Surface treatments can''t reach the inflammation happening beneath.

**What worked for people with your pattern**

• Week 2: 71% said new breakouts were less frequent
• Week 4: 83% said existing bumps were calmer
• Week 6: 79% said skin looked clearer overall', 5, 1),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A2', 'Comedonal Acne', 'comedonal', 'Comedonal Pattern', 'YOUR RESULTS', 'your answers fit a comedonal (clogged pore) pattern', 'Your answers show blackheads and whiteheads—non-inflamed clogged pores. The good news: this is the most treatable form.', '**Why physical exfoliation makes it worse**

Scrubbing spreads bacteria and causes micro-tears. You need chemical exfoliation that dissolves the plugs.

**What worked for people with your pattern**

• Week 2: 68% noticed fewer new blackheads
• Week 4: 76% said pores looked smaller
• Week 6: 82% said texture was smoother', 3, 2),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A3', 'Cystic Acne', 'cystic', 'Cystic Pattern', 'YOUR RESULTS', 'your answers fit a deep cystic pattern', 'Your answers show deep, painful nodules under the skin. These form when infection goes deep into the follicle.', '**Why over-the-counter treatments fail**

Cystic acne sits too deep for topical treatments to reach. You need something that penetrates to the source.

**What worked for people with your pattern**

• Week 3: 64% said new cysts were smaller
• Week 6: 72% said pain was reduced
• Week 8: 69% said fewer new cysts forming', 3, 3),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A4', 'Hormonal Acne', 'hormonal', 'Hormonal Pattern', 'YOUR RESULTS', 'your answers fit a hormonal acne pattern', 'Your answers show breakouts concentrated on jawline and chin, often cyclical. This is driven by hormone fluctuations, not hygiene.', '**Why cleansing harder doesn''t help**

Hormonal acne starts from the inside. External treatments alone can''t address the hormonal trigger.

**What worked for people with your pattern**

• Week 2: 58% noticed less monthly flare intensity
• Week 4: 71% said jawline was clearer
• Week 6: 67% said cycle-related breakouts reduced', 3, 4),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A5', 'Fungal Acne', 'fungal', 'Fungal Pattern', 'YOUR RESULTS', 'your answers suggest fungal acne, not bacterial', 'Your answers show uniform, itchy bumps—often on forehead, chest, or back. This is yeast overgrowth, not bacteria.', '**Why antibiotics make it worse**

Antibiotics kill bacteria but let yeast flourish. Many people with ''treatment-resistant acne'' actually have fungal acne.

**What to do**

• Stop all antibiotics (with doctor approval)
• Check your products for oils/fatty acids that feed yeast
• Start antifungal-compatible skincare', 3, 5),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A6', 'Rosacea', 'rosacea', 'Rosacea Pattern', 'YOUR RESULTS', 'your answers suggest rosacea, not acne', 'Your answers show flushing, redness, and bumps—especially on cheeks and nose. Acne treatments can make rosacea permanently worse.', '**Why acne treatments backfire**

Benzoyl peroxide and retinoids are too harsh for rosacea skin. They trigger more inflammation and broken capillaries.

**What to do**

• Stop all harsh acne treatments immediately
• Identify your triggers (heat, alcohol, spicy food, stress)
• Start gentle, anti-inflammatory care', 3, 6),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A7', 'Folliculitis', 'folliculitis', 'Folliculitis Pattern', 'YOUR RESULTS', 'your answers fit a folliculitis pattern', 'Your answers show bumps at hair follicles—often from shaving, friction, or bacteria. This isn''t acne, though it looks similar.', '**Why acne treatments don''t clear it**

Folliculitis is an infection of the hair follicle. It needs antibacterial treatment, not pore-clearing.

**What worked for people with your pattern**

• Week 1: 74% noticed less irritation
• Week 2: 81% said bumps were flattening
• Week 4: 78% said skin was clear', 3, 7),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A8', 'Keratosis Pilaris', 'keratosis-pilaris', 'KP Pattern', 'YOUR RESULTS', 'your answers suggest keratosis pilaris, not acne', 'Your answers show rough, bumpy texture—often on upper arms, thighs, or cheeks. This is keratin buildup, not infection.', '**Why acne treatments irritate without helping**

KP needs gentle exfoliation and hydration, not antibacterial or drying treatments.

**What worked for people with your pattern**

• Week 2: 69% noticed smoother texture
• Week 4: 77% said bumps were less visible
• Week 6: 73% said skin felt softer', 3, 8),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A9', 'Perioral Dermatitis', 'perioral', 'Perioral Pattern', 'YOUR RESULTS', 'your answers fit a perioral dermatitis pattern', 'Your answers show bumps around mouth, nose, or chin—with the lip line usually clear. Heavy creams make this worse.', '**Why moisturizers backfire**

Perioral dermatitis involves microbiome imbalance. Occlusive products trap moisture and feed the overgrowth.

**What to do**

• Stop all heavy creams immediately
• Check your toothpaste (fluoride can trigger this)
• Switch to lightweight, non-occlusive care', 3, 9),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A10', 'Milia', 'milia', 'Milia Pattern', 'YOUR RESULTS', 'your answers suggest milia, not acne', 'Your answers show tiny white bumps that don''t pop like whiteheads. These are keratin cysts trapped under skin.', '**Why extraction doesn''t work like with blackheads**

Milia have no pore opening. They need professional extraction or specific exfoliation to dissolve.

**What worked for people with your pattern**

• Week 3: 62% noticed bumps getting smaller
• Week 6: 71% said some had resolved
• Week 8: 68% said skin was smoother', 3, 10),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A11', 'Acne Mechanica', 'mechanica', 'Friction Pattern', 'YOUR RESULTS', 'your answers fit an acne mechanica (friction) pattern', 'Your answers show breakouts where something rubs—mask line, helmet area, chin strap zone, or sports gear contact.', '**Why it keeps coming back**

Friction + sweat + bacteria = perfect storm. You need to address all three, not just treat the bumps.

**What worked for people with your pattern**

• Week 1: 78% noticed less irritation
• Week 2: 82% said fewer new bumps in friction areas
• Week 4: 76% said pattern was breaking', 3, 11),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'A12', 'Mixed Pattern', 'mixed', 'Mixed Pattern', 'YOUR RESULTS', 'your answers show a mixed or unclear pattern', 'Your answers don''t clearly match one subtype. That''s common—your skin may involve multiple factors.', '**What to do**

• Start with gentle, broad-spectrum care
• Track your triggers carefully
• Consider seeing a dermatologist for clarity

Many people have overlapping patterns that need a multi-pronged approach.', 0, 12);

-- Insert objection content
INSERT INTO objection_content (funnel_id, key, headline, body) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'a', 'We know you''ve been burned before.', 'That''s why every order includes our 30-day guarantee. If it doesn''t work for your pattern, you pay nothing.'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b', 'Your skin''s safety matters most.', 'EMUAID uses natural ingredients with 50+ years of safe use. No harsh chemicals, no synthetic irritants.'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'c', 'Skepticism is healthy.', 'Over 45,000 5-star reviews from people who felt exactly like you do right now. Your pattern has been solved before.'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'd', 'That''s exactly why you took this quiz.', 'We just analyzed your answers against 847,000+ cases. Your results page shows exactly what pattern you''re dealing with.');
