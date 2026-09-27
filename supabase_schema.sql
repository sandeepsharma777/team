-- ====================================================================
-- TeamSync Database Schema (PostgreSQL for Supabase)
-- Brand: TeamSync — Connect. Collaborate. Build.
-- Updated ID Column Types to TEXT to seamlessly support Firebase UIDs
-- and Postgres UUIDs without 400 Bad Request type errors.
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ====================================================================
-- 1. DROP EXISTING TABLES (If recreating from scratch)
-- ====================================================================
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.team_chat_messages CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.team_invitations CASCADE;
DROP TABLE IF EXISTS public.team_join_requests CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.opportunity_rules CASCADE;
DROP TABLE IF EXISTS public.opportunities CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.colleges CASCADE;

-- ====================================================================
-- 2. CREATE TABLES
-- ====================================================================

-- 1. COLLEGES / INSTITUTIONS
CREATE TABLE public.colleges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENT PROFILES (Users - IDs can be Firebase UIDs e.g. KAoGEyR... or UUIDs)
CREATE TABLE public.profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    college_id TEXT REFERENCES public.colleges(id) ON DELETE SET NULL,
    college_name TEXT NOT NULL,
    year_of_study TEXT NOT NULL CHECK (year_of_study IN ('1st Year', '2nd Year', '3rd Year', '4th Year', 'Other')),
    branch TEXT NOT NULL,
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    skills JSONB DEFAULT '[]'::jsonb,
    interests JSONB DEFAULT '[]'::jsonb,
    github_url TEXT DEFAULT '',
    linkedin_url TEXT DEFAULT '',
    portfolio_url TEXT DEFAULT '',
    is_open_to_teams BOOLEAN DEFAULT true,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. OPPORTUNITIES (Hackathons, Competitions, Challenges, Events)
CREATE TABLE public.opportunities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    organizer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Hackathon' CHECK (category IN ('Hackathon', 'Competition', 'Challenge', 'Special Event', 'Innovation')),
    participation_mode TEXT NOT NULL DEFAULT 'team_required' CHECK (participation_mode IN ('team_required', 'individual_allowed', 'team_optional')),
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'past', 'closed')),
    is_published BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    registration_deadline TIMESTAMPTZ,
    location TEXT DEFAULT 'Online',
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. OPPORTUNITY RULES (Configurable rule engine per opportunity)
CREATE TABLE public.opportunity_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    opportunity_id TEXT NOT NULL UNIQUE REFERENCES public.opportunities(id) ON DELETE CASCADE,
    min_team_size INTEGER DEFAULT 1 CHECK (min_team_size >= 1),
    max_team_size INTEGER DEFAULT 5 CHECK (max_team_size >= min_team_size),
    exact_team_size INTEGER CHECK (exact_team_size IS NULL OR exact_team_size >= 1),
    composition_rules JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEAMS
CREATE TABLE public.teams (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('Hackathon', 'Special Event', 'Personal Project')),
    opportunity_id TEXT REFERENCES public.opportunities(id) ON DELETE SET NULL,
    project_name TEXT,
    description TEXT NOT NULL,
    required_skills JSONB DEFAULT '[]'::jsonb,
    required_roles JSONB DEFAULT '[]'::jsonb,
    leader_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Recruiting' CHECK (status IN ('Recruiting', 'Building', 'Completed')),
    custom_rules JSONB,
    github_url TEXT DEFAULT '',
    figma_url TEXT DEFAULT '',
    demo_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TEAM MEMBERS (Membership & Roles)
CREATE TABLE public.team_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_in_team TEXT NOT NULL DEFAULT 'Member',
    is_leader BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (team_id, user_id)
);

-- 7. JOIN REQUESTS (Student -> Team)
CREATE TABLE public.team_join_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT DEFAULT '',
    role_interested TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TEAM INVITATIONS (Leader -> Student)
CREATE TABLE public.team_invitations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    invited_by TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT DEFAULT '',
    role_offered TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PROJECTS & SHOWCASE
CREATE TABLE public.projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_id TEXT REFERENCES public.teams(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Personal Project',
    skills_used JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Building' CHECK (status IN ('Building', 'Completed')),
    is_showcase BOOLEAN DEFAULT false,
    github_url TEXT DEFAULT '',
    demo_url TEXT DEFAULT '',
    outcome TEXT DEFAULT '',
    created_by TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. LIGHTWEIGHT TEAM CHAT MESSAGES
CREATE TABLE public.team_chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    team_id TEXT NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. NOTIFICATIONS
CREATE TABLE public.notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    recipient_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'team_request', 
        'team_invitation', 
        'request_accepted', 
        'request_rejected', 
        'invitation_accepted', 
        'invitation_rejected', 
        'team_update', 
        'opportunity_update'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_entity_type TEXT DEFAULT 'team' CHECK (related_entity_type IN ('team', 'opportunity', 'profile')),
    related_entity_id TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_college_id ON public.profiles(college_id);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_category ON public.opportunities(category);
CREATE INDEX idx_teams_opportunity_id ON public.teams(opportunity_id);
CREATE INDEX idx_teams_leader_id ON public.teams(leader_id);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_team_join_requests_team_id ON public.team_join_requests(team_id);
CREATE INDEX idx_team_join_requests_user_id ON public.team_join_requests(user_id);
CREATE INDEX idx_team_invitations_team_id ON public.team_invitations(team_id);
CREATE INDEX idx_team_invitations_user_id ON public.team_invitations(user_id);
CREATE INDEX idx_team_chat_messages_team_id ON public.team_chat_messages(team_id);
CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);

