export const TEMPLATE_SECTIONS = [
  { name: '1. ACCESS & ONBOARDING', area: 'meta_ads' },
  { name: '2. META BUSINESS SETUP', area: 'meta_ads' },
  { name: '3. PIXEL & TRACKING', area: 'meta_ads' },
  { name: '4. LANDING PAGE', area: 'meta_ads' },
  { name: '5. VIDEO AD MATERIALS (Client Must Provide)', area: 'meta_ads' },
  { name: '6. VIDEO AD CREATION', area: 'meta_ads' },
  { name: '7. IMAGE AD CREATION', area: 'meta_ads' },
  { name: '1. GOOGLE ADS SETUP', area: 'google_ads' },
  { name: '2. SEARCH CAMPAIGNS', area: 'google_ads' },
  { name: '3. TRACKING & CONVERSIONS', area: 'google_ads' },
  { name: '1. ACCOUNT CONFIGURATION', area: 'ghl' },
  { name: '2. FUNNEL CREATION', area: 'ghl' },
  { name: '3. AUTOMATION & WORKFLOWS', area: 'ghl' },
  { name: '4. AI RECEPTIONIST', area: 'ghl' }
];

export const TEMPLATE_TASKS = [
  // 1. ACCESS & ONBOARDING
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get added to Meta Business Manager', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to Ad Account', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to Facebook Page', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to Instagram Account', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to website backend (for Pixel install)', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to domain (for domain verification in Meta)', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Receive brand kit (logo, colors, fonts)', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Receive offer details & promotion info', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Receive target audience info (age, gender, location, interests)', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Receive budget & campaign goals', role: 'Project Manager' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Onboarding', role: 'Project Manager' }, // Added for Pure Seoul/Naples

  // 2. META BUSINESS SETUP
  { sectionName: '2. META BUSINESS SETUP', title: 'Verify domain in Meta Business Manager', role: 'Video Editor/Meta Specialist' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Create or connect Ad Account', role: 'Video Editor/Meta Specialist' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Connect Facebook Page to Ad Account', role: 'Video Editor/Meta Specialist' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Connect Instagram Account to Ad Account', role: 'Video Editor/Meta Specialist' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Set up payment method on Ad Account', role: 'Video Editor/Meta Specialist' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Assign correct roles/permissions to team members', role: 'Video Editor/Meta Specialist' },

  // 3. PIXEL & TRACKING
  { sectionName: '3. PIXEL & TRACKING', title: 'Create Facebook Pixel', role: 'Video Editor/Meta Specialist' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Install Pixel on website (header code or via GTM)', role: 'GoHighLevel Specialist' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Set up standard events', role: 'GoHighLevel Specialist' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Verify Pixel is firing correctly', role: 'GoHighLevel Specialist' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Set up Conversions API', role: 'GoHighLevel Specialist' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Define & configure UTM parameters', role: 'Video Editor/Meta Specialist' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Test all events in Meta Events Manager', role: 'Video Editor/Meta Specialist' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Set Up New Pixel', role: 'GoHighLevel Specialist' }, // Specific task alias

  // 4. LANDING PAGE
  { sectionName: '4. LANDING PAGE', title: 'Create landing page (new offer)', role: 'GoHighLevel Specialist' },
  { sectionName: '4. LANDING PAGE', title: 'Create New Landing Page', role: 'GoHighLevel Specialist' }, // Specific task alias
  { sectionName: '4. LANDING PAGE', title: 'Write headline & subheadline', role: 'GoHighLevel Specialist' },
  { sectionName: '4. LANDING PAGE', title: 'Write body copy / offer details', role: 'GoHighLevel Specialist' },
  { sectionName: '4. LANDING PAGE', title: 'Add CTA button with correct URL', role: 'GoHighLevel Specialist' },
  { sectionName: '4. LANDING PAGE', title: 'Add form (name, email, phone)', role: 'GoHighLevel Specialist' },
  { sectionName: '4. LANDING PAGE', title: 'Mobile optimization check', role: 'GoHighLevel Specialist' },
  { sectionName: '4. LANDING PAGE', title: 'Set up Thank You page', role: 'GoHighLevel Specialist' },

  // 5. VIDEO AD MATERIALS (Client Must Provide)
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'Raw video footage', role: 'Project Manager' },
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'Waiting for Raw Videos', role: 'Project Manager' }, // Specific
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'Doctor/spokesperson video — Long version', role: 'Project Manager' },
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'UGC (User Generated Content) videos', role: 'Project Manager' },
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'Brand colors & fonts', role: 'Project Manager' },

  // 6. VIDEO AD CREATION
  { sectionName: '6. VIDEO AD CREATION', title: 'Edit Doctor Video — Long version', role: 'Video Editor/Meta Specialist' },
  { sectionName: '6. VIDEO AD CREATION', title: 'Create Doctor Video — Long', role: 'Video Editor/Meta Specialist' }, // Alias
  { sectionName: '6. VIDEO AD CREATION', title: 'Edit Doctor Video — Short version', role: 'Video Editor/Meta Specialist' },
  { sectionName: '6. VIDEO AD CREATION', title: 'Create Doctor Video — Short', role: 'Video Editor/Meta Specialist' }, // Alias
  { sectionName: '6. VIDEO AD CREATION', title: 'Edit UGC Videos', role: 'Video Editor/Meta Specialist' },
  { sectionName: '6. VIDEO AD CREATION', title: 'Create UGC Videos (new offer)', role: 'Video Editor/Meta Specialist' }, // Alias
  { sectionName: '6. VIDEO AD CREATION', title: 'Create Short-form videos (Reels-style)', role: 'Video Editor/Meta Specialist' },
  { sectionName: '6. VIDEO AD CREATION', title: 'Create Short Videos (new offer)', role: 'Video Editor/Meta Specialist' }, // Alias
  { sectionName: '6. VIDEO AD CREATION', title: 'Review & quality check all videos', role: 'Video Editor/Meta Specialist' },

  // 7. IMAGE AD CREATION
  { sectionName: '7. IMAGE AD CREATION', title: 'Design static image ad — Feed (1:1)', role: 'Video Editor/Meta Specialist' },
  { sectionName: '7. IMAGE AD CREATION', title: 'Design static image ad — Stories (9:16)', role: 'Video Editor/Meta Specialist' },
  { sectionName: '7. IMAGE AD CREATION', title: 'Export all files in correct sizes', role: 'Video Editor/Meta Specialist' },

  // 1. GOOGLE ADS SETUP (one-time access & setup)
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Adv. Verification', role: 'Video Editor/Meta Specialist' },
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Connect SiteKit (Google Tag)', role: 'GoHighLevel Specialist' },
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Google Tag Installation', role: 'GoHighLevel Specialist' },
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Install GHL # Script', role: 'GoHighLevel Specialist' },
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Connect GMB', role: 'Video Editor/Meta Specialist' },

  // 2. SEARCH CAMPAIGNS (campaign creation)
  { sectionName: '2. SEARCH CAMPAIGNS', title: 'Create Campaigns', role: 'Video Editor/Meta Specialist' },
  { sectionName: '2. SEARCH CAMPAIGNS', title: 'Create Assets', role: 'Video Editor/Meta Specialist' },
  { sectionName: '2. SEARCH CAMPAIGNS', title: 'Launch Campaigns', role: 'Video Editor/Meta Specialist' },

  // 3. TRACKING & CONVERSIONS
  { sectionName: '3. TRACKING & CONVERSIONS', title: 'Map GHL Conv. > Google Ads', role: 'Video Editor/Meta Specialist' },
  { sectionName: '3. TRACKING & CONVERSIONS', title: 'Create Conv. Actions', role: 'Video Editor/Meta Specialist' },

  // 1. ACCOUNT CONFIGURATION (GHL)
  { sectionName: '1. ACCOUNT CONFIGURATION', title: 'Integration (Google)', role: 'Project Manager' },
  { sectionName: '1. ACCOUNT CONFIGURATION', title: 'Integration (Meta)', role: 'GoHighLevel Specialist' },
  { sectionName: '1. ACCOUNT CONFIGURATION', title: 'Integrate Domain', role: 'GoHighLevel Specialist' },
  { sectionName: '1. ACCOUNT CONFIGURATION', title: 'Set and Validate Dedicated Sending Domain', role: 'GoHighLevel Specialist' },
  { sectionName: '1. ACCOUNT CONFIGURATION', title: 'A2P Application', role: 'Project Manager' },
  { sectionName: '1. ACCOUNT CONFIGURATION', title: 'Google Lead Event Creation', role: 'Video Editor/Meta Specialist' },

  // 2. FUNNEL CREATION (GHL)
  { sectionName: '2. FUNNEL CREATION', title: 'Build Funnel', role: 'GoHighLevel Specialist' },
  { sectionName: '2. FUNNEL CREATION', title: 'Gather Client Assets', role: 'Project Manager' },
  { sectionName: '2. FUNNEL CREATION', title: 'Purchase Lookalike Domain', role: 'Project Manager' },
  { sectionName: '2. FUNNEL CREATION', title: 'Define Client Offer', role: 'Project Manager' },
  { sectionName: '2. FUNNEL CREATION', title: 'Tracking Code Installation', role: 'GoHighLevel Specialist' },

  // 3. AUTOMATION & WORKFLOWS (GHL)
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'CAPI Conversion', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Google Number Pool Conversion', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'New Lead Optin - Did Not Schedule', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Booked Appointment Reminder', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'No Show/Cancelled Appointment Win-back', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Pipeline Changed To No Show/Cancelled', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Lead to AI Outbound Call', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Get and Place Call: Outbound + Inbound', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Reactivation Call: Stale Customer', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Lead Type Updater & Aging', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Inbound Message Internal Notification', role: 'GoHighLevel Specialist' },
  { sectionName: '3. AUTOMATION & WORKFLOWS', title: 'Missed Call Text Back', role: 'GoHighLevel Specialist' },

  // 4. AI RECEPTIONIST (GHL)
  { sectionName: '4. AI RECEPTIONIST', title: 'Prompt', role: 'GoHighLevel Specialist' },
  { sectionName: '4. AI RECEPTIONIST', title: 'AI Receptionist Objective', role: 'GoHighLevel Specialist' },
  { sectionName: '4. AI RECEPTIONIST', title: 'Retell Workspace', role: 'Project Manager' },
  { sectionName: '4. AI RECEPTIONIST', title: 'Add Client Payment Method', role: 'Project Manager' },
  { sectionName: '4. AI RECEPTIONIST', title: 'Purchase Number', role: 'GoHighLevel Specialist' },
];
