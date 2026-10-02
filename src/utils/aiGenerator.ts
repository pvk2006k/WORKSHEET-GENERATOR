import { WorksheetData, Question } from '../types';

const questionTemplates: Record<string, { questions: string[], answers: string[], explanations: string[] }[]> = {
  'math': [
    {
      questions: ['What is 15 + 27?', 'Solve: 48 - 19 = ?', 'What is 6 × 7?', 'Divide 56 by 8', 'What is 100 - 37?'],
      answers: ['42', '29', '42', '7', '63'],
      explanations: ['15 + 27 = 42. We add the ones (5+7=12), carry over 1, then add tens (1+2+1=4).', '48 - 19 = 29. We borrow from tens place: 18-9=9, 3-1=2.', '6 × 7 = 42. This is a multiplication fact that can be memorized using times tables.', '56 ÷ 8 = 7. We find how many times 8 fits into 56.', '100 - 37 = 63. We borrow: 10-7=3, 9-3=6.']
    }
  ],
  'science': [
    {
      questions: ['What is the process by which plants make food?', 'Which planet is known as the Red Planet?', 'What gas do humans breathe in?', 'What is the boiling point of water?', 'What is the largest organ in the human body?'],
      answers: ['Photosynthesis', 'Mars', 'Oxygen', '100°C', 'Skin'],
      explanations: ['Photosynthesis is the process where plants use sunlight, water, and CO2 to produce glucose and oxygen.', 'Mars appears red due to iron oxide (rust) on its surface.', 'Humans breathe in oxygen (O2) and breathe out carbon dioxide (CO2).', 'Water boils at 100°C (212°F) at standard atmospheric pressure.', 'The skin is the largest organ, covering about 20 square feet in adults.']
    }
  ],
  'english': [
    {
      questions: ['What is the plural of "child"?', 'Identify the verb: "The cat runs quickly."', 'What is the past tense of "go"?', 'Choose the correct spelling: recieve/recieve/receive', 'What type of word is "beautifully"?'],
      answers: ['Children', 'Runs', 'Went', 'Receive', 'Adverb'],
      explanations: ['The plural of "child" is "children" - an irregular plural form.', '"Runs" is the verb as it shows the action performed by the cat.', '"Go" changes to "went" in past tense - it\'s an irregular verb.', 'The correct spelling is "receive" - remember "i before e except after c".', '"Beautifully" is an adverb because it modifies a verb, adjective, or another adverb.']
    }
  ],
  'default': [
    {
      questions: [],
      answers: [],
      explanations: []
    }
  ]
};

