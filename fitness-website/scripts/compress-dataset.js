/**
 * Dataset Compression Script
 * Converts the 25MB gym_recommendation.json into a compact indexed lookup (~50-500KB).
 * 
 * Run: node scripts/compress-dataset.js
 */

const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "..", "datasets", "gym_recommendation.json");
const OUTPUT = path.join(__dirname, "..", "datasets", "gym_recommendation_indexed.json");

console.log("📂 Loading dataset...");
const raw = JSON.parse(fs.readFileSync(INPUT, "utf-8"));
console.log(`  → ${raw.length} rows loaded (${(fs.statSync(INPUT).size / 1024 / 1024).toFixed(1)} MB)`);

// Group by (Sex, Level, Fitness Goal) and deduplicate recommendations
const index = {};

for (const row of raw) {
  const sex = (row.Sex || "Unknown").trim();
  const level = (row.Level || "Unknown").trim();
  const goal = (row["Fitness Goal"] || "Unknown").trim();
  const key = `${sex}|${level}|${goal}`;

  if (!index[key]) {
    index[key] = {
      sex,
      level,
      goal,
      exercises: new Set(),
      equipment: new Set(),
      diets: new Set(),
      recommendations: new Set(),
    };
  }

  const entry = index[key];

  // Collect unique values
  if (row.Exercises) {
    row.Exercises.split(",").forEach((e) => {
      const trimmed = e.trim();
      if (trimmed) entry.exercises.add(trimmed);
    });
  }
  if (row.Equipment) {
    row.Equipment.split(",").forEach((e) => {
      const trimmed = e.trim();
      if (trimmed) entry.equipment.add(trimmed);
    });
  }
  if (row.Diet) {
    const trimmed = row.Diet.trim();
    if (trimmed) entry.diets.add(trimmed);
  }
  if (row.Recommendation) {
    const trimmed = row.Recommendation.trim();
    if (trimmed) entry.recommendations.add(trimmed);
  }
}

// Convert Sets to Arrays and format output
const output = Object.values(index).map((entry) => ({
  sex: entry.sex,
  level: entry.level,
  goal: entry.goal,
  exercises: [...entry.exercises].slice(0, 15).join(", "), // Cap at 15 unique exercises
  equipment: [...entry.equipment].slice(0, 10).join(", "),
  diet: [...entry.diets].slice(0, 5).join("; "),
  recommendation: [...entry.recommendations].slice(0, 3).join(" | "),
}));

console.log(`  → Compressed to ${output.length} unique groups`);

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), "utf-8");

const outputSize = fs.statSync(OUTPUT).size;
const inputSize = fs.statSync(INPUT).size;
const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

console.log(`  → Output: ${(outputSize / 1024).toFixed(1)} KB (${reduction}% reduction)`);
console.log(`✅ Saved to: ${OUTPUT}`);
