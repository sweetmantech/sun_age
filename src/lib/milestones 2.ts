export interface Milestone {
  type: 'interval' | 'birthday' | 'cosmic' | 'astronomical' | 'angel';
  cycles: number;
  name: string;
  description: string;
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
      description: `${nextInterval} days of solar rotation`
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
    description: "Your next birthday - a complete solar cycle"
  });

  // 3. Check for next cosmic number
  const nextCosmic = COSMIC_NUMBERS.find(m => m.cycles > currentCycles);
  if (nextCosmic) {
    nextMilestones.push({
      type: 'cosmic',
      cycles: nextCosmic.cycles,
      name: nextCosmic.name,
      description: nextCosmic.description
    });
  }

  // 4. Check for next angel number
  const nextAngel = ANGEL_NUMBERS.find(m => m.cycles > currentCycles);
  if (nextAngel) {
    nextMilestones.push({
      type: 'angel',
      cycles: nextAngel.cycles,
      name: nextAngel.name,
      description: nextAngel.description
    });
  }

  // Only consider rotation-based milestones for the main milestone
  return nextMilestones.sort((a, b) => a.cycles - b.cycles)[0] || null;
}

// Helper function to get the next solstice (for notifications or separate display)
function getNextSolstice(fromDate: Date): Date {
  const year = fromDate.getFullYear();
  // Approximate solstice dates (June 21 and December 21)
  const summerSolstice = new Date(year, 5, 21); // June 21
  const winterSolstice = new Date(year, 11, 21); // December 21
  if (fromDate < summerSolstice) {
    return summerSolstice;
  } else if (fromDate < winterSolstice) {
    return winterSolstice;
  } else {
    return new Date(year + 1, 5, 21); // Next year's summer solstice
  }
}

export function getProgressToNextMilestone(currentCycles: number, nextMilestone: Milestone | null): number {
  if (!nextMilestone) return 100;
  
  // For birthdays and astronomical events, we need to calculate progress differently
  if (nextMilestone.type === 'birthday' || nextMilestone.type === 'astronomical') {
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
  // Find the last milestone (could be interval, cosmic, or angel number)
  const prevInterval = Math.floor(currentCycles / 1000) * 1000;
  const prevAngel = ANGEL_NUMBERS.filter(m => m.cycles < currentCycles).pop();
  const prevCosmic = COSMIC_NUMBERS.filter(m => m.cycles < currentCycles).pop();
  
  // Return the highest previous milestone
  const milestones = [
    prevInterval > 0 ? {
      type: 'interval' as const,
      cycles: prevInterval,
      name: `${prevInterval} Rotations`,
      description: `${prevInterval} days of solar rotation`
    } : null,
    prevAngel ? {
      type: 'angel' as const,
      cycles: prevAngel.cycles,
      name: prevAngel.name,
      description: prevAngel.description
    } : null,
    prevCosmic ? {
      type: 'cosmic' as const,
      cycles: prevCosmic.cycles,
      name: prevCosmic.name,
      description: prevCosmic.description
    } : null
  ].filter(Boolean);
  
  return milestones.length > 0 ? milestones.reduce((a, b) => a!.cycles > b!.cycles ? a : b) : null;
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
    case 'astronomical':
      return "Align with the next solstice";
    default:
      return milestone.description;
  }
} 