function generateMathQuestions(topic: string, count: number): Question[] {
  const questions: Question[] = [];
  const topicLower = topic.toLowerCase();
  
  if (topicLower.includes('addition') || topicLower.includes('add')) {
    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * 50) + 10;
      const b = Math.floor(Math.random() * 50) + 10;
      questions.push({
        id: i + 1,
        type: 'fill-in-blank',
        question: `Solve: ${a} + ${b} = ?`,
        correctAnswer: `${a + b}`,
        explanation: `${a} + ${b} = ${a + b}. We add the ones place first, then the tens place.`,
        points: 2
      });
    }
  } else if (topicLower.includes('multiplication') || topicLower.includes('multiply') || topicLower.includes('times table')) {
    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * 12) + 2;
      const b = Math.floor(Math.random() * 12) + 2;
      questions.push({
        id: i + 1,
        type: 'fill-in-blank',
        question: `What is ${a} × ${b}?`,
        correctAnswer: `${a * b}`,
        explanation: `${a} × ${b} = ${a * b}. This can be solved using the multiplication table.`,
        points: 2
      });
    }
  } else if (topicLower.includes('subtraction') || topicLower.includes('subtract')) {
    for (let i = 0; i < count; i++) {
      const a = Math.floor(Math.random() * 50) + 30;
      const b = Math.floor(Math.random() * 20) + 5;
      questions.push({
        id: i + 1,
        type: 'fill-in-blank',
        question: `Solve: ${a} - ${b} = ?`,
        correctAnswer: `${a - b}`,
        explanation: `${a} - ${b} = ${a - b}. We subtract the ones place first, then the tens place.`,
        points: 2
      });
    }
  } else if (topicLower.includes('division') || topicLower.includes('divide')) {
    for (let i = 0; i < count; i++) {
      const b = Math.floor(Math.random() * 10) + 2;
      const result = Math.floor(Math.random() * 12) + 2;
      const a = b * result;
      questions.push({
        id: i + 1,
        type: 'fill-in-blank',
        question: `Divide: ${a} ÷ ${b} = ?`,
        correctAnswer: `${result}`,
        explanation: `${a} ÷ ${b} = ${result}. We find how many times ${b} fits into ${a} evenly.`,
        points: 2
      });
    }
  } else if (topicLower.includes('fraction')) {
    const fractions = [
      { q: 'What is 1/2 + 1/2?', a: '1', e: '1/2 + 1/2 = 2/2 = 1. When denominators are same, add numerators.' },
      { q: 'Simplify: 4/8', a: '1/2', e: '4/8 = 1/2. Divide both numerator and denominator by their GCD (4).' },
      { q: 'What is 1/3 + 1/3?', a: '2/3', e: '1/3 + 1/3 = 2/3. Same denominators, so add numerators: 1+1=2.' },
      { q: 'Which is larger: 1/2 or 1/4?', a: '1/2', e: '1/2 is larger. When numerators are same, smaller denominator means larger fraction.' },
      { q: 'Convert 3/4 to decimal', a: '0.75', e: '3/4 = 0.75. Divide numerator by denominator: 3÷4 = 0.75.' },
    ];
    for (let i = 0; i < Math.min(count, fractions.length); i++) {
      questions.push({
        id: i + 1,
        type: 'fill-in-blank',
        question: fractions[i].q,
        correctAnswer: fractions[i].a,
        explanation: fractions[i].e,
        points: 2
      });
    }
  } else {
    // General math
    const generalQuestions = [
      { q: 'What is 15 × 12?', a: '180', e: '15 × 12 = 180. Break it down: 15×10=150, 15×2=30, 150+30=180.' },
      { q: 'Find the area of a rectangle with length 8cm and width 5cm', a: '40 cm²', e: 'Area = length × width = 8 × 5 = 40 cm²' },
      { q: 'What is 144 ÷ 12?', a: '12', e: '144 ÷ 12 = 12. This is a perfect square: 12² = 144.' },
      { q: 'If a triangle has angles 60° and 80°, what is the third angle?', a: '40°', e: 'Sum of angles in a triangle = 180°. Third angle = 180° - 60° - 80° = 40°.' },
      { q: 'What is the perimeter of a square with side 7cm?', a: '28 cm', e: 'Perimeter = 4 × side = 4 × 7 = 28 cm' },
      { q: 'Convert 2.5 kg to grams', a: '2500 g', e: '1 kg = 1000 g, so 2.5 kg = 2.5 × 1000 = 2500 g' },
      { q: 'What is 25% of 200?', a: '50', e: '25% of 200 = (25/100) × 200 = 50' },
      { q: 'Find the next number: 2, 4, 8, 16, ?', a: '32', e: 'Each number doubles: 2×2=4, 4×2=8, 8×2=16, 16×2=32' },
      { q: 'What is the LCM of 4 and 6?', a: '12', e: 'Multiples of 4: 4,8,12,16... Multiples of 6: 6,12,18... LCM = 12' },
      { q: 'Solve: 3x + 5 = 20', a: 'x = 5', e: '3x + 5 = 20 → 3x = 15 → x = 5' },
    ];
    for (let i = 0; i < Math.min(count, generalQuestions.length); i++) {
      questions.push({
        id: i + 1,
        type: i % 3 === 0 ? 'multiple-choice' : 'fill-in-blank',
        question: generalQuestions[i].q,
        options: i % 3 === 0 ? [generalQuestions[i].a, '45', '60', '35'] : undefined,
        correctAnswer: generalQuestions[i].a,
        explanation: generalQuestions[i].e,
        points: 2
      });
    }
  }
  return questions;
}

