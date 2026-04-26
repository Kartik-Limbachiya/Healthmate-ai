/**
 * RAG (Retrieval-Augmented Generation) module for fitness recommendations.
 * Uses the compressed indexed dataset (~36KB) instead of the raw 25MB file.
 */

// Use the compressed/indexed dataset (99.9% smaller)
import dataset from '../datasets/gym_recommendation_indexed.json';

export interface UserTraits {
  age?: number;
  sex?: 'Male' | 'Female';
  weight?: number; // kg
  height?: number; // m
  level?: string; // 'Underweight', 'Normal', 'Overweight', 'Obese'
  goal?: string; // 'Weight Gain', 'Weight Loss', 'Weight Maintenance'
}

export function calculateBMI(weight: number, height: number): number {
  if (height > 3) height = height / 100; // cm to m
  return weight / (height * height);
}

export function getBMILevel(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 24.9) return 'Normal Weight';
  if (bmi < 29.9) return 'Overweight';
  return 'Obese';
}

const goalMapping: Record<string, string> = {
  'loseweight': 'Weight Loss',
  'buildmuscle': 'Weight Gain',
  'improveendurance': 'Weight Maintenance',
  'maintainhealth': 'Weight Maintenance',
  'musclegain': 'Weight Gain',
  'weightloss': 'Weight Loss',
  'weightgain': 'Weight Gain',
  'weightmaintenance': 'Weight Maintenance',
};

/**
 * Find matching recommendations from the indexed dataset.
 * The indexed format has pre-grouped entries by (sex, level, goal).
 */
export function findRecommendations(traits: UserTraits) {
  let { sex, weight, height, level, goal } = traits;

  // Calculate BMI level if weight/height provided but level is not
  if (weight && height && !level) {
    const bmi = calculateBMI(weight, height);
    level = getBMILevel(bmi);
  }

  // Normalize goal
  let normalizedGoal = goal;
  if (goal) {
    const goalKey = goal.toLowerCase().replace(/\s/g, '');
    normalizedGoal = goalMapping[goalKey] || goal;
  }

  // Filter the indexed dataset
  const matches = (dataset as any[]).filter((row: any) => {
    let isMatch = true;

    // Match sex
    if (sex && row.sex && row.sex.toLowerCase() !== sex.toLowerCase()) {
      isMatch = false;
    }

    // Match level
    if (level && row.level) {
      const rowLevel = row.level.toLowerCase();
      const targetLevel = level.toLowerCase();
      if (!rowLevel.includes(targetLevel) && !(targetLevel === 'normal' && rowLevel === 'normal weight')) {
        isMatch = false;
      }
    }

    // Match goal
    if (normalizedGoal && row.goal) {
      const rowGoal = row.goal.toLowerCase().replace(/\s/g, '');
      const targetGoal = normalizedGoal.toLowerCase().replace(/\s/g, '');
      if (rowGoal !== targetGoal) {
        isMatch = false;
      }
    }

    return isMatch;
  });

  // If no exact match, relax by removing sex constraint
  if (matches.length === 0 && level) {
    const relaxedMatches = (dataset as any[]).filter((row: any) => {
      let isMatch = true;
      if (level && row.level) {
        const rowLevel = row.level.toLowerCase();
        const targetLevel = level.toLowerCase();
        if (!rowLevel.includes(targetLevel) && !(targetLevel === 'normal' && rowLevel === 'normal weight')) {
          isMatch = false;
        }
      }
      if (normalizedGoal && row.goal) {
        const rowGoal = row.goal.toLowerCase().replace(/\s/g, '');
        const targetGoal = normalizedGoal.toLowerCase().replace(/\s/g, '');
        if (rowGoal !== targetGoal) {
          isMatch = false;
        }
      }
      return isMatch;
    });
    return relaxedMatches.slice(0, 3);
  }

  return matches.slice(0, 3);
}
