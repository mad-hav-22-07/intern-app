import type { RoleId } from './roles'

export type Round = {
  id: string
  label: string
  desc: string
  minutes: number
  /** scripted interviewer turns */
  script: { q: string; followUp?: string }[]
}

export const ROUNDS: Record<RoleId, Round[]> = {
  sde: [
    {
      id: 'sde-dsa',
      label: 'DSA Round',
      desc: 'Two problems, think out loud, optimise before you code.',
      minutes: 45,
      script: [
        { q: "Let's start with a warm-up. Given an array of integers and a target, return the indices of the two numbers that add to the target. Walk me through your approach before you write anything.", followUp: 'Good. Now what if the array is sorted, can you do it without extra space?' },
        { q: 'Next one. Design a data structure that supports insert, delete and getRandom, all in O(1) average time. What are you reaching for?', followUp: 'How do you handle the delete in O(1) if the element is in the middle of your array?' },
        { q: 'Last question. What is the time and space complexity of what you just built, and where would it degrade in production?' },
      ],
    },
    {
      id: 'sde-tech',
      label: 'Technical / CS Fundamentals',
      desc: 'OS, networks, DBMS and one low-level design problem.',
      minutes: 40,
      script: [
        { q: 'I see a backend project on your resume. Walk me through what happens, end to end, when a user hits your login endpoint.', followUp: 'Where exactly does the session live, and what breaks if you run two instances of that server?' },
        { q: 'Explain the difference between a process and a thread, and tell me when you would deliberately choose one over the other.' },
        { q: 'You have a table with fifty million rows and a query that filters on two columns. How do you make it fast, and what does that cost you?' },
      ],
    },
    {
      id: 'sde-hr',
      label: 'HR / Behavioural',
      desc: 'Fit, motivation and how you handle conflict.',
      minutes: 25,
      script: [
        { q: 'Tell me about yourself, and keep it to about ninety seconds.', followUp: 'You mentioned a team project. What went wrong on it, and what did you personally do about it?' },
        { q: 'Why this company, and why this role specifically? Be concrete.' },
        { q: 'Where do you see the gap between what you know today and what this role needs?' },
      ],
    },
  ],
  quant: [
    { id: 'q-prob', label: 'Probability Round', desc: 'Expected value, conditional probability, and one long puzzle.', minutes: 40, script: [ { q: 'You flip a fair coin until you see two heads in a row. What is the expected number of flips?', followUp: 'Now generalise it to k heads in a row.' }, { q: 'Three players draw from a shuffled deck without replacement. What is the probability the second player draws the first ace?' }, { q: 'A stick is broken at two uniformly random points. What is the probability the three pieces form a triangle?' } ] },
    { id: 'q-mental', label: 'Mental Maths Sprint', desc: 'Eighty arithmetic questions, eight minutes. The real filter.', minutes: 8, script: [ { q: 'Ready? 47 × 63.' }, { q: '18% of 2,450.' }, { q: '√2809.' } ] },
    { id: 'q-market', label: 'Market Making', desc: 'Quote a two-sided market and manage your position.', minutes: 30, script: [ { q: 'I want a market on the number of countries in Africa. Give me a bid and an ask.', followUp: 'I lift your offer. Do you want to update your market?' }, { q: 'Now make me a market on the sum of the digits of my phone number.' } ] },
  ],
  consult: [
    { id: 'c-case', label: 'Case Interview', desc: 'Interviewer-led profitability or market entry case.', minutes: 35, script: [ { q: 'Our client is a regional cinema chain with twelve properties. Profits have fallen 30% over two years while footfall is flat. What is going on?', followUp: 'You said costs. Which costs, and how would you size them?' }, { q: 'Ticket prices are unchanged and concession revenue per head is down 40%. What does that tell you?' }, { q: 'Give me your recommendation to the CEO in ninety seconds, with the risks.' } ] },
    { id: 'c-guess', label: 'Guesstimate Round', desc: 'Structure, assumptions stated out loud, sanity check at the end.', minutes: 20, script: [ { q: 'How many air conditioners are sold in Chennai in a year?', followUp: 'Your household penetration assumption looks high. Defend it or revise it.' }, { q: 'Sanity-check your answer against something you know independently.' } ] },
    { id: 'c-pei', label: 'Personal Experience Interview', desc: 'One story, gone deep on. Expect five layers of "why".', minutes: 25, script: [ { q: 'Tell me about a time you led a team through disagreement.', followUp: 'What did the person who disagreed with you say afterwards?' }, { q: 'What would you do differently if you ran that again tomorrow?' } ] },
  ],
  finance: [
    { id: 'f-apt', label: 'Aptitude & Maths', desc: 'Speed round on percentages, ratios and data interpretation.', minutes: 25, script: [ { q: 'A stock falls 20% then rises 20%. Where is it relative to where it started?' }, { q: 'You are shown a table of quarterly revenue for four segments. Which segment is dragging the total, and by how much?' } ] },
    { id: 'f-tech', label: 'Technical / Markets', desc: 'Basic derivatives intuition and one market view.', minutes: 30, script: [ { q: 'Explain what a call option is to someone who has never traded. No formulas.', followUp: 'What happens to its value if volatility rises and nothing else changes?' }, { q: 'What is one market view you hold right now, and what would prove you wrong?' } ] },
    { id: 'f-hr', label: 'Fit Round', desc: 'Why finance, why this desk, and what you read.', minutes: 20, script: [ { q: 'Why finance and not the engineering role your degree points at?' }, { q: 'What did you read this morning?' } ] },
  ],
  aiml: [
    { id: 'a-fund', label: 'ML Fundamentals', desc: 'Bias-variance, regularisation, evaluation, and why things work.', minutes: 35, script: [ { q: 'Explain the bias-variance tradeoff using a model you have actually trained.', followUp: 'Your validation loss is lower than your training loss. What is happening?' }, { q: 'Explain attention to me without writing a single equation.' }, { q: 'How would you detect data leakage in a pipeline you inherited?' } ] },
    { id: 'a-proj', label: 'Project Deep-Dive', desc: 'Every design choice on your resume, defended.', minutes: 40, script: [ { q: 'Pick the project you are proudest of. Why did you choose that architecture over the obvious baseline?', followUp: 'What was your baseline, and by how much did you beat it?' }, { q: 'What would you change if you had to serve this to a hundred thousand users tomorrow?' } ] },
    { id: 'a-code', label: 'Coding Round', desc: 'DSA plus one live debugging of a training loop.', minutes: 45, script: [ { q: 'Implement a function that returns the top-k most frequent elements. Complexity target is better than O(n log n).' }, { q: 'Here is a training loop that runs but never converges. Talk me through how you would debug it.' } ] },
  ],
  fmcg: [
    { id: 'm-gd', label: 'Group Discussion', desc: 'Six people, fifteen minutes, abstract topic. Structure over volume.', minutes: 15, script: [ { q: 'Topic: "Is convenience making us worse at patience?" You have thirty seconds to think, then open.', followUp: 'Two people have spoken over each other. Bring the discussion back.' }, { q: 'Two minutes left. Summarise for the group.' } ] },
    { id: 'm-pi', label: 'Personal Interview', desc: 'Behavioural, structured around leadership stories.', minutes: 30, script: [ { q: 'Tell me about a time you influenced someone who had no reason to listen to you.', followUp: 'What specifically did you say that changed their mind?' }, { q: 'Why FMCG, and why the supply chain side of it?' } ] },
    { id: 'm-case', label: 'Business Case', desc: 'Short case presented to two managers.', minutes: 25, script: [ { q: 'A shampoo brand is losing share in tier-2 towns while growing in metros. Diagnose it.' }, { q: 'What would you do in the next quarter, and how would you measure whether it worked?' } ] },
  ],
  core: [
    { id: 'k-tech', label: 'Core Technical', desc: 'Department fundamentals from second and third year courses.', minutes: 40, script: [ { q: 'Walk me through the assumptions behind the equation you used most in your final year project.', followUp: 'Which of those assumptions breaks first in a real plant?' }, { q: 'Derive the relationship you just quoted, on paper, out loud.' } ] },
    { id: 'k-proj', label: 'Project Round', desc: 'Your design choices, and what you would change.', minutes: 30, script: [ { q: 'Describe your project as if I were a plant manager, not an academic.' }, { q: 'What was the failure mode you did not anticipate?' } ] },
    { id: 'k-hr', label: 'HR Round', desc: 'Fit, relocation and long-term intent.', minutes: 20, script: [ { q: 'Are you comfortable with a plant posting for the first two years?' }, { q: 'Why core, when most of your batch is going non-core?' } ] },
  ],
}

export const FEEDBACK = {
  overall: 72,
  strengths: [
    'Stated your approach before writing code in both problems.',
    'Correctly identified the O(1) constraint and picked the right structure.',
    'Recovered well when the follow-up invalidated your first assumption.',
  ],
  improve: [
    { title: 'Complexity stated late', body: 'You gave time complexity only when asked. Volunteer it right after you describe the approach. It signals you were thinking about it all along.' },
    { title: 'Edge cases skipped', body: 'Neither solution handled the empty-input case. Say the edge cases out loud even if you do not code them.' },
    { title: 'Long silences', body: 'Two gaps over forty seconds. Narrate the dead ends too. Silence reads as being stuck.' },
  ],
  metrics: [
    { label: 'Correctness', value: 84 },
    { label: 'Communication', value: 68 },
    { label: 'Code quality', value: 76 },
    { label: 'Pace', value: 61 },
  ],
}
