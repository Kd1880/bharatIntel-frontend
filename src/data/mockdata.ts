export interface GeoNode {
  id: string
  name: string
  lat: number
  lng: number
  type: 'country' | 'chokepoint' | 'buffer_state' | 'string_of_pearls' | 'dependency'
  wikidataId: string
  impactScore: number
  confidence: number
  lastEvent?: string
}

export interface GeoEdge {
  id: string
  source: string
  target: string
  relation: string
  confidence: number
  conflictFlag: boolean
  validFrom: string
  sourceUrl: string
}

export interface Alert {
  id: string
  number: number
  severity: 'CRITICAL' | 'HIGH' | 'WATCH' | 'INFO'
  title: string
  subtitle: string
  timestamp: string
  region: string
  confidence: number
  pattern: string
  steps: string[]
  edges: string[]
  recommendation: string
  nodes: string[]  // node IDs to highlight in mini graph
  lat?: number     // for map pin
  lng?: number
}

export interface Query {
  id: string
  number: number
  question: string
  answer: string
  timestamp: string
  edgesTraversed: number
  sources: number
  cypherGenerated: string
  usedNodes: string[]
}

export const NODE_COLORS: Record<string, string> = {
  country:         '#00FF41',
  chokepoint:      '#FF3131',
  buffer_state:    '#00B4FF',
  string_of_pearls:'#FFB800',
  dependency:      '#CC44FF',
}

export const NODES: GeoNode[] = [
  { id:'Q668',   name:'India',          lat:20.59,  lng:78.96,  type:'country',          wikidataId:'Q668',  impactScore:100, confidence:1.0  },
  { id:'Q148',   name:'China',          lat:35.86,  lng:104.19, type:'chokepoint',       wikidataId:'Q148',  impactScore:91,  confidence:0.97 },
  { id:'Q843',   name:'Pakistan',       lat:30.37,  lng:69.34,  type:'buffer_state',     wikidataId:'Q843',  impactScore:87,  confidence:0.95 },
  { id:'Q837',   name:'Nepal',          lat:28.39,  lng:84.12,  type:'buffer_state',     wikidataId:'Q837',  impactScore:72,  confidence:0.93 },
  { id:'Q854',   name:'Sri Lanka',      lat:7.87,   lng:80.77,  type:'buffer_state',     wikidataId:'Q854',  impactScore:68,  confidence:0.91 },
  { id:'Q902',   name:'Bangladesh',     lat:23.68,  lng:90.35,  type:'buffer_state',     wikidataId:'Q902',  impactScore:61,  confidence:0.89 },
  { id:'Q836',   name:'Myanmar',        lat:21.91,  lng:95.95,  type:'buffer_state',     wikidataId:'Q836',  impactScore:58,  confidence:0.85 },
  { id:'Gwadar', name:'Gwadar Port',    lat:25.12,  lng:62.32,  type:'chokepoint',       wikidataId:'Q1061', impactScore:83,  confidence:0.88 },
  { id:'Malacca',name:'Str. Malacca',   lat:2.18,   lng:102.25, type:'chokepoint',       wikidataId:'Q182',  impactScore:79,  confidence:0.92 },
  { id:'BRI',    name:'Belt & Road',    lat:39.90,  lng:116.40, type:'string_of_pearls', wikidataId:'Q473',  impactScore:77,  confidence:0.86 },
  { id:'RE',     name:'Rare Earths',    lat:36.0,   lng:101.0,  type:'dependency',       wikidataId:'Q1048', impactScore:85,  confidence:0.91 },
  // extra geo nodes for live event demonstration
  { id:'IL',     name:'Israel',         lat:31.76,  lng:35.21,  type:'country',          wikidataId:'Q801',  impactScore:22,  confidence:0.80 },
  { id:'RU',     name:'Russia',         lat:61.52,  lng:105.31, type:'country',          wikidataId:'Q159',  impactScore:34,  confidence:0.82 },
  { id:'US',     name:'USA',            lat:37.09,  lng:-95.71, type:'country',          wikidataId:'Q30',   impactScore:45,  confidence:0.88 },
]