-- ====================================================================
-- 4. AUTOMATIC TRIGGER FOR updated_at COLUMNS
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_opportunity_rules_updated_at BEFORE UPDATE ON public.opportunity_rules FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_team_join_requests_updated_at BEFORE UPDATE ON public.team_join_requests FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_team_invitations_updated_at BEFORE UPDATE ON public.team_invitations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ====================================================================
-- 5. SEED DATA: Colleges
-- ====================================================================
INSERT INTO public.colleges (name, code) VALUES
('Stanford University', 'STANFORD'),
('Massachusetts Institute of Technology', 'MIT'),
('University of California, Berkeley', 'UCB'),
('Carnegie Mellon University', 'CMU'),
('Indian Institute of Technology, Bombay', 'IITB'),
('Indian Institute of Technology, Delhi', 'IITD'),
('National University of Singapore', 'NUS'),
('Georgia Institute of Technology', 'GATECH'),
('University of Washington', 'UW'),
('University of Toronto', 'UTORONTO')
ON CONFLICT (name) DO NOTHING;

-- ====================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. COLLEGES: Public read, All insert/update
CREATE POLICY "Allow public read on colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Allow all insert on colleges" ON public.colleges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on colleges" ON public.colleges FOR UPDATE USING (true);

-- 2. PROFILES: Public read, All insert/update/delete
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow all insert on profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on profiles" ON public.profiles FOR DELETE USING (true);

-- 3. OPPORTUNITIES: Public read, All write operations
CREATE POLICY "Allow public read on opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Allow all insert on opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on opportunities" ON public.opportunities FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on opportunities" ON public.opportunities FOR DELETE USING (true);

-- 4. OPPORTUNITY RULES: Public read, All write operations
CREATE POLICY "Allow public read on opportunity_rules" ON public.opportunity_rules FOR SELECT USING (true);
CREATE POLICY "Allow all insert on opportunity_rules" ON public.opportunity_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on opportunity_rules" ON public.opportunity_rules FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on opportunity_rules" ON public.opportunity_rules FOR DELETE USING (true);

-- 5. TEAMS: Public read, All write operations
CREATE POLICY "Allow public read on teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow all insert on teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on teams" ON public.teams FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on teams" ON public.teams FOR DELETE USING (true);

-- 6. TEAM MEMBERS: Public read, All write operations
CREATE POLICY "Allow public read on team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Allow all insert on team_members" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update on team_members" ON public.team_members FOR UPDATE USING (true);
CREATE POLICY "Allow all delete on team_members" ON public.team_members FOR DELETE USING (true);

-- 7. TEAM JOIN REQUESTS: Public read, All write operations
CREATE POLICY "Allow read on join_requests" ON public.team_join_requests FOR SELECT USING (true);
CREATE POLICY "Allow insert on join_requests" ON public.team_join_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on join_requests" ON public.team_join_requests FOR UPDATE USING (true);
CREATE POLICY "Allow delete on join_requests" ON public.team_join_requests FOR DELETE USING (true);

-- 8. TEAM INVITATIONS: Public read, All write operations
CREATE POLICY "Allow read on invitations" ON public.team_invitations FOR SELECT USING (true);
CREATE POLICY "Allow insert on invitations" ON public.team_invitations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on invitations" ON public.team_invitations FOR UPDATE USING (true);
CREATE POLICY "Allow delete on invitations" ON public.team_invitations FOR DELETE USING (true);

-- 9. PROJECTS: Public read, All write operations
CREATE POLICY "Allow read on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow insert on projects" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on projects" ON public.projects FOR UPDATE USING (true);
CREATE POLICY "Allow delete on projects" ON public.projects FOR DELETE USING (true);

-- 10. TEAM CHAT MESSAGES: Public read, All write operations
CREATE POLICY "Allow read on team_chat_messages" ON public.team_chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow insert on team_chat_messages" ON public.team_chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on team_chat_messages" ON public.team_chat_messages FOR UPDATE USING (true);
CREATE POLICY "Allow delete on team_chat_messages" ON public.team_chat_messages FOR DELETE USING (true);

-- 11. NOTIFICATIONS: Public read, All write operations
CREATE POLICY "Allow read on notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow insert on notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Allow delete on notifications" ON public.notifications FOR DELETE USING (true);
