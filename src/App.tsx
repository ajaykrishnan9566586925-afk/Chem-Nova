import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Sparkles,
  Brain,
  FileText,
  ChevronRight,
  ChevronLeft,
  Award,
  Search,
  Layers,
  FlaskConical,
  Loader2,
  AlertCircle,
  Check,
  Video,
  Globe,
  GraduationCap,
  Mic
} from 'lucide-react';

// ============================================================================
// SAFE REACT CHILD & ERROR BOUNDARY GUARD
// ============================================================================

function safeText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

class StudioErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected rendering error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-center">
            <h2 className="text-lg font-bold text-rose-400">Chemistry Studio View Recovered</h2>
            <p className="text-xs text-slate-400">{this.state.message}</p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold cursor-pointer"
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// RUNTIME API KEY HELPER (SUPPORTS BOTH CANVAS RUNTIME & VITE ENV)
// ============================================================================

function getGeminiApiKey(): string {
  try {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env;
    if (metaEnv && typeof metaEnv.VITE_GEMINI_API_KEY === 'string') {
      return metaEnv.VITE_GEMINI_API_KEY;
    }
  } catch {
    // Fallback to empty string so Canvas runtime injects the key automatically
  }
  return '';
}







// ============================================================================
// MULTILINGUAL TRANSLATIONS & BOLD INDIAN MALE VOICE + SSML CONFIGURATION
// ============================================================================

type LangCode = 'en';
interface LanguageOption {
  code: LangCode;
  name: string;
  nativeName: string;
  bcp47: string;
  ssmlLang: string;
  ttsInstruction: string;
}
const LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English (India)',
    nativeName: 'English (IN)',
    bcp47: 'en-IN',
    ssmlLang: 'en-IN',
    ttsInstruction:
      'VOICE STYLE: Bold, deep, resonant Indian male chemistry professor from Tamil Nadu speaking in a clear Indian English accent (en-IN). Strictly bold male Indian voice only—NEVER American or British accent, NEVER female voice. Do NOT say good morning, vanakkam, hello, or any greetings. Speak with strong, steady authority and read every single word completely from start to finish:'
  }
];interface UiTranslationSet {
  appSubtitle: string;
  tabStudio: string;
  tabSyllabus: string;
  tabPractice: string;
  tabPast: string;
  syllabusMastery: string;
  studioHeader: string;
  studioSub: string;
  topicLabel: string;
  generateBtn: string;
  generatingBtn: string;
  watchLesson: string;
  fullUnitVideo: string;
  videoBtn: string;
  syllabusHeader: string;
  syllabusSub: string;
  allClass12Label: string;
  volume1Label: string;
  volume2Label: string;
  practiceHeader: string;
  practiceSub: string;
  allTopicsFilter: string;
  questionLabel: string;
  explanationLabel: string;
  pastHeader: string;
  pastSub: string;
  searchPlaceholder: string;
  revealSolution: string;
  hideSolution: string;
  generateWalkthrough: string;
  finalAnswerLabel: string;
  askTutorTitle: string;
  askTutorPlaceholder: string;
  solveBtn: string;
  derivingBtn: string;
}

const ENGLISH_UI_STRINGS: UiTranslationSet = {
  appSubtitle: 'TN Class 12 (+2) Samacheer Kalvi Chemistry AI',
  tabStudio: 'AI Video Studio',
  tabSyllabus: 'Class 12 Syllabus',
  tabPractice: 'Practice & Sums',
  tabPast: 'HSC Board Papers',
  syllabusMastery: 'Class 12 Mastery',
  studioHeader: 'Avichi Chem Nova — TN Class 12 (+2) Chemistry AI Video Studio',
  studioSub: 'Step-by-step solved numericals with live value-changing visuals & bold Indian male voice (<5s).',
  topicLabel: 'TN Class 12 Samacheer Kalvi Chemistry Unit, Lesson, Topic or Numerical Sum',
  generateBtn: 'Generate AI Lesson',
  generatingBtn: 'Generating (<5s)...',
  watchLesson: 'Watch AI Video Lesson',
  fullUnitVideo: 'Full Chapter Video',
  videoBtn: 'Video',
  syllabusHeader: 'Tamil Nadu Class 12 (+2) Chemistry Complete Syllabus',
  syllabusSub: 'Every chapter, every unit & every topic from TN State Board Samacheer Kalvi Class 12: Volume 1 (Chapters 1–7) & Volume 2 (Chapters 8–15).',
  allClass12Label: 'All Chapters (1–15)',
  volume1Label: 'Volume 1 (Ch 1–7)',
  volume2Label: 'Volume 2 (Ch 8–15)',
  practiceHeader: 'TN Class 12 Chemistry Step-by-Step Practice & Numericals',
  practiceSub: 'Tamil Nadu State Board Class 12 (+2) Chemistry questions and numerical sums with step-by-step solutions.',
  allTopicsFilter: 'All Class 12 Chemistry Chapters (1–15)',
  questionLabel: 'Question',
  explanationLabel: 'Step-by-Step Explanation',
  pastHeader: 'TN Class 12 (+2) HSC Chemistry Public Exam Archive',
  pastSub: 'Tamil Nadu HSC (+2) Chemistry Public Exam questions with step-by-step markscheme derivations and numericals.',
  searchPlaceholder: 'Search year, chapter or topic...',
  revealSolution: 'Reveal Step-by-Step Solution',
  hideSolution: 'Hide Step-by-Step Solution',
  generateWalkthrough: 'Generate Video Walkthrough',
  finalAnswerLabel: 'Final Answer',
  askTutorTitle: 'Ask Avichi Chem Nova AI',
  askTutorPlaceholder: 'Ask any TN Class 12 Chemistry numerical, mechanism, or law...',
  solveBtn: 'Solve Step-by-Step',
  derivingBtn: 'Solving...'
};

function getUiStrings(lang: LangCode): UiTranslationSet {
  // Strictly change the entire UI into Tamil when Tamil is selected; keep English for all other languages
  void lang; return ENGLISH_UI_STRINGS;
}

// ============================================================================
// COMPLETE TAMIL NADU STATE BOARD (SAMACHEER KALVI) CLASS 12 (+2) CHEMISTRY
// EVERY SINGLE CHAPTER (1–15) AND EVERY INDIVIDUAL TOPIC COVERED
// ============================================================================

type VolumeFilter = 'all' | 'Volume 1' | 'Volume 2';

interface ChemTopic {
  id: string;
  code: string;
  title: string;
  tamilTitle: string;
  description: string;
  tamilDescription: string;
  subTopics: string[];
  tamilSubTopics: string[];
  keyFormulas: string[];
  sampleSumPrompt: string;
  tamilSampleSumPrompt: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  tamilDifficulty: string;
  estimatedMinutes: number;
}

interface ChemChapter {
  id: string;
  grade: '12';
  volume: 'Volume 1' | 'Volume 2';
  tamilVolume: string;
  number: number;
  title: string;
  tamilTitle: string;
  topics: ChemTopic[];
}