export const EDGES: GeoEdge[] = [
  { id:'e1',  source:'Q148', target:'Gwadar',  relation:'INVESTS_IN',       confidence:0.91, conflictFlag:false, validFrom:'2015-04-20', sourceUrl:'https://gdelt.org/1001' },
  { id:'e2',  source:'Q148', target:'Q843',    relation:'TRADES_WITH',      confidence:0.95, conflictFlag:false, validFrom:'2013-03-20', sourceUrl:'https://gdelt.org/1002' },
  { id:'e3',  source:'Q148', target:'Q854',    relation:'INVESTS_IN',       confidence:0.88, conflictFlag:true,  validFrom:'2017-07-01', sourceUrl:'https://gdelt.org/1003' },
  { id:'e4',  source:'Q148', target:'Q837',    relation:'TRADES_WITH',      confidence:0.82, conflictFlag:false, validFrom:'2016-05-10', sourceUrl:'https://gdelt.org/1004' },
  { id:'e5',  source:'Q148', target:'BRI',     relation:'LEADS',            confidence:0.97, conflictFlag:false, validFrom:'2013-09-07', sourceUrl:'https://gdelt.org/1005' },
  { id:'e6',  source:'Q148', target:'RE',      relation:'EXPORTS',          confidence:0.93, conflictFlag:false, validFrom:'2010-01-01', sourceUrl:'https://gdelt.org/1006' },
  { id:'e7',  source:'Q668', target:'RE',      relation:'DEPENDS_ON',       confidence:0.91, conflictFlag:false, validFrom:'2010-01-01', sourceUrl:'https://gdelt.org/1007' },
  { id:'e8',  source:'Q668', target:'Q843',    relation:'DISPUTE',          confidence:0.97, conflictFlag:true,  validFrom:'1947-08-14', sourceUrl:'https://gdelt.org/1008' },
  { id:'e9',  source:'Q668', target:'Q148',    relation:'DISPUTE',          confidence:0.95, conflictFlag:true,  validFrom:'1962-10-20', sourceUrl:'https://gdelt.org/1009' },
  { id:'e10', source:'Q668', target:'Malacca', relation:'DEPENDS_ON',       confidence:0.89, conflictFlag:false, validFrom:'2000-01-01', sourceUrl:'https://gdelt.org/1010' },
  { id:'e11', source:'Q843', target:'Gwadar',  relation:'HOSTS',            confidence:0.94, conflictFlag:false, validFrom:'2015-04-20', sourceUrl:'https://gdelt.org/1011' },
]

export const ALERTS: Alert[] = [
  {
    id:'a1', number:1, severity:'CRITICAL',
    title:'String of Pearls — 3/4 steps matched',
    subtitle:'CHN → Gwadar → PAK border arc',
    timestamp:'2m ago', region:'WESTERN INDIAN OCEAN',
    confidence:0.87, pattern:'String of Pearls',
    steps:['CHN invests in Gwadar ✓','PAK hosts CPEC ✓','LKA port agreement ✓','Myanmar access — pending'],
    edges:['Q148→Gwadar: INVESTS_IN (0.91)','Q843→Gwadar: HOSTS (0.94)','Q148→Q854: INVESTS_IN (0.88)'],
    recommendation:'Monitor Myanmar port negotiations. 4th step completion triggers full encirclement.',
    nodes:['Q148','Q843','Q854','Gwadar','BRI'],
    lat:25.12, lng:62.32,
  },
  {
    id:'a2', number:2, severity:'CRITICAL',
    title:'Gwadar militarisation — dual-use detected',
    subtitle:'PLA-N vessels 3x in 60 days',
    timestamp:'14m ago', region:'ARABIAN SEA',
    confidence:0.92, pattern:'Debt Trap + Military',
    steps:['LKA port leased to CHN ✓','CPEC military facilities ✓','PLA-N docking confirmed ✓'],
    edges:['Q148→Q854: INVESTS_IN (0.88)','Q843→Gwadar: HOSTS (0.94)'],
    recommendation:'Direct naval threat to Indian Ocean security. 400km from Indian coast.',
    nodes:['Q148','Q843','Gwadar'],
    lat:25.12, lng:62.32,
  },
  {
    id:'a3', number:3, severity:'HIGH',
    title:'LAC troop buildup — Aksai Chin',
    subtitle:'3,000+ PLA forward positions',
    timestamp:'1h ago', region:'HIMALAYAN BORDER',
    confidence:0.78, pattern:'Military Buildup',
    steps:['Satellite confirms PLA deployment ✓','India Army escalation risk ✓','Diplomatic pressure renewed ✓'],
    edges:['Q668→Q148: DISPUTE (0.95)'],
    recommendation:'India may need to redirect forces from other sectors.',
    nodes:['Q668','Q148'],
    lat:35.86, lng:104.19,
  },
  {
    id:'a4', number:4, severity:'WATCH',
    title:'Nepal BRI accession signal',
    subtitle:'Q837 buffer state at risk',
    timestamp:'3h ago', region:'SOUTH ASIA',
    confidence:0.78, pattern:'Buffer Erosion',
    steps:['Nepal signed BRI MoU 2017 ✓','CHN trade share growing ✓','IND remittance dependency high'],
    edges:['Q148→Q837: TRADES_WITH (0.82)','Q668→Q837 buffer path weakening'],
    recommendation:'Nepal on northern buffer arc. BRI entrenchment collapses 3 edges.',
    nodes:['Q668','Q148','Q837'],
    lat:28.39, lng:84.12,
  },
  {
    id:'a5', number:5, severity:'WATCH',
    title:'IND–CHN trade tone improving',
    subtitle:'AvgTone +1.4 over 30d baseline',
    timestamp:'6h ago', region:'DIPLOMATIC',
    confidence:0.74, pattern:'Tone Shift',
    steps:['GDELT AvgTone: −1.2 → +0.2 ✓','NumArticles up 18% ✓','Border flux events down 3'],
    edges:['Q668↔Q148 AvgTone delta +1.4'],
    recommendation:'Possible diplomatic thaw. Cross-reference World Bank trade volumes.',
    nodes:['Q668','Q148'],
    lat:20.59, lng:78.96,
  },
  {
    id:'a6', number:6, severity:'INFO',
    title:'Malacca dependency — stable',
    subtitle:'No new chokepoint events',
    timestamp:'12h ago', region:'INDIAN OCEAN',
    confidence:0.92, pattern:'Chokepoint Monitor',
    steps:['No military incidents ✓','Shipping volume nominal ✓','IND naval presence maintained ✓'],
    edges:['Q668→Malacca: DEPENDS_ON (0.89)'],
    recommendation:'No immediate escalation risk. Standard monitoring.',
    nodes:['Q668','Malacca'],
    lat:2.18, lng:102.25,
  },
]

