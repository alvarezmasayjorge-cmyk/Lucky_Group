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
  { name: '3. AUTOMATION & WORKFLOWS', area: 'ghl' }
];

export const TEMPLATE_TASKS = [
  // 1. ACCESS & ONBOARDING
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get added to Meta Business Manager', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to Ad Account', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to Facebook Page', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to Instagram Account', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to website backend (for Pixel install)', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Get access to domain (for domain verification in Meta)', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Receive brand kit (logo, colors, fonts)', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Receive offer details & promotion info', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Receive target audience info (age, gender, location, interests)', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Receive budget & campaign goals', role: 'Client' },
  { sectionName: '1. ACCESS & ONBOARDING', title: 'Onboarding', role: 'Client' }, // Added for Pure Seoul/Naples

  // 2. META BUSINESS SETUP
  { sectionName: '2. META BUSINESS SETUP', title: 'Verify domain in Meta Business Manager', role: 'Media Buyer' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Create or connect Ad Account', role: 'Media Buyer' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Connect Facebook Page to Ad Account', role: 'Media Buyer' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Connect Instagram Account to Ad Account', role: 'Media Buyer' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Set up payment method on Ad Account', role: 'Media Buyer' },
  { sectionName: '2. META BUSINESS SETUP', title: 'Assign correct roles/permissions to team members', role: 'Media Buyer' },

  // 3. PIXEL & TRACKING
  { sectionName: '3. PIXEL & TRACKING', title: 'Create Facebook Pixel', role: 'Media Buyer' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Install Pixel on website (header code or via GTM)', role: 'Funneler' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Set up standard events', role: 'Funneler' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Verify Pixel is firing correctly', role: 'Funneler' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Set up Conversions API', role: 'Funneler' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Define & configure UTM parameters', role: 'Media Buyer' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Test all events in Meta Events Manager', role: 'Media Buyer' },
  { sectionName: '3. PIXEL & TRACKING', title: 'Set Up New Pixel', role: 'Funneler' }, // Specific task alias

  // 4. LANDING PAGE
  { sectionName: '4. LANDING PAGE', title: 'Create landing page (new offer)', role: 'Funneler' },
  { sectionName: '4. LANDING PAGE', title: 'Create New Landing Page', role: 'Funneler' }, // Specific task alias
  { sectionName: '4. LANDING PAGE', title: 'Write headline & subheadline', role: 'Funneler' },
  { sectionName: '4. LANDING PAGE', title: 'Write body copy / offer details', role: 'Funneler' },
  { sectionName: '4. LANDING PAGE', title: 'Add CTA button with correct URL', role: 'Funneler' },
  { sectionName: '4. LANDING PAGE', title: 'Add form (name, email, phone)', role: 'Funneler' },
  { sectionName: '4. LANDING PAGE', title: 'Mobile optimization check', role: 'Funneler' },
  { sectionName: '4. LANDING PAGE', title: 'Set up Thank You page', role: 'Funneler' },

  // 5. VIDEO AD MATERIALS (Client Must Provide)
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'Raw video footage', role: 'Client' },
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'Waiting for Raw Videos', role: 'Client' }, // Specific
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'Doctor/spokesperson video — Long version', role: 'Client' },
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'UGC (User Generated Content) videos', role: 'Client' },
  { sectionName: '5. VIDEO AD MATERIALS (Client Must Provide)', title: 'Brand colors & fonts', role: 'Client' },

  // 6. VIDEO AD CREATION
  { sectionName: '6. VIDEO AD CREATION', title: 'Edit Doctor Video — Long version', role: 'Video Editor' },
  { sectionName: '6. VIDEO AD CREATION', title: 'Create Doctor Video — Long', role: 'Video Editor' }, // Alias
  { sectionName: '6. VIDEO AD CREATION', title: 'Edit Doctor Video — Short version', role: 'Video Editor' },
  { sectionName: '6. VIDEO AD CREATION', title: 'Create Doctor Video — Short', role: 'Video Editor' }, // Alias
  { sectionName: '6. VIDEO AD CREATION', title: 'Edit UGC Videos', role: 'Video Editor' },
  { sectionName: '6. VIDEO AD CREATION', title: 'Create UGC Videos (new offer)', role: 'Video Editor' }, // Alias
  { sectionName: '6. VIDEO AD CREATION', title: 'Create Short-form videos (Reels-style)', role: 'Video Editor' },
  { sectionName: '6. VIDEO AD CREATION', title: 'Create Short Videos (new offer)', role: 'Video Editor' }, // Alias
  { sectionName: '6. VIDEO AD CREATION', title: 'Review & quality check all videos', role: 'Video Editor' },

  // 7. IMAGE AD CREATION
  { sectionName: '7. IMAGE AD CREATION', title: 'Design static image ad — Feed (1:1)', role: 'Graphic Designer' },
  { sectionName: '7. IMAGE AD CREATION', title: 'Design static image ad — Stories (9:16)', role: 'Graphic Designer' },
  { sectionName: '7. IMAGE AD CREATION', title: 'Export all files in correct sizes', role: 'Graphic Designer' },

  // 1. GOOGLE ADS SETUP (one-time access & setup)
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Adv. Verification', role: 'Media Buyer' },
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Connect SiteKit (Google Tag)', role: 'Funneler' },
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Google Tag Installation', role: 'Funneler' },
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Install GHL # Script', role: 'Funneler' },
  { sectionName: '1. GOOGLE ADS SETUP', title: 'Connect GMB', role: 'Media Buyer' },

  // 2. SEARCH CAMPAIGNS (campaign creation)
  { sectionName: '2. SEARCH CAMPAIGNS', title: 'Create Campaigns', role: 'Media Buyer' },
  { sectionName: '2. SEARCH CAMPAIGNS', title: 'Create Assets', role: 'Graphic Designer' },
  { sectionName: '2. SEARCH CAMPAIGNS', title: 'Launch Campaigns', role: 'Media Buyer' },

  // 3. TRACKING & CONVERSIONS
  { sectionName: '3. TRACKING & CONVERSIONS', title: 'Map GHL Conv. > Google Ads', role: 'Media Buyer' },
  { sectionName: '3. TRACKING & CONVERSIONS', title: 'Create Conv. Actions', role: 'Media Buyer' },
];