const TN_CHEMISTRY_SYLLABUS: ChemChapter[] = [
  {
    id: 'tn12-chem-c1',
    grade: '12',
    volume: 'Volume 1',
    tamilVolume: 'தொகுதி 1',
    number: 1,
    title: 'Metallurgy',
    tamilTitle: 'உலோகவியல்',
    topics: [
      {
        id: 'tn12-c1-t1',
        code: '1.1–1.3',
        title: 'Occurrence of Ores, Concentration Methods & Extraction of Crude Metal',
        tamilTitle: 'தாதுக்களின் கிடைப்பு, அடர்ப்பித்தல் முறைகள் மற்றும் தூய்மையற்ற உலோகம் பிரித்தெடுத்தல்',
        description:
          'Minerals vs ores, gravity separation, froth flotation (collectors & depressants), magnetic separation, leaching (cyanide & alkali leaching), calcination, roasting, smelting, and self-reduction.',
        tamilDescription:
          'கனிமங்கள் மற்றும் தாதுக்கள், புவியீர்ப்பு பிரிப்பு, நுரை மிதப்பு முறை, காந்தப் பிரிப்பு, கசிவு ஊறல் முறை, வறுத்தல், சுட்டெரித்தல் மற்றும் உருக்கிப் பிரித்தல்.',
        subTopics: [
          '1.1–1.2 Minerals, Ores & Physical/Chemical Concentration (Froth Flotation & Leaching)',
          '1.3 Conversion of Concentrated Ore to Crude Metal (Roasting, Calcination & Smelting)'
        ],
        tamilSubTopics: [
          '1.1–1.2 கனிமங்கள், தாதுக்கள் மற்றும் நுரை மிதப்பு, கசிவு ஊறல் அடர்ப்பித்தல்',
          '1.3 வறுத்தல், சுட்டெரித்தல் மற்றும் உருக்கிப் பிரித்தல் மூலம் உலோகம் பெறல்'
        ],
        keyFormulas: ['4Au + 8CN⁻ + 2H₂O + O₂ → 4[Au(CN)₂]⁻ + 4OH⁻', 'Al₂O₃·2H₂O + 2NaOH → 2NaAlO₂ + 3H₂O'],
        sampleSumPrompt: 'Leaching of 24 g pure gold ore with NaCN & Zn displacement step-by-step calculation',
        tamilSampleSumPrompt: '24 கி தூய தங்கத் தாதுவை NaCN கொண்டு கசிவு ஊறல் செய்து துத்தநாகத்தால் வீழ்படிவாக்கும் படிப்படியான கணக்கு',
        difficulty: 'Foundation',
        tamilDifficulty: 'அடிப்படை',
        estimatedMinutes: 18
      },
      {
        id: 'tn12-c1-t2',
        code: '1.4–1.6',
        title: 'Ellingham Diagram, Thermodynamic Principles & Refining of Metals',
        tamilTitle: 'எலிங்கம் வரைபடம், வெப்ப இயக்கவியல் தத்துவங்கள் மற்றும் உலோகங்களைத் தூய்மையாக்கல்',
        description:
          'Gibbs free energy ΔG° = ΔH° - TΔS°, Ellingham diagram features & limitations, reduction of metal oxides using C, CO & Al (aluminothermic process), and distillation, liquation, electrolytic refining, zone refining, Mond’s process & van Arkel method.',
        tamilDescription:
          'கிப்ஸ் கட்டிலா ஆற்றல் ΔG° = ΔH° - TΔS°, எலிங்கம் வரைபடத்தின் பண்புகள் மற்றும் வரம்புகள், அலுமினிய வெப்பக் குறைப்பு மற்றும் மின்னாற்பகுப்பு, மண்டலத் தூய்மையாக்கல், மாண்ட் மற்றும் வான் ஆர்கெல் முறைகள்.',
        subTopics: [
          '1.4 Thermodynamic Principles & Ellingham Diagram Applications',
          '1.5–1.6 Refining Methods: Electrolytic, Zone Refining, Mond’s & van Arkel Process'
        ],
        tamilSubTopics: [
          '1.4 வெப்ப இயக்கவியல் தத்துவங்கள் மற்றும் எலிங்கம் வரைபடப் பயன்பாடுகள்',
          '1.5–1.6 மின்னாற்பகுப்பு, மண்டலத் தூய்மையாக்கல், மாண்ட் மற்றும் வான் ஆர்கெல் முறைகள்'
        ],
        keyFormulas: ['ΔG° = -RT ln K_eq', 'ΔG° = ΔH° - TΔS°'],
        sampleSumPrompt: 'Calculate ΔG° at 1000 K for Cr₂O₃ reduction given ΔH° = 810 kJ and ΔS° = 240 J/K step-by-step',
        tamilSampleSumPrompt: '1000 K வெப்பநிலையில் ΔH° = 810 kJ மற்றும் ΔS° = 240 J/K எனில் ΔG° மதிப்பைப் படிப்படியாகக் காண்க',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 22
      }
    ]
  },
  {
    id: 'tn12-chem-c2',
    grade: '12',
    volume: 'Volume 1',
    tamilVolume: 'தொகுதி 1',
    number: 2,
    title: 'p-Block Elements – I',
    tamilTitle: 'p-தொகுதி தனிமங்கள் – I',
    topics: [
      {
        id: 'tn12-c2-t1',
        code: '2.1–2.3',
        title: 'Group 13 (Boron Family): Borax, Boric Acid, Diborane, BF₃ & Alum',
        tamilTitle: 'தொகுதி 13 (போரான் குடும்பம்): போராக்ஸ், போரிக் அமிலம், டைபோரேன் மற்றும் படிகாரம்',
        description:
          'Anomalous properties of boron, inert pair effect, borax bead test, structure & reactions of boric acid (H₃BO₃), 3-center 2-electron (banana) bonds in diborane (B₂H₆), BF₃ Lewis acidity, and potash alum.',
        tamilDescription:
          'போரானின் முரண்பட்ட பண்புகள், மந்த இணை விளைவு, போராக்ஸ் மணிச் சோதனை, போரிக் அமிலம், டைபோரேன் (B₂H₆) வாழைப்பழப் பிணைப்பு, BF₃ மற்றும் படிகாரம்.',
        subTopics: [
          '2.1–2.2 General Trends of Group 13, Borax & Boric Acid',
          '2.3 Diborane (3c-2e Bonds), BF₃ & Potash Alum'
        ],
        tamilSubTopics: [
          '2.1–2.2 தொகுதி 13 பொதுப் பண்புகள், போராக்ஸ் மற்றும் போரிக் அமிலம்',
          '2.3 டைபோரேன் (3c-2e பிணைப்புகள்), BF₃ மற்றும் படிகாரம்'
        ],
        keyFormulas: ['Na₂B₄O₇·10H₂O', 'B₂H₆ + 6H₂O → 2H₃BO₃ + 6H₂', 'K₂SO₄·Al₂(SO₄)₃·24H₂O'],
        sampleSumPrompt: 'Moles of H₂ gas evolved when 2.76 g diborane (B₂H₆) reacts with excess water step-by-step',
        tamilSampleSumPrompt: '2.76 கி டைபோரேன் (B₂H₆) அதிகப்படியான நீருடன் வினைபுரியும்போது வெளியாகும் H₂ மோல்களைக் கணக்கிடுக',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 20
      },
      {
        id: 'tn12-c2-t2',
        code: '2.4–2.5',
        title: 'Group 14 (Carbon Family): Allotropes of Carbon, CO, CO₂, Silicones & Silicates',
        tamilTitle: 'தொகுதி 14 (கார்பன் குடும்பம்): கார்பனின் புறவேற்றுமை வடிவங்கள், சிலிகோன்கள் மற்றும் சிலிக்கேட்டுகள்',
        description:
          'Diamond, graphite, fullerenes & carbon nanotubes, carbon monoxide & carbon dioxide, silicon carbide (Carborundum), organosilicon polymers (silicones), and ortho, pyro, cyclic, chain, sheet & 3D silicates.',
        tamilDescription:
          'வைரம், கிராஃபைட், ஃபுல்லரீன்கள், கார்பன் மோனாக்சைடு மற்றும் டைஆக்சைடு, சிலிகான் கார்பைடு, சிலிகோன்கள் மற்றும் சிலிக்கேட்டுகளின் வகைகள்.',
        subTopics: [
          '2.4 Allotropes of Carbon, Carbon Monoxide & Carbon Dioxide',
          '2.5 Silicones, Silicates & Zeolites'
        ],
        tamilSubTopics: [
          '2.4 கார்பனின் புறவேற்றுமை வடிவங்கள், CO மற்றும் CO₂',
          '2.5 சிலிகோன்கள், சிலிக்கேட்டுகள் மற்றும் ஜியோலைட்டுகள்'
        ],
        keyFormulas: ['(CH₃)₂SiCl₂ + 2H₂O → (CH₃)₂Si(OH)₂ + 2HCl', 'SiO₄⁴⁻ tetrahedral unit'],
        sampleSumPrompt: 'Mass of (CH₃)₂SiCl₂ needed to prepare 148 g linear polydimethylsiloxane polymer step-by-step',
        tamilSampleSumPrompt: '148 கி பாலிடைமெத்தில் சிலோக்சேன் தயாரிக்கத் தேவைப்படும் (CH₃)₂SiCl₂ நிறையைக் கணக்கிடுக',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 20
      }
    ]
  },
  {
    id: 'tn12-chem-c3',
    grade: '12',
    volume: 'Volume 1',
    tamilVolume: 'தொகுதி 1',
    number: 3,
    title: 'p-Block Elements – II',
    tamilTitle: 'p-தொகுதி தனிமங்கள் – II',
    topics: [
      {
        id: 'tn12-c3-t1',
        code: '3.1–3.2',
        title: 'Group 15 (Nitrogen Family): Ammonia, Nitric Acid, Phosphine, PCl₃ & PCl₅',
        tamilTitle: 'தொகுதி 15 (நைட்ரஜன் குடும்பம்): அம்மோனியா, நைட்ரிக் அமிலம், பாஸ்பைன், PCl₃ மற்றும் PCl₅',
        description:
          'Anomalous behavior of nitrogen, Haber’s process for ammonia, Ostwald’s process for HNO₃, allotropes of phosphorus (white, red, black), phosphine (PH₃), PCl₃, PCl₅ trigonal bipyramidal geometry, and oxoacids of phosphorus.',
        tamilDescription:
          'நைட்ரஜனின் முரண்பட்ட பண்புகள், ஹேபர் முறை அம்மோனியா, ஆஸ்வால்ட் முறை நைட்ரிக் அமிலம், பாஸ்பரஸ் புறவேற்றுமை வடிவங்கள், பாஸ்பைன், PCl₃, PCl₅ மற்றும் பாஸ்பரஸ் ஆக்சோ அமிலங்கள்.',
        subTopics: [
          '3.1 Group 15 Trends, Ammonia (Haber Process) & Nitric Acid (Ostwald Process)',
          '3.2 Allotropes of Phosphorus, PH₃, PCl₃, PCl₅ & Oxoacids of Phosphorus'
        ],
        tamilSubTopics: [
          '3.1 தொகுதி 15 பண்புகள், அம்மோனியா (ஹேபர் முறை) மற்றும் நைட்ரிக் அமிலம்',
          '3.2 பாஸ்பரஸ் வடிவங்கள், PH₃, PCl₃, PCl₅ மற்றும் பாஸ்பரஸ் ஆக்சோ அமிலங்கள்'
        ],
        keyFormulas: ['N₂(g) + 3H₂(g) ⇌ 2NH₃(g)', 'PCl₅(s) ⇌ PCl₃(g) + Cl₂(g)'],
        sampleSumPrompt: 'Volume of NH₃ at STP obtained from 28 kg N₂ and 9 kg H₂ via Haber process step-by-step',
        tamilSampleSumPrompt: '28 கிகி N₂ மற்றும் 9 கிகி H₂ இலிருந்து ஹேபர் முறையில் கிடைக்கும் NH₃ கனஅளவைக் கணக்கிடுக',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 22
      },
      {
        id: 'tn12-c3-t2',
        code: '3.3–3.5',
        title: 'Group 16 (Oxygen Family), Group 17 (Halogens), Interhalogens & Group 18 (Noble Gases)',
        tamilTitle: 'தொகுதி 16 (ஆக்சிஜன்), தொகுதி 17 (ஹாலஜன்கள்) மற்றும் தொகுதி 18 (மந்த வாயுக்கள்)',
        description:
          'Ozone (O₃), allotropes of sulphur (rhombic α, monoclinic β), contact process for H₂SO₄, bleaching powder, interhalogen compounds (ClF₃, BrF₅, IF₇), pseudohalogens, and xenon fluorides & oxides (XeF₂, XeF₄, XeF₆, XeO₃).',
        tamilDescription:
          'ஓசோன் (O₃), கந்தகத்தின் வடிவங்கள், தொடுமுறை கந்தக அமிலம், சலவைத் தூள், இடை ஹாலஜன் சேர்மங்கள் மற்றும் மந்த வாயுக்களின் சேர்மங்கள் (XeF₂, XeF₄, XeF₆).',
        subTopics: [
          '3.3 Group 16: Ozone, Sulphur Allotropes & Sulphuric Acid (Contact Process)',
          '3.4–3.5 Group 17 Halogens, Interhalogens & Group 18 Noble Gas Compounds'
        ],
        tamilSubTopics: [
          '3.3 தொகுதி 16: ஓசோன், கந்தக வடிவங்கள் மற்றும் தொடுமுறை கந்தக அமிலம்',
          '3.4–3.5 தொகுதி 17 ஹாலஜன்கள், இடை ஹாலஜன்கள் மற்றும் மந்த வாயுச் சேர்மங்கள்'
        ],
        keyFormulas: ['2SO₂(g) + O₂(g) ⇌ 2SO₃(g)', 'Xe + 2F₂ → XeF₄ (673 K, 6 bar)'],
        sampleSumPrompt: 'Mass of SO₃ and H₂SO₄ produced from 64 g SO₂ with 80% conversion step-by-step',
        tamilSampleSumPrompt: '64 கி SO₂ இலிருந்து 80% மாற்றத்தில் கிடைக்கும் SO₃ மற்றும் H₂SO₄ நிறையைக் கணக்கிடுக',
        difficulty: 'Advanced',
        tamilDifficulty: 'உயர்நிலை',
        estimatedMinutes: 24
      }
    ]
  },
  {
    id: 'tn12-chem-c4',
    grade: '12',
    volume: 'Volume 1',
    tamilVolume: 'தொகுதி 1',
    number: 4,
    title: 'Transition and Inner Transition Elements',
    tamilTitle: 'இடைநிலை மற்றும் உள் இடைநிலைத் தனிமங்கள்',
    topics: [
      {
        id: 'tn12-c4-t1',
        code: '4.1–4.4',
        title: '3d Transition Series: Electronic Configuration, Oxidation States, Magnetism & Catalysts',
        tamilTitle: '3d இடைநிலைத் தொடர்: எலக்ட்ரான் அமைப்பு, ஆக்சிஜனேற்ற நிலைகள், காந்தத்தன்மை மற்றும் வினையூக்கிகள்',
        description:
          'Electronic configurations of 3d elements (Cr and Cu exceptions), variable oxidation states, atomic/ionic radii, lanthanide contraction vs actinide contraction, spin-only magnetic moment μ = √[n(n+2)] BM, colored ions, complex formation, and catalytic activity.',
        tamilDescription:
          '3d தனிமங்களின் எலக்ட்ரான் அமைப்பு, மாறும் ஆக்சிஜனேற்ற நிலைகள், லாந்தனைடு சுருக்கம், சுழல் காந்தத் திருப்புத்திறன் μ = √[n(n+2)] BM, நிறமுடைய அயனிகள் மற்றும் வினையூக்கப் பண்பு.',
        subTopics: [
          '4.1–4.2 Electronic Configuration, Oxidation States & Lanthanide Contraction',
          '4.3–4.4 Magnetic Moment, Colored Ions, Alloy & Catalytic Properties'
        ],
        tamilSubTopics: [
          '4.1–4.2 எலக்ட்ரான் அமைப்பு, ஆக்சிஜனேற்ற நிலைகள் மற்றும் லாந்தனைடு சுருக்கம்',
          '4.3–4.4 காந்தத் திருப்புத்திறன், நிறமுடைய அயனிகள் மற்றும் வினையூக்கப் பண்பு'
        ],
        keyFormulas: ['μ_s = √[n(n + 2)] BM', 'Cr (3d⁵ 4s¹), Cu (3d¹⁰ 4s¹)'],
        sampleSumPrompt: 'Calculate spin-only magnetic moment (in BM) of Mn²⁺ (d⁵) and Fe³⁺ (d⁵) ions step-by-step',
        tamilSampleSumPrompt: 'Mn²⁺ (d⁵) அயனியின் சுழல் காந்தத் திருப்புத்திறனை (BM அலகில்) படிப்படியாகக் கணக்கிடுக',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 20
      },
      {
        id: 'tn12-c4-t2',
        code: '4.5–4.7',
        title: 'Potassium Dichromate (K₂Cr₂O₇), Potassium Permanganate (KMnO₄) & Actinoids',
        tamilTitle: 'பொட்டாசியம் டைகுரோமேட் (K₂Cr₂O₇), பொட்டாசியம் பெர்மாங்கனேட் (KMnO₄) மற்றும் ஆக்டினாய்டுகள்',
        description:
          'Preparation, chromyl chloride test & oxidizing actions of K₂Cr₂O₇ and KMnO₄ in acidic, basic & neutral media, and comparison of lanthanoids and actinoids.',
        tamilDescription:
          'K₂Cr₂O₇ மற்றும் KMnO₄ தயாரிப்பு, குரோமைல் குளோரைடு சோதனை, ஆக்சிஜனேற்ற வினைகள் மற்றும் லாந்தனைடுகள், ஆக்டினாய்டுகள் ஒப்பீடு.',
        subTopics: [
          '4.5–4.6 Preparation & Oxidizing Properties of K₂Cr₂O₇ and KMnO₄',
          '4.7 Actinoids & Comparison Between Lanthanoids and Actinoids'
        ],
        tamilSubTopics: [
          '4.5–4.6 K₂Cr₂O₇ மற்றும் KMnO₄ தயாரிப்பு மற்றும் ஆக்சிஜனேற்ற வினைகள்',
          '4.7 ஆக்டினாய்டுகள் மற்றும் லாந்தனைடு, ஆக்டினாய்டு ஒப்பீடு'
        ],
        keyFormulas: ['Cr₂O₇²⁻ + 14H⁺ + 6e⁻ → 2Cr³⁺ + 7H₂O', 'MnO₄⁻ + 8H⁺ + 5e⁻ → Mn²⁺ + 4H₂O'],
        sampleSumPrompt: 'Moles of Fe²⁺ oxidized by 0.2 mol KMnO₄ in acidic medium step-by-step',
        tamilSampleSumPrompt: 'அமில ஊடகத்தில் 0.2 மோல் KMnO₄ ஆல் ஆக்சிஜனேற்றம் அடையும் Fe²⁺ மோல்களைக் கணக்கிடுக',
        difficulty: 'Advanced',
        tamilDifficulty: 'உயர்நிலை',
        estimatedMinutes: 20
      }
    ]
  },
  {
    id: 'tn12-chem-c5',
    grade: '12',
    volume: 'Volume 1',
    tamilVolume: 'தொகுதி 1',
    number: 5,
    title: 'Coordination Chemistry',
    tamilTitle: 'அணைவு வேதியியல்',
    topics: [
      {
        id: 'tn12-c5-t1',
        code: '5.1–5.4',
        title: 'Werner’s Theory, IUPAC Nomenclature, Isomerism & Bonding (VBT & CFT)',
        tamilTitle: 'வெர்னர் கொள்கை, IUPAC பெயரிடல், மாற்றியம் மற்றும் பிணைப்புக் கொள்கைகள் (VBT & CFT)',
        description:
          'Primary & secondary valences, ligands (monodentate, chelating, ambidentate), coordination number & sphere, IUPAC naming rules, structural & stereoisomerism (geometrical & optical), Valence Bond Theory (inner vs outer orbital complexes), Crystal Field Theory (Δ_o, Δ_t, spectrochemical series), and metal carbonyls.',
        tamilDescription:
          'முதன்மை மற்றும் இரண்டாம் நிலை இணைதிறன்கள், ஈனிகள், IUPAC பெயரிடல், மாற்றிய வகைகள், இணைப்புத் திறன் கொள்கை (VBT) மற்றும் படிகப் புலக் கொள்கை (CFT).',
        subTopics: [
          '5.1–5.2 Werner’s Theory, Coordination Terms, IUPAC Naming & Isomerism',
          '5.3–5.4 Valence Bond Theory (VBT), Crystal Field Theory (CFT) & Metal Carbonyls'
        ],
        tamilSubTopics: [
          '5.1–5.2 வெர்னர் கொள்கை, IUPAC பெயரிடல் மற்றும் மாற்றிய வகைகள்',
          '5.3–5.4 இணைப்புத் திறன் கொள்கை (VBT), படிகப் புலக் கொள்கை (CFT) மற்றும் உலோக கார்பனைல்கள்'
        ],
        keyFormulas: ['CFSE (octahedral) = (-0.4 n_t2g + 0.6 n_eg) Δ_o'],
        sampleSumPrompt: 'Calculate CFSE (in terms of Δ_o) and magnetic behavior of [Fe(CN)₆]⁴⁻ vs [Fe(H₂O)₆]²⁺ step-by-step',
        tamilSampleSumPrompt: '[Fe(CN)₆]⁴⁻ மற்றும் [Fe(H₂O)₆]²⁺ அணைவுகளின் CFSE மதிப்பை Δ_o அலகில் படிப்படியாகக் காண்க',
        difficulty: 'Advanced',
        tamilDifficulty: 'உயர்நிலை',
        estimatedMinutes: 24
      }
    ]
  },
  {
    id: 'tn12-chem-c6',
    grade: '12',
    volume: 'Volume 1',
    tamilVolume: 'தொகுதி 1',
    number: 6,
    title: 'Solid State',
    tamilTitle: 'திட நிலைமை',
    topics: [
      {
        id: 'tn12-c6-t1',
        code: '6.1–6.5',
        title: 'Crystal Lattices, Unit Cell, Packing Efficiency, Density & Crystal Defects',
        tamilTitle: 'படிக அணிக்கோவை, அலகு கூடு, பொதிவுத் திறன், அடர்த்தி மற்றும் படிகக் குறைபாடுகள்',
        description:
          'Crystalline vs amorphous solids, 7 crystal systems & 14 Bravais lattices, number of atoms per unit cell (SC, BCC, FCC), packing efficiency (52.4%, 68%, 74%), density formula ρ = (Z·M)/(N_A·a³), radius ratio rules, and stoichiometric (Schottky & Frenkel), impurity & non-stoichiometric defects.',
        tamilDescription:
          'படிக மற்றும் படிகமற்ற திடப்பொருட்கள், அலகு கூட்டில் அணுக்களின் எண்ணிக்கை (SC, BCC, FCC), பொதிவுத் திறன், அடர்த்தி வாய்ப்பாடு மற்றும் ஷாட்கி, ஃபிரெங்கல் குறைபாடுகள்.',
        subTopics: [
          '6.1–6.3 Unit Cells (SC, BCC, FCC), Packing Efficiency & Density Calculations',
          '6.4–6.5 Stoichiometric (Schottky & Frenkel), Impurity & Non-Stoichiometric Defects',
          '6.6 Radius Ratio Rules & Coordination Number Prediction'
        ],
        tamilSubTopics: [
          '6.1–6.3 அலகு கூடுகள் (SC, BCC, FCC), பொதிவுத் திறன் மற்றும் அடர்த்திக் கணக்குகள்',
          '6.4–6.5 ஷாட்கி, ஃபிரெங்கல் மற்றும் விகிதச்சமமற்ற படிகக் குறைபாடுகள்',
          '6.6 ஆரை விகித விதிகள் மற்றும் ஒருங்கிணை எண் கணிப்பு'
        ],
        keyFormulas: ['ρ = (Z · M) / (N_A · a³)', 'FCC: r = a / (2√2), Z = 4, PE = 74%', 'BCC: r = (√3 a) / 4, Z = 2, PE = 68%'],
        sampleSumPrompt: 'Density of FCC copper crystal with edge length 360 pm and atomic mass 63.5 g/mol step-by-step',
        tamilSampleSumPrompt: 'விளிம்பு நீளம் 360 pm மற்றும் அணு நிறை 63.5 கி/மோல் கொண்ட FCC தாமிரத்தின் அடர்த்தியைக் கணக்கிடுக',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 22
      }
    ]
  },
  {
    id: 'tn12-chem-c7',
    grade: '12',
    volume: 'Volume 1',
    tamilVolume: 'தொகுதி 1',
    number: 7,
    title: 'Chemical Kinetics',
    tamilTitle: 'வேதி வினைவேகவியல்',
    topics: [
      {
        id: 'tn12-c7-t1',
        code: '7.1–7.5',
        title: 'Rate Law, Order & Molecularity, Integrated Rate Equations & Arrhenius Equation',
        tamilTitle: 'வினைவேக விதி, வினைவகை மற்றும் மூலக்கூறு எண், தொகையிடப்பட்ட வேகச் சமன்பாடுகள் மற்றும் அர்ஹீனியஸ் சமன்பாடு',
        description:
          'Average & instantaneous rate of reaction, rate law & rate constant k, zero-order & first-order integrated rate equations, half-life t₁/₂, pseudo-first-order reactions, collision theory, and Arrhenius equation k = A e^(-E_a/RT).',
        tamilDescription:
          'சராசரி மற்றும் கணநேர வினைவேகம், பூஜ்ஜிய மற்றும் முதல் வகை வினைகளின் தொகையிடப்பட்ட சமன்பாடுகள், அரை ஆயுட்காலம் t₁/₂ மற்றும் அர்ஹீனியஸ் கிளர்வு ஆற்றல் சமன்பாடு.',
        subTopics: [
          '7.1–7.3 Rate Law, Order of Reaction & Zero/First-Order Integrated Equations',
          '7.4–7.5 Collision Theory & Arrhenius Equation for Activation Energy (E_a)'
        ],
        tamilSubTopics: [
          '7.1–7.3 வினைவேக விதி, வினைவகை மற்றும் பூஜ்ஜிய, முதல் வகை வினைச் சமன்பாடுகள்',
          '7.4–7.5 மோதல் கொள்கை மற்றும் அர்ஹீனியஸ் கிளர்வு ஆற்றல் (E_a) சமன்பாடு'
        ],
        keyFormulas: ['k = (2.303 / t) log₁₀([A]₀ / [A])', 't₁/₂ (1st order) = 0.693 / k'],
        sampleSumPrompt: 'Time for 75% completion of a first-order reaction with half-life 30 minutes step-by-step',
        tamilSampleSumPrompt: 'அரை ஆயுட்காலம் 30 நிமிடங்கள் கொண்ட முதல் வகை வினை 75% நிறைவடைய ஆகும் நேரத்தைக் கணக்கிடுக',
        difficulty: 'Advanced',
        tamilDifficulty: 'உயர்நிலை',
        estimatedMinutes: 24
      }
    ]
  },
  {
    id: 'tn12-chem-c8',
    grade: '12',
    volume: 'Volume 2',
    tamilVolume: 'தொகுதி 2',
    number: 8,
    title: 'Ionic Equilibrium',
    tamilTitle: 'அயனிச் சமநிலை',
    topics: [
      {
        id: 'tn12-c8-t1',
        code: '8.1–8.5',
        title: 'Arrhenius, Bronsted–Lowry & Lewis Acids/Bases, Ostwald Dilution, pH, Buffers & K_sp',
        tamilTitle: 'அமில-காரக் கொள்கைகள், ஆஸ்வால்ட் நீர்த்தல் விதி, pH, தாங்கல் கரைசல்கள் மற்றும் கரைதிறன் பெருக்கம் (K_sp)',
        description:
          'Conjugate acid-base pairs, Ostwald dilution law α = √(K_a/C), ionic product of water K_w, pH & pOH scale, buffer solutions & Henderson–Hasselbalch equation, common ion effect, and solubility product K_sp.',
        tamilDescription:
          'இணை அமில-கார இணைகள், ஆஸ்வால்ட் நீர்த்தல் விதி, pH கணக்கீடுகள், ஹெண்டர்சன்–ஹேசல்பால்ச் தாங்கல் சமன்பாடு மற்றும் கரைதிறன் பெருக்கம் K_sp.',
        subTopics: [
          '8.1–8.3 Acid-Base Concepts, Ostwald Dilution Law & pH Calculations',
          '8.4–8.5 Buffer Solutions, Henderson Equation & Solubility Product (K_sp)'
        ],
        tamilSubTopics: [
          '8.1–8.3 அமில-காரக் கொள்கைகள், ஆஸ்வால்ட் நீர்த்தல் விதி மற்றும் pH கணக்குகள்',
          '8.4–8.5 தாங்கல் கரைசல்கள், ஹெண்டர்சன் சமன்பாடு மற்றும் கரைதிறன் பெருக்கம் (K_sp)'
        ],
        keyFormulas: ['pH = -log₁₀[H₃O⁺]', 'pH = pK_a + log₁₀([Salt]/[Acid])', 'K_sp = s² (1:1 salt)'],
        sampleSumPrompt: 'Calculate pH of 0.01 M CH₃COOH solution given K_a = 1.8 × 10⁻⁵ step-by-step',
        tamilSampleSumPrompt: 'K_a = 1.8 × 10⁻⁵ கொண்ட 0.01 M CH₃COOH கரைசலின் pH மதிப்பைப் படிப்படியாகக் காண்க',
        difficulty: 'Advanced',
        tamilDifficulty: 'உயர்நிலை',
        estimatedMinutes: 24
      }
    ]
  },
  {
    id: 'tn12-chem-c9',
    grade: '12',
    volume: 'Volume 2',
    tamilVolume: 'தொகுதி 2',
    number: 9,
    title: 'Electrochemistry',
    tamilTitle: 'மின்னிரசாயனவியல்',
    topics: [
      {
        id: 'tn12-c9-t1',
        code: '9.1–9.5',
        title: 'Conductance, Kohlrausch’s Law, Faraday’s Laws, Nernst Equation, Fuel Cells & Corrosion',
        tamilTitle: 'மின்கடத்துத்திறன், கோல்ராஷ் விதி, ஃபாரடே விதிகள், நெர்ன்ஸ்ட் சமன்பாடு மற்றும் அரிமானம்',
        description:
          'Specific conductance κ, molar conductance Λ_m, Kohlrausch’s law of independent migration of ions, Faraday’s first & second laws of electrolysis, galvanic cell & Nernst equation, Gibbs free energy ΔG° = -nFE°_cell, lead storage battery, H₂–O₂ fuel cell, and electrochemical corrosion.',
        tamilDescription:
          'மோலார் மின்கடத்துத்திறன் Λ_m, கோல்ராஷ் விதி, ஃபாரடே மின்னாற்பகுப்பு விதிகள், நெர்ன்ஸ்ட் சமன்பாடு, எரிபொருள் மின்கலன்கள் மற்றும் உலோக அரிமானம்.',
        subTopics: [
          '9.1–9.2 Molar Conductance, Kohlrausch’s Law & Faraday’s Laws of Electrolysis',
          '9.3–9.5 Nernst Equation, Cell EMF, Batteries, Fuel Cells & Corrosion'
        ],
        tamilSubTopics: [
          '9.1–9.2 மோலார் மின்கடத்துத்திறன், கோல்ராஷ் விதி மற்றும் ஃபாரடே விதிகள்',
          '9.3–9.5 நெர்ன்ஸ்ட் சமன்பாடு, மின்கல மின்னழுத்தம், எரிபொருள் மின்கலன் மற்றும் அரிமானம்'
        ],
        keyFormulas: ['E_cell = E°_cell - (0.0591 / n) log₁₀ Q', 'ΔG° = -n F E°_cell'],
        sampleSumPrompt: 'Cell EMF at 298 K for Zn | Zn²⁺ (0.01 M) || Cu²⁺ (0.1 M) | Cu given E°_cell = 1.10 V step-by-step',
        tamilSampleSumPrompt: 'E°_cell = 1.10 V எனில் Zn | Zn²⁺ (0.01 M) || Cu²⁺ (0.1 M) | Cu மின்கலத்தின் EMF மதிப்பைக் காண்க',
        difficulty: 'Advanced',
        tamilDifficulty: 'உயர்நிலை',
        estimatedMinutes: 25
      }
    ]
  },
  {
    id: 'tn12-chem-c10',
    grade: '12',
    volume: 'Volume 2',
    tamilVolume: 'தொகுதி 2',
    number: 10,
    title: 'Surface Chemistry',
    tamilTitle: 'புறப்பரப்பு வேதியியல்',
    topics: [
      {
        id: 'tn12-c10-t1',
        code: '10.1–10.4',
        title: 'Adsorption (Physisorption vs Chemisorption), Freundlich Isotherm, Catalysis & Colloids',
        tamilTitle: 'பரப்பு கவர்தல், ஃப்ராய்ட்லிச் சமவெப்ப மாறிலி, வினையூக்கம் மற்றும் கூழ்மங்கள்',
        description:
          'Physical vs chemical adsorption, Freundlich adsorption isotherm (x/m = kP^(1/n)), homogeneous vs heterogeneous catalysis, enzyme catalysis, classification & preparation of colloids, Tyndall effect, Brownian motion, electrophoresis, coagulation & Hardy–Schulze rule, and emulsions.',
        tamilDescription:
          'இயற்பு மற்றும் வேதிப் பரப்பு கவர்தல், ஃப்ராய்ட்லிச் சமவெப்ப மாறிலி, கூழ்மங்களின் வகைகள், டிண்டால் விளைவு, பிரௌனியன் இயக்கம் மற்றும் ஹார்டி–ஷூல்ஸ் விதி.',
        subTopics: [
          '10.1–10.2 Adsorption Types, Freundlich Isotherm & Catalysis',
          '10.3–10.4 Colloidal Dispersions, Tyndall Effect, Hardy–Schulze Rule & Emulsions'
        ],
        tamilSubTopics: [
          '10.1–10.2 பரப்பு கவர்தல் வகைகள், ஃப்ராய்ட்லிச் சமவெப்ப மாறிலி மற்றும் வினையூக்கம்',
          '10.3–10.4 கூழ்மங்கள், டிண்டால் விளைவு, ஹார்டி–ஷூல்ஸ் விதி மற்றும் குழம்புகள்'
        ],
        keyFormulas: ['log(x/m) = log k + (1/n) log P'],
        sampleSumPrompt: 'Calculate log(x/m) for Freundlich adsorption where k = 2, P = 4 atm, and 1/n = 0.5 step-by-step',
        tamilSampleSumPrompt: 'k = 2, P = 4 atm, 1/n = 0.5 எனில் ஃப்ராய்ட்லிச் சமன்பாட்டின் படி log(x/m) மதிப்பைக் காண்க',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 18
      }
    ]
  },
  {
    id: 'tn12-chem-c11',
    grade: '12',
    volume: 'Volume 2',
    tamilVolume: 'தொகுதி 2',
    number: 11,
    title: 'Hydroxy Compounds and Ethers',
    tamilTitle: 'ஹைட்ராக்ஸி சேர்மங்கள் மற்றும் ஈதர்கள்',
    topics: [
      {
        id: 'tn12-c11-t1',
        code: '11.1–11.5',
        title: 'Alcohols, Phenols, Ethers, Lucas Test, Kolbe, Reimer–Tiemann & Williamson Synthesis',
        tamilTitle: 'ஆல்கஹால்கள், பீனால்கள், ஈதர்கள், லூகாஸ் சோதனை, கோல்ப், ரீமர்–டைமன் மற்றும் வில்லியம்சன் வினை',
        description:
          'Classification & IUPAC naming of alcohols, phenols & ethers, Lucas test (1°, 2°, 3° alcohols), oxidation & esterification, acidic nature of phenol, Kolbe’s reaction, Reimer–Tiemann reaction, phthalein test, and Williamson ether synthesis & cleavage of ethers by HI.',
        tamilDescription:
          'ஆல்கஹால்கள், பீனால்கள் மற்றும் ஈதர்களின் பெயரிடல், லூகாஸ் சோதனை, பீனாலின் அமிலத்தன்மை, கோல்ப் வினை, ரீமர்–டைமன் வினை மற்றும் வில்லியம்சன் ஈதர் தொகுப்பு.',
        subTopics: [
          '11.1–11.3 Alcohols: Preparation, Lucas Test, Dehydration & Oxidation',
          '11.4–11.5 Phenols (Kolbe & Reimer–Tiemann) and Ethers (Williamson Synthesis)'
        ],
        tamilSubTopics: [
          '11.1–11.3 ஆல்கஹால்கள்: தயாரிப்பு, லூகாஸ் சோதனை மற்றும் ஆக்சிஜனேற்றம்',
          '11.4–11.5 பீனால்கள் (கோல்ப் & ரீமர்–டைமன்) மற்றும் ஈதர்கள் (வில்லியம்சன் தொகுப்பு)'
        ],
        keyFormulas: ['R-ONa + R\'-X → R-O-R\' + NaX', 'C₆H₅OH + CO₂ + NaOH → Salicylic acid'],
        sampleSumPrompt: 'Theoretical yield of tert-butyl methyl ether from 7.4 g tert-butyl alcohol & excess CH₃ONa step-by-step',
        tamilSampleSumPrompt: '7.4 கி டெர்ட்-பியூட்டைல் ஆல்கஹாலிலிருந்து கிடைக்கும் ஈதரின் கோட்பாட்டு அளவைக் கணக்கிடுக',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 22
      }
    ]
  },
  {
    id: 'tn12-chem-c12',
    grade: '12',
    volume: 'Volume 2',
    tamilVolume: 'தொகுதி 2',
    number: 12,
    title: 'Carbonyl Compounds and Carboxylic Acids',
    tamilTitle: 'கார்பனைல் சேர்மங்கள் மற்றும் கார்பாக்சிலிக் அமிலங்கள்',
    topics: [
      {
        id: 'tn12-c12-t1',
        code: '12.1–12.5',
        title: 'Aldehydes, Ketones, Aldol, Cannizzaro, Clemmensen, Rosenmund & Carboxylic Acids',
        tamilTitle: 'ஆல்டிஹைடுகள், கீட்டோன்கள், ஆல்டால், கன்னிசாரோ வினைகள் மற்றும் கார்பாக்சிலிக் அமிலங்கள்',
        description:
          'Nucleophilic addition to C=O, Rosenmund & Stephen reduction, Tollen’s & Fehling’s tests, Aldol condensation, Crossed Cannizzaro reaction, Perkin reaction, Knoevenagel reaction, Clemmensen & Wolff–Kishner reduction, Hell–Volhard–Zelinsky (HVZ) reaction, and derivatives of carboxylic acids.',
        tamilDescription:
          'ரோசன்மண்ட் ஒடுக்கம், டோலன் மற்றும் ஃபெலிங் சோதனைகள், ஆல்டால் குறுக்கம், கன்னிசாரோ வினை, கிளெமென்சன் ஒடுக்கம், HVZ வினை மற்றும் கார்பாக்சிலிக் அமில வழிப்பொருட்கள்.',
        subTopics: [
          '12.1–12.3 Aldehydes & Ketones: Preparation, Nucleophilic Addition & Named Reactions',
          '12.4–12.5 Carboxylic Acids: Acidity Trends, HVZ Reaction & Acid Derivatives'
        ],
        tamilSubTopics: [
          '12.1–12.3 ஆல்டிஹைடுகள் & கீட்டோன்கள்: தயாரிப்பு, ஆல்டால் மற்றும் கன்னிசாரோ வினைகள்',
          '12.4–12.5 கார்பாக்சிலிக் அமிலங்கள்: அமிலத்தன்மை, HVZ வினை மற்றும் வழிப்பொருட்கள்'
        ],
        keyFormulas: ['2 HCHO + conc. NaOH → CH₃OH + HCOONa (Cannizzaro)'],
        sampleSumPrompt: 'Mass of acetic acid (CH₃COOH) formed by oxidation of 9.2 g ethanol with K₂Cr₂O₇/H⁺ step-by-step',
        tamilSampleSumPrompt: '9.2 கி எத்தனாலை ஆக்சிஜனேற்றம் செய்து கிடைக்கும் அசிட்டிக் அமில நிறையைக் கணக்கிடுக',
        difficulty: 'Advanced',
        tamilDifficulty: 'உயர்நிலை',
        estimatedMinutes: 24
      }
    ]
  },
  {
    id: 'tn12-chem-c13',
    grade: '12',
    volume: 'Volume 2',
    tamilVolume: 'தொகுதி 2',
    number: 13,
    title: 'Organic Nitrogen Compounds',
    tamilTitle: 'கரிம நைட்ரஜன் சேர்மங்கள்',
    topics: [
      {
        id: 'tn12-c13-t1',
        code: '13.1–13.4',
        title: 'Nitro Compounds, Amines (Gabriel Phthalimide & Hofmann), Carbylamine & Diazonium Salts',
        tamilTitle: 'நைட்ரோ சேர்மங்கள், அமீன்கள் (ஹாஃப்மன், கார்பைலமீன்) மற்றும் டையசோனியம் உப்புகள்',
        description:
          'Tautomerism in nitroalkanes, basic strength of amines (gas phase vs aqueous solution), Gabriel phthalimide synthesis, Hofmann bromamide degradation, carbylamine test, Hinsberg reagent, mustard oil reaction, and Sandmeyer, Gattermann & coupling reactions of benzene diazonium chloride.',
        tamilDescription:
          'நைட்ரோ ஆல்கேன்கள் மாற்றியம், அமீன்களின் காரத்தன்மை, ஹாஃப்மன் சிதைவு வினை, கார்பைலமீன் சோதனை, ஹின்ஸ்பெர்க் வினை மற்றும் பென்சீன் டையசோனியம் குளோரைடு வினைகள்.',
        subTopics: [
          '13.1–13.2 Nitro Compounds & Amines: Basicity, Hofmann Degradation & Tests',
          '13.3–13.4 Cyanides/Isocyanides & Diazonium Salts (Sandmeyer & Coupling)'
        ],
        tamilSubTopics: [
          '13.1–13.2 நைட்ரோ சேர்மங்கள் & அமீன்கள்: காரத்தன்மை, ஹாஃப்மன் சிதைவு மற்றும் சோதனைகள்',
          '13.3–13.4 சயனைடுகள் மற்றும் டையசோனியம் உப்புகளின் வினைகள்'
        ],
        keyFormulas: ['R-CONH₂ + Br₂ + 4NaOH → R-NH₂ + Na₂CO₃ + 2NaBr + 2H₂O'],
        sampleSumPrompt: 'Mass of aniline obtained from 14.2 g acetamide via Hofmann bromamide degradation step-by-step',
        tamilSampleSumPrompt: '14.2 கி அசிட்டமைடிலிருந்து ஹாஃப்மன் வினையில் கிடைக்கும் அனிலின் நிறையைக் கணக்கிடுக',
        difficulty: 'Intermediate',
        tamilDifficulty: 'நடுத்தரம்',
        estimatedMinutes: 20
      }
    ]
  },
  {
    id: 'tn12-chem-c14',
    grade: '12',
    volume: 'Volume 2',
    tamilVolume: 'தொகுதி 2',
    number: 14,
    title: 'Biomolecules',
    tamilTitle: 'உயிரியல் மூலக்கூறுகள்',
    topics: [
      {
        id: 'tn12-c14-t1',
        code: '14.1–14.5',
        title: 'Carbohydrates (Glucose & Fructose), Proteins, Enzymes, Nucleic Acids (DNA & RNA) & Vitamins',
        tamilTitle: 'கார்போஹைட்ரேட்டுகள் (குளுக்கோஸ் & ஃப்ரக்டோஸ்), புரதங்கள், நொதிகள், நியூக்ளிக் அமிலங்கள் மற்றும் வைட்டமின்கள்',
        description:
          'Aldoses vs ketoses, cyclic structure of D(+)-glucose & mutarotation, disaccharides (sucrose, maltose, lactose) & polysaccharides (starch, cellulose), amino acids, zwitterion & isoelectric point, peptide bond & protein denaturation, DNA double helix vs RNA, and fat/water-soluble vitamins & hormones.',
        tamilDescription:
          'குளுக்கோஸ் மற்றும் ஃப்ரக்டோஸ் அமைப்புகள், இரட்டைச் சர்க்கரைகள், அமினோ அமிலங்கள், ஸ்விட்டர் அயனி, புரதங்கள், DNA மற்றும் RNA கட்டமைப்புகள் மற்றும் வைட்டமின்கள்.',
        subTopics: [
          '14.1–14.2 Carbohydrates (Glucose Ring Structure, Mutarotation & Polysaccharides)',
          '14.3–14.5 Amino Acids, Zwitterion, Proteins, Enzymes, DNA/RNA & Vitamins'
        ],
        tamilSubTopics: [
          '14.1–14.2 கார்போஹைட்ரேட்டுகள் (குளுக்கோஸ் வளைய அமைப்பு மற்றும் மியூட்டா சுழற்சி)',
          '14.3–14.5 அமினோ அமிலங்கள், ஸ்விட்டர் அயனி, புரதங்கள், DNA/RNA மற்றும் வைட்டமின்கள்'
        ],
        keyFormulas: ['C₆H₁₂O₆ + 5(CH₃CO)₂O → Glucose pentaacetate + 5CH₃COOH'],
        sampleSumPrompt: 'Moles of acetic anhydride required to acetylate 18 g D-glucose completely step-by-step',
        tamilSampleSumPrompt: '18 கி குளுக்கோஸை முழுமையாக அசிட்டைலேற்றம் செய்யத் தேவைப்படும் அசிட்டிக் நீரிலி மோல்களைக் காண்க',
        difficulty: 'Foundation',
        tamilDifficulty: 'அடிப்படை',
        estimatedMinutes: 18
      }
    ]
  },
  {
    id: 'tn12-chem-c15',
    grade: '12',
    volume: 'Volume 2',
    tamilVolume: 'தொகுதி 2',
    number: 15,
    title: 'Chemistry in Everyday Life',
    tamilTitle: 'அன்றாட வாழ்வில் வேதியியல்',
    topics: [
      {
        id: 'tn12-c15-t1',
        code: '15.1–15.4',
        title: 'Drugs & Pharmaceuticals, Food Additives, Cleansing Agents (Soaps & Detergents) & Polymers',
        tamilTitle: 'மருந்துப் பொருட்கள், உணவுச் சேர்க்கைகள், சுத்திகரிப்புப் பொருட்கள் மற்றும் பலபடிகள்',
        description:
          'Analgesics, antipyretics, antiseptics, disinfectants, antacids, antihistamines & antibiotics; preservatives, antioxidants, artificial sweeteners & food colors; saponification of soaps vs synthetic detergents; and addition & condensation polymers (Nylon-6,6, Buna-S, Bakelite, biodegradable polymers).',
        tamilDescription:
          'வலி நிவாரணிகள், காய்ச்சல் நீக்கிகள், கிருமி நாசினிகள், அமில நீக்கிகள், உணவுப் பாதுகாப்புப் பொருட்கள், சோப்புகள், சலவைத் தூள்கள் மற்றும் பலபடிகள் (நைலான்-6,6, பேக்கலைட்).',
        subTopics: [
          '15.1–15.2 Classification of Drugs & Food Additives (Preservatives & Sweeteners)',
          '15.3–15.4 Soaps, Synthetic Detergents & Addition/Condensation Polymers'
        ],
        tamilSubTopics: [
          '15.1–15.2 மருந்து வகைகள் மற்றும் உணவுச் சேர்க்கைப் பொருட்கள்',
          '15.3–15.4 சோப்புகள், சலவைத் தூள்கள் மற்றும் பலபடிகள்'
        ],
        keyFormulas: ['Triglyceride + 3NaOH → Glycerol + 3RCOONa (Saponification)'],
        sampleSumPrompt: 'Mass of NaOH required for complete saponification of 88.4 g tristearin (M = 884 g/mol) step-by-step',
        tamilSampleSumPrompt: '88.4 கி டிரைஸ்டியரின் முழு சோப்பாக்கலுக்குத் தேவைப்படும் NaOH நிறையைக் கணக்கிடுக',
        difficulty: 'Foundation',
        tamilDifficulty: 'அடிப்படை',
        estimatedMinutes: 16
      }
    ]
  }
];