function generateScienceQuestions(topic: string, count: number): Question[] {
  const questions: Question[] = [];
  const topicLower = topic.toLowerCase();
  
  const scienceBank: Record<string, { q: string, a: string, e: string }[]> = {
    'plants': [
      { q: 'What is the process by which plants make their food?', a: 'Photosynthesis', e: 'Photosynthesis uses sunlight, water, and CO₂ to produce glucose and oxygen.' },
      { q: 'Which part of the plant absorbs water from soil?', a: 'Roots', e: 'Roots absorb water and minerals from the soil through root hairs.' },
      { q: 'What green pigment is found in leaves?', a: 'Chlorophyll', e: 'Chlorophyll gives leaves their green color and is essential for photosynthesis.' },
      { q: 'What is the male reproductive part of a flower?', a: 'Stamen', e: 'The stamen consists of anther (produces pollen) and filament.' },
      { q: 'Through which process do plants lose water?', a: 'Transpiration', e: 'Transpiration is the loss of water vapor through stomata in leaves.' },
    ],
    'animals': [
      { q: 'What is the largest mammal in the world?', a: 'Blue Whale', e: 'The Blue Whale can grow up to 100 feet long and weigh up to 200 tons.' },
      { q: 'How many legs does an insect have?', a: '6', e: 'All insects have exactly 6 legs (3 pairs).' },
      { q: 'What do herbivores eat?', a: 'Plants', e: 'Herbivores are animals that eat only plants and plant products.' },
      { q: 'Which animal is known as the King of the Jungle?', a: 'Lion', e: 'The lion is called the King of the Jungle due to its strength and majestic appearance.' },
      { q: 'What is a baby frog called?', a: 'Tadpole', e: 'A tadpole is the larval stage of a frog, living in water with a tail.' },
    ],
    'body': [
      { q: 'How many bones are in the adult human body?', a: '206', e: 'An adult human body has 206 bones. Babies are born with about 270 bones.' },
      { q: 'Which organ pumps blood throughout the body?', a: 'Heart', e: 'The heart pumps about 5 liters of blood per minute through the circulatory system.' },
      { q: 'What is the largest organ of the human body?', a: 'Skin', e: 'The skin covers about 20 square feet and weighs about 8 pounds in adults.' },
      { q: 'Which blood cells fight infections?', a: 'White blood cells', e: 'White blood cells (leukocytes) are part of the immune system that fight infections.' },
      { q: 'What carries oxygen in blood?', a: 'Red blood cells (Hemoglobin)', e: 'Hemoglobin in red blood cells binds to oxygen and carries it throughout the body.' },
    ],
    'default': [
      { q: 'What is the chemical formula for water?', a: 'H₂O', e: 'Water consists of 2 hydrogen atoms and 1 oxygen atom.' },
      { q: 'What force pulls objects toward Earth?', a: 'Gravity', e: 'Gravity is the force of attraction between objects with mass.' },
      { q: 'What is the boiling point of water at sea level?', a: '100°C', e: 'Water boils at 100°C (212°F) at standard atmospheric pressure.' },
      { q: 'Which planet is closest to the Sun?', a: 'Mercury', e: 'Mercury is the closest planet to the Sun, orbiting at about 58 million km.' },
      { q: 'What type of energy does the Sun provide?', a: 'Solar/Light energy', e: 'The Sun provides light and heat (thermal) energy through nuclear fusion.' },
      { q: 'What is the hardest natural substance?', a: 'Diamond', e: 'Diamond is the hardest natural substance, rating 10 on the Mohs scale.' },
      { q: 'What gas do plants absorb from the atmosphere?', a: 'Carbon dioxide (CO₂)', e: 'Plants absorb CO₂ for photosynthesis and release oxygen.' },
      { q: 'How many planets are in our solar system?', a: '8', e: 'There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.' },
      { q: 'What is the unit of electric current?', a: 'Ampere', e: 'The Ampere (A) is the SI unit of electric current.' },
      { q: 'What state of matter has a definite volume but no definite shape?', a: 'Liquid', e: 'Liquids take the shape of their container but maintain a constant volume.' },
    ]
  };

  let bank = scienceBank['default'];
  for (const key of Object.keys(scienceBank)) {
    if (topicLower.includes(key)) {
      bank = scienceBank[key];
      break;
    }
  }

  for (let i = 0; i < Math.min(count, bank.length); i++) {
    questions.push({
      id: i + 1,
      type: i % 4 === 0 ? 'multiple-choice' : 'fill-in-blank',
      question: bank[i].q,
      options: i % 4 === 0 ? [bank[i].a, 'Nitrogen', 'Carbon', 'Helium'] : undefined,
      correctAnswer: bank[i].a,
      explanation: bank[i].e,
      points: 2
    });
  }
  return questions;
}

