function calculateBMR(sex, weight, height, birthday) {
  let BMR;
  let age = calculateAge(birthday);
  if (sex === "female") {
    BMR = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  } else {
    BMR = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  }
  return BMR;
}

function calculateAge(birthday) {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function calculateCalorieNeeds(sex, birthday, weight, height, activity, goal) {
  let BMR = calculateBMR(sex, weight, height, birthday);
  let calorieNeeds;
  switch (activity) {
    case "sedentary":
      calorieNeeds = Math.round(BMR * 1.2);
      break;
    case "lightly-active":
      calorieNeeds = Math.round(BMR * 1.375);
      break;
    case "moderately-active":
      calorieNeeds = Math.round(BMR * 1.55);
      break;
    case "very-active":
      calorieNeeds = Math.round(BMR * 1.725);
      break;
    case "super-active":
      calorieNeeds = Math.round(BMR * 1.9);
      break;
    default:
      calorieNeeds = 0;
  }
  if (goal === "lose-weight") {
    calorieNeeds -= 300;
  } else if (goal === "gain-muscle") {
    calorieNeeds += 200;
  }
  return calorieNeeds;
}

function calculateMacronutrients(weight, calorieNeeds, goal) {
  let carbPercentage, proteinPercentage, fatPercentage;
  if (goal === "weight loss") {
    carbPercentage = 0.5;
    proteinPercentage = 0.3;
    fatPercentage = 0.2;
  } else if (goal === "muscle gain") {
    carbPercentage = 0.4;
    proteinPercentage = 0.35;
    fatPercentage = 0.25;
  } else {
    carbPercentage = 0.5;
    proteinPercentage = 0.2;
    fatPercentage = 0.3;
  }

  const protein = Math.round((calorieNeeds * proteinPercentage) / 4);
  const fat = Math.round((calorieNeeds * fatPercentage) / 9);
  const carbs = Math.round((calorieNeeds * carbPercentage) / 4);

  return { protein, fat, carbs };
}

module.exports = {
  calculateBMR,
  calculateCalorieNeeds,
  calculateMacronutrients,
};