interface PracticeQuestion {
  id: string;
  grade: '12';
  topicId: string;
  question: string;
  tamilQuestion: string;
  options: string[];
  tamilOptions: string[];
  correctIndex: number;
  explanation: string;
  tamilExplanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tamilDifficulty: string;
}

const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'pq-chem-1',
    grade: '12',
    topicId: 'tn12-c6-t1',
    question: 'Sum: A metal crystallizes in an FCC lattice (Z = 4). If atomic mass M = 60 g/mol and edge length a = 4 × 10⁻⁸ cm, what is its density? (TN Class 12 Ch 6)',
    tamilQuestion: 'கணக்கு: ஒரு உலோகம் FCC அணிக்கோவையில் (Z = 4) படிகமாகிறது. அணு நிறை M = 60 கி/மோல் மற்றும் விளிம்பு நீளம் a = 4 × 10⁻⁸ செ.மீ எனில் அதன் அடர்த்தி யாது? (12-ஆம் வகுப்பு பாடம் 6)',
    options: [
      'Step 1: ρ = (Z·M)/(N_A·a³) = (4 × 60)/(6.022×10²³ × 6.4×10⁻²³) = 6.23 g/cm³',
      'Step 1: ρ = (Z·M)/(N_A·a³) = 3.11 g/cm³',
      'Step 1: ρ = (Z·M)/(N_A·a³) = 12.46 g/cm³',
      'Step 1: ρ = (Z·M)/(N_A·a³) = 1.56 g/cm³'
    ],
    tamilOptions: [
      'படி 1: ρ = (Z·M)/(N_A·a³) = (4 × 60)/(6.022×10²³ × 6.4×10⁻²³) = 6.23 கி/செ.மீ³',
      'படி 1: ρ = (Z·M)/(N_A·a³) = 3.11 கி/செ.மீ³',
      'படி 1: ρ = (Z·M)/(N_A·a³) = 12.46 கி/செ.மீ³',
      'படி 1: ρ = (Z·M)/(N_A·a³) = 1.56 கி/செ.மீ³'
    ],
    correctIndex: 0,
    explanation:
      'Step 1: For FCC, Z = 4. Step 2: a³ = (4 × 10⁻⁸ cm)³ = 64 × 10⁻²⁴ cm³ = 6.4 × 10⁻²³ cm³. Step 3: Numerator = 4 × 60 = 240; Denominator = 6.022 × 10²³ × 6.4 × 10⁻²³ ≈ 38.54. Step 4: ρ = 240 / 38.54 ≈ 6.23 g/cm³.',
    tamilExplanation:
      'படி 1: FCC அலகு கூட்டிற்கு Z = 4. படி 2: a³ = (4 × 10⁻⁸ செ.மீ)³ = 6.4 × 10⁻²³ செ.மீ³. படி 3: தொகுதி = 4 × 60 = 240; பகுதி = 6.022 × 10²³ × 6.4 × 10⁻²³ ≈ 38.54. படி 4: ρ = 240 / 38.54 ≈ 6.23 கி/செ.மீ³.',
    difficulty: 'Medium',
    tamilDifficulty: 'நடுத்தரம்'
  },
  {
    id: 'pq-chem-2',
    grade: '12',
    topicId: 'tn12-c7-t1',
    question: 'Sum: For a first-order reaction, the rate constant k = 0.0693 min⁻¹. What is the half-life t₁/₂? (TN Class 12 Ch 7)',
    tamilQuestion: 'கணக்கு: ஒரு முதல் வகை வினையின் வினைவேக மாறிலி k = 0.0693 நிமிடம்⁻¹ எனில், அதன் அரை ஆயுட்காலம் t₁/₂ யாது? (12-ஆம் வகுப்பு பாடம் 7)',
    options: ['10 minutes', '20 minutes', '5 minutes', '30 minutes'],
    tamilOptions: ['10 நிமிடங்கள்', '20 நிமிடங்கள்', '5 நிமிடங்கள்', '30 நிமிடங்கள்'],
    correctIndex: 0,
    explanation:
      'Step 1: Formula for first-order half-life is t₁/₂ = 0.693 / k. Step 2: Substitute k = 0.0693 min⁻¹. Step 3: t₁/₂ = 0.693 / 0.0693 = 10 minutes.',
    tamilExplanation:
      'படி 1: முதல் வகை வினையின் அரை ஆயுட்கால வாய்ப்பாடு t₁/₂ = 0.693 / k. படி 2: k = 0.0693 நிமிடம்⁻¹ எனப் பிரதியிடுக. படி 3: t₁/₂ = 0.693 / 0.0693 = 10 நிமிடங்கள்.',
    difficulty: 'Easy',
    tamilDifficulty: 'எளிது'
  },
  {
    id: 'pq-chem-3',
    grade: '12',
    topicId: 'tn12-c8-t1',
    question: 'Sum: What is the pH of an aqueous solution with [H₃O⁺] = 1 × 10⁻⁴ M at 298 K? (TN Class 12 Ch 8)',
    tamilQuestion: 'கணக்கு: 298 K வெப்பநிலையில் [H₃O⁺] = 1 × 10⁻⁴ M கொண்ட நீர்க்கரைசலின் pH மதிப்பு யாது? (12-ஆம் வகுப்பு பாடம் 8)',
    options: ['4', '10', '3', '7'],
    tamilOptions: ['4', '10', '3', '7'],
    correctIndex: 0,
    explanation:
      'Step 1: pH = -log₁₀[H₃O⁺]. Step 2: Substitute [H₃O⁺] = 1 × 10⁻⁴. Step 3: pH = -log₁₀(10⁻⁴) = -(-4) = 4.',
    tamilExplanation:
      'படி 1: pH = -log₁₀[H₃O⁺]. படி 2: [H₃O⁺] = 1 × 10⁻⁴ எனப் பிரதியிடுக. படி 3: pH = -log₁₀(10⁻⁴) = -(-4) = 4.',
    difficulty: 'Easy',
    tamilDifficulty: 'எளிது'
  },
  {
    id: 'pq-chem-4',
    grade: '12',
    topicId: 'tn12-c9-t1',
    question: 'Sum: A galvanic cell has E°_cell = 1.10 V and n = 2 electrons transferred. What is ΔG° in kJ/mol? (F = 96500 C/mol) (TN Class 12 Ch 9)',
    tamilQuestion: 'கணக்கு: ஒரு மின்கலத்தின் E°_cell = 1.10 V மற்றும் பரிமாறப்படும் எலக்ட்ரான்கள் n = 2 எனில், ΔG° மதிப்பு (kJ/மோல் அலகில்) யாது? (12-ஆம் வகுப்பு பாடம் 9)',
    options: ['-212.3 kJ/mol', '+212.3 kJ/mol', '-106.15 kJ/mol', '-424.6 kJ/mol'],
    tamilOptions: ['-212.3 kJ/மோல்', '+212.3 kJ/மோல்', '-106.15 kJ/மோல்', '-424.6 kJ/மோல்'],
    correctIndex: 0,
    explanation:
      'Step 1: ΔG° = -n F E°_cell. Step 2: ΔG° = -(2)(96500 C/mol)(1.10 V) = -212300 J/mol. Step 3: Convert to kJ/mol by dividing by 1000: -212.3 kJ/mol.',
    tamilExplanation:
      'படி 1: ΔG° = -n F E°_cell. படி 2: ΔG° = -(2)(96500)(1.10) = -212300 J/மோல். படி 3: 1000 ஆல் வகுத்து kJ/மோல் ஆக மாற்ற: -212.3 kJ/மோல்.',
    difficulty: 'Medium',
    tamilDifficulty: 'நடுத்தரம்'
  },
  {
    id: 'pq-chem-5',
    grade: '12',
    topicId: 'tn12-c5-t1',
    question: 'Sum: What is the spin-only magnetic moment of [Fe(CN)₆]⁴⁻ (d⁶ low-spin octahedral complex)? (TN Class 12 Ch 5)',
    tamilQuestion: 'கணக்கு: [Fe(CN)₆]⁴⁻ (d⁶ குறைசுழல் எண்முகி அணைவு) அயனியின் சுழல் காந்தத் திருப்புத்திறன் யாது? (12-ஆம் வகுப்பு பாடம் 5)',
    options: ['0 BM (Diamagnetic)', '2.83 BM (2 unpaired e⁻)', '4.90 BM (4 unpaired e⁻)', '5.92 BM (5 unpaired e⁻)'],
    tamilOptions: ['0 BM (டயாகாந்தம்)', '2.83 BM (2 இணையற்ற e⁻)', '4.90 BM (4 இணையற்ற e⁻)', '5.92 BM (5 இணையற்ற e⁻)'],
    correctIndex: 0,
    explanation:
      'Step 1: Fe²⁺ has 3d⁶ configuration. Step 2: CN⁻ is a strong-field ligand causing pairing into t₂g⁶ eg⁰ (0 unpaired electrons, n = 0). Step 3: μ_s = √[0(0+2)] = 0 BM (diamagnetic).',
    tamilExplanation:
      'படி 1: Fe²⁺ அயனி 3d⁶ அமைப்பைக் கொண்டுள்ளது. படி 2: வலிமையான CN⁻ ஈனி எலக்ட்ரான்களை t₂g⁶ eg⁰ என இணைப்பதால் இணையற்ற எலக்ட்ரான்கள் n = 0. படி 3: μ_s = 0 BM (டயாகாந்தம்).',
    difficulty: 'Hard',
    tamilDifficulty: 'உயர்நிலை'
  },
  {
    id: 'pq-chem-6',
    grade: '12',
    topicId: 'tn12-c12-t1',
    question: 'Sum: Which carbonyl compound undergoes self-aldol condensation when warmed with dilute NaOH? (TN Class 12 Ch 12)',
    tamilQuestion: 'கணக்கு: நீர்த்த NaOH உடன் வெப்பப்படுத்தும்போது தன்-ஆல்டால் குறுக்கத்திற்கு உட்படும் கார்பனைல் சேர்மம் எது? (12-ஆம் வகுப்பு பாடம் 12)',
    options: [
      'Acetaldehyde (CH₃CHO) — possesses α-hydrogen atoms',
      'Formaldehyde (HCHO) — no α-hydrogen atoms',
      'Benzaldehyde (C₆H₅CHO) — no α-hydrogen atoms',
      'Trimethylacetaldehyde ((CH₃)₃CCHO) — no α-hydrogen atoms'
    ],
    tamilOptions: [
      'அசிட்டால்டிஹைடு (CH₃CHO) — α-ஹைட்ரஜன் அணுக்கள் உள்ளன',
      'ஃபார்மால்டிஹைடு (HCHO) — α-ஹைட்ரஜன் அணுக்கள் இல்லை',
      'பென்சால்டிஹைடு (C₆H₅CHO) — α-ஹைட்ரஜன் அணுக்கள் இல்லை',
      'டிரைமெத்தில் அசிட்டால்டிஹைடு — α-ஹைட்ரஜன் அணுக்கள் இல்லை'
    ],
    correctIndex: 0,
    explanation:
      'Step 1: Aldol condensation requires at least one acidic α-hydrogen atom. Step 2: CH₃CHO has three α-hydrogens and forms 3-hydroxybutanal (aldol) with dil. NaOH.',
    tamilExplanation:
      'படி 1: ஆல்டால் குறுக்கத்திற்கு α-ஹைட்ரஜன் அணு அவசியம். படி 2: CH₃CHO மூலக்கூறில் மூன்று α-ஹைட்ரஜன்கள் உள்ளதால் நீர்த்த NaOH உடன் ஆல்டாலைத் தருகிறது.',
    difficulty: 'Medium',
    tamilDifficulty: 'நடுத்தரம்'
  }
];

