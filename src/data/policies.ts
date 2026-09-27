export interface PolicyClause {
  id: string;
  section: string;
  clauseNumber: string;
  title: string;
  content: string;
  tags: string[];
}

export interface SampleScenario {
  id: string;
  title: string;
  query: string;
  expectedClause: string;
  description: string;
}

export interface InsurancePolicy {
  id: string;
  title: string;
  code: string;
  category: 'Auto' | 'Home' | 'Health' | 'Travel';
  insurer: string;
  policyholder: string;
  policyNumber: string;
  effectivePeriod: string;
  status: 'Active' | 'Under Review';
  summary: {
    deductible: string;
    coverageLimit: string;
    premium: string;
    specialNotes: string;
  };
  clauses: PolicyClause[];
  sampleScenarios: SampleScenario[];
  fullDocumentText: string;
}

export const POLICIES: InsurancePolicy[] = [
  {
    id: 'auto-gold',
    title: 'AutoShield Gold — Personal Auto Policy',
    code: 'PAP-2026-GOLD',
    category: 'Auto',
    insurer: 'NSOffice Mutual Insurance Corp',
    policyholder: 'Alex & Morgan Vance',
    policyNumber: 'AP-8849201-B',
    effectivePeriod: 'Jan 15, 2026 – Jan 15, 2027',
    status: 'Active',
    summary: {
      deductible: 'Collision: $500 | Comprehensive: $250',
      coverageLimit: 'Liability: $250k/$500k/$100k | Comprehensive: ACV',
      premium: '$1,280 / year (Paid in Full)',
      specialNotes: 'Includes Glass Waiver ($0 Ded) & Rental Reimbursement ($50/day up to 30 days)',
    },
    sampleScenarios: [
      {
        id: 'auto-deer-strike',
        title: 'Deer Collision / Animal Strike',
        query: "I was driving on Route 9 near Hudson Valley at dusk and a deer leaped out. I hit it, and my front bumper, grille, and radiator are cracked. What's my deductible and does this count as an at-fault accident that will raise my rates?",
        expectedClause: 'Section II, Clause 1.2(c) - Comprehensive Perils',
        description: 'Hits animal on road; comprehensive $250 deductible applies rather than collision $500, not considered at-fault.',
      },
      {
        id: 'auto-hit-and-run',
        title: 'Hit-and-Run in Parking Lot',
        query: "My vehicle was legally parked at the supermarket. When I returned, the entire rear passenger quarter panel was dented and scraped. No note was left. What do I need to do to file a claim?",
        expectedClause: 'Section III, Clause 4.2 - Notice of Loss & Police Reporting',
        description: 'Hit-and-run loss; requires 24-hour police report for collision/uninsured motorist coverage.',
      },
      {
        id: 'auto-rental-car',
        title: 'Rental Car While in Repair Shop',
        query: "My car needs to be in the body shop for approximately 10 days for covered repairs. Does my policy provide a replacement rental vehicle?",
        expectedClause: 'Section II, Clause 3.1 - Transportation Expenses & Rental Car',
        description: 'Rental reimbursement covers up to $50/day for up to 30 days while car is undergoing covered repairs.',
      },
      {
        id: 'auto-windshield-crack',
        title: 'Rock Chip & Windshield Crack',
        query: "A rock kicked up from a gravel truck on the highway and created a star crack across my front windshield. How much will I pay out of pocket to get it replaced?",
        expectedClause: 'Section II, Clause 1.2(d) - Windshield & Safety Glass Waiver',
        description: 'Glass waiver applies: $0 deductible for repair, or $50 deductible for full OEM replacement.',
      },
    ],
    clauses: [
      {
        id: 'clause-1-1',
        section: 'Section II: Coverage for Damage to Your Auto',
        clauseNumber: 'Clause 1.1',
        title: 'Collision Coverage & Standard Deductible',
        content: `The Company will pay for direct and accidental physical loss to 'your covered auto' caused by collision with another object or vehicle, or by upset of 'your covered auto'. A deductible of $500 applies to each occurrence under this coverage. The Company's liability shall not exceed the Actual Cash Value (ACV) of the vehicle at the time of loss.`,
        tags: ['collision', 'deductible', 'acv', 'vehicle damage'],
      },
      {
        id: 'clause-1-2c',
        section: 'Section II: Coverage for Damage to Your Auto',
        clauseNumber: 'Clause 1.2(c)',
        title: 'Comprehensive (Other Than Collision) — Animal Impact & Natural Perils',
        content: `Comprehensive coverage protects against direct physical loss caused by perils other than collision. For purposes of this policy, contact with a bird or animal (including deer, elk, cattle, and domestic livestock) shall be treated expressly as a COMPREHENSIVE loss, subject to the reduced Comprehensive Deductible of $250. Such claims are non-fault comprehensive incidents and shall not be subject to safe-driver policy surcharges upon annual renewal.`,
        tags: ['deer', 'animal strike', 'comprehensive', 'deductible', 'rate increase', 'at-fault'],
      },
      {
        id: 'clause-1-2d',
        section: 'Section II: Coverage for Damage to Your Auto',
        clauseNumber: 'Clause 1.2(d)',
        title: 'Safety Glass & Windshield Endorsement',
        content: `Under the Gold Protection Endorsement, windshield chips and cracks measuring less than 6 inches will be repaired with zero deductible ($0 out-of-pocket). Where structural windshield replacement is required for driver assistance sensor calibration, a reduced glass deductible of $50 applies.`,
        tags: ['windshield', 'glass', 'rock chip', 'deductible waiver'],
      },
      {
        id: 'clause-2-4',
        section: 'Section II: Physical Damage Conditions',
        clauseNumber: 'Clause 2.4',
        title: 'Original Equipment Manufacturer (OEM) Replacement Parts',
        content: `For vehicles within the first 3 model years of original manufacture, the Company authorizes original equipment manufacturer (OEM) replacement components for all safety-critical structural and mechanical assemblies. For vehicles exceeding 3 model years, certified Like-Kind-and-Quality (LKQ) components may be utilized unless the OEM endorsement premium was specifically scheduled.`,
        tags: ['oem parts', 'repairs', 'body shop', 'lkq'],
      },
      {
        id: 'clause-3-1',
        section: 'Section II: Transportation & Rental Benefits',
        clauseNumber: 'Clause 3.1',
        title: 'Rental Reimbursement & Transportation Expenses',
        content: `The Company will reimburse the insured for reasonable rental vehicle expenses up to $50 per calendar day, for a maximum aggregate duration of 30 days ($1,500 maximum), incurred when 'your covered auto' is withdrawn from normal use for more than 24 hours due to a covered Collision or Comprehensive loss. Coverage commences 24 hours after loss report and terminates when vehicle repairs are certified complete.`,
        tags: ['rental car', 'transportation', 'daily limit', 'repair delay'],
      },
      {
        id: 'clause-4-2',
        section: 'Section III: General Duties After An Accident or Loss',
        clauseNumber: 'Clause 4.2',
        title: 'Notice of Loss & Hit-and-Run Police Report Requirement',
        content: `The insured must give prompt notice to the Company or its authorized agent. In the event of a Hit-and-Run accident, theft, or vandalism, the insured MUST notify the police or competent law enforcement jurisdiction within 24 hours of discovery, obtain an official police incident report number, and make the damaged property available for physical inspection prior to repair authorization.`,
        tags: ['hit-and-run', 'police report', '24 hours', 'proof of loss'],
      },
    ],
    fullDocumentText: `NSOFFICE MUTUAL INSURANCE CORP — PERSONAL AUTO POLICY GOLD (PAP-2026-GOLD)
Policyholder: Alex & Morgan Vance | Policy No: AP-8849201-B | Term: 2026-2027

SECTION I: DECLARATIONS & SCHEDULE OF COVERAGES
- Bodily Injury Liability: $250,000 per person / $500,000 per occurrence
- Property Damage Liability: $100,000 per occurrence
- Collision Deductible: $500 per covered loss
- Comprehensive (Other Than Collision) Deductible: $250 per covered loss
- Transportation / Rental Reimbursement: $50/day up to 30 days ($1,500 aggregate)
- Roadside Assistance: Unlimited towing up to 25 miles per incident

SECTION II: PHYSICAL DAMAGE COVERAGES
Clause 1.1 - Collision Coverage: Covers accidental physical damage to covered auto caused by collision with another object or upset. Subject to $500 collision deductible.
Clause 1.2(c) - Comprehensive Perils (Animal Strike): Direct physical loss caused by contact with a bird or animal (such as deer, elk, or livestock) is classified expressly as Comprehensive. Subject to $250 comprehensive deductible. Comprehensive losses are non-fault and do not affect safe-driver renewal discounts.
Clause 1.2(d) - Windshield Waiver: Chip repair has $0 deductible; complete replacement with ADAS sensor calibration carries a $50 glass deductible.
Clause 2.4 - OEM Replacement Parts: Vehicles under 3 model years receive genuine OEM parts.
Clause 3.1 - Rental Vehicle Reimbursement: Up to $50 per day for up to 30 days when vehicle is inoperable or undergoing active repair due to a covered loss.

SECTION III: GENERAL PROVISIONS & DUTIES
Clause 4.2 - Notice of Loss & Hit-and-Run: Notice must be filed promptly. Hit-and-run or vandalism requires reporting to law enforcement within 24 hours.`,
  },
  {
    id: 'home-platinum',
    title: 'HomeGuard Platinum — All-Risk Homeowners Policy',
    code: 'HO-3-PLATINUM',
    category: 'Home',
    insurer: 'NSOffice Property & Casualty Syndicate',
    policyholder: 'David & Sarah Chen',
    policyNumber: 'HO-5104882-C',
    effectivePeriod: 'Mar 01, 2026 – Mar 01, 2027',
    status: 'Active',
    summary: {
      deductible: '$1,000 Standard Property | Wind/Hail: 1%',
      coverageLimit: 'Dwelling: $650,000 | Personal Property: $325,000 | Liability: $500,000',
      premium: '$2,150 / year',
      specialNotes: 'Includes Water Backup Endorsement ($10,000 limit) and Equipment Breakdown',
    },
    sampleScenarios: [
      {
        id: 'home-pipe-burst',
        title: 'Sudden Plumbing Pipe Burst',
        query: "A copper water pipe burst under my second-floor bathroom vanity while we were at work. Water leaked through the ceiling into the downstairs kitchen and living room hardwood floors. Is this covered, and what is our deductible?",
        expectedClause: 'Section I, Clause 3.2(a) - Sudden & Accidental Water Discharge',
        description: 'Sudden plumbing pipe failure is covered under standard $1,000 deductible; distinguishes from continuous gradual leaks.',
      },
      {
        id: 'home-sewer-backup',
        title: 'Basement Drain & Sewer Backup',
        query: "After heavy rainfall, municipal storm runoff caused the basement floor drain to back up, ruining our finished basement carpet and drywall. Do we have coverage for this?",
        expectedClause: 'Section I, Clause 3.5 - Water Backup of Sewers & Drains Endorsement',
        description: 'Covered under the attached Water Backup Endorsement up to $10,000 with a $500 endorsement deductible.',
      },
      {
        id: 'home-fallen-tree',
        title: 'Fallen Tree on Roof After Storm',
        query: "During last night's windstorm, our neighbor's oak tree fell across our roof and punctured the master bedroom ceiling. Does our policy pay to remove the tree and fix the roof?",
        expectedClause: 'Section I, Clause 4.1 - Windstorm & Fallen Tree Debris Removal',
        description: 'Roof damage covered under Dwelling A; debris removal covered up to $1,500; subrogation against neighbor if tree was known dead/diseased.',
      },
    ],
    clauses: [
      {
        id: 'clause-home-3-2a',
        section: 'Section I: Perils Insured Against — Dwelling & Other Structures',
        clauseNumber: 'Clause 3.2(a)',
        title: 'Sudden and Accidental Discharge of Water or Steam',
        content: `The Company covers accidental direct physical loss caused by sudden and accidental discharge or overflow of water or steam from within a plumbing, heating, air conditioning, or automatic fire protective sprinkler system, or from within a household appliance. The Company will also pay the reasonable cost of tearing out and replacing any part of the building necessary to repair the system from which the water escaped. Standard policy deductible of $1,000 applies.`,
        tags: ['water damage', 'pipe burst', 'plumbing', 'sudden accidental', 'tear out'],
      },
      {
        id: 'clause-home-3-2b',
        section: 'Section I: Exclusions — Water Damage',
        clauseNumber: 'Clause 3.2(b)',
        title: 'Exclusion of Continuous or Repeated Seepage',
        content: `The Company does NOT insure against loss caused by continuous, repeated, or gradual seepage or leakage of water or steam over a period of 14 days or more from within a plumbing system, appliance, or roof structure, whether known or unknown to the insured. The insured is obligated to maintain standard preventative maintenance.`,
        tags: ['gradual leak', 'mold', 'seepage exclusion', 'maintenance'],
      },
      {
        id: 'clause-home-3-5',
        section: 'Section I: Endorsement HO-0495',
        clauseNumber: 'Clause 3.5',
        title: 'Water Backup of Sewers and Sump Pump Overflow',
        content: `By endorsement, coverage is extended up to an aggregate limit of $10,000 for direct physical loss to covered dwelling and personal property caused by water or water-borne material which backs up through sewers or drains, or which overflows or is discharged from a sump, sump pump, or related equipment. A dedicated endorsement deductible of $500 applies to claims under this section.`,
        tags: ['sewer backup', 'drain backup', 'sump pump', 'water backup endorsement'],
      },
      {
        id: 'clause-home-4-1',
        section: 'Section I: Additional Coverages',
        clauseNumber: 'Clause 4.1',
        title: 'Windstorm, Hail, and Fallen Tree Debris Removal',
        content: `The Company will pay up to $1,500 per occurrence (not to exceed $1,000 for any single tree) for the reasonable expense of removing fallen trees from the residence premises, provided the tree damaged a covered structure or blocks an ingress/egress driveway. Dwelling structural repairs are adjusted under Coverage A subject to the standard property deductible.`,
        tags: ['windstorm', 'fallen tree', 'roof damage', 'debris removal'],
      },
      {
        id: 'clause-home-5-1',
        section: 'Section II: Comprehensive Personal Liability',
        clauseNumber: 'Clause 5.1',
        title: 'Personal Liability & Medical Payments to Others',
        content: `If a claim is made or a suit is brought against an insured for damages because of bodily injury or property damage caused by an occurrence to which this coverage applies, the Company will pay up to $500,000 for the damages for which the insured is legally liable. Coverage F provides up to $5,000 for necessary medical expenses incurred within three years from the date of an accident causing bodily injury to guests on the insured premises.`,
        tags: ['guest injury', 'liability', 'medical payments', 'slip and fall'],
      },
    ],
    fullDocumentText: `NSOFFICE PROPERTY & CASUALTY SYNDICATE — HOMEGUARD PLATINUM (HO-3-PLATINUM)
Policyholder: David & Sarah Chen | Property: 142 Elmwood Crest, Seattle, WA | Policy No: HO-5104882-C

SECTION I: PROPERTY COVERAGES
Coverage A (Dwelling): $650,000
Coverage B (Other Structures): $65,000
Coverage C (Personal Property): $325,000
Coverage D (Loss of Use): $130,000
Standard Deductible: $1,000

Clause 3.2(a) - Sudden & Accidental Water Discharge: Covers sudden bursting of plumbing pipes, heating, or appliances, including tear-out costs to access plumbing. Subject to $1,000 deductible.
Clause 3.2(b) - Gradual Seepage Exclusion: Excludes leaks persisting longer than 14 days or continuous decay.
Clause 3.5 - Water Backup Endorsement: Covers up to $10,000 for sewer and drain backups with a $500 deductible.
Clause 4.1 - Fallen Tree & Debris: Covers roof damage plus up to $1,500 for tree debris removal.
Clause 5.1 - Liability & Guest Medical: Up to $500,000 personal liability and $5,000 medical payments for guest injuries.`,
  },
  {
    id: 'health-premier',
    title: 'MediShield Premier — PPO Gold Healthcare Plan',
    code: 'HLTH-PPO-2026',
    category: 'Health',
    insurer: 'NSOffice Health Alliance',
    policyholder: 'Jordan Taylor',
    policyNumber: 'MH-773199-01',
    effectivePeriod: 'Jan 01, 2026 – Dec 31, 2026',
    status: 'Active',
    summary: {
      deductible: 'In-Network: $1,500 | Out-of-Network: $3,000',
      coverageLimit: 'Out-of-Pocket Max: $4,500 In-Network / $9,000 Out',
      premium: '$420 / month',
      specialNotes: 'Includes No Surprises Act Protection for Emergency & Out-of-Network Stabilization',
    },
    sampleScenarios: [
      {
        id: 'health-emergency-room',
        title: 'Emergency Room Visit Out-of-State',
        query: "I am on a business trip in Denver and experiencing acute abdominal pain. Can I go to the nearest hospital emergency room without prior authorization, and will it be covered as in-network?",
        expectedClause: 'Section II, Clause 2.1 - Emergency Care & No Surprises Act',
        description: 'True emergency room care requires no prior authorization and is legally covered at in-network cost-sharing under the No Surprises Act.',
      },
      {
        id: 'health-specialist-referral',
        title: 'Specialist Consultation & Direct Access',
        query: "I need to see a dermatologist for a suspicious mole. Do I need to get a referral from my primary care physician first?",
        expectedClause: 'Section III, Clause 6.2 - Specialist Care & Open Access',
        description: 'PPO plan allows direct scheduling with in-network specialists without PCP referral; $40 copay applies.',
      },
    ],
    clauses: [
      {
        id: 'clause-hlth-2-1',
        section: 'Section II: Emergency & Urgent Medical Services',
        clauseNumber: 'Clause 2.1',
        title: 'Emergency Medical Care & No Surprises Protection',
        content: `Emergency medical services for an emergency medical condition do NOT require prior authorization. Under federal and state No Surprises regulations, emergency care rendered at an out-of-network facility or by out-of-network clinicians shall be adjudicated at the In-Network cost-sharing level ($250 copay, then 20% coinsurance after deductible). Balance billing by out-of-network providers for emergency stabilization is prohibited.`,
        tags: ['emergency room', 'no surprises act', 'prior authorization', 'copay'],
      },
      {
        id: 'clause-hlth-3-3',
        section: 'Section II: Outpatient & Urgent Care',
        clauseNumber: 'Clause 3.3',
        title: 'Urgent Care Center Services',
        content: `Services received at a participating In-Network Urgent Care facility for non-life-threatening illness or injuries are covered with a fixed $35 copay per visit. Deductible is waived for urgent care consultations.`,
        tags: ['urgent care', 'copay', 'deductible waiver'],
      },
      {
        id: 'clause-hlth-6-2',
        section: 'Section III: Specialist Care & Diagnostics',
        clauseNumber: 'Clause 6.2',
        title: 'Specialist Direct Access & Prior Authorization Thresholds',
        content: `As a MediShield PPO member, you may consult any in-network participating specialist without obtaining a referral from your primary care physician. Specialist office consultations are subject to a $40 copay. Advanced outpatient diagnostic imaging (MRI, CT, PET scans) requires clinical prior authorization from your ordering physician prior to service delivery.`,
        tags: ['specialist', 'no referral', 'copay', 'mri', 'prior authorization'],
      },
    ],
    fullDocumentText: `NSOFFICE HEALTH ALLIANCE — MEDISHIELD PREMIER PPO GOLD (HLTH-PPO-2026)
Member: Jordan Taylor | Policy: MH-773199-01 | Calendar Year 2026

Deductible: $1,500 Individual / $3,000 Family
Out-of-Pocket Maximum: $4,500 Individual
Emergency Room: $250 Copay + 20% Coinsurance
Specialist Visit: $40 Copay (No referral required)
Urgent Care: $35 Copay

Clause 2.1 - Emergency Room Care: Covered without prior authorization at in-network rates under No Surprises Act regardless of facility network status.
Clause 3.3 - Urgent Care: $35 fixed copay, deductible waived.
Clause 6.2 - Specialist Care: Direct access without PCP referral; advanced imaging requires prior authorization.`,
  },
  {
    id: 'travel-platinum',
    title: 'GlobalTraveler Elite — Worldwide Travel & Trip Protection',
    code: 'TRV-WORLD-2026',
    category: 'Travel',
    insurer: 'NSOffice Global Underwriters',
    policyholder: 'Elena Rostova',
    policyNumber: 'GT-903124-E',
    effectivePeriod: 'Feb 10, 2026 – Feb 10, 2027',
    status: 'Active',
    summary: {
      deductible: '$0 Deductible for Delays & Baggage | $100 Medical',
      coverageLimit: 'Trip Cancellation: $10,000 | Evacuation: $500,000',
      premium: '$385 / year (Annual Multi-Trip)',
      specialNotes: 'Includes 4-Hour Flight Delay Benefit and Emergency Dental Relief Abroad',
    },
    sampleScenarios: [
      {
        id: 'travel-flight-delay',
        title: '7-Hour Flight Disruption in Frankfurt',
        query: "My connecting flight from Frankfurt to London was canceled due to mechanical issues, and the next flight isn't until tomorrow morning (an 8-hour delay). Can I expense a hotel room and dinner?",
        expectedClause: 'Section II, Clause 2.1 - Trip Delay & Essential Accommodations',
        description: 'Delays exceeding 4 hours entitle policyholder to up to $250 per day (up to $1,000 total) for hotel and meals.',
      },
      {
        id: 'travel-emergency-dental',
        title: 'Emergency Tooth Extraction Abroad',
        query: "While visiting Spain, I developed an excruciating tooth abscess and had to see an emergency dentist for pain relief and an extraction. Is this covered?",
        expectedClause: 'Section III, Clause 4.5 - Emergency Dental Pain Relief',
        description: 'Emergency dental treatment for acute pain is covered up to $1,500 with a $50 deductible.',
      },
    ],
    clauses: [
      {
        id: 'clause-trv-2-1',
        section: 'Section II: Flight Disruption & Travel Inconvenience',
        clauseNumber: 'Clause 2.1',
        title: 'Trip Delay & Essential Living Expenses',
        content: `If your common carrier flight is delayed for 4 or more consecutive hours from the scheduled departure time due to mechanical breakdown, adverse weather, or airline labor strike, the Company will reimburse reasonable additional living expenses up to $250 per 24-hour period, up to an aggregate maximum of $1,000. Eligible expenses include reasonable hotel accommodation, restaurant meals, and local transit to/from lodging. Receipts and airline delay certification are required.`,
        tags: ['flight delay', 'hotel reimbursement', 'meals', '4 hours', 'airline delay'],
      },
      {
        id: 'clause-trv-2-4',
        section: 'Section II: Baggage Inconvenience',
        clauseNumber: 'Clause 2.4',
        title: 'Baggage Delay (> 6 Hours)',
        content: `If your checked baggage is delayed or misdirected by a common carrier for more than 6 hours after your scheduled arrival, the Company will reimburse up to $300 for the immediate purchase of essential clothing, toiletries, and medication.`,
        tags: ['baggage delay', 'lost luggage', 'toiletries', 'clothes'],
      },
      {
        id: 'clause-trv-4-5',
        section: 'Section III: Emergency Medical & Dental',
        clauseNumber: 'Clause 4.5',
        title: 'Emergency Dental Relief for Acute Pain',
        content: `The Company will pay up to $1,500 for emergency dental treatment performed by a licensed practitioner outside the insured's home country, provided such treatment is necessitated by acute, sudden dental pain or injury to sound natural teeth. A $50 deductible applies.`,
        tags: ['emergency dental', 'tooth pain', 'travel medical', 'abroad'],
      },
    ],
    fullDocumentText: `NSOFFICE GLOBAL TRAVELER ELITE (TRV-WORLD-2026)
Insured: Elena Rostova | Policy No: GT-903124-E | Annual Multi-Trip Policy

Trip Cancellation: Up to $10,000 per trip
Flight Delay (4+ hours): $250/day up to $1,000
Baggage Delay (6+ hours): Up to $300 for essentials
Emergency Medical: $250,000 | Evacuation: $500,000

Clause 2.1 - Trip Delay: Flights delayed > 4 hours qualify for up to $250/day hotel, meal, and transit reimbursement.
Clause 2.4 - Baggage Delay: Delay > 6 hours allows $300 emergency purchases.
Clause 4.5 - Emergency Dental: Up to $1,500 for sudden acute dental pain abroad with a $50 deductible.`,
  },
];
