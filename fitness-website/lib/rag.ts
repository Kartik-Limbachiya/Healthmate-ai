import dataset from '../datasets/gym_recommendation.json';

export interface UserTraits {
  age?: number;
  sex?: 'Male' | 'Female';
  weight?: number; // kg
  height?: number; // m
  level?: string; // 'Underweight', 'Normal', 'Overweight', 'Obese'
  goal?: string; // 'Weight Gain', 'Weight Loss', 'Weight Maintenance'
}

// Function to calculate BMI based on weight and height
export function calculateBMI(weight: number, height: number): number {
  if (height > 3) height = height / 100; // cm to m
  return weight / (height * height);
}

// Function to determine BMI level category
export function getBMILevel(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 24.9) return 'Normal Weight';
  if (bmi < 29.9) return 'Overweight';
  if (bmi < 29.9) return 'Overweight';
  return 'Obese';
}

const goalMapping: Record<string, string> = {
  'loseweight': 'Weight Loss',
  'buildmuscle': 'Weight Gain', 
  'improveendurance': 'Weight Maintenance',
  'maintainhealth': 'Weight Maintenance',
};

export function findRecommendations(traits: UserTraits) {
  let { age, sex, weight, height, level, goal } = traits;

  if (weight && height && !level) {
    const bmi = calculateBMI(weight, height);
    level = getBMILevel(bmi);
  }

  // Filter the dataset based on available traits
  const matches = (dataset as any[]).filter((row: any) => {
    let isMatch = true;

    if (sex && typeof row.Sex === 'string' && row.Sex.toLowerCase() !== sex.toLowerCase()) {
      isMatch = false;
    }
    if (level && typeof row.Level === 'string' && row.Level.toLowerCase().indexOf(level.toLowerCase()) === -1) {
      if (level.toLowerCase() === 'normal' && row.Level.toLowerCase() === 'normal weight') {
        // match
      } else {
        isMatch = false;
      }
    }
    
    if (goal) {
      // Normalize the incoming goal (which might be from the UI dropdown or from Gemini)
      let normalizedGoal = goal.toLowerCase().replace(/\\s/g, '');
      let mappedGoal = goalMapping[normalizedGoal] || goal;
      
      if (typeof row['Fitness Goal'] === 'string' && row['Fitness Goal'].toLowerCase().replace(/\\s/g, '') !== mappedGoal.toLowerCase().replace(/\\s/g, '')) {
         isMatch = false;
      }
    }

    return isMatch;
  });

  // If no match based on all constraints, relax some constraints
  if (matches.length === 0 && level) {
      // return matches based only on level and goal
      const relaxedMatches = (dataset as any[]).filter((row: any) => {
          let isMatch = true;
          if (level && typeof row.Level === 'string' && row.Level.toLowerCase().indexOf(level.toLowerCase()) === -1) {
              if (level.toLowerCase() === 'normal' && row.Level.toLowerCase() === 'normal weight') {
                  // match
              } else {
                  isMatch = false;
              }
          }
          if (goal) {
            let normalizedGoal = goal.toLowerCase().replace(/\\s/g, '');
            let mappedGoal = goalMapping[normalizedGoal] || goal;
            
            if (typeof row['Fitness Goal'] === 'string' && row['Fitness Goal'].toLowerCase().replace(/\\s/g, '') !== mappedGoal.toLowerCase().replace(/\\s/g, '')) {
               isMatch = false;
            }
          }
          return isMatch;
      });
      return relaxedMatches.slice(0, 3);
  }

  // Return top 3 matches to provide variety without overloading context
  return matches.slice(0, 3);
}