interface PastQuestion {
  id: string;
  grade: '12';
  year: number;
  paper: string;
  tamilPaper: string;
  topic: string;
  tamilTopic: string;
  marks: number;
  question: string;
  tamilQuestion: string;
  solutionSteps: string[];
  tamilSolutionSteps: string[];
  finalAnswer: string;
  tamilFinalAnswer: string;
}

const PAST_QUESTIONS: PastQuestion[] = [
  {
    id: 'tn-chem-past-2025-1',
    grade: '12',
    year: 2025,
    paper: 'TN HSC March Public Exam - Chemistry (5 Marks)',
    tamilPaper: 'தமிழ்நாடு அரசு மார்ச் பொதுத்தேர்வு - வேதியியல் (5 மதிப்பெண்கள்)',
    topic: 'Chapter 7: Chemical Kinetics (First-Order Rate Law & Numerical)',
    tamilTopic: 'பாடம் 7: வேதி வினைவேகவியல் (முதல் வகை வினை & கணக்கு)',
    marks: 5,
    question:
      'Derive the integrated rate law for a first-order reaction A → Product, and calculate the rate constant if 50% of reactant decomposes in 20 minutes.',
    tamilQuestion:
      'முதல் வகை வினை A → விளைபொருள் என்பதற்கான தொகையிடப்பட்ட வேகச் சமன்பாட்டை வருவித்து, 20 நிமிடங்களில் 50% வினைபடுபொருள் சிதைவடைந்தால் வினைவேக மாறிலியைக் காண்க.',
    solutionSteps: [
      'Step 1: Rate = -d[A]/dt = k[A]¹ ⇒ d[A]/[A] = -k dt.',
      'Step 2: Integrate from t = 0 ([A] = [A]₀) to time t ([A] = [A]_t): ln([A]_t / [A]₀) = -kt.',
      'Step 3: Rearranging gives k = (2.303 / t) log₁₀([A]₀ / [A]_t).',
      'Step 4: For 50% decomposition in t = 20 min, [A]₀ / [A]_t = 2, so k = 0.693 / 20 = 0.03465 min⁻¹.'
    ],
    tamilSolutionSteps: [
      'படி 1: வினைவேகம் = -d[A]/dt = k[A]¹ ⇒ d[A]/[A] = -k dt.',
      'படி 2: t = 0 ([A] = [A]₀) முதல் t வரை தொகையிட: ln([A]_t / [A]₀) = -kt.',
      'படி 3: சமன்பாடு: k = (2.303 / t) log₁₀([A]₀ / [A]_t).',
      'படி 4: t = 20 நிமிடத்தில் 50% சிதைவு எனில் [A]₀/[A]_t = 2; k = 0.693 / 20 = 0.03465 நிமிடம்⁻¹.'
    ],
    finalAnswer: 'k = (2.303 / t) log₁₀([A]₀ / [A]_t); Numerical k = 0.03465 min⁻¹',
    tamilFinalAnswer: 'k = (2.303 / t) log₁₀([A]₀ / [A]_t); கணக்கு விடை: k = 0.03465 நிமிடம்⁻¹'
  },
  {
    id: 'tn-chem-past-2024-1',
    grade: '12',
    year: 2024,
    paper: 'TN HSC Public Exam - Chemistry (5 Marks)',
    tamilPaper: 'தமிழ்நாடு அரசு பொதுத்தேர்வு - வேதியியல் (5 மதிப்பெண்கள்)',
    topic: 'Chapter 5: Coordination Chemistry (VBT & CFT)',
    tamilTopic: 'பாடம் 5: அணைவு வேதியியல் (VBT & படிகப் புலக் கொள்கை)',
    marks: 5,
    question:
      'Explain the hybridization, geometry, and magnetic property of [Ni(CN)₄]²⁻ and [NiCl₄]²⁻ using Valence Bond Theory.',
    tamilQuestion:
      'இணைப்புத் திறன் கொள்கையின் (VBT) அடிப்படையில் [Ni(CN)₄]²⁻ மற்றும் [NiCl₄]²⁻ அணைவுகளின் இனக்கலப்பு, வடிவம் மற்றும் காந்தப் பண்பை விளக்குக.',
    solutionSteps: [
      'Step 1: In both complexes, Ni is in +2 oxidation state with 3d⁸ outer electronic configuration.',
      'Step 2: In [Ni(CN)₄]²⁻, strong ligand CN⁻ pairs up the two unpaired 3d electrons, giving dsp² hybridization, square planar geometry, and diamagnetic behavior (0 unpaired electrons).',
      'Step 3: In [NiCl₄]²⁻, weak ligand Cl⁻ does not pair 3d electrons, giving sp³ hybridization, tetrahedral geometry, and paramagnetic behavior (2 unpaired electrons, μ = √8 ≈ 2.83 BM).'
    ],
    tamilSolutionSteps: [
      'படி 1: இரு அணைவுகளிலும் Ni, +2 ஆக்சிஜனேற்ற நிலையில் 3d⁸ எலக்ட்ரான் அமைப்பைக் கொண்டுள்ளது.',
      'படி 2: [Ni(CN)₄]²⁻ அணைவில் வலிமையான ஈனி CN⁻ எலக்ட்ரான்களை இணைப்பதால் dsp² இனக்கலப்பு, சமதள சதுர வடிவம் மற்றும் டயாகாந்தத் தன்மை கிடைக்கிறது.',
      'படி 3: [NiCl₄]²⁻ அணைவில் பலவீனமான ஈனி Cl⁻ இணைப்பதில்லை; எனவே sp³ இனக்கலப்பு, நான்முகி வடிவம் மற்றும் பாராகாந்தத் தன்மை (μ ≈ 2.83 BM) கிடைக்கிறது.'
    ],
    finalAnswer: '[Ni(CN)₄]²⁻: dsp², Square Planar, Diamagnetic | [NiCl₄]²⁻: sp³, Tetrahedral, Paramagnetic',
    tamilFinalAnswer: '[Ni(CN)₄]²⁻: dsp², சமதள சதுரம், டயாகாந்தம் | [NiCl₄]²⁻: sp³, நான்முகி, பாராகாந்தம்'
  }
];

// ============================================================================
// HELPER UTILITIES: FAST <5S TIMEOUT FETCH, SSML BUILDER & PCM DECODER
// ============================================================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs = 4200
): Promise<Response> {
  const controller = new AbortController();
  const timerId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    window.clearTimeout(timerId);
  }
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}





// ============================================================================
// STEP-BY-STEP SUM & VALUE-LINKED SCENE RESOLVER
// ============================================================================

type ChemVisualScene =
  | 'sum_step_solver'
  | 'titration_burette'
  | 'galvanic_cell_hardware'
  | 'crystal_lattice_unitcell'
  | 'metallurgy_furnace'
  | 'organic_mechanism_ring'
  | 'coordination_complex_3d'
  | 'biomolecule_helix'
  | 'kinetics_energy_profile'
  | 'organic_reaction_pathway'
  | 'distillation_column';

interface ChemSceneCue {
  scene: ChemVisualScene;
  captionEn: string;
  captionTa: string;
  stepBadgeEn: string;
  stepBadgeTa: string;
  extractedValues: string[];
}

function splitNarrationIntoSegments(narration: string): string[] {
  const sentences = narration
    .split(/(?<=[.!?।;])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length >= 2) return sentences;

  const words = narration.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 12) return [narration.trim() || 'Step-by-Step Chemistry'];
  const chunks: string[] = [];
  const size = Math.ceil(words.length / 3);
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '));
  }
  return chunks;
}

function extractNumericalAndChemicalTokens(segment: string): string[] {
  const matches = segment.match(
    /(?:[0-9]+(?:\.[0-9]+)?\s*(?:x|X|mol|M|V|K|°C|g|kg|kJ|J|min|s|pm|Å|%|BM|pH)?|[A-Z][a-z]?(?:[₀-₉0-9]+)?(?:\s*[\+\-→⇌]\s*[A-Z0-9a-z₀-₉\+\-]+)*)/g
  );
  if (!matches) return [];
  const unique: string[] = [];
  for (const m of matches) {
    const clean = m.trim();
    if (clean.length >= 2 && !unique.includes(clean)) {
      unique.push(clean);
    }
    if (unique.length >= 4) break;
  }
  return unique;
}

function classifyChemSegmentToScene(
  segment: string,
  equation: string,
  topicTitle: string,
  segmentIdx: number,
  totalSegments: number
): ChemSceneCue {
  void totalSegments;
  const combined = `${topicTitle} ${equation} ${segment}`.toLowerCase();
  const extractedValues = extractNumericalAndChemicalTokens(segment);
  const stepNum = segmentIdx + 1;
  const isMetallurgy = /metallurgy|ore|froth|roasting|calcination|smelting|ellingham|refining|zone|furnace|blister|bessemer/.test(combined);
  const isElectro = /nernst|emf|cell|conduct|faraday|galvanic|electro|anode|cathode|kohlrausch/.test(combined);
  const isKinetics = /kinetic|order|half|arrhenius|rate|activation|collision/.test(combined);
  const isSolid = /solid|lattice|fcc|bcc|packing|unit cell|density|crystal|defect|bragg|schottky|frenkel/.test(combined);
  const isIonic = /ionic|acid|base|buffer|henderson|solubility|ksp|ph|ostwald|titration|arrhenius acid/.test(combined);
  const isCoord = /coordination|ligand|werner|crystal field|cfse|isomer|d-block|f-block|transition|complex|lanthanoid|actinoid/.test(combined);
  const isOrganic = /aldehyde|ketone|carboxylic|amine|nitro|aldol|cannizzaro|phenol|alcohol|ether|haloalkane|diazonium|hofmann|organic|benzene|carbonyl|rosenmund|clemmensen|hvz/.test(combined);
  const isBiomol = /biomolecule|glucose|fructose|protein|enzyme|dna|rna|vitamin|polymer|everyday|drug|zwitterion/.test(combined);
  const isSurface = /surface|adsorption|colloid|catalysis|freundlich|emulsion|distillation|tyndall|brownian/.test(combined);
  const scenePool: { scene: ChemVisualScene; label: string }[] = isMetallurgy
    ? [
        { scene: 'metallurgy_furnace', label: `Step ${stepNum}: Blast Furnace Reduction & Smelting` },
        { scene: 'distillation_column', label: `Step ${stepNum}: Zone Refining & Vapour Purification` },
        { scene: 'kinetics_energy_profile', label: `Step ${stepNum}: Ellingham ΔG° vs Temperature Curve` },
        { scene: 'crystal_lattice_unitcell', label: `Step ${stepNum}: Refined Metal Crystal Lattice` }
      ]
    : isElectro
      ? [
          { scene: 'galvanic_cell_hardware', label: `Step ${stepNum}: Galvanic Cell, Salt Bridge & e⁻ Flow` },
          { scene: 'titration_burette', label: `Step ${stepNum}: Molar Conductivity & Cell Constant` },
          { scene: 'kinetics_energy_profile', label: `Step ${stepNum}: Nernst EMF & Gibbs Energy (ΔG°)` },
          { scene: 'galvanic_cell_hardware', label: `Step ${stepNum}: Faraday Electrolysis Deposition` }
        ]
      : isKinetics
        ? [
            { scene: 'kinetics_energy_profile', label: `Step ${stepNum}: Activation Energy (Ea) Profile` },
            { scene: 'titration_burette', label: `Step ${stepNum}: Concentration Decay [A] vs Time` },
            { scene: 'distillation_column', label: `Step ${stepNum}: Half-Life (t½) & Rate Constant` },
            { scene: 'kinetics_energy_profile', label: `Step ${stepNum}: Arrhenius Temperature Curve` }
          ]
        : isSolid
          ? [
              { scene: 'crystal_lattice_unitcell', label: `Step ${stepNum}: 3D Unit Cell (SC / BCC / FCC)` },
              { scene: 'coordination_complex_3d', label: `Step ${stepNum}: Packing Efficiency & Coordination No.` },
              { scene: 'kinetics_energy_profile', label: `Step ${stepNum}: Crystal Density (ρ = zM / a³Nₐ)` },
              { scene: 'crystal_lattice_unitcell', label: `Step ${stepNum}: Schottky & Frenkel Point Defects` }
            ]
          : isIonic
            ? [
                { scene: 'titration_burette', label: `Step ${stepNum}: Acid-Base Titration & Buffer pH` },
                { scene: 'galvanic_cell_hardware', label: `Step ${stepNum}: Weak Electrolyte & Ostwald Dilution` },
                { scene: 'kinetics_energy_profile', label: `Step ${stepNum}: Henderson-Hasselbalch Buffer Curve` },
                { scene: 'titration_burette', label: `Step ${stepNum}: Solubility Product (Ksp) Equilibrium` }
              ]
            : isCoord
              ? [
                  { scene: 'coordination_complex_3d', label: `Step ${stepNum}: Octahedral [ML₆] Complex Geometry` },
                  { scene: 'crystal_lattice_unitcell', label: `Step ${stepNum}: Crystal Field Splitting (t₂g / e_g)` },
                  { scene: 'organic_mechanism_ring', label: `Step ${stepNum}: Geometrical & Optical Isomerism` },
                  { scene: 'coordination_complex_3d', label: `Step ${stepNum}: Hybridization & Magnetic Moment` }
                ]
              : isOrganic
                ? [
                    { scene: 'organic_mechanism_ring', label: `Step ${stepNum}: Aromatic Ring & Carbonyl (C=O)` },
                    { scene: 'organic_reaction_pathway', label: `Step ${stepNum}: Named Reaction Electron Shift` },
                    { scene: 'distillation_column', label: `Step ${stepNum}: Functional Group & Product Yield` },
                    { scene: 'organic_mechanism_ring', label: `Step ${stepNum}: Organic Conversion Summary` }
                  ]
                : isBiomol
                  ? [
                      { scene: 'biomolecule_helix', label: `Step ${stepNum}: DNA Double Helix & Base Pairs` },
                      { scene: 'organic_mechanism_ring', label: `Step ${stepNum}: Cyclic Glucose & Peptide Linkage` },
                      { scene: 'organic_reaction_pathway', label: `Step ${stepNum}: Enzyme Action & Zwitterion` },
                      { scene: 'biomolecule_helix', label: `Step ${stepNum}: Proteins, Nucleic Acids & Vitamins` }
                    ]
                  : isSurface
                    ? [
                        { scene: 'distillation_column', label: `Step ${stepNum}: Surface Adsorption & Colloids` },
                        { scene: 'kinetics_energy_profile', label: `Step ${stepNum}: Freundlich Isotherm & Catalysis` },
                        { scene: 'crystal_lattice_unitcell', label: `Step ${stepNum}: Catalyst Surface Active Sites` },
                        { scene: 'titration_burette', label: `Step ${stepNum}: Coagulation & Hardy-Schulze Rule` }
                      ]
                    : [
                        { scene: 'crystal_lattice_unitcell', label: `Step ${stepNum}: Structural & Chemical Model` },
                        { scene: 'kinetics_energy_profile', label: `Step ${stepNum}: Reaction Energy Profile` },
                        { scene: 'galvanic_cell_hardware', label: `Step ${stepNum}: Quantitative Step Substitution` },
                        { scene: 'organic_reaction_pathway', label: `Step ${stepNum}: Final Verified Result` }
                      ];
  const picked = scenePool[segmentIdx % scenePool.length];
  return {
    scene: picked.scene,
    captionEn: picked.label,
    captionTa: picked.label,
    stepBadgeEn: `Step ${stepNum}`,
    stepBadgeTa: `Step ${stepNum}`,
    extractedValues
  };
}
interface ChemSlide {
  id?: string;
  slideNumber: number;
  divisionNumber?: number;
  title: string;
  tamilTitle?: string;
  visualType: 'equilibrium' | 'lattice' | 'electrochem' | 'formula_board' | 'concept' | 'formula' | 'example' | 'summary';
  keyPoints?: string[];
  tamilKeyPoints?: string[];
  stepBreakdown: string[];
  tamilStepBreakdown?: string[];
  equation: string;
  narration: string;
  durationSec?: number;
  sceneType?: ChemVisualScene;
}
interface GeneratedChemLesson {
  lessonTitle: string;
  tamilLessonTitle?: string;
  topicSummary: string;
  tamilTopicSummary?: string;
  chapterTag?: string;
  slides: ChemSlide[];
  quickCheckQuestion: {
    prompt: string;
    tamilPrompt?: string;
    options: string[];
    tamilOptions?: string[];
    correctIndex: number;
    explanation: string;
    tamilExplanation?: string;
  };
}function buildInstantChemLesson(
  topicQuery: string,
  isTamilMode: boolean,
  langConfig: LanguageOption
): GeneratedChemLesson {
  const q = topicQuery.toLowerCase();

  let matchedChapter = TN_CHEMISTRY_SYLLABUS[5];
  for (const ch of TN_CHEMISTRY_SYLLABUS) {
    if (
      q.includes(`chapter ${ch.number}`) ||
      q.includes(`ch ${ch.number}`) ||
      q.includes(`பாடம் ${ch.number}`) ||
      q.includes(ch.title.toLowerCase()) ||
      q.includes(ch.tamilTitle) ||
      ch.topics.some(
        (t) =>
          q.includes(t.code) ||
          q.includes(t.title.toLowerCase().slice(0, 12)) ||
          q.includes(t.tamilTitle.slice(0, 10))
      )
    ) {
      matchedChapter = ch;
      break;
    }
  }

  const matchedTopic =
    matchedChapter.topics.find(
      (t) =>
        q.includes(t.code) ||
        q.includes(t.title.toLowerCase().slice(0, 12)) ||
        q.includes(t.tamilTitle.slice(0, 10))
    ) || matchedChapter.topics[0];

  const eq1 = matchedTopic.keyFormulas[0] || 'ΔG° = -RT ln K';
  const eq2 = matchedTopic.keyFormulas[1] || eq1;

  const tamilSlides: ChemSlide[] = [
    {
      slideNumber: 1,
      title: 'அடிப்படைக் கோட்பாடு மற்றும் வரையறை',
      visualType: 'equilibrium',
      equation: eq1,
      stepBreakdown: [
        `படி 1: ${matchedTopic.tamilTitle} அடிப்படை விதி மற்றும் குறியீடுகள்.`,
        `படி 2: சமன்பாடு ${eq1} மூலம் மாறிகளின் தொடர்பு.`,
        'படி 3: SI அலகுகளில் அளவுகளை மாற்றுதல்.'
      ],
      narration: `${matchedChapter.tamilTitle} பாடத்தில் ${matchedTopic.tamilTitle} மிக முக்கியமான கருத்தாகும். முதலில் ${eq1} என்ற அடிப்படை விதியைப் புரிந்துகொள்ள வேண்டும். மாறிகளின் மதிப்பு மாறும்போது விளைவு எவ்வாறு மாறுகிறது என்பதைக் கவனியுங்கள். அனைத்துக் கணக்குகளிலும் SI அலகுகளைப் பயன்படுத்துவது அவசியம்.`
    },
    {
      slideNumber: 2,
      title: 'கணக்குத் தீர்வு — பகுதி 1 (மதிப்புகள் & பிரதியிடல்)',
      visualType: 'lattice',
      equation: `2x → 4x  |  ${eq1}`,
      stepBreakdown: [
        'படி 1: கொடுக்கப்பட்ட மதிப்பு 2x எனில், மாற்றப்பட்ட மதிப்பு 4x ஆகிறது.',
        `படி 2: ${eq1} சமன்பாட்டில் 2x மற்றும் 4x மதிப்புகளைப் பிரதியிடுக.`,
        'படி 3: பொதுவான காரணிகளை நீக்கி எளிய பின்னமாக மாற்றுக.'
      ],
      narration: `இப்போது ஒரு கணக்கை படிப்படியாகத் தீர்ப்போம். கொடுக்கப்பட்ட அளவு 2x என்று வைத்துக் கொள்வோம். வினை முன்னேறும்போது மதிப்பு 2x இலிருந்து 4x ஆக மாறுகிறது. இந்த 2x மற்றும் 4x மதிப்புகளைச் சமன்பாட்டில் பிரதியிட்டு எளிமைப்படுத்துகிறோம்.`
    },
    {
      slideNumber: 3,
      title: 'கணக்குத் தீர்வு — பகுதி 2 (இறுதி விடை & சரிபார்ப்பு)',
      visualType: 'electrochem',
      equation: `3x + 5x = 8x  |  ${eq2}`,
      stepBreakdown: [
        'படி 4: 3x மற்றும் 5x ஆகிய இரு உறுப்புகளைக் கூட்டினால் 8x கிடைக்கிறது.',
        `படி 5: ${eq2} விதியின்படி இறுதி எண்ணியல் மதிப்பைக் கணக்கிடுக.`,
        'படி 6: சரியான அலகுடன் இறுதி விடையை எழுதுக.'
      ],
      narration: `தொடர்ந்து இரண்டாம் பகுதிக் கணக்கில் 3x மற்றும் 5x ஆகிய மதிப்புகளைக் கூட்டுகிறோம். 3x கூட்டல் 5x சமம் 8x ஆகும். பின்னர் இந்த 8x மதிப்பிலிருந்து துல்லியமான இறுதி விடையைச் சரியான அலகுடன் பெறுகிறோம்.`
    },
    {
      slideNumber: 4,
      title: 'பொதுத்தேர்வு முக்கியக் குறிப்புகள்',
      visualType: 'formula_board',
      equation: matchedTopic.keyFormulas.join('  |  '),
      stepBreakdown: [
        'படி 1: சமச்சீர் கல்வி விதிகள் மற்றும் சமன்பாடுகளைத் தெளிவாக எழுதுக.',
        'படி 2: கணக்கின் ஒவ்வொரு படியையும் தனித்தனியாகக் காட்டுக.',
        'படி 3: இறுதி விடையில் அலகு தவறாமல் இருக்க வேண்டும்.'
      ],
      narration: `பொதுத்தேர்வில் கணக்குகளைத் தீர்க்கும்போது ஒவ்வொரு படியையும் தெளிவாக எழுதுவது முழு மதிப்பெண்கள் பெற உதவும். 2x, 3x மற்றும் 5x போன்ற மதிப்புகளைப் பிரதியிடும்போது குறியீடுகளைக் கவனமாகக் கையாள வேண்டும். இறுதி விடையுடன் சரியான அலகைக் குறிப்பிட மறக்காதீர்கள்.`
    }
  ];

  if (isTamilMode) {
    return {
      lessonTitle: `பாடம் ${matchedChapter.number}: ${matchedTopic.tamilTitle}`,
      topicSummary: matchedTopic.tamilDescription,
      slides: tamilSlides,
      quickCheckQuestion: {
        prompt: `${matchedTopic.tamilTitle} தொடர்பான சரியான வேதியியல் சமன்பாடு அல்லது விதி எது?`,
        options: [
          eq1,
          'PV = nRT (நல்லியல்பு வாயு விதி)',
          'F = ma (நியூட்டனின் இரண்டாம் விதி)',
          'E = hν (ஃபோட்டான் ஆற்றல்)'
        ],
        correctIndex: 0,
        explanation: `சமச்சீர் கல்வி 12-ஆம் வகுப்பு பாடம் ${matchedChapter.number} படி, ${eq1} என்பதே சரியான தொடர்பாகும்.`
      }
    };
  }

  const narrationsByLang: Record<LangCode, [string, string, string, string]> = {
    en: [
      `In Tamil Nadu Class 12 Chapter ${matchedChapter.number} ${matchedChapter.title}, ${matchedTopic.title} builds on ${eq1}. Watch how changing concentration or state shifts the physical-chemical balance step by step. Always convert given quantities into consistent units first. Clear definitions prevent sign and unit mistakes in board exams.`,
      `Now let us solve a numerical step by step. Suppose the initial quantity is 2x and increases to 4x during the process. Substituting 2x and 4x into ${eq1} simplifies the ratio cleanly. Notice how the x factor cancels out when comparing ratios directly.`,
      `Continuing the step-by-step calculation, adding 3x and 5x gives 8x for the combined term. Applying ${eq2} with this 8x value yields the exact numerical result. Every intermediate calculation is shown on screen as the numbers update. Check the final unit carefully before concluding.`,
      `For TN HSC Chemistry exams, write every step of a sum in sequence rather than jumping to the answer. Verify that 2x, 3x, and 5x substitutions match the given stoichiometric or mathematical conditions. Always state the final numerical value with its proper SI unit.`
    ]
  };  const chosenNarr = narrationsByLang[langConfig.code] || narrationsByLang.en;

  return {
    lessonTitle: `Chapter ${matchedChapter.number}: ${matchedTopic.title}`,
    topicSummary: matchedTopic.description,
    slides: [
      {
        slideNumber: 1,
        title: 'Core Principle & Governing Law',
        visualType: 'equilibrium',
        equation: eq1,
        stepBreakdown: [
          `Step 1: State governing law for ${matchedTopic.title}.`,
          `Step 2: Identify variables in ${eq1}.`,
          'Step 3: Standardize SI/molar units before solving.'
        ],
        narration: chosenNarr[0]
      },
      {
        slideNumber: 2,
        title: 'Step-by-Step Sum — Substituting 2x & 4x',
        visualType: 'lattice',
        equation: `2x → 4x  |  ${eq1}`,
        stepBreakdown: [
          'Step 1: Given initial term = 2x, updated term = 4x.',
          `Step 2: Substitute 2x and 4x into ${eq1}.`,
          'Step 3: Simplify algebraic/stoichiometric ratio.'
        ],
        narration: chosenNarr[1]
      },
      {
        slideNumber: 3,
        title: 'Step-by-Step Sum — Combining 3x + 5x = 8x',
        visualType: 'electrochem',
        equation: `3x + 5x = 8x  |  ${eq2}`,
        stepBreakdown: [
          'Step 4: Combine terms: 3x + 5x = 8x.',
          `Step 5: Apply ${eq2} with updated value 8x.`,
          'Step 6: Compute final numerical answer with units.'
        ],
        narration: chosenNarr[2]
      },
      {
        slideNumber: 4,
        title: 'HSC Exam Strategy & Key Takeaways',
        visualType: 'formula_board',
        equation: matchedTopic.keyFormulas.join('  |  '),
        stepBreakdown: [
          'Step 1: Show every step clearly for full marks.',
          'Step 2: Double-check value changes (2x, 3x, 5x).',
          'Step 3: Include exact units in final answer.'
        ],
        narration: chosenNarr[3]
      }
    ],
    quickCheckQuestion: {
      prompt: `Which equation or law applies to ${matchedTopic.title} (TN Class 12 Ch ${matchedChapter.number})?`,
      options: [
        eq1,
        'PV = nRT (Ideal Gas Law)',
        'F = ma (Newton Second Law)',
        'E = hν (Photon Energy)'
      ],
      correctIndex: 0,
      explanation: `In TN State Board Class 12 Chapter ${matchedChapter.number}, ${eq1} is the key governing relation for ${matchedTopic.title}.`
    }
  };
}

// ============================================================================
// AVICHI CHEM NOVA AI STUDIO COMPONENT (<5S GENERATION + BOLD INDIAN MALE VOICE)
// ============================================================================