export const QUERIES: Query[] = [
  {
    id:'q1', number:1,
    question:'What leverage does China have over India via rare earths?',
    answer:'India imports 72% of rare earth elements from China (conf 0.91 · 6 sources). In 3 of 4 LAC escalation events since 2017, export delays followed within 18 days. Graph path: India DEPENDS_ON → RareEarthImports → China.',
    timestamp:'08:14 IST', edgesTraversed:14, sources:8,
    cypherGenerated:`MATCH (i:Country {id:'Q668'})-[r:DEPENDS_ON]->(re)-[:SOURCED_FROM]->(c:Country {id:'Q148'}) RETURN r, re, c`,
    usedNodes:['Q668','RE','Q148'],
  },
  {
    id:'q2', number:2,
    question:'Which neighbors have overlapping defense agreements with India and China?',
    answer:'Bangladesh (BIMSTEC + SCO observer), Sri Lanka (VSC port + SAARC), Myanmar (border security + BRI debt). All three have dual allegiance structures creating potential conflict-of-interest.',
    timestamp:'07:52 IST', edgesTraversed:22, sources:6,
    cypherGenerated:`MATCH (n:Country)-[:ALLIED_WITH]->(india:Country {id:'Q668'}), (n)-[:ALLIED_WITH]->(china:Country {id:'Q148'}) RETURN n`,
    usedNodes:['Q668','Q148','Q854','Q902','Q836'],
  },
  {
    id:'q3', number:3,
    question:'How has India-Pakistan media tone changed since Balakot 2019?',
    answer:'Media tone (Goldstein) deteriorated from avg −1.2 (2020) to −3.8 (2024). Driven by Galwan, LAC incidents. India-Bangladesh improved +2.1 → +3.8. Polarization increasing with India gaining eastern, losing maritime sphere.',
    timestamp:'Yesterday', edgesTraversed:18, sources:12,
    cypherGenerated:`MATCH (i:Country {id:'Q668'})-[r:MEDIA_TONE]->(p:Country {id:'Q843'}) WHERE r.date >= '2019-02-26' RETURN r ORDER BY r.date`,
    usedNodes:['Q668','Q843'],
  },
]

export const TICKER_ITEMS = [
  { severity:'CRITICAL', text:'CHN invests_in Gwadar Port',           conf:0.91, source:'Al Jazeera',   age:'2m'  },
  { severity:'WATCH',    text:'Nepal signs_agreement_with CHN',        conf:0.82, source:'The Diplomat', age:'8m'  },
  { severity:'CRITICAL', text:'String of Pearls — 3/4 steps matched', conf:0.87, source:'Pattern engine',age:'12m' },
  { severity:'INFO',     text:'IND-CHN trade tone +1.4 over 30d',      conf:0.74, source:'GDELT',         age:'22m' },
  { severity:'WATCH',    text:'LKA debt/GDP rising · BRI signal',      conf:0.81, source:'CFR',           age:'35m' },
  { severity:'CRITICAL', text:'CPEC expansion despite IND-PAK war',    conf:0.93, source:'Newsweek',      age:'41m' },
  { severity:'INFO',     text:'Quad summit — IND-US-JPN-AUS aligned',  conf:0.88, source:'Reuters',       age:'1h'  },
  { severity:'WATCH',    text:'Chabahar Port future uncertain',         conf:0.76, source:'ToI',           age:'2h'  },
]