function generateEnglishQuestions(topic: string, count: number): Question[] {
  const questions: Question[] = [];
  const topicLower = topic.toLowerCase();
  
  const englishBank: Record<string, { q: string, a: string, e: string, type?: string }[]> = {
    'grammar': [
      { q: 'Identify the noun: "The dog chased the ball."', a: 'Dog, ball', e: 'Nouns are naming words. "Dog" and "ball" are both nouns in this sentence.' },
      { q: 'What is the plural of "mouse"?', a: 'Mice', e: '"Mouse" has an irregular plural form: "mice" (not "mouses").' },
      { q: 'Choose the correct verb: "She ___ to school every day."', a: 'walks', e: 'With third person singular (she), we add -s to the verb in simple present tense.' },
      { q: 'What is the past tense of "swim"?', a: 'Swam', e: '"Swim" is an irregular verb: swim → swam → swum.' },
      { q: 'Identify the adjective: "The tall building is old."', a: 'Tall, old', e: 'Adjectives describe nouns. "Tall" describes building, "old" also describes building.' },
    ],
    'vocabulary': [
      { q: 'What is the synonym of "happy"?', a: 'Joyful', e: 'Synonyms are words with similar meanings. Happy = joyful, glad, cheerful.' },
      { q: 'What is the antonym of "brave"?', a: 'Cowardly', e: 'Antonyms are words with opposite meanings. Brave is the opposite of cowardly.' },
      { q: 'Fill in: "She is ___ intelligent girl in the class."', a: 'the most', e: 'We use "the most" before adjectives to form the superlative degree.' },
      { q: 'What does the word "enormous" mean?', a: 'Very large', e: 'Enormous means extremely large or huge in size.' },
      { q: 'Choose the correct homophone: "I ___ the answer."', a: 'know', e: '"Know" (to be aware) vs "no" (negative). Here we need "know".' },
    ],
    'default': [
      { q: 'What is the plural of "child"?', a: 'Children', e: '"Child" has an irregular plural: "children" (not "childs").' },
      { q: 'Identify the verb: "The birds fly south."', a: 'Fly', e: '"Fly" is the action word (verb) in this sentence.' },
      { q: 'What punctuation ends a question?', a: 'Question mark (?)', e: 'A question mark (?) is used at the end of interrogative sentences.' },
      { q: 'Choose correct: "He don\'t/don\'t/doesn\'t like pizza."', a: "doesn't", e: 'With third person singular (he/she/it), we use "doesn\'t" in negative sentences.' },
      { q: 'What is the opposite of "ancient"?', a: 'Modern', e: 'Ancient means very old, so its opposite is modern (new/current).' },
      { q: 'Which is a compound sentence?', a: 'I like tea, and she likes coffee.', e: 'A compound sentence joins two independent clauses with a conjunction (and, but, or).' },
      { q: 'What is the past participle of "write"?', a: 'Written', e: 'Write → wrote (past) → written (past participle).' },
      { q: 'Identify the adverb: "She sings beautifully."', a: 'Beautifully', e: '"Beautifully" modifies the verb "sings", telling us how she sings.' },
      { q: 'What type of word is "quickly"?', a: 'Adverb', e: '"Quickly" is an adverb as it describes how an action is performed.' },
      { q: 'Choose the correct article: "___ honest man is respected."', a: 'An', e: 'We use "an" before words starting with a vowel sound. "Honest" starts with a vowel sound.' },
    ]
  };

  let bank = englishBank['default'];
  for (const key of Object.keys(englishBank)) {
    if (topicLower.includes(key)) {
      bank = englishBank[key];
      break;
    }
  }

  for (let i = 0; i < Math.min(count, bank.length); i++) {
    questions.push({
      id: i + 1,
      type: bank[i].type === 'mcq' ? 'multiple-choice' : 'fill-in-blank',
      question: bank[i].q,
      correctAnswer: bank[i].a,
      explanation: bank[i].e,
      points: 2
    });
  }
  return questions;
}

function generateGKQuestions(topic: string, count: number): Question[] {
  const questions: Question[] = [];
  const gkBank = [
    { q: 'What is the capital of India?', a: 'New Delhi', e: 'New Delhi is the capital city of India.' },
    { q: 'Who wrote the national anthem of India?', a: 'Rabindranath Tagore', e: 'Rabindranath Tagore wrote "Jana Gana Mana", India\'s national anthem.' },
    { q: 'Which is the largest continent?', a: 'Asia', e: 'Asia is the largest continent by both area and population.' },
    { q: 'What is the currency of Japan?', a: 'Yen', e: 'The Japanese Yen (¥) is the official currency of Japan.' },
    { q: 'Who is known as the Father of the Nation in India?', a: 'Mahatma Gandhi', e: 'Mahatma Gandhi is called the Father of the Nation for his role in India\'s independence.' },
    { q: 'Which river is the longest in India?', a: 'Ganga', e: 'The Ganga (Ganges) is the longest river in India, flowing 2,525 km.' },
    { q: 'How many states are there in India?', a: '28', e: 'India has 28 states and 8 Union Territories.' },
    { q: 'What is the national animal of India?', a: 'Bengal Tiger', e: 'The Bengal Tiger was declared the national animal of India in 1973.' },
    { q: 'Which is the smallest planet in our solar system?', a: 'Mercury', e: 'Mercury is the smallest planet in our solar system.' },
    { q: 'What is the national flower of India?', a: 'Lotus', e: 'The Lotus is the national flower of India, symbolizing purity and enlightenment.' },
  ];

  for (let i = 0; i < Math.min(count, gkBank.length); i++) {
    questions.push({
      id: i + 1,
      type: i % 3 === 0 ? 'multiple-choice' : 'fill-in-blank',
      question: gkBank[i].q,
      options: i % 3 === 0 ? [gkBank[i].a, 'Mumbai', 'Chennai', 'Kolkata'] : undefined,
      correctAnswer: gkBank[i].a,
      explanation: gkBank[i].e,
      points: 2
    });
  }
  return questions;
}

function detectSubject(topic: string): string {
  const t = topic.toLowerCase();
  if (t.includes('math') || t.includes('number') || t.includes('addition') || t.includes('subtraction') || t.includes('multiplication') || t.includes('division') || t.includes('fraction') || t.includes('geometry') || t.includes('algebra') || t.includes('calculate') || t.includes('equation') || t.includes('times table')) return 'math';
  if (t.includes('science') || t.includes('plant') || t.includes('animal') || t.includes('body') || t.includes('space') || t.includes('physics') || t.includes('chemistry') || t.includes('biology') || t.includes('energy') || t.includes('force') || t.includes('matter')) return 'science';
  if (t.includes('english') || t.includes('grammar') || t.includes('vocabulary') || t.includes('verb') || t.includes('noun') || t.includes('sentence') || t.includes('spelling') || t.includes('reading') || t.includes('writing') || t.includes('synonym') || t.includes('antonym')) return 'english';
  if (t.includes('gk') || t.includes('general knowledge') || t.includes('capital') || t.includes('country') || t.includes('history') || t.includes('geography')) return 'gk';
  return 'math';
}

export function generateWorksheet(className: string, topic: string, numQuestions: number): WorksheetData {
  const subject = detectSubject(topic);
  let questions: Question[] = [];
  
  switch (subject) {
    case 'math':
      questions = generateMathQuestions(topic, numQuestions);
      break;
    case 'science':
      questions = generateScienceQuestions(topic, numQuestions);
      break;
    case 'english':
      questions = generateEnglishQuestions(topic, numQuestions);
      break;
    case 'gk':
      questions = generateGKQuestions(topic, numQuestions);
      break;
    default:
      questions = generateMathQuestions(topic, numQuestions);
  }

  const practiceSetId = `PSET-${className.replace(/\s/g, '').toUpperCase()}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
  
  return {
    title: `${topic} - Practice Worksheet`,
    practiceSetId,
    className,
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    topic,
    totalMarks: questions.length * 2,
    timeAllowed: `${Math.max(20, questions.length * 3)} minutes`,
    instructions: [
      'Read each question carefully before answering.',
      'Write your answers neatly in the space provided.',
      'Each question carries equal marks as indicated.',
      'Attempt all questions.',
      'Check your answers before submitting.'
    ],
    questions
  };
}