const AiChemStudio: React.FC<{
  initialTopic?: string;
  language: LangCode;
}> = ({ initialTopic, language }) => {
  const isTamilMode = false;
  const langConfig = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  const ui = getUiStrings(language);

  const [promptTopic, setPromptTopic] = useState(
    initialTopic ||
      'TN Class 12 Chemistry Chapter 6: Solid State FCC Density & Step-by-Step Numericals (2x, 3x, 5x)'
  );
  const [difficultyLevel, setDifficultyLevel] = useState<'Foundation' | 'Intermediate' | 'Exam Mastery'>('Intermediate');
  const [visualTheme, setVisualTheme] = useState<'chem_dark' | 'chalkboard' | 'lab_slate'>('chem_dark');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lesson, setLesson] = useState<GeneratedChemLesson | null>(null);

  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);
  const [spokenRatio, setSpokenRatio] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioBuffers, setAudioBuffers] = useState<Record<string, AudioBuffer>>({});
  const [quizChoice, setQuizChoice] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const audioFinishedRef = useRef<boolean>(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechKeepAliveRef = useRef<number | null>(null);
  const playbackSessionIdRef = useRef<number>(0);
  const lockedWebVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const unlockedAudioCtxRef = useRef<AudioContext | null>(null);
  const activeWebAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const webAudioTimingRef = useRef<{ startTime: number; duration: number } | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const fallbackTimingRef = useRef<{ startMs: number; durationMs: number } | null>(null);
  const audioBufferCacheRef = useRef<Record<string, AudioBuffer>>({});
  const lessonCacheRef = useRef<Record<string, GeneratedChemLesson>>({});

  const [audioStatusLabel, setAudioStatusLabel] = useState<string>('Ready');

  useEffect(() => {
    if (initialTopic) {
      setPromptTopic(initialTopic);
    }
  }, [initialTopic]);

  const unlockBrowserAudio = useCallback(() => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        if (!unlockedAudioCtxRef.current || unlockedAudioCtxRef.current.state === 'closed') {
          unlockedAudioCtxRef.current = new AudioCtx();
        }
        if (unlockedAudioCtxRef.current.state === 'suspended') {
          unlockedAudioCtxRef.current.resume().catch(() => {});
        }
        const silentBuf = unlockedAudioCtxRef.current.createBuffer(1, 1, 22050);
        const src = unlockedAudioCtxRef.current.createBufferSource();
        src.buffer = silentBuf;
        src.connect(unlockedAudioCtxRef.current.destination);
        src.start(0);
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    } catch {
      // Ignore audio unlock error
    }
  }, []);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const stopAllAudio = useCallback(() => {
    playbackSessionIdRef.current += 1;
    webAudioTimingRef.current = null;
    fallbackTimingRef.current = null;

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    if (speechKeepAliveRef.current !== null) {
      window.clearInterval(speechKeepAliveRef.current);
      speechKeepAliveRef.current = null;
    }
    if (activeWebAudioSourceRef.current) {
      try {
        activeWebAudioSourceRef.current.onended = null;
        activeWebAudioSourceRef.current.stop();
        activeWebAudioSourceRef.current.disconnect();
      } catch {
        // Already stopped
      }
      activeWebAudioSourceRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    activeUtteranceRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, [stopAllAudio]);

    const selectBoldIndianMaleVoice = useCallback(
    (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
      if (!voices || voices.length === 0) return undefined;
      const blockedFemaleNames = [
        'heera',
        'neerja',
        'raveena',
        'aditi',
        'priya',
        'kavya',
        'divya',
        'pallavi',
        'swara',
        'shruti',
        'sobhana',
        'kalpana',
        'zira',
        'hazel',
        'susan',
        'aria',
        'jenny',
        'michelle',
        'sara',
        'linda',
        'catherine',
        'female',
        'woman',
        'girl'
      ];
      const preferredMaleNames = [
        'prabhat',
        'ravi',
        'rishi',
        'hemant',
        'madhur',
        'valluvar',
        'kumar',
        'arjun',
        'guy',
        'christopher',
        'eric',
        'roger',
        'steffan',
        'ryan',
        'george',
        'david',
        'mark',
        'daniel',
        'james',
        'uk english male',
        'male',
        'man'
      ];
      const isNotFemale = (v: SpeechSynthesisVoice) => {
        const lower = v.name.toLowerCase();
        return !blockedFemaleNames.some((f) => lower.includes(f));
      };
      const isKnownMale = (v: SpeechSynthesisVoice) => {
        const lower = v.name.toLowerCase();
        return isNotFemale(v) && preferredMaleNames.some((m) => lower.includes(m));
      };
      // 1. Priority: Indian English (en-IN) Bold Male Voice (e.g. Microsoft Prabhat, Ravi, Rishi)
      const indianMale = voices.find(
        (v) => v.lang.toLowerCase() === 'en-in' && isKnownMale(v)
      );
      if (indianMale) return indianMale;
      // 2. Fallback: Any English Male Voice (e.g. Microsoft Guy / George / David / Mark) — NEVER female
      const englishMale = voices.find(
        (v) => v.lang.toLowerCase().startsWith('en') && isKnownMale(v)
      );
      if (englishMale) return englishMale;
      return undefined;
    },
    []
  );const speakSentenceChainFallback = useCallback(
    (fullText: string, sessionId: number, labelSuffix = '') => {
      if (playbackSessionIdRef.current !== sessionId || isMuted) {
        audioFinishedRef.current = true;
        return;
      }

      const wordsList = fullText.trim().split(/\s+/).filter(Boolean);
      const minExpectedDurationMs = Math.max(10000, wordsList.length * 460);

      if (!('speechSynthesis' in window)) {
        fallbackTimingRef.current = { startMs: performance.now(), durationMs: minExpectedDurationMs };
        fallbackTimerRef.current = setTimeout(() => {
          if (playbackSessionIdRef.current === sessionId) {
            audioFinishedRef.current = true;
            fallbackTimingRef.current = null;
          }
        }, minExpectedDurationMs);
        return;
      }

      const rawSentences = fullText
        .split(/(?<=[.!?।,;:])\s+/)
        .map((s) => s.trim())
        .filter(Boolean);

      const sentences: string[] = [];
      for (const piece of rawSentences.length > 0 ? rawSentences : [fullText]) {
        if (piece.length <= 115) {
          sentences.push(piece);
        } else {
          const words = piece.split(/\s+/);
          let currentChunk = '';
          for (const w of words) {
            if ((currentChunk + ' ' + w).trim().length > 115 && currentChunk) {
              sentences.push(currentChunk.trim());
              currentChunk = w;
            } else {
              currentChunk = (currentChunk + ' ' + w).trim();
            }
          }
          if (currentChunk) sentences.push(currentChunk);
        }
      }

      fallbackTimingRef.current = { startMs: performance.now(), durationMs: minExpectedDurationMs };

      if (speechKeepAliveRef.current !== null) {
        window.clearInterval(speechKeepAliveRef.current);
      }
      speechKeepAliveRef.current = window.setInterval(() => {
        if (playbackSessionIdRef.current !== sessionId) {
          if (speechKeepAliveRef.current !== null) {
            window.clearInterval(speechKeepAliveRef.current);
            speechKeepAliveRef.current = null;
          }
          return;
        }
        // Only apply keep-alive pause/resume on local offline voices; online neural voices repeat if paused
        if (window.speechSynthesis.speaking && lockedWebVoiceRef.current?.localService) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 4500);

      const totalSentences = Math.max(1, sentences.length);

      const speakIndex = (idx: number) => {
        if (playbackSessionIdRef.current !== sessionId || isMuted) return;
        setSpokenRatio(Math.min(1, idx / totalSentences));

        if (idx >= sentences.length) {
          setSpokenRatio(1);
          setSlideProgress(100);
          fallbackTimerRef.current = window.setTimeout(() => {
            if (playbackSessionIdRef.current === sessionId) {
              fallbackTimingRef.current = null;
              audioFinishedRef.current = true;
              setAudioStatusLabel(isTamilMode ? 'பகுதி நிறைவு' : 'Division Complete');
            }
          }, 950);
          if (speechKeepAliveRef.current !== null) {
            window.clearInterval(speechKeepAliveRef.current);
            speechKeepAliveRef.current = null;
          }
          return;
        }

        const chunkText = sentences[idx];
        const utterance = new SpeechSynthesisUtterance(chunkText);
        activeUtteranceRef.current = utterance;
        const chunkWords = chunkText.split(/\s+/).filter(Boolean).length;
        const maxChunkMs = Math.max(22000, chunkWords * 1600);
        let chunkSettled = false;
        let chunkSafetyTimer = 0;
        const advanceChunk = () => {
          if (chunkSettled) return;
          chunkSettled = true;
          window.clearTimeout(chunkSafetyTimer);
          if (playbackSessionIdRef.current === sessionId) {
            window.setTimeout(() => speakIndex(idx + 1), 80);
          }
        };
        const liveVoices = window.speechSynthesis.getVoices();
        const chosenMale = selectBoldIndianMaleVoice(liveVoices);
        if (chosenMale) {
          lockedWebVoiceRef.current = chosenMale;
          utterance.voice = chosenMale;
        } else {
          const availableNames = liveVoices
            .filter((v) => v.lang.toLowerCase().startsWith(langConfig.code))
            .map((v) => v.name)
            .join(', ');
          setAudioStatusLabel(
            isTamilMode
              ? `ஆண் குரல் இல்லை (Edge உலாவி அல்லது API Key பயன்படுத்தவும்: ${availableNames || 'None'})`
              : `No Male Voice in Browser (Open in Edge or add API Key)`
          );
          advanceChunk();
          return;
        }
        utterance.lang = langConfig.bcp47;
        utterance.pitch = 0.84;
        utterance.rate = 0.88;
        utterance.volume = 1.0;
        chunkSafetyTimer = window.setTimeout(advanceChunk, maxChunkMs);        utterance.onstart = () => {
          if (playbackSessionIdRef.current === sessionId) {
            setSpokenRatio(Math.min(0.98, (idx + 0.15) / totalSentences));
            setAudioStatusLabel(
              isTamilMode
                ? `${labelSuffix} • கம்பீர இந்திய ஆண் குரல்`
                : `${labelSuffix} • Bold Indian Male Voice`
            );
          }
        };

        utterance.onend = advanceChunk;
        utterance.onerror = advanceChunk;

        window.speechSynthesis.speak(utterance);
      };

      const startChain = () => {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
          window.setTimeout(() => speakIndex(0), 110);
        } else {
          speakIndex(0);
        }
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        startChain();
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', () => startChain(), { once: true });
        window.setTimeout(startChain, 200);
      }
    },
    [isMuted, isTamilMode, langConfig.bcp47, selectBoldIndianMaleVoice]
  );

  const sanitizeTextForTts = useCallback((raw: string): string => {
    return raw
      .replace(/⇒/g, ' implies ')
      .replace(/→/g, ' gives ')
      .replace(/≠/g, ' not equal to ')
      .replace(/≤/g, ' less than or equal to ')
      .replace(/≥/g, ' greater than or equal to ')
      .replace(/∮/g, ' closed integral ')
      .replace(/∑/g, ' sum of ')
      .replace(/√/g, ' square root of ')
      .replace(/ω/g, ' omega ')
      .replace(/λ/g, ' lambda ')
      .replace(/Φ/g, ' flux ')
      .replace(/°/g, ' degree ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);  const fetchSingleSlideAudioBuffer = useCallback(
    async (textToSpeak: string, lang: LanguageOption): Promise<AudioBuffer | null> => {
      try {
        const apiKey = getGeminiApiKey();
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        const cleanText = sanitizeTextForTts(textToSpeak);

        const payload = {
          contents: [
            {
              parts: [
                {
                  text: lang.code === "en" ? `Speak in a bold, deep Indian male professor accent (en-IN). Read clearly without greetings:\n${cleanText}` : `${lang.ttsInstruction}\n\n${cleanText}`
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Charon' }
              }
            }
          },
          model: 'gemini-2.5-flash-preview-tts'
        };

        const response = await fetchWithTimeout(
          apiUrl,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          },
          12000
        );

        if (!response.ok) return null;

        const result = await response.json();
        const part = result?.candidates?.[0]?.content?.parts?.[0];
        const audioData = part?.inlineData?.data;
        const mimeType = part?.inlineData?.mimeType;

        if (audioData && mimeType && mimeType.startsWith('audio/')) {
          const rateMatch = mimeType.match(/rate=(\d+)/);
          const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
          const pcmBuffer = base64ToArrayBuffer(audioData);
          const pcm16 = new Int16Array(pcmBuffer);

          if (pcm16.length / sampleRate < 3.5) {
            return null;
          }

          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (!unlockedAudioCtxRef.current || unlockedAudioCtxRef.current.state === 'closed') {
            unlockedAudioCtxRef.current = new AudioCtx();
          }
          const ctx = unlockedAudioCtxRef.current;

          const audioBuffer = ctx.createBuffer(1, pcm16.length, sampleRate);
          const channelData = audioBuffer.getChannelData(0);
          for (let i = 0; i < pcm16.length; i++) {
            channelData[i] = pcm16[i] / 32768.0;
          }
          return audioBuffer;
        }
        return null;
      } catch {
        return null;
      }
    },
    [sanitizeTextForTts]
  );

  const playDecodedBuffer = useCallback(
    async (buffer: AudioBuffer, sessionId: number, divisionLabel: string) => {
      if (playbackSessionIdRef.current !== sessionId || isMuted) return;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!unlockedAudioCtxRef.current || unlockedAudioCtxRef.current.state === 'closed') {
        unlockedAudioCtxRef.current = new AudioCtx();
      }
      const ctx = unlockedAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (playbackSessionIdRef.current !== sessionId || isMuted) return;

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 1.6;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      activeWebAudioSourceRef.current = source;
      const effectiveDuration = Math.max(buffer.duration, 4.5);
      webAudioTimingRef.current = {
        startTime: ctx.currentTime,
        duration: effectiveDuration
      };

      setAudioStatusLabel(
        isTamilMode
          ? `${divisionLabel} • கம்பீர இந்திய ஆண் குரல்`
          : `${divisionLabel} • Bold Indian Male Voice`
      );

      source.onended = () => {
        if (playbackSessionIdRef.current === sessionId) {
          audioFinishedRef.current = true;
          webAudioTimingRef.current = null;
          setSpokenRatio(1);
          setAudioStatusLabel(isTamilMode ? 'பகுதி நிறைவு' : 'Division Complete');
        }
      };

      source.start(0);
    },
    [isMuted, isTamilMode]
  );

  const playSlideAudio = useCallback(
    async (
      slideIndex: number,
      textToSpeak?: string,
      preloadedBufferMap?: Record<string, AudioBuffer>
    ) => {
      stopAllAudio();
      audioFinishedRef.current = false;
      setSpokenRatio(0);

      if (!textToSpeak || isMuted) {
        audioFinishedRef.current = true;
        setAudioStatusLabel(isMuted ? (isTamilMode ? 'ஒலி நிறுத்தப்பட்டது' : 'Muted') : 'Ready');
        return;
      }

      const sessionId = playbackSessionIdRef.current;
      const divisionLabel = isTamilMode ? `பகுதி ${slideIndex + 1}/4` : `Div ${slideIndex + 1}/4`;
      const cacheKey = `${language}-${slideIndex}-${textToSpeak.slice(0, 32)}`;
      const existingBuffer =
        preloadedBufferMap?.[cacheKey] ||
        audioBufferCacheRef.current[cacheKey] ||
        audioBuffers[cacheKey];

      if (existingBuffer) {
        await playDecodedBuffer(existingBuffer, sessionId, divisionLabel);
        return;
      }

      setIsAudioLoading(true);
      setAudioStatusLabel(
        isTamilMode
          ? `கம்பீர இந்திய ஆண் குரல் (${divisionLabel})...`
          : `Loading Bold Indian Male Voice (${divisionLabel})...`
      );
      const fetchedBuffer = await fetchSingleSlideAudioBuffer(textToSpeak, langConfig);
      setIsAudioLoading(false);

      if (playbackSessionIdRef.current !== sessionId || isMuted) return;

      if (fetchedBuffer) {
        audioBufferCacheRef.current[cacheKey] = fetchedBuffer;
        setAudioBuffers((prev) => ({ ...prev, [cacheKey]: fetchedBuffer }));
        await playDecodedBuffer(fetchedBuffer, sessionId, divisionLabel);
      } else {
        speakSentenceChainFallback(textToSpeak, sessionId, divisionLabel);
      }
    },
    [
      audioBuffers,
      fetchSingleSlideAudioBuffer,
      isMuted,
      isTamilMode,
      langConfig,
      language,
      playDecodedBuffer,
      speakSentenceChainFallback,
      stopAllAudio
    ]
  );

  const prebufferRemainingDivisions = useCallback(
    async (slides: ChemSlide[], activeLang: LanguageOption) => {
      await Promise.all(
        slides.slice(1).map(async (slide, offsetIdx) => {
          const idx = offsetIdx + 1;
          if (!slide?.narration) return;
          const cacheKey = `${activeLang.code}-${idx}-${slide.narration.slice(0, 32)}`;
          if (audioBufferCacheRef.current[cacheKey]) return;

          const buf = await fetchSingleSlideAudioBuffer(slide.narration, activeLang);
          if (buf) {
            audioBufferCacheRef.current[cacheKey] = buf;
            setAudioBuffers((prev) => ({ ...prev, [cacheKey]: buf }));
          }
        })
      );
    },
    [fetchSingleSlideAudioBuffer]
  );

  const handleGenerateLesson = async () => {
    if (!promptTopic.trim()) return;

    unlockBrowserAudio();

    const normalizedTopic = promptTopic.trim();
    const lessonCacheKey = `${language}-${difficultyLevel}-${normalizedTopic.toLowerCase()}`;

    setErrorMsg(null);
    setQuizChoice(null);
    stopAllAudio();

    const cachedLesson = lessonCacheRef.current[lessonCacheKey];
    if (cachedLesson) {
      setLesson(cachedLesson);
      setIsGenerating(false);
      setGenerationStep('');
      setCurrentSlideIdx(0);
      setSlideProgress(0);
      setSpokenRatio(0);
      setIsPlaying(true);
      playSlideAudio(0, cachedLesson.slides[0]?.narration);
      prebufferRemainingDivisions(cachedLesson.slides, langConfig);
      return;
    }

    setIsGenerating(true);
    setIsPlaying(false);
    setCurrentSlideIdx(0);
    setSlideProgress(0);
    setSpokenRatio(0);

    try {
      setGenerationStep(
        isTamilMode
          ? '4-பகுதி தமிழ் வேதியியல் வீடியோ பாடம் உருவாக்கப்படுகிறது...'
          : `Generating 4-division chemistry video (<5s) + ${langConfig.name} Bold Indian Male Voice...`
      );

      const apiKey = getGeminiApiKey();
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const strictLangRules: Record<LangCode, string> = {
        en: "Keep visual labels in English and write the narration field of all 4 divisions in clear Indian English (en-IN) suitable for a bold Indian male professor."
      };
      const languageInstruction = strictLangRules[language] || strictLangRules.en;const systemPrompt = `You are a bold, deep-voiced Indian male chemistry professor teaching TN Class 12 (+2) Samacheer Kalvi Chemistry.
Create a concise 4-division video lesson with step-by-step solved numericals (including 2x, 3x, 5x, 8x examples) on "${normalizedTopic}" (${difficultyLevel} level).
RULES:
1. No greetings ("Good morning", "Vanakkam", "Hello").
2. Each division MUST have exactly 4 stepBreakdown points and 4 narration sentences, where Sentence 1 explains Point 1, Sentence 2 explains Point 2, Sentence 3 explains Point 3, and Sentence 4 explains Point 4.
3. ${languageInstruction}
4. visualType: one of "mechanism", "equilibrium", "lattice", "electrochem", "formula_board".`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Generate a 4-division TN Class 12 Chemistry video lesson with step-by-step numericals for: "${normalizedTopic}".`
              }
            ]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          thinkingConfig: { thinkingBudget: 0 },
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              lessonTitle: { type: 'STRING' },
              topicSummary: { type: 'STRING' },
              slides: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    slideNumber: { type: 'INTEGER' },
                    title: { type: 'STRING' },
                    visualType: {
                      type: 'STRING',
                      enum: ['mechanism', 'equilibrium', 'lattice', 'electrochem', 'formula_board']
                    },
                    equation: { type: 'STRING' },
                    stepBreakdown: {
                      type: 'ARRAY',
                      items: { type: 'STRING' }
                    },
                    narration: { type: 'STRING' }
                  },
                  required: ['slideNumber', 'title', 'visualType', 'equation', 'stepBreakdown', 'narration']
                }
              },
              quickCheckQuestion: {
                type: 'OBJECT',
                properties: {
                  prompt: { type: 'STRING' },
                  options: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  },
                  correctIndex: { type: 'INTEGER' },
                  explanation: { type: 'STRING' }
                },
                required: ['prompt', 'options', 'correctIndex', 'explanation']
              }
            },
            required: ['lessonTitle', 'topicSummary', 'slides', 'quickCheckQuestion']
          }
        }
      };

      const response = await fetchWithTimeout(
        apiUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        },
        4200
      );

      if (!response.ok) {
        throw new Error(`Gemini service returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error('Empty response received from Gemini.');
      }

      const parsedRaw = JSON.parse(rawText);
      const parsedLesson: GeneratedChemLesson = {
        lessonTitle: safeText(parsedRaw?.lessonTitle) || normalizedTopic,
        topicSummary: safeText(parsedRaw?.topicSummary),
        slides: Array.isArray(parsedRaw?.slides)
          ? parsedRaw.slides.map((s: Record<string, unknown>, idx: number) => ({
              slideNumber: Number(s?.slideNumber) || idx + 1,
              title: safeText(s?.title) || `Division ${idx + 1}`,
              visualType: [
                'mechanism',
                'equilibrium',
                'lattice',
                'electrochem',
                'formula_board'
              ].includes(String(s?.visualType))
                ? (s?.visualType as ChemSlide['visualType'])
                : 'formula_board',
              equation: safeText(s?.equation),
              stepBreakdown: Array.isArray(s?.stepBreakdown)
                ? s.stepBreakdown.map((bp: unknown) => safeText(bp)).filter(Boolean)
                : [],
              narration: safeText(s?.narration) || safeText(s?.title)
            }))
          : [],
        quickCheckQuestion: {
          prompt: safeText(parsedRaw?.quickCheckQuestion?.prompt),
          options: Array.isArray(parsedRaw?.quickCheckQuestion?.options)
            ? parsedRaw.quickCheckQuestion.options.map((o: unknown) => safeText(o))
            : [],
          correctIndex: Number(parsedRaw?.quickCheckQuestion?.correctIndex) || 0,
          explanation: safeText(parsedRaw?.quickCheckQuestion?.explanation)
        }
      };

      lessonCacheRef.current[lessonCacheKey] = parsedLesson;
      setLesson(parsedLesson);
      setIsGenerating(false);
      setGenerationStep('');

      setCurrentSlideIdx(0);
      setSlideProgress(0);
      setSpokenRatio(0);
      setIsPlaying(true);
      playSlideAudio(0, parsedLesson.slides[0]?.narration);
      prebufferRemainingDivisions(parsedLesson.slides, langConfig);
    } catch {
      const instantLesson = buildInstantChemLesson(normalizedTopic, isTamilMode, langConfig);
      lessonCacheRef.current[lessonCacheKey] = instantLesson;
      setLesson(instantLesson);
      setIsGenerating(false);
      setGenerationStep('');

      setCurrentSlideIdx(0);
      setSlideProgress(0);
      setSpokenRatio(0);
      setIsPlaying(true);
      playSlideAudio(0, instantLesson.slides[0]?.narration);
      prebufferRemainingDivisions(instantLesson.slides, langConfig);
    }
  };

  useEffect(() => {
    if (!isPlaying || !lesson) return;

    const interval = setInterval(() => {
      if (
        webAudioTimingRef.current &&
        unlockedAudioCtxRef.current &&
        webAudioTimingRef.current.duration > 0
      ) {
        const elapsed =
          unlockedAudioCtxRef.current.currentTime - webAudioTimingRef.current.startTime;
        const ratio = Math.min(0.99, Math.max(0, elapsed / webAudioTimingRef.current.duration));
        setSlideProgress(ratio * 100);
        setSpokenRatio(ratio);
        return;
      }

      if (fallbackTimingRef.current && fallbackTimingRef.current.durationMs > 0) {
        const elapsedMs = performance.now() - fallbackTimingRef.current.startMs;
        const ratio = Math.min(0.99, Math.max(0, elapsedMs / fallbackTimingRef.current.durationMs));
        setSlideProgress(ratio * 100);
        return;
      }

      if (!audioFinishedRef.current && !isMuted) {
        setSlideProgress((prev) => (prev >= 99 ? 99 : prev + 0.4));
        return;
      }

      setSlideProgress(100);
      setSpokenRatio(1);
      if (currentSlideIdx < lesson.slides.length - 1) {
        const nextIdx = currentSlideIdx + 1;
        setCurrentSlideIdx(nextIdx);
        setSlideProgress(0);
        setSpokenRatio(0);
        playSlideAudio(nextIdx, lesson.slides[nextIdx]?.narration);
      } else {
        setIsPlaying(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, lesson, currentSlideIdx, isMuted, isAudioLoading, slideProgress, spokenRatio, playSlideAudio]);

  const togglePlayPause = () => {
    if (!lesson) return;
    unlockBrowserAudio();
    if (isPlaying) {
      setIsPlaying(false);
      stopAllAudio();
      setAudioStatusLabel(isTamilMode ? 'இடைநிறுத்தப்பட்டது' : 'Paused');
    } else {
      if (slideProgress >= 100 && currentSlideIdx === lesson.slides.length - 1) {
        setCurrentSlideIdx(0);
        setSlideProgress(0);
        setSpokenRatio(0);
        playSlideAudio(0, lesson.slides[0]?.narration);
      } else {
        playSlideAudio(currentSlideIdx, lesson.slides[currentSlideIdx]?.narration);
      }
      setIsPlaying(true);
    }
  };

  const handleSelectSlide = (idx: number) => {
    if (!lesson) return;
    unlockBrowserAudio();
    setCurrentSlideIdx(idx);
    setSlideProgress(0);
    setSpokenRatio(0);
    stopAllAudio();
    if (isPlaying) {
      playSlideAudio(idx, lesson.slides[idx]?.narration);
    }
  };

  useEffect(() => {
    if (lesson && isPlaying) {
      playSlideAudio(currentSlideIdx, lesson.slides[currentSlideIdx]?.narration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // ============================================================================
  // STEP-BY-STEP SUM & VALUE-CHANGING CANVAS RENDERER
  // ============================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let pulsePhase = 0;

    const render = () => {
      pulsePhase += 0.04;

      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
          canvas.width = rect.width;
          canvas.height = rect.height;
        }
      }

      const w = canvas.width;
      const h = canvas.height;

      const bgMap = {
        chem_dark: '#040e14',
        chalkboard: '#0b221a',
        lab_slate: '#071326'
      };
      const gridMap = {
        chem_dark: 'rgba(45, 212, 191, 0.07)',
        chalkboard: 'rgba(110, 231, 183, 0.07)',
        lab_slate: 'rgba(56, 189, 248, 0.12)'
      };
      const accentMap = {
        chem_dark: '#14b8a6',
        chalkboard: '#34d399',
        lab_slate: '#38bdf8'
      };

      ctx.fillStyle = bgMap[visualTheme];
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = gridMap[visualTheme];
      ctx.lineWidth = 1;
      const gridStep = 32;
      for (let x = 0; x < w; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const currentSlide = lesson?.slides[currentSlideIdx];
      const isCompact = w < 640;
      const vizCenterX = isCompact ? w * 0.5 : w * 0.72;
      const vizCenterY = isCompact ? h * 0.72 : h * 0.5;
      const vizRadius = isCompact ? Math.min(w, h) * 0.21 : Math.min(w * 0.21, h * 0.32);

      const drawMolecularOrSumOrbit = (
        cx: number,
        cy: number,
        radius: number,
        phase: number,
        stepIndex: number,
        values: string[]
      ) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = accentMap[visualTheme];
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(0, 0, 14 + Math.sin(phase) * 2, 0, Math.PI * 2);
        ctx.stroke();

        const activeVal = values[stepIndex % Math.max(1, values.length)] || `${(stepIndex + 1) * 2}x`;

        for (let k = 0; k < 3; k++) {
          ctx.save();
          ctx.rotate(phase * (0.65 + stepIndex * 0.15) + (k * Math.PI) / 3);
          ctx.beginPath();
          ctx.ellipse(0, 0, radius * 0.92, radius * 0.34, 0, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = k === stepIndex % 3 ? '#5eead4' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(radius * 0.92, 0, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.fillStyle = '#99f6e4';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(activeVal.slice(0, 22), 0, 4);
        ctx.restore();
      };

      const drawPerNarrationContentVisual = (
        cx: number,
        cy: number,
        radius: number,
        phase: number,
        scene: ChemVisualScene,
        stepIndex: number,
        values: string[]
      ) => {
        ctx.save();
        ctx.translate(cx, cy);
        const activeVal = values[stepIndex % Math.max(1, values.length)] || `${(stepIndex + 1) * 2}x`;

        if (scene === 'galvanic_cell_hardware') {
          const bw = radius * 0.72;
          const bh = radius * 0.78;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-bw - 10, -bh * 0.35, bw, bh);
          ctx.strokeRect(10, -bh * 0.35, bw, bh);

          ctx.strokeStyle = '#5eead4';
          ctx.beginPath();
          ctx.arc(0, -bh * 0.35, bw * 0.75, Math.PI, 0);
          ctx.stroke();

          const flowX = -bw * 0.5 + ((phase * 30) % (bw * 1.4));
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(flowX, -bh * 0.75, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (scene === 'metallurgy_furnace') {
          const w = radius * 0.72;
          const h = radius * 1.15;
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(-w * 0.45, -h * 0.5);
          ctx.lineTo(w * 0.45, -h * 0.5);
          ctx.lineTo(w * 0.85, h * 0.2);
          ctx.lineTo(w * 0.65, h * 0.5);
          ctx.lineTo(-w * 0.65, h * 0.5);
          ctx.lineTo(-w * 0.85, h * 0.2);
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = 'rgba(249, 115, 22, 0.75)';
          ctx.fillRect(-w * 0.62, h * 0.22, w * 1.24, h * 0.26);
          for (let i = 0; i < 6; i++) {
            const by = h * 0.18 - ((phase * 28 + i * 16) % (h * 0.62));
            const bx = -w * 0.35 + ((i * 17) % (w * 0.7));
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = '#fde68a';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('Blast Furnace (1900 K)', 0, -h * 0.6);
        } else if (scene === 'organic_mechanism_ring') {
          const r = radius * 0.62;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const ang = (Math.PI / 3) * i - Math.PI / 6;
            const px = r * Math.cos(ang);
            const py = r * Math.sin(ang);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.strokeStyle = '#2dd4bf';
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.56, phase, phase + Math.PI * 1.6);
          ctx.stroke();
          ctx.strokeStyle = '#f472b6';
          ctx.beginPath();
          ctx.moveTo(r * 0.86, -r * 0.5);
          ctx.lineTo(r * 1.4, -r * 0.85);
          ctx.stroke();
          ctx.fillStyle = '#f9a8d4';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('C=O', r * 1.05, -r * 0.9);
        } else if (scene === 'coordination_complex_3d') {
          const arm = radius * 0.72;
          const ligands = [
            { x: 0, y: -arm },
            { x: 0, y: arm },
            { x: -arm, y: 0 },
            { x: arm, y: 0 },
            { x: -arm * 0.55, y: -arm * 0.45 },
            { x: arm * 0.55, y: arm * 0.45 }
          ];
          ligands.forEach((lg) => {
            ctx.strokeStyle = 'rgba(167, 139, 250, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(lg.x, lg.y);
            ctx.stroke();
            ctx.fillStyle = '#34d399';
            ctx.beginPath();
            ctx.arc(lg.x, lg.y, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('L', lg.x, lg.y + 3);
          });
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(0, 0, 15 + Math.sin(phase * 2) * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('M^n+', 0, 4);
        } else if (scene === 'biomolecule_helix') {
          const hSpan = radius * 1.45;
          const topY = -hSpan / 2;
          for (let i = 0; i <= 12; i++) {
            const frac = i / 12;
            const y = topY + frac * hSpan;
            const p = frac * Math.PI * 2.4 + phase * 1.4;
            const x1 = Math.sin(p) * (radius * 0.48);
            const x2 = -Math.sin(p) * (radius * 0.48);
            ctx.strokeStyle = i % 2 === 0 ? 'rgba(52, 211, 153, 0.75)' : 'rgba(251, 191, 36, 0.75)';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(x1, y, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#f472b6';
            ctx.beginPath();
            ctx.arc(x2, y, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (scene === 'crystal_lattice_unitcell') {
          const s = radius * 0.65;
          const shift = 14 + Math.sin(phase) * 3;
          ctx.strokeStyle = '#5eead4';
          ctx.lineWidth = 2;
          ctx.strokeRect(-s / 2, -s / 2, s, s);
          ctx.strokeStyle = '#38bdf8';
          ctx.strokeRect(-s / 2 + shift, -s / 2 - shift, s, s);

          const corners = [
            [-s / 2, -s / 2],
            [s / 2, -s / 2],
            [s / 2, s / 2],
            [-s / 2, s / 2]
          ];
          corners.forEach(([x0, y0], idx) => {
            ctx.strokeStyle = 'rgba(94, 234, 212, 0.5)';
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + shift, y0 - shift);
            ctx.stroke();

            ctx.fillStyle = idx === stepIndex % 4 ? '#fbbf24' : '#5eead4';
            ctx.beginPath();
            ctx.arc(x0, y0, 4.5, 0, Math.PI * 2);
            ctx.fill();
          });
        } else if (scene === 'kinetics_energy_profile') {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-radius * 0.85, radius * 0.55);
          ctx.lineTo(radius * 0.85, radius * 0.55);
          ctx.moveTo(-radius * 0.85, radius * 0.55);
          ctx.lineTo(-radius * 0.85, -radius * 0.65);
          ctx.stroke();

          const barrierLift = 0.75 + Math.sin(phase) * 0.14;
          ctx.strokeStyle = '#5eead4';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-radius * 0.75, radius * 0.25);
          ctx.bezierCurveTo(
            -radius * 0.25,
            -radius * 0.9 * barrierLift,
            radius * 0.2,
            -radius * 0.9 * barrierLift,
            radius * 0.75,
            radius * 0.45
          );
          ctx.stroke();
        } else if (scene === 'titration_burette') {
          const fillRatio = 0.35 + ((stepIndex + 1) / 4) * 0.45;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(-radius * 0.45, -radius * 0.55, radius * 0.9, radius * 1.15);

          const liquidH = radius * 1.05 * fillRatio;
          ctx.fillStyle = 'rgba(20, 184, 166, 0.35)';
          ctx.fillRect(
            -radius * 0.45 + 2,
            radius * 0.6 - liquidH,
            radius * 0.9 - 4,
            liquidH - 2
          );
        } else if (scene === 'organic_reaction_pathway') {
          const rRing = radius * 0.52;
          ctx.strokeStyle = '#5eead4';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const ang = (k * Math.PI) / 3 + phase * 0.35;
            const px = Math.cos(ang) * rRing;
            const py = Math.sin(ang) * rRing;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(Math.cos(phase) * (rRing * 1.25), Math.sin(phase) * (rRing * 1.25), 5.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (scene === 'distillation_column') {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-radius * 0.32, -radius * 0.68, radius * 0.64, radius * 1.32);

          for (let b = 0; b < 5; b++) {
            const by = radius * 0.5 - ((phase * 24 + b * 14) % (radius * 1.1));
            ctx.strokeStyle = '#5eead4';
            ctx.beginPath();
            ctx.arc(Math.sin(phase + b) * 8, by, 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        } else {
          drawMolecularOrSumOrbit(0, 0, radius, phase, stepIndex, values);
          ctx.restore();
          return;
        }

        ctx.fillStyle = '#99f6e4';
        ctx.font = 'bold 11.5px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(activeVal.slice(0, 22), 0, radius * 0.85);
        ctx.restore();
      };

      if (!currentSlide) {
        drawMolecularOrSumOrbit(w / 2, h / 2 + 12, 74, pulsePhase, 0, ['2x → 4x', '3x + 5x = 8x']);

        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 18px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          isTamilMode
            ? 'Avichi Chem Nova AI வேதியியல் வகுப்பறை தயார்'
            : 'Avichi Chem Nova AI Studio Ready',
          0,
          -88
        );
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Inter, system-ui, sans-serif';
        ctx.fillText(
          isTamilMode
            ? '12-ஆம் வகுப்பு வேதியியல் பாடம் அல்லது கணக்கைத் தேர்ந்தெடுத்து "AI பாடம் உருவாக்கு" அழுத்தவும்'
            : 'Choose any TN Class 12 Chemistry chapter or sum & click "Generate AI Lesson"',
          0,
          96
        );
        ctx.restore();
      } else {
        const segments = splitNarrationIntoSegments(currentSlide.narration);
        const totalSegs = Math.max(1, segments.length);
        const effRatio = isMuted ? slideProgress / 100 : spokenRatio;
        const segIdx = Math.min(totalSegs - 1, Math.floor(effRatio * totalSegs));
        const activeSegment = segments[segIdx] || currentSlide.narration;

        const cue = classifyChemSegmentToScene(activeSegment, currentSlide.equation || "", `${promptTopic} ${lesson?.lessonTitle || ""} ${currentSlide.title}`, currentSlideIdx + segIdx, totalSegs);

        ctx.fillStyle = accentMap[visualTheme];
        ctx.font = 'bold 12px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(
          isTamilMode
            ? `பகுதி ${currentSlideIdx + 1} / ${lesson.slides.length}  •  ${cue.stepBadgeTa}`
            : `DIVISION ${currentSlideIdx + 1} OF ${lesson.slides.length}  •  ${cue.stepBadgeEn.toUpperCase()}`,
          28,
          34
        );

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${isCompact ? 17 : 21}px Inter, system-ui, sans-serif`;
        const titleStr =
          currentSlide.title.length > 42 ? currentSlide.title.slice(0, 39) + '...' : currentSlide.title;
        ctx.fillText(titleStr, 28, 62);

        const eqBoxW = isCompact ? w - 56 : w * 0.44;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.beginPath();
        ctx.roundRect(28, 78, eqBoxW, 44, 10);
        ctx.fill();
        ctx.strokeStyle = accentMap[visualTheme];
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#5eead4';
        ctx.font = `600 ${isCompact ? 13 : 15}px monospace`;
        ctx.fillText(currentSlide.equation, 42, 105);

        const steps = currentSlide.stepBreakdown || [];
        const activeBulletIdx =
          steps.length > 0
            ? Math.min(steps.length - 1, Math.floor((segIdx / Math.max(1, totalSegs)) * steps.length))
            : 0;
        steps.forEach((st, idx) => {
          const isCurrentStep = idx === activeBulletIdx;
          const isCompletedStep = idx < activeBulletIdx;
          if (isCurrentStep) {
            ctx.fillStyle = 'rgba(20, 184, 166, 0.18)';
            ctx.beginPath();
            ctx.roundRect(24, 132 + idx * 30, eqBoxW + 8, 24, 6);
            ctx.fill();
            ctx.fillStyle = '#5eead4';
          } else if (isCompletedStep) {
            ctx.fillStyle = 'rgba(167, 243, 208, 0.85)';
          } else {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
          }
          ctx.font = `${isCurrentStep ? 'bold' : 'normal'} ${isCompact ? 12 : 13.5}px Inter, system-ui, sans-serif`;
          const yPos = 148 + idx * 30;
          if (!isCompact || yPos < h * 0.46) {
            const prefix = isCurrentStep ? '▸' : isCompletedStep ? '✓' : '•';
            const clipped = st.length > 52 ? st.slice(0, 49) + '...' : st;
            ctx.fillText(`${prefix}  ${clipped}`, 30, yPos);
          }
        });

        ctx.save();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.lineWidth = 1.2;
        const cardW = vizRadius * 2.45;
        const cardH = vizRadius * 2.25;
        ctx.beginPath();
        ctx.roundRect(vizCenterX - cardW / 2, vizCenterY - cardH / 2, cardW, cardH, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = accentMap[visualTheme];
        ctx.font = 'bold 11px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          isTamilMode ? cue.captionTa : cue.captionEn,
          vizCenterX,
          vizCenterY - cardH / 2 + 20
        );
        ctx.restore();
        drawPerNarrationContentVisual(
          vizCenterX,
          vizCenterY + 8,
          vizRadius * 0.85,
          pulsePhase,
          cue.scene,
          segIdx,
          cue.extractedValues
        );
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [lesson, currentSlideIdx, slideProgress, spokenRatio, visualTheme, isTamilMode, promptTopic]);

  const activeSegments = lesson?.slides[currentSlideIdx]
    ? splitNarrationIntoSegments(lesson.slides[currentSlideIdx].narration)
    : [];
  const activeSegIdx =
    activeSegments.length > 0
      ? Math.min(
          activeSegments.length - 1,
          Math.floor((isMuted ? slideProgress / 100 : spokenRatio) * activeSegments.length)
        )
      : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              {ui.topicLabel}
            </label>
            <div className="relative">
              <Sparkles className="w-4 h-4 text-teal-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promptTopic}
                onChange={(e) => setPromptTopic(e.target.value)}
                placeholder={
                  isTamilMode
                    ? 'எ.கா., 12-ஆம் வகுப்பு பாடம் 7 முதல் வகை வினை மற்றும் படிப்படியான கணக்கு...'
                    : 'e.g., TN Class 12 Chapter 7 First-Order Kinetics & Step-by-Step Numerical...'
                }
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {isTamilMode ? 'நிலை' : 'Level'}
              </label>
              <select
                value={difficultyLevel}
                onChange={(e) =>
                  setDifficultyLevel(e.target.value as 'Foundation' | 'Intermediate' | 'Exam Mastery')
                }
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Foundation">{isTamilMode ? 'அடிப்படை' : 'Foundation'}</option>
                <option value="Intermediate">{isTamilMode ? 'நடுத்தரம்' : 'Intermediate'}</option>
                <option value="Exam Mastery">{isTamilMode ? 'பொதுத்தேர்வு தேர்ச்சி' : 'Public Exam Mastery'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                {isTamilMode ? 'பலகை வடிவம்' : 'Board Style'}
              </label>
              <select
                value={visualTheme}
                onChange={(e) =>
                  setVisualTheme(e.target.value as 'chem_dark' | 'chalkboard' | 'lab_slate')
                }
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="chem_dark">{isTamilMode ? 'இருண்ட வேதியியல் பலகை' : 'Chem Lab Dark'}</option>
                <option value="chalkboard">{isTamilMode ? 'கரும்பலகை' : 'Chalkboard'}</option>
                <option value="lab_slate">{isTamilMode ? 'ஆய்வக நீலம்' : 'Lab Slate'}</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateLesson}
            disabled={isGenerating || !promptTopic.trim()}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{ui.generatingBtn}</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>{ui.generateBtn}</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isTamilMode ? '15 பாடங்கள் விரைவுத் தேர்வு:' : 'All 15 Chapters Quick Presets:'}
          </span>
          {TN_CHEMISTRY_SYLLABUS.map((ch) => (
            <button
              type="button"
              key={ch.id}
              onClick={() =>
                setPromptTopic(
                  isTamilMode
                    ? `12-ஆம் வகுப்பு வேதியியல் பாடம் ${ch.number}: ${ch.tamilTitle}`
                    : `TN Class 12 Chemistry Chapter ${ch.number}: ${ch.title}`
                )
              }
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-900/40 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-300 transition-colors cursor-pointer"
            >
              {isTamilMode ? `பாடம் ${ch.number}: ${ch.tamilTitle}` : `Ch ${ch.number}: ${ch.title}`}
            </button>
          ))}
        </div>

        {isGenerating && (
          <div className="mt-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 flex items-center gap-3 text-sm text-teal-700 dark:text-teal-300">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{safeText(generationStep)}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between gap-3 text-sm text-rose-700 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{safeText(errorMsg)}</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateLesson}
              className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 cursor-pointer"
            >
              {isTamilMode ? 'மீண்டும் முயற்சி' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative w-full h-[380px] sm:h-[440px]">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {lesson && lesson.slides[currentSlideIdx] && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-xl px-4 py-2.5 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-teal-400">
                <span>
                  {isTamilMode
                    ? `படி ${activeSegIdx + 1}/${Math.max(1, activeSegments.length)} (குரலுக்கு ஏற்ப மதிப்புகள் மாறுகின்றன)`
                    : `Step ${activeSegIdx + 1}/${Math.max(1, activeSegments.length)} (Values & Visuals Linked to Narration)`}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
                {activeSegments[activeSegIdx] || lesson.slides[currentSlideIdx].narration}
              </p>
            </div>
          )}
        </div>

        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 space-y-3">
          {lesson && (
            <div className="grid grid-cols-4 gap-2">
              {lesson.slides.map((s, idx) => {
                let fill = 0;
                if (idx < currentSlideIdx) fill = 100;
                else if (idx === currentSlideIdx) fill = slideProgress;

                return (
                  <button
                    type="button"
                    key={s.slideNumber}
                    onClick={() => handleSelectSlide(idx)}
                    className="group text-left focus:outline-none cursor-pointer"
                  >
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-teal-500 transition-all duration-100"
                        style={{ width: `${fill}%` }}
                      />
                    </div>
                    <p
                      className={`text-[11px] truncate ${
                        idx === currentSlideIdx
                          ? 'text-teal-400 font-semibold'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {isTamilMode ? `பகுதி ${idx + 1}: ${s.title}` : `Div ${idx + 1}: ${s.title}`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={togglePlayPause}
                disabled={!lesson}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
                title={isPlaying ? (isTamilMode ? 'இடைநிறுத்து' : 'Pause') : (isTamilMode ? 'இயக்கு' : 'Play')}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectSlide(Math.max(0, currentSlideIdx - 1))}
                disabled={!lesson || currentSlideIdx === 0}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors cursor-pointer"
                title={isTamilMode ? 'முந்தைய பகுதி' : 'Previous Division'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleSelectSlide(Math.min((lesson?.slides.length || 1) - 1, currentSlideIdx + 1))
                }
                disabled={!lesson || currentSlideIdx === (lesson?.slides.length || 1) - 1}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors cursor-pointer"
                title={isTamilMode ? 'அடுத்த பகுதி' : 'Next Division'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectSlide(0)}
                disabled={!lesson}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-colors cursor-pointer"
                title={isTamilMode ? 'மீண்டும் தொடங்கு' : 'Restart Lesson'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300">
                {isAudioLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin text-teal-400" />
                ) : (
                  <Mic className={`w-3 h-3 ${isMuted ? 'text-rose-400' : 'text-emerald-400'}`} />
                )}
                <span className="truncate max-w-[180px] sm:max-w-[260px]">
                  {isMuted ? (isTamilMode ? 'ஒலி நிறுத்தப்பட்டது' : 'Audio Muted') : audioStatusLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  unlockBrowserAudio();
                  const nextMute = !isMuted;
                  setIsMuted(nextMute);
                  if (nextMute) {
                    stopAllAudio();
                  } else if (lesson && isPlaying) {
                    playSlideAudio(currentSlideIdx, lesson.slides[currentSlideIdx]?.narration);
                  }
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute Bold Indian Male Voice' : 'Mute Voice'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {lesson && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{lesson.lessonTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isTamilMode ? 'படிப்படியான வேதியியல் குறிப்புகள் (4 பகுதிகள்)' : '4-Division Step-by-Step Chemistry Notes'}
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {lesson.topicSummary}
            </p>
            <div className="space-y-2 pt-2">
              {lesson.slides.map((s, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSlide(idx)}
                  className={`p-3 rounded-xl border text-sm cursor-pointer transition-all ${
                    idx === currentSlideIdx
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                    <span>
                      {isTamilMode ? `பகுதி ${idx + 1}. ${s.title}` : `Division ${idx + 1}. ${s.title}`}
                    </span>
                    <code className="text-xs px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-teal-700 dark:text-teal-300">
                      {s.equation}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {isTamilMode ? 'பாடப் புரிதல் வினா' : 'Lesson Mastery Check'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isTamilMode ? 'உங்கள் வேதியியல் அறிவை உடனடியாகச் சோதிக்கவும்' : 'Verify your chemistry concept immediately'}
                  </p>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {lesson.quickCheckQuestion.prompt}
              </p>

              <div className="space-y-2">
                {lesson.quickCheckQuestion.options.map((opt, idx) => {
                  const isSelected = quizChoice === idx;
                  const isCorrect = idx === lesson.quickCheckQuestion.correctIndex;
                  let btnStyle =
                    'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300';

                  if (quizChoice !== null) {
                    if (isCorrect) {
                      btnStyle =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-medium';
                    } else if (isSelected) {
                      btnStyle =
                        'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
                    }
                  }

                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setQuizChoice(idx)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {quizChoice !== null && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {quizChoice !== null && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {quizChoice !== null && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {ui.explanationLabel}:{' '}
                </span>
                {lesson.quickCheckQuestion.explanation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN AVICHI CHEM NOVA APPLICATION COMPONENT
// ============================================================================

function ChemNovaStudioContent() {
  const [language, setLanguage] = useState<LangCode>('en');
  const [activeTab, setActiveTab] = useState<'studio' | 'syllabus' | 'practice' | 'past'>('studio');
  const [selectedVolume, setSelectedVolume] = useState<VolumeFilter>('all');
  const [studioTopic, setStudioTopic] = useState<string | undefined>(undefined);
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({
    'tn12-chem-c1-t1': true
  });

  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('all');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [searchPast, setSearchPast] = useState('');

  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorAnswer, setTutorAnswer] = useState<string | null>(null);
  const [isTutorThinking, setIsTutorThinking] = useState(false);

  const isTamilMode = false;
  const ui = getUiStrings(language);
  const langConfig = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const launchLessonForTopic = (topicTitle: string) => {
    setStudioTopic(topicTitle);
    setActiveTab('studio');
  };

  const toggleTopicComplete = (id: string) => {
    setCompletedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredChapters =
    selectedVolume === 'all'
      ? TN_CHEMISTRY_SYLLABUS
      : TN_CHEMISTRY_SYLLABUS.filter((c) => c.volume === selectedVolume);
  const totalTopicsCount = TN_CHEMISTRY_SYLLABUS.reduce((acc, c) => acc + c.topics.length, 0);
  const completedCount = Object.values(completedTopics).filter(Boolean).length;
  const masteryPercentage = Math.round((completedCount / totalTopicsCount) * 100);

  const filteredPractice =
    selectedTopicFilter === 'all'
      ? PRACTICE_QUESTIONS
      : PRACTICE_QUESTIONS.filter((q) => q.topicId === selectedTopicFilter);

  const filteredPastQuestions = PAST_QUESTIONS.filter(
    (pq) =>
      pq.topic.toLowerCase().includes(searchPast.toLowerCase()) ||
      pq.tamilTopic.toLowerCase().includes(searchPast.toLowerCase()) ||
      pq.question.toLowerCase().includes(searchPast.toLowerCase()) ||
      pq.tamilQuestion.toLowerCase().includes(searchPast.toLowerCase()) ||
      pq.year.toString().includes(searchPast)
  );

  const handleAskTutor = async () => {
    if (!tutorQuestion.trim()) return;
    setIsTutorThinking(true);
    setTutorAnswer(null);
    try {
      const apiKey = getGeminiApiKey();
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: tutorQuestion }]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text: isTamilMode
                ? 'You are Avichi Chem Nova AI Tutor for Tamil Nadu State Board Class 12 (+2) Samacheer Kalvi Chemistry. Respond 100% in clear Tamil (தமிழ்) script with step-by-step solved numericals, equations, and explanations.'
                : `You are Avichi Chem Nova AI Tutor for Tamil Nadu State Board Class 12 (+2) Samacheer Kalvi Chemistry. Provide clear step-by-step solved numericals, mechanisms, and explanations in ${langConfig.name}.`
            }
          ]
        }
      };

      const res = await fetchWithTimeout(
        apiUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        },
        4200
      );
      const data = await res.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setTutorAnswer(
        reply ||
          (isTamilMode
            ? 'விடையை உருவாக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
            : 'Could not generate a response. Please rephrase your chemistry question.')
      );
    } catch {
      setTutorAnswer(
        isTamilMode
          ? 'இணைய இணைப்புச் சிக்கல். தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
          : 'Connection issue while reaching Gemini AI. Please try again.'
      );
    } finally {
      setIsTutorThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
                  Avichi Chem Nova
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800">
                  {ui.appSubtitle}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl overflow-x-auto">
            {[
              { id: 'studio', label: ui.tabStudio, icon: Video },
              { id: 'syllabus', label: ui.tabSyllabus, icon: Layers },
              { id: 'practice', label: ui.tabPractice, icon: Brain },
              { id: 'past', label: ui.tabPast, icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'studio' | 'syllabus' | 'practice' | 'past')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5">
              <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LangCode)}
                aria-label="Select Narration Language (Bold Indian Male Voice)"
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white dark:bg-slate-900">
                    ${l.name} (${l.nativeName})
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden xl:flex items-center gap-2.5">
              <div className="text-right">
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{ui.syllabusMastery}</p>
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  {completedCount}/{totalTopicsCount} ({masteryPercentage}%)
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center">
                <Award className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          
        </div>

        {activeTab === 'studio' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ui.studioHeader}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">{ui.studioSub}</p>
            </div>

            <AiChemStudio initialTopic={studioTopic} language={language} />
          </div>
        )}

        {activeTab === 'syllabus' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ui.syllabusHeader}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{ui.syllabusSub}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                {[
                  {
                    vol: 'all' as VolumeFilter,
                    title: ui.allClass12Label,
                    badge: isTamilMode ? `15 பாடங்கள் • ${totalTopicsCount} தலைப்புகள்` : `15 Chapters • ${totalTopicsCount} Topics`
                  },
                  {
                    vol: 'Volume 1' as VolumeFilter,
                    title: ui.volume1Label,
                    badge: isTamilMode ? 'பாடங்கள் 1–7' : 'Ch 1–7'
                  },
                  {
                    vol: 'Volume 2' as VolumeFilter,
                    title: ui.volume2Label,
                    badge: isTamilMode ? 'பாடங்கள் 8–15' : 'Ch 8–15'
                  }
                ].map((v) => {
                  const active = selectedVolume === v.vol;
                  return (
                    <button
                      type="button"
                      key={v.vol}
                      onClick={() => setSelectedVolume(v.vol)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        active
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{v.title}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${
                          active
                            ? 'bg-teal-500 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {v.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredChapters.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-start gap-3">
                      <span className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 font-bold text-sm flex items-center justify-center shrink-0">
                        {ch.number < 10 ? `0${ch.number}` : ch.number}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                            {isTamilMode
                              ? `பாடம் ${ch.number}: ${ch.tamilTitle}`
                              : `Chapter ${ch.number}: ${ch.title}`}
                          </h2>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800">
                            {isTamilMode
                              ? `${ch.tamilVolume} • ${ch.topics.length} தலைப்புகள்`
                              : `${ch.volume} • ${ch.topics.length} Topics`}
                          </span>
                        </div>
                        {!isTamilMode && (
                          <p className="text-xs font-medium text-teal-600 dark:text-teal-400 mt-0.5">
                            {ch.tamilTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        launchLessonForTopic(
                          isTamilMode
                            ? `12-ஆம் வகுப்பு வேதியியல் பாடம் ${ch.number}: ${ch.tamilTitle}`
                            : `TN Class 12 Chemistry (${ch.volume}) Chapter ${ch.number}: ${ch.title} (Complete Chapter & Step-by-Step Sums)`
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{ui.fullUnitVideo}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ch.topics.map((topic) => {
                      const isDone = !!completedTopics[topic.id];
                      const activeSubTopics = isTamilMode ? topic.tamilSubTopics : topic.subTopics;
                      return (
                        <div
                          key={topic.id}
                          className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                                    {isTamilMode ? `தலைப்பு ${topic.code}` : `Topic ${topic.code}`}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    {isTamilMode
                                      ? `${topic.tamilDifficulty} • ~${topic.estimatedMinutes} நிமிடம்`
                                      : `${topic.difficulty} • ~${topic.estimatedMinutes} min`}
                                  </span>
                                </div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                                  {isTamilMode ? topic.tamilTitle : topic.title}
                                </h3>
                                {!isTamilMode && (
                                  <p className="text-[11px] text-teal-600 dark:text-teal-400 mt-0.5">
                                    {topic.tamilTitle}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleTopicComplete(topic.id)}
                                className={`p-1.5 rounded-lg border transition-colors shrink-0 cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-teal-500'
                                }`}
                                title={isTamilMode ? 'முடிந்ததாகக் குறி' : 'Mark Topic Complete'}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                              {isTamilMode ? topic.tamilDescription : topic.description}
                            </p>

                            <div className="space-y-1.5">
                              {activeSubTopics.map((sub, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="flex items-center justify-between gap-2 text-[11px] text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/60"
                                >
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                                    <span>{sub}</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      launchLessonForTopic(
                                        isTamilMode
                                          ? `12-ஆம் வகுப்பு வேதியியல் பாடம் ${ch.number} (${ch.tamilTitle}) - ${sub}`
                                          : `TN Class 12 Chemistry Chapter ${ch.number} (${ch.title}) - ${sub}`
                                      )
                                    }
                                    className="px-2 py-0.5 rounded bg-teal-50 hover:bg-teal-600 dark:bg-teal-950/80 dark:hover:bg-teal-600 text-[10px] text-teal-600 hover:text-white dark:text-teal-300 dark:hover:text-white font-semibold transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                                  >
                                    <Play className="w-2.5 h-2.5" />
                                    <span>{ui.videoBtn}</span>
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {topic.keyFormulas.map((f, i) => (
                                <code
                                  key={i}
                                  className="text-[10px] px-2 py-0.5 rounded bg-teal-50/80 dark:bg-slate-800 border border-teal-200/60 dark:border-slate-700 text-teal-700 dark:text-teal-300"
                                >
                                  {f}
                                </code>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                              {isTamilMode ? topic.tamilSampleSumPrompt : topic.sampleSumPrompt}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                launchLessonForTopic(
                                  isTamilMode
                                    ? `12-ஆம் வகுப்பு வேதியியல் பாடம் ${ch.number}: ${topic.tamilTitle} — ${topic.tamilSampleSumPrompt}`
                                    : `TN Class 12 Chemistry Chapter ${ch.number}: ${topic.title} — ${topic.sampleSumPrompt}`
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span>{ui.watchLesson}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ui.practiceHeader}</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{ui.practiceSub}</p>
                </div>

                <select
                  value={selectedTopicFilter}
                  onChange={(e) => setSelectedTopicFilter(e.target.value)}
                  className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-200 max-w-xs"
                >
                  <option value="all">{ui.allTopicsFilter}</option>
                  {TN_CHEMISTRY_SYLLABUS.flatMap((c) =>
                    c.topics.map((t) => ({
                      id: t.id,
                      label: `${t.code}: ${isTamilMode ? t.tamilTitle : t.title}`
                    }))
                  ).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {filteredPractice.map((pq, index) => {
                  const chosen = userAnswers[pq.id];
                  const hasAnswered = chosen !== undefined;
                  const activeOptions = isTamilMode ? pq.tamilOptions : pq.options;

                  return (
                    <div
                      key={pq.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                          {ui.questionLabel} {index + 1}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {isTamilMode ? pq.tamilDifficulty : pq.difficulty}
                        </span>
                      </div>

                      <p className="text-base font-medium text-slate-900 dark:text-white">
                        {isTamilMode ? pq.tamilQuestion : pq.question}
                      </p>

                      <div className="grid grid-cols-1 gap-2.5">
                        {activeOptions.map((opt, optIdx) => {
                          const isThisSelected = chosen === optIdx;
                          const isThisCorrect = optIdx === pq.correctIndex;

                          let style =
                            'border-slate-200 dark:border-slate-800 hover:border-teal-400 text-slate-700 dark:text-slate-300';
                          if (hasAnswered) {
                            if (isThisCorrect) {
                              style =
                                'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-semibold';
                            } else if (isThisSelected) {
                              style =
                                'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200';
                            }
                          }

                          return (
                            <button
                              type="button"
                              key={optIdx}
                              onClick={() =>
                                setUserAnswers((prev) => ({ ...prev, [pq.id]: optIdx }))
                              }
                              className={`px-4 py-3 rounded-xl border text-left text-sm transition-all flex items-center justify-between cursor-pointer ${style}`}
                            >
                              <span>{opt}</span>
                              {hasAnswered && isThisCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                              {hasAnswered && isThisSelected && !isThisCorrect && (
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ui.explanationLabel}:{' '}
                          </span>
                          {isTamilMode ? pq.tamilExplanation : pq.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 sticky top-24">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-600 text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{ui.askTutorTitle}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isTamilMode ? 'தமிழில் படிப்படியான கணக்குத் தீர்வு' : 'Step-by-Step Class 12 Chemistry Solver'}
                    </p>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={tutorQuestion}
                  onChange={(e) => setTutorQuestion(e.target.value)}
                  placeholder={ui.askTutorPlaceholder}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <button
                  type="button"
                  onClick={handleAskTutor}
                  disabled={isTutorThinking || !tutorQuestion.trim()}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isTutorThinking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{ui.derivingBtn}</span>
                    </>
                  ) : (
                    <span>{ui.solveBtn}</span>
                  )}
                </button>

                {tutorAnswer && (
                  <div className="p-4 rounded-xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {tutorAnswer}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'past' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{ui.pastHeader}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{ui.pastSub}</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchPast}
                  onChange={(e) => setSearchPast(e.target.value)}
                  placeholder={ui.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredPastQuestions.map((item) => {
                const isOpen = !!expandedSolutions[item.id];
                const activeSteps = isTamilMode ? item.tamilSolutionSteps : item.solutionSteps;
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 text-xs font-bold">
                          {item.year}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {isTamilMode ? item.tamilPaper : item.paper}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {isTamilMode ? item.tamilTopic : item.topic}
                        </span>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800">
                        {isTamilMode ? `[${item.marks} மதிப்பெண்கள்]` : `[${item.marks} Marks]`}
                      </span>
                    </div>

                    <p className="text-base text-slate-900 dark:text-white leading-relaxed">
                      {isTamilMode ? item.tamilQuestion : item.question}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSolutions((prev) => ({
                            ...prev,
                            [item.id]: !prev[item.id]
                          }))
                        }
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                      >
                        {isOpen ? ui.hideSolution : ui.revealSolution}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          launchLessonForTopic(isTamilMode ? item.tamilTopic : item.topic)
                        }
                        className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-xs font-semibold text-teal-600 dark:text-teal-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{ui.generateWalkthrough}</span>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2.5">
                        {activeSteps.map((st, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                          >
                            {st}
                          </p>
                        ))}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                            {ui.finalAnswerLabel}:{' '}
                          </span>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {isTamilMode ? item.tamilFinalAnswer : item.finalAnswer}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <StudioErrorBoundary>
      <ChemNovaStudioContent />
    </StudioErrorBoundary>
  );
}
