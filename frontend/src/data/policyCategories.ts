export interface PolicyCategory {
  id: string;
  name: string;
  description: string;
  level: 'federal' | 'state' | 'local' | 'ballot';
  keywords: string[];
  civicTags: string[];
}

export const POLICY_CATEGORIES: PolicyCategory[] = [
  // FEDERAL LEVEL POLICIES
  {
    id: 'healthcare-reform',
    name: 'Healthcare Reform',
    description: 'Policies related to healthcare access, insurance, Medicare, Medicaid, and medical cost reduction.',
    level: 'federal',
    keywords: ['healthcare', 'medical', 'insurance', 'medicare', 'medicaid', 'hospital', 'prescription', 'drugs'],
    civicTags: ['healthcare', 'social_services', 'economy']
  },
  {
    id: 'climate-environment',
    name: 'Climate & Environmental Protection',
    description: 'Environmental regulations, climate change mitigation, clean energy, and conservation policies.',
    level: 'federal',
    keywords: ['climate', 'environment', 'clean energy', 'renewable', 'carbon', 'pollution', 'conservation', 'green'],
    civicTags: ['environment', 'energy', 'regulation']
  },
  {
    id: 'immigration-reform',
    name: 'Immigration Reform',
    description: 'Immigration policies, border security, pathway to citizenship, and refugee programs.',
    level: 'federal',
    keywords: ['immigration', 'border', 'citizenship', 'refugee', 'asylum', 'visa', 'deportation', 'migrant'],
    civicTags: ['immigration', 'security', 'social_policy']
  },
  {
    id: 'economic-policy',
    name: 'Economic Policy & Jobs',
    description: 'Economic growth, job creation, trade policy, taxation, and fiscal responsibility.',
    level: 'federal',
    keywords: ['economy', 'jobs', 'employment', 'trade', 'taxes', 'fiscal', 'budget', 'deficit', 'inflation'],
    civicTags: ['economy', 'employment', 'taxation']
  },
  {
    id: 'education-funding',
    name: 'Education Funding & Policy',
    description: 'Federal education funding, student loans, school choice, and educational standards.',
    level: 'federal',
    keywords: ['education', 'school', 'student', 'loans', 'college', 'university', 'funding', 'teachers'],
    civicTags: ['education', 'funding', 'social_services']
  },
  {
    id: 'defense-security',
    name: 'Defense & National Security',
    description: 'Military spending, national defense, cybersecurity, and homeland security policies.',
    level: 'federal',
    keywords: ['defense', 'military', 'security', 'cyber', 'homeland', 'veterans', 'armed forces'],
    civicTags: ['security', 'defense', 'veterans']
  },
  {
    id: 'civil-rights',
    name: 'Civil Rights & Social Justice',
    description: 'Civil rights protections, voting rights, criminal justice reform, and equality initiatives.',
    level: 'federal',
    keywords: ['civil rights', 'voting', 'justice', 'equality', 'discrimination', 'police', 'criminal justice'],
    civicTags: ['civil_rights', 'justice', 'equality']
  },
  {
    id: 'infrastructure-federal',
    name: 'Federal Infrastructure Investment',
    description: 'Interstate highways, bridges, broadband, airports, and national infrastructure projects.',
    level: 'federal',
    keywords: ['infrastructure', 'highways', 'bridges', 'broadband', 'airports', 'transportation', 'internet'],
    civicTags: ['infrastructure', 'transportation', 'technology']
  },

  // STATE LEVEL POLICIES
  {
    id: 'state-education',
    name: 'State Education Policy',
    description: 'State education funding, curriculum standards, teacher pay, and school district policies.',
    level: 'state',
    keywords: ['state education', 'curriculum', 'teacher pay', 'school districts', 'state funding'],
    civicTags: ['education', 'funding', 'employment']
  },
  {
    id: 'state-healthcare',
    name: 'State Healthcare Programs',
    description: 'State Medicaid expansion, public health programs, and healthcare regulations.',
    level: 'state',
    keywords: ['medicaid expansion', 'public health', 'state healthcare', 'health programs'],
    civicTags: ['healthcare', 'social_services', 'regulation']
  },
  {
    id: 'transportation-state',
    name: 'State Transportation & Roads',
    description: 'State highway maintenance, public transit, and transportation infrastructure.',
    level: 'state',
    keywords: ['state highways', 'public transit', 'roads', 'transportation', 'infrastructure'],
    civicTags: ['transportation', 'infrastructure', 'public_services']
  },
  {
    id: 'criminal-justice-state',
    name: 'State Criminal Justice',
    description: 'Prison reform, sentencing guidelines, drug policy, and law enforcement funding.',
    level: 'state',
    keywords: ['prison', 'sentencing', 'drug policy', 'law enforcement', 'criminal justice'],
    civicTags: ['justice', 'law_enforcement', 'social_policy']
  },
  {
    id: 'environmental-state',
    name: 'State Environmental Regulation',
    description: 'State environmental protections, water quality, air quality, and natural resource management.',
    level: 'state',
    keywords: ['water quality', 'air quality', 'natural resources', 'environmental protection'],
    civicTags: ['environment', 'regulation', 'public_health']
  },
  {
    id: 'economic-development-state',
    name: 'State Economic Development',
    description: 'Business incentives, job training programs, and economic development initiatives.',
    level: 'state',
    keywords: ['business incentives', 'job training', 'economic development', 'workforce'],
    civicTags: ['economy', 'employment', 'business']
  },

  // LOCAL LEVEL POLICIES
  {
    id: 'affordable-housing',
    name: 'Affordable Housing Initiative',
    description: 'Local housing policies, rent control, zoning for affordable housing, and homelessness programs.',
    level: 'local',
    keywords: ['affordable housing', 'rent control', 'zoning', 'homelessness', 'housing crisis'],
    civicTags: ['housing', 'zoning', 'social_services']
  },
  {
    id: 'local-transportation',
    name: 'Local Transportation & Transit',
    description: 'Public transit, bike lanes, pedestrian safety, and local transportation improvements.',
    level: 'local',
    keywords: ['public transit', 'bike lanes', 'pedestrian', 'local transportation', 'traffic'],
    civicTags: ['transportation', 'public_services', 'safety']
  },
  {
    id: 'public-safety',
    name: 'Public Safety & Police Reform',
    description: 'Police funding, community policing, crime prevention, and emergency services.',
    level: 'local',
    keywords: ['police', 'crime prevention', 'emergency services', 'public safety', 'community policing'],
    civicTags: ['safety', 'law_enforcement', 'community']
  },
  {
    id: 'zoning-development',
    name: 'Zoning & Development Policy',
    description: 'Land use planning, development regulations, historic preservation, and growth management.',
    level: 'local',
    keywords: ['zoning', 'development', 'land use', 'historic preservation', 'growth management'],
    civicTags: ['zoning', 'development', 'planning']
  },
  {
    id: 'local-environment',
    name: 'Local Environmental Policy',
    description: 'Waste management, recycling programs, local parks, and environmental sustainability.',
    level: 'local',
    keywords: ['waste management', 'recycling', 'parks', 'sustainability', 'local environment'],
    civicTags: ['environment', 'sustainability', 'public_services']
  },
  {
    id: 'municipal-services',
    name: 'Municipal Services & Infrastructure',
    description: 'Water and sewer systems, road maintenance, snow removal, and basic city services.',
    level: 'local',
    keywords: ['water', 'sewer', 'road maintenance', 'snow removal', 'city services'],
    civicTags: ['infrastructure', 'public_services', 'utilities']
  },
  {
    id: 'local-business',
    name: 'Local Business & Economic Development',
    description: 'Small business support, downtown revitalization, and local economic initiatives.',
    level: 'local',
    keywords: ['small business', 'downtown', 'local economy', 'business support'],
    civicTags: ['economy', 'business', 'development']
  },

  // BALLOT MEASURES & INITIATIVES
  {
    id: 'tax-initiatives',
    name: 'Tax & Revenue Initiatives',
    description: 'Property tax measures, sales tax initiatives, and revenue generation proposals.',
    level: 'ballot',
    keywords: ['property tax', 'sales tax', 'revenue', 'tax initiative', 'funding measure'],
    civicTags: ['taxation', 'funding', 'revenue']
  },
  {
    id: 'bond-measures',
    name: 'Infrastructure Bond Measures',
    description: 'School bonds, transportation bonds, and infrastructure funding measures.',
    level: 'ballot',
    keywords: ['school bonds', 'transportation bonds', 'infrastructure bonds', 'capital improvements'],
    civicTags: ['infrastructure', 'funding', 'education']
  },
  {
    id: 'social-policy-ballot',
    name: 'Social Policy Ballot Measures',
    description: 'Drug policy reform, criminal justice initiatives, and social issue ballot measures.',
    level: 'ballot',
    keywords: ['drug reform', 'criminal justice ballot', 'social issues', 'policy reform'],
    civicTags: ['social_policy', 'justice', 'reform']
  },
  {
    id: 'environmental-ballot',
    name: 'Environmental Ballot Measures',
    description: 'Environmental protection initiatives, clean energy measures, and conservation proposals.',
    level: 'ballot',
    keywords: ['environmental initiative', 'clean energy ballot', 'conservation measure'],
    civicTags: ['environment', 'energy', 'conservation']
  },
  {
    id: 'governance-reform',
    name: 'Government Reform Initiatives',
    description: 'Voting system changes, redistricting reform, and government accountability measures.',
    level: 'ballot',
    keywords: ['voting reform', 'redistricting', 'government accountability', 'election reform'],
    civicTags: ['governance', 'reform', 'democracy']
  },

  // SPECIALIZED POLICY AREAS
  {
    id: 'veterans-affairs',
    name: 'Veterans Affairs & Support',
    description: 'Veterans healthcare, benefits, housing assistance, and support services.',
    level: 'federal',
    keywords: ['veterans', 'VA', 'military benefits', 'veteran healthcare', 'veteran housing'],
    civicTags: ['veterans', 'healthcare', 'social_services']
  },
  {
    id: 'technology-policy',
    name: 'Technology & Digital Policy',
    description: 'Internet privacy, digital rights, cybersecurity, and technology regulation.',
    level: 'federal',
    keywords: ['internet privacy', 'digital rights', 'cybersecurity', 'tech regulation', 'data protection'],
    civicTags: ['technology', 'privacy', 'regulation']
  },
  {
    id: 'agriculture-rural',
    name: 'Agriculture & Rural Development',
    description: 'Farm subsidies, rural broadband, agricultural policy, and rural economic development.',
    level: 'federal',
    keywords: ['agriculture', 'farming', 'rural', 'farm subsidies', 'rural broadband'],
    civicTags: ['agriculture', 'rural', 'economy']
  },
  {
    id: 'energy-policy',
    name: 'Energy Policy & Independence',
    description: 'Energy independence, oil and gas policy, renewable energy incentives, and energy infrastructure.',
    level: 'federal',
    keywords: ['energy independence', 'oil', 'gas', 'renewable energy', 'energy infrastructure'],
    civicTags: ['energy', 'infrastructure', 'economy']
  },
  {
    id: 'senior-services',
    name: 'Senior Services & Aging',
    description: 'Social Security, Medicare, senior housing, and aging-related services and policies.',
    level: 'federal',
    keywords: ['social security', 'medicare', 'senior housing', 'aging', 'elderly care'],
    civicTags: ['seniors', 'healthcare', 'social_services']
  }
];

// Helper functions for working with policy categories
export const getPolicyCategoriesByLevel = (level: PolicyCategory['level']): PolicyCategory[] => {
  return POLICY_CATEGORIES.filter(category => category.level === level);
};

export const getPolicyCategoriesByTag = (tag: string): PolicyCategory[] => {
  return POLICY_CATEGORIES.filter(category => category.civicTags.includes(tag));
};

export const searchPolicyCategories = (searchTerm: string): PolicyCategory[] => {
  const term = searchTerm.toLowerCase();
  return POLICY_CATEGORIES.filter(category => 
    category.name.toLowerCase().includes(term) ||
    category.description.toLowerCase().includes(term) ||
    category.keywords.some(keyword => keyword.toLowerCase().includes(term))
  );
};

export const getPolicyCategoryById = (id: string): PolicyCategory | undefined => {
  return POLICY_CATEGORIES.find(category => category.id === id);
};
