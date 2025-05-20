export interface Milestone {
  type: 'interval' | 'birthday' | 'cosmic' | 'angel';
  cycles: number;
  name: string;
  description: string;
  prompt: string;
  theme: string;
}

// Cosmic numbers for special milestones
const COSMIC_NUMBERS = [
  { cycles: 1000, name: "First Thousand", description: "A thousand rotations around the sun" },
  { cycles: 5000, name: "Five Thousand", description: "Five thousand solar cycles" },
  { cycles: 10000, name: "Ten Thousand", description: "Ten thousand days of solar rotation" },
  { cycles: 25000, name: "Twenty-Five Thousand", description: "A quarter of a hundred thousand cycles" },
  { cycles: 50000, name: "Fifty Thousand", description: "Fifty thousand solar cycles" },
  { cycles: 100000, name: "Hundred Thousand", description: "A hundred thousand rotations" }
];

// Angel numbers for spiritual milestones
const ANGEL_NUMBERS = [
  { cycles: 1111, name: "Angel Number 1111", description: "A powerful manifestation number" },
  { cycles: 2222, name: "Angel Number 2222", description: "Balance and harmony" },
  { cycles: 3333, name: "Angel Number 3333", description: "Divine protection and guidance" },
  { cycles: 4444, name: "Angel Number 4444", description: "Angels are near" },
  { cycles: 5555, name: "Angel Number 5555", description: "Major life changes" },
  { cycles: 6666, name: "Angel Number 6666", description: "Material and spiritual balance" },
  { cycles: 7777, name: "Angel Number 7777", description: "Spiritual awakening" },
  { cycles: 8888, name: "Angel Number 8888", description: "Abundance and prosperity" },
  { cycles: 9999, name: "Angel Number 9999", description: "Completion and fulfillment" },
  // 5-digit angel numbers for most lifespans
  { cycles: 11111, name: "Angel Number 11111", description: "A new era of manifestation and alignment" },
  { cycles: 22222, name: "Angel Number 22222", description: "Profound harmony and life balance" },
  { cycles: 33333, name: "Angel Number 33333", description: "Deep spiritual guidance and protection" }
];

// Convert all milestone types to our unified Milestone interface
export const MILESTONES: Milestone[] = [
  // Interval milestones (every 1000 days)
  ...Array.from({ length: 100 }, (_, i) => ({
    type: 'interval' as const,
    cycles: (i + 1) * 1000,
    name: `${(i + 1) * 1000} Rotations`,
    description: `${(i + 1) * 1000} days of solar rotation`,
    prompt: `You've completed ${(i + 1) * 1000} rotations around the sun. What patterns have emerged in your journey?`,
    theme: "Patterns"
  })),
  // Cosmic milestones
  ...COSMIC_NUMBERS.map(m => ({
    type: 'cosmic' as const,
    cycles: m.cycles,
    name: m.name,
    description: m.description,
    prompt: `You've reached ${m.name}. How has this cosmic milestone influenced your journey?`,
    theme: "Cosmic Connection"
  })),
  // Angel number milestones
  ...ANGEL_NUMBERS.map(m => ({
    type: 'angel' as const,
    cycles: m.cycles,
    name: m.name,
    description: m.description,
    prompt: `You've reached ${m.name}. What spiritual insights have you gained?`,
    theme: "Spiritual Growth"
  }))
].sort((a, b) => a.cycles - b.cycles);

// Get the next milestone based on current cycles and birth date
export function getNextMilestone(currentCycles: number, birthDate: Date): Milestone | null {
  const today = new Date();
  const nextMilestones: Milestone[] = [];

  // 1. Check for next 1000-day interval
  const nextInterval = Math.ceil(currentCycles / 1000) * 1000;
  if (nextInterval > currentCycles) {
    nextMilestones.push({
      type: 'interval',
      cycles: nextInterval,
      name: `${nextInterval} Rotations`,
      description: `${nextInterval} days of solar rotation`,
      prompt: `You're approaching ${nextInterval} rotations. What patterns are emerging?`,
      theme: "Patterns"
    });
  }

  // 2. Check for next birthday (solar return)
  const nextBirthday = new Date(birthDate);
  nextBirthday.setFullYear(today.getFullYear());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const daysToBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const cyclesAtBirthday = currentCycles + daysToBirthday;
  nextMilestones.push({
    type: 'birthday',
    cycles: cyclesAtBirthday,
    name: "Solar Return",
    description: "Your next birthday - a complete solar cycle",
    prompt: "Your next solar return approaches. How have you grown since your last birthday?",
    theme: "Growth"
  });

  // 3. Check for next cosmic number
  const nextCosmic = COSMIC_NUMBERS.find(m => m.cycles > currentCycles);
  if (nextCosmic) {
    nextMilestones.push({
      type: 'cosmic',
      cycles: nextCosmic.cycles,
      name: nextCosmic.name,
      description: nextCosmic.description,
      prompt: `You're approaching ${nextCosmic.name}. How will this cosmic milestone influence your journey?`,
      theme: "Cosmic Connection"
    });
  }

  // 4. Check for next angel number
  const nextAngel = ANGEL_NUMBERS.find(m => m.cycles > currentCycles);
  if (nextAngel) {
    nextMilestones.push({
      type: 'angel',
      cycles: nextAngel.cycles,
      name: nextAngel.name,
      description: nextAngel.description,
      prompt: `You're approaching ${nextAngel.name}. What spiritual insights are you seeking?`,
      theme: "Spiritual Growth"
    });
  }

  // Return the next milestone (closest in time)
  return nextMilestones.sort((a, b) => a.cycles - b.cycles)[0] || null;
}

export function getCurrentMilestone(currentCycles: number): Milestone | null {
  return MILESTONES.find(m => m.cycles === currentCycles) || null;
}

export function getProgressToNextMilestone(currentCycles: number, nextMilestone: Milestone | null): number {
  if (!nextMilestone) return 100;
  
  // For birthdays and astronomical events, we need to calculate progress differently
  if (nextMilestone.type === 'birthday') {
    const total = nextMilestone.cycles - currentCycles;
    return Math.min(100, Math.max(0, (1 - (total / 365)) * 100));
  }
  
  // For interval, cosmic, and angel milestones, calculate progress based on the previous milestone
  const prevMilestone = getPreviousMilestone(currentCycles);
  const prevCycles = prevMilestone ? prevMilestone.cycles : 0;
  const total = nextMilestone.cycles - prevCycles;
  const current = currentCycles - prevCycles;
  
  return Math.min(100, Math.max(0, (current / total) * 100));
}

function getPreviousMilestone(currentCycles: number): Milestone | null {
  return MILESTONES.filter(m => m.cycles < currentCycles).pop() || null;
}

export function getMilestoneDescription(milestone: Milestone): string {
  switch (milestone.type) {
    case 'interval':
      return `Reach ${milestone.cycles} rotations around the sun`;
    case 'birthday':
      return "Celebrate your next solar return";
    case 'cosmic':
      return milestone.description;
    case 'angel':
      return milestone.description;
    default:
      return milestone.description;
  }
} 