import type { RoleId } from './roles'

/**
 * The daily challenge bank: one item per role per day.
 *
 * Rotation is deterministic (see `lib/daily.ts`), so everyone on the same profile
 * sees the same question on the same date and it changes at local midnight. That
 * makes it something a batch can actually discuss, which a random pick would not.
 *
 * Each role gets the shape of question its interviews actually use:
 *   SDE / AI-ML  coding and concept questions you answer in prose
 *   Quant        probability and brainteasers
 *   Consulting   a guesstimate, judged on structure rather than the number
 *   FMCG         a timed aptitude set, because those rounds are speed tests
 *   Finance      aptitude plus one markets question
 *   Core         department fundamentals
 */

export type DailyKind = 'coding' | 'puzzle' | 'concept' | 'guesstimate' | 'aptitude'

/** One multiple-choice question inside an aptitude set. */
export type Mcq = {
  q: string
  options: string[]
  /** index into `options` */
  answer: number
  why: string
}

export type DailyItem = {
  id: string
  kind: DailyKind
  title: string
  prompt: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  /** One nudge, for when someone is stuck but does not want the answer. */
  hint?: string
  /** What a strong answer covers. Shown only after the user asks for it. */
  approach?: string[]
  /** Set only when `kind` is 'aptitude'. */
  questions?: Mcq[]
}

export const KIND_LABEL: Record<DailyKind, string> = {
  coding: 'Question of the day',
  puzzle: 'Puzzle of the day',
  concept: 'Concept of the day',
  guesstimate: 'Guesstimate of the day',
  aptitude: 'Aptitude set',
}

export const DAILY: Record<RoleId, DailyItem[]> = {
  // ------------------------------------------------------------------ SDE
  sde: [
    {
      id: 'sde-1',
      kind: 'coding',
      title: 'Longest substring without repeating characters',
      prompt:
        'Given a string, return the length of the longest substring with no repeated characters. Explain your approach before writing code, then state the complexity.',
      difficulty: 'Medium',
      hint: 'Two pointers and a structure that answers "have I seen this character, and where?" in O(1).',
      approach: [
        'Sliding window: expand the right pointer one character at a time.',
        'Keep a map of character to its last index. On a repeat inside the window, jump the left pointer to lastIndex + 1 rather than moving it one step at a time.',
        'Track the best window length as you go.',
        'O(n) time, O(min(n, alphabet)) space. Say the alphabet bound out loud, interviewers listen for it.',
      ],
    },
    {
      id: 'sde-2',
      kind: 'coding',
      title: 'Design an LRU cache',
      prompt:
        'Build a cache with get and put, both O(1), that evicts the least recently used key when it exceeds capacity.',
      difficulty: 'Medium',
      hint: 'One structure gives you O(1) lookup, a different one gives you O(1) reordering. You need both.',
      approach: [
        'Hash map from key to node, plus a doubly linked list ordered by recency.',
        'get: look up the node, unlink it, push it to the front, return its value.',
        'put: if present, update and move to front. If not, insert at front and evict the tail when over capacity.',
        'The doubly linked list is what makes removal O(1); a singly linked list would force a scan for the previous node.',
        'Partial credit for an ordered map, but say why the explicit list is better.',
      ],
    },
    {
      id: 'sde-3',
      kind: 'concept',
      title: 'Why does an index make a query faster, and when does it not?',
      prompt:
        'Explain what a B-tree index actually does to a lookup, and give two cases where adding one does not help or actively hurts.',
      difficulty: 'Medium',
      approach: [
        'An index is a sorted structure, so a lookup becomes O(log n) descent instead of a full scan.',
        'It does not help when the query touches most of the table: the planner will pick a sequential scan because random IO per row costs more than reading it all.',
        'It does not help when the column is wrapped in a function, e.g. WHERE lower(email) = …, unless you built the index on that expression.',
        'It hurts writes: every insert, update and delete has to maintain every index on the table.',
        'Low-cardinality columns (a boolean) rarely justify one.',
      ],
    },
    {
      id: 'sde-4',
      kind: 'coding',
      title: 'Merge intervals',
      prompt:
        'Given a list of intervals, merge all overlapping ones and return the result. What is the cost, and what dominates it?',
      difficulty: 'Easy',
      hint: 'The hard part disappears once the input is in a particular order.',
      approach: [
        'Sort by start time. This is the dominant cost, O(n log n).',
        'Sweep once, keeping the current merged interval. If the next start is <= current end, extend the end to max(end, next end); otherwise push and start a new one.',
        'Be explicit about whether touching intervals ([1,2] and [2,3]) count as overlapping. Ask rather than assume.',
      ],
    },
    {
      id: 'sde-5',
      kind: 'concept',
      title: 'What actually happens when you type a URL and press enter?',
      prompt:
        'Walk through it end to end. Go as deep as you can on at least one layer rather than staying shallow across all of them.',
      difficulty: 'Medium',
      approach: [
        'DNS resolution: browser cache, OS cache, resolver, root, TLD, authoritative.',
        'TCP handshake, then TLS handshake: certificate, key exchange, cipher agreement.',
        'HTTP request, possibly over a connection that is already open (keep-alive, or HTTP/2 multiplexing).',
        'Server, load balancer, application, database, response.',
        'Browser parses HTML, builds the DOM, blocks on synchronous scripts, fetches subresources, builds the CSSOM, renders, paints.',
        'Pick one layer and go deep. Naming all of them shallowly is the common failure.',
      ],
    },
    {
      id: 'sde-6',
      kind: 'coding',
      title: 'Detect a cycle in a linked list',
      prompt:
        'Determine whether a linked list has a cycle, in O(1) extra space. Then find the node where the cycle begins.',
      difficulty: 'Medium',
      hint: 'Two runners at different speeds must meet if the track loops.',
      approach: [
        'Floyd: slow moves one, fast moves two. If they meet, there is a cycle.',
        'For the entry point: reset one pointer to the head, then advance both one step at a time. They meet at the start of the cycle.',
        'Be ready to justify why that works. Let the distance to the cycle be a and the meeting point be b into the cycle; the algebra falls out of 2(a+b) = a+b+kL.',
      ],
    },
    {
      id: 'sde-7',
      kind: 'concept',
      title: 'Process vs thread, and why it matters here',
      prompt:
        'Explain the difference, then say which one you would reach for to handle 10,000 concurrent connections, and why.',
      difficulty: 'Easy',
      approach: [
        'Processes have separate address spaces; threads share one. Context switching between processes costs more.',
        'Shared memory makes threads cheap to communicate through and dangerous to get wrong: races, deadlocks, the need for locks.',
        'For 10,000 connections, neither one-process-per-connection nor one-thread-per-connection scales; the memory and scheduler cost dominates.',
        'The answer is an event loop over non-blocking IO (epoll, kqueue), possibly one loop per core. Name a real system that does this.',
      ],
    },
    {
      id: 'sde-8',
      kind: 'coding',
      title: 'Kth largest element',
      prompt:
        'Find the kth largest element in an unsorted array. Give at least two approaches and say when you would pick each.',
      difficulty: 'Medium',
      approach: [
        'Sort and index: O(n log n), trivial to write, fine when n is small or you need the whole order anyway.',
        'Min-heap of size k: O(n log k) time, O(k) space. Best when k is much smaller than n, and it streams.',
        'Quickselect: O(n) average, O(n²) worst. Fastest in practice for one query on a fixed array.',
        'Saying which one you would ship, and why, matters more than knowing all three.',
      ],
    },
  ],

  // ---------------------------------------------------------------- Quant
  quant: [
    {
      id: 'quant-1',
      kind: 'puzzle',
      title: 'Two envelopes, one is double',
      prompt:
        'One envelope holds twice the other. You pick one and see ₹100. Swapping seems to give an expected 0.5(50) + 0.5(200) = ₹125, so you should always swap. But that argument works before you open it too, which is absurd. Where is the flaw?',
      difficulty: 'Hard',
      hint: 'What are you implicitly assuming about how the smaller amount was chosen?',
      approach: [
        'The calculation assumes P(the other is 200 | I see 100) = P(the other is 50 | I see 100) = 1/2.',
        'That requires a prior over the smaller amount that is uniform over an infinite range, which is not a valid probability distribution.',
        'Under any proper prior, seeing 100 is informative: it shifts your belief about which envelope you hold, and the two branches are no longer equally likely.',
        'With a proper prior the expected gain from swapping is zero on average, though it can be positive for particular observed values.',
        'The interviewer is testing whether you notice an unstated assumption, not whether you know the name of the paradox.',
      ],
    },
    {
      id: 'quant-2',
      kind: 'puzzle',
      title: 'Expected rolls to see all six faces',
      prompt:
        'You roll a fair die repeatedly. What is the expected number of rolls until you have seen every face at least once?',
      difficulty: 'Medium',
      hint: 'Break it into stages: how long to see a new face when you already have k of them?',
      approach: [
        'Once you hold k distinct faces, each roll is new with probability (6-k)/6.',
        'That is geometric, so the expected wait for the next new face is 6/(6-k).',
        'Total = 6(1/6 + 1/5 + 1/4 + 1/3 + 1/2 + 1/1) = 6 × 2.45 = 14.7.',
        'This is the coupon collector problem. State the general answer, n·H(n), if you get there.',
      ],
    },
    {
      id: 'quant-3',
      kind: 'puzzle',
      title: 'Broken stick',
      prompt:
        'A stick of length 1 is broken at two uniformly random points. What is the probability the three pieces form a triangle?',
      difficulty: 'Medium',
      hint: 'Triangle inequality means no piece exceeds 1/2. Draw the sample space.',
      approach: [
        'Let the cuts be x and y, uniform on the unit square.',
        'The three pieces form a triangle exactly when every piece is under 1/2.',
        'Sketch the unit square and shade the region satisfying all three constraints; it is two triangles each of area 1/8.',
        'Answer: 1/4. Draw the picture rather than pushing symbols, it is faster and easier to defend.',
      ],
    },
    {
      id: 'quant-4',
      kind: 'puzzle',
      title: 'Fair result from a biased coin',
      prompt:
        'You have a coin that lands heads with unknown probability p, where 0 < p < 1. Produce a perfectly fair 50/50 outcome. Then: what is the expected number of flips?',
      difficulty: 'Medium',
      hint: 'Look at pairs of flips and throw away the outcomes that are symmetric.',
      approach: [
        'Flip twice. HT and TH each occur with probability p(1-p), so they are equally likely whatever p is.',
        'Call HT heads, TH tails, and discard HH and TT, reflipping.',
        'This is von Neumann\'s trick. Each pair is usable with probability 2p(1-p), so the expected number of pairs is 1/(2p(1-p)) and the expected flips is 1/(p(1-p)).',
        'Note it degrades badly for extreme p, which is a good thing to volunteer.',
      ],
    },
    {
      id: 'quant-5',
      kind: 'puzzle',
      title: 'The 100 prisoners and the boxes',
      prompt:
        '100 prisoners, 100 boxes containing their numbers in random order. Each may open 50 boxes. All must find their own number or everyone loses. Random guessing gives 2^-100. Find a strategy that wins about 31% of the time.',
      difficulty: 'Hard',
      hint: 'The arrangement is a permutation. Permutations decompose into something.',
      approach: [
        'Each prisoner opens the box with their own number, then the box numbered whatever they found, and follows that chain.',
        'This walks the cycle of the permutation containing their number.',
        'Everyone succeeds exactly when the permutation has no cycle longer than 50.',
        'P(no long cycle) = 1 - (1/51 + 1/52 + … + 1/100) ≈ 1 - ln 2 ≈ 0.307.',
        'The point is that the outcomes become correlated instead of independent. That reframing is the whole answer.',
      ],
    },
    {
      id: 'quant-6',
      kind: 'puzzle',
      title: 'Expected maximum of two uniforms',
      prompt:
        'X and Y are independent and uniform on [0,1]. What is E[max(X,Y)]? Now generalise to n variables.',
      difficulty: 'Easy',
      approach: [
        'P(max <= t) = P(X <= t)P(Y <= t) = t², so the density is 2t on [0,1].',
        'E[max] = ∫₀¹ t·2t dt = 2/3.',
        'For n variables the CDF is tⁿ, the density is n·t^(n-1), and the expectation is n/(n+1).',
        'Sanity check: it tends to 1 as n grows, which is what you would expect.',
      ],
    },
    {
      id: 'quant-7',
      kind: 'puzzle',
      title: 'Mental maths under pressure',
      prompt:
        'Without writing anything: 17 × 23, then 8% of 1,250, then what fraction of 1 is 0.0625? Time yourself. Under 15 seconds total is the bar at the trading firms.',
      difficulty: 'Easy',
      approach: [
        '17 × 23: (20 - 3)(20 + 3) = 400 - 9 = 391. Look for the difference-of-squares shape.',
        '8% of 1,250: 1,250/100 = 12.5, times 8 = 100. Or note 8% = 2/25.',
        '0.0625 = 1/16. Memorise the reciprocals of 1 to 20 as decimals; this is the single highest-return drill for these rounds.',
        'Speed here is trained, not innate. Two weeks of daily drills moves most people from about 60% to over 90%.',
      ],
    },
    {
      id: 'quant-8',
      kind: 'puzzle',
      title: 'Ants on a metre stick',
      prompt:
        '100 ants are placed randomly on a 1 metre stick, each facing left or right, all walking at 1 m/min. When two meet they reverse direction. What is the longest possible time before every ant has fallen off?',
      difficulty: 'Medium',
      hint: 'Ants are indistinguishable. What if they passed through each other instead?',
      approach: [
        'Two ants bouncing is indistinguishable from two ants passing through each other, since you cannot tell them apart.',
        'So treat every ant as walking straight off the end without interacting.',
        'The worst case is an ant starting at one end and walking the full length: 1 minute.',
        'The reframing is the entire trick, and it is the kind of move these rounds are testing for.',
      ],
    },
  ],

  // ----------------------------------------------------------- Consulting
  consult: [
    {
      id: 'con-1',
      kind: 'guesstimate',
      title: 'Number of auto-rickshaws in Chennai',
      prompt:
        'Estimate how many auto-rickshaws operate in Chennai. Structure out loud before you compute, and state every assumption as you make it.',
      difficulty: 'Medium',
      hint: 'Two independent routes: from demand (trips needed) or from supply (drivers, vehicles). Doing both and reconciling is stronger.',
      approach: [
        'Demand side: Chennai population ~11m, say 25% take a paid road trip on a given day, of which autos take ~20%. That is roughly 550k auto trips a day.',
        'One auto does perhaps 20 trips a day. 550k / 20 gives around 27,000 autos.',
        'Supply side cross-check: driver households, vehicles per driver, share of registered three-wheelers.',
        'State the range, not a false-precision number: "roughly 25,000 to 35,000".',
        'Then say what would move the estimate most: the share of trips taken by auto is the biggest lever, so that is the number you would go and verify first.',
      ],
    },
    {
      id: 'con-2',
      kind: 'guesstimate',
      title: 'Revenue of a single multiplex screen',
      prompt:
        'Estimate the annual revenue of one screen in a Chennai multiplex. Then say which lever the operator should pull to raise it.',
      difficulty: 'Medium',
      approach: [
        'Seats (~200) × shows per day (4) × occupancy (~30% averaged over weekdays and weekends) = ~240 tickets a day.',
        'Ticket ~₹200, so ~₹48k a day, about ₹1.75 crore a year from tickets.',
        'Food and beverage typically adds 25 to 30% of ticket revenue at much higher margin, plus on-screen advertising.',
        'Total roughly ₹2.2 to 2.5 crore.',
        'The lever: occupancy and F&B attach rate, not ticket price. Say why, since price rises usually reduce footfall enough to offset.',
      ],
    },
    {
      id: 'con-3',
      kind: 'guesstimate',
      title: 'Profitability case: a falling margin',
      prompt:
        'A regional dairy has flat revenue but its profit fell 20% last year. Diagnose it. Structure your first three questions.',
      difficulty: 'Medium',
      hint: 'Profit = revenue - cost. Revenue is flat, so start by splitting cost, but confirm the revenue mix has not shifted.',
      approach: [
        'Confirm the frame: flat revenue could still hide a mix shift from high-margin to low-margin products. Ask first.',
        'Split costs into fixed and variable. Then variable into raw milk procurement, packaging, transport, and fixed into plant, labour, distribution.',
        'For a dairy, procurement price is the usual culprit, and it moves with fodder costs and the seasonal flush.',
        'Ask for a two-year cost breakdown by line rather than guessing which line moved.',
        'Interviewers push hard on the cost side here. Break fixed versus variable quickly and confidently.',
      ],
    },
    {
      id: 'con-4',
      kind: 'guesstimate',
      title: 'Market sizing: electric two-wheelers in India',
      prompt:
        'Size the annual market for electric two-wheelers in India in units, and say what has to be true for it to double.',
      difficulty: 'Hard',
      approach: [
        'Total two-wheeler sales are roughly 15 to 18m units a year.',
        'Electric penetration is in the mid single digits, so around 0.9 to 1.1m units.',
        'Segment it: urban commuters (the realistic near-term buyers) versus rural, and fleet or delivery versus private.',
        'For it to double, the constraint is charging access for people without private parking, and upfront price parity after subsidies.',
        'Naming the binding constraint is what separates a good answer from an arithmetic one.',
      ],
    },
    {
      id: 'con-5',
      kind: 'guesstimate',
      title: 'Number of tennis balls used at Wimbledon',
      prompt:
        'Estimate the number of tennis balls used across the whole tournament. Classic warm-up, but be clean about it.',
      difficulty: 'Easy',
      approach: [
        'Matches: 128 players in each singles draw means 127 matches, roughly 254 for both, plus doubles and juniors. Call it 650 matches.',
        'Balls are changed every 7 games initially then every 9, so roughly 8 to 10 changes of 6 balls per match.',
        'About 55 balls per match × 650 = roughly 36,000. Published figures are around 54,000, so a good range is 35,000 to 55,000.',
        'Finishing with a range and naming your weakest assumption is the point, not hitting the exact number.',
      ],
    },
    {
      id: 'con-6',
      kind: 'guesstimate',
      title: 'Should a coffee chain enter tier-2 India?',
      prompt:
        'A premium coffee chain is considering 50 stores across tier-2 cities. Give a structured recommendation in five minutes.',
      difficulty: 'Hard',
      approach: [
        'Structure: market attractiveness, our right to win, economics per store, risks, then a recommendation.',
        'Market: disposable income growth, the cafe as a meeting space rather than a coffee purchase, competition from local chains.',
        'Unit economics: rent is far lower than metros but so is average ticket size. Model whether the ratio improves or worsens.',
        'Right to win: brand recognition may not travel; supply chain and training are the real constraints at 50 stores.',
        'Recommend a piloted entry with an explicit kill criterion, e.g. 10 stores, and the specific metric you would judge them on. Committing to a decision is expected.',
      ],
    },
  ],

  // ---------------------------------------------------------------- FMCG
  fmcg: [
    {
      id: 'fmcg-1',
      kind: 'aptitude',
      title: 'Percentages and profit',
      prompt: 'Three questions. Shortlisting tests are speed tests, so aim for under a minute each.',
      difficulty: 'Easy',
      questions: [
        {
          q: 'A shopkeeper marks up a product 40% then offers a 25% discount. What is the profit percentage?',
          options: ['5%', '10%', '15%', '12.5%'],
          answer: 0,
          why: 'Take cost = 100. Marked = 140. After 25% off: 140 × 0.75 = 105. Profit = 5%.',
        },
        {
          q: 'If the price rises 25%, by what percentage must consumption fall to keep spending unchanged?',
          options: ['25%', '20%', '15%', '30%'],
          answer: 1,
          why: 'Spend = price × quantity. New price factor 1.25, so quantity must be 1/1.25 = 0.8, a 20% fall. The pattern: a rise of x% needs a cut of x/(100+x).',
        },
        {
          q: 'A sells to B at 20% profit, B sells to C at 25% profit. C pays ₹1,800. What did A pay?',
          options: ['₹1,200', '₹1,250', '₹1,500', '₹1,000'],
          answer: 0,
          why: '1800 / 1.25 = 1440 is B\'s cost. 1440 / 1.20 = 1200 is A\'s cost. Work backwards, dividing rather than subtracting.',
        },
      ],
    },
    {
      id: 'fmcg-2',
      kind: 'aptitude',
      title: 'Ratios, time and work',
      prompt: 'Three questions on the two topics that come up in almost every FMCG aptitude round.',
      difficulty: 'Medium',
      questions: [
        {
          q: 'A does a job in 12 days, B in 18. Working together, how long?',
          options: ['7.2 days', '7.5 days', '6 days', '8 days'],
          answer: 0,
          why: 'Rates add: 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 days. Always convert to rate per day first.',
        },
        {
          q: 'Two vessels hold milk and water in ratios 3:1 and 5:3. Mixed in equal volumes, what is the new ratio?',
          options: ['2:1', '7:3', '11:5', '13:7'],
          answer: 2,
          why: 'Milk fractions: 3/4 and 5/8. Equal volumes gives (3/4 + 5/8)/2 = 11/16 milk, so 11:5.',
        },
        {
          q: 'A sum doubles in 8 years at simple interest. In how many years does it triple?',
          options: ['12', '16', '20', '24'],
          answer: 1,
          why: 'Doubling means the interest equalled the principal in 8 years, so the rate is 12.5%. Tripling needs interest of 2× principal, so 16 years. Simple interest is linear; compound would not be.',
        },
      ],
    },
    {
      id: 'fmcg-3',
      kind: 'aptitude',
      title: 'Data interpretation',
      prompt:
        'A brand sold 1,200 units in Q1, 1,500 in Q2, 1,350 in Q3 and 1,800 in Q4, at ₹250 per unit throughout.',
      difficulty: 'Medium',
      questions: [
        {
          q: 'What was the quarter-on-quarter growth in Q3?',
          options: ['+10%', '-10%', '-12.5%', '+12.5%'],
          answer: 1,
          why: '(1350 - 1500)/1500 = -10%. Check which quarter the question names before computing.',
        },
        {
          q: 'What share of annual revenue came from Q4?',
          options: ['25%', '28%', '31%', '35%'],
          answer: 2,
          why: 'Total units 5,850. Q4 is 1,800/5,850 = 30.8%, so about 31%. Price is constant, so units are enough; do not multiply it out.',
        },
        {
          q: 'To grow next year 20% on the annual total, how many units must be sold?',
          options: ['6,500', '7,020', '7,200', '6,850'],
          answer: 1,
          why: '5,850 × 1.2 = 7,020.',
        },
      ],
    },
    {
      id: 'fmcg-4',
      kind: 'aptitude',
      title: 'Supply chain reasoning',
      prompt: 'Aptitude with an operations flavour, which is how FMCG papers usually frame it.',
      difficulty: 'Medium',
      questions: [
        {
          q: 'A plant makes 500 units/hour and runs 20 hours a day at 85% yield. Daily saleable output?',
          options: ['8,500', '10,000', '9,000', '7,650'],
          answer: 0,
          why: '500 × 20 = 10,000 produced, × 0.85 = 8,500 saleable. Apply yield at the end, not to the rate.',
        },
        {
          q: 'Demand is 300 units/day, lead time 5 days, safety stock 400. What is the reorder point?',
          options: ['1,500', '1,900', '700', '2,000'],
          answer: 1,
          why: 'Reorder point = demand during lead time + safety stock = 300 × 5 + 400 = 1,900.',
        },
        {
          q: 'Stock covers 18 days at 250 units/day. If demand rises to 300, how many days of cover remain?',
          options: ['15', '13', '16', '12'],
          answer: 0,
          why: 'Stock = 18 × 250 = 4,500. At 300/day that is 15 days. Convert to absolute stock first; days of cover is not directly scalable.',
        },
      ],
    },
    {
      id: 'fmcg-5',
      kind: 'aptitude',
      title: 'Verbal and logical reasoning',
      prompt: 'The section people skip preparing for and then lose marks on.',
      difficulty: 'Easy',
      questions: [
        {
          q: 'All marketers are analysts. Some analysts are creative. Which necessarily follows?',
          options: [
            'Some marketers are creative',
            'All analysts are marketers',
            'No valid conclusion about marketers and creativity',
            'No marketer is creative',
          ],
          answer: 2,
          why: 'The creative analysts may all sit outside the marketer subset. "Some A are C" plus "all M are A" tells you nothing about M and C.',
        },
        {
          q: 'Pick the word closest in meaning to "ubiquitous".',
          options: ['Rare', 'Omnipresent', 'Ambiguous', 'Unique'],
          answer: 1,
          why: 'Ubiquitous means present everywhere. It is the opposite of rare and unrelated to ambiguity.',
        },
        {
          q: 'A statement says a campaign "drove" a sales rise. What is the main weakness?',
          options: [
            'Sales are hard to measure',
            'Correlation is being presented as causation with no control',
            'The campaign was too short',
            'There is no weakness',
          ],
          answer: 1,
          why: 'Without a control region or a pre-post comparison holding other factors constant, seasonality or a competitor stockout explains it equally well. Naming the missing counterfactual is the answer.',
        },
      ],
    },
  ],

  // ------------------------------------------------------------- Finance
  finance: [
    {
      id: 'fin-1',
      kind: 'aptitude',
      title: 'Interest, returns and speed',
      prompt: 'The first round is an aptitude filter. These are the shapes it uses.',
      difficulty: 'Medium',
      questions: [
        {
          q: '₹10,000 at 10% compounded annually. Value after 3 years?',
          options: ['₹13,000', '₹13,310', '₹13,100', '₹12,100'],
          answer: 1,
          why: '10,000 × 1.1³ = 13,310. Memorise 1.1² = 1.21 and 1.1³ = 1.331; they appear constantly.',
        },
        {
          q: 'A portfolio falls 20% then rises 20%. Net change?',
          options: ['0%', '-4%', '+4%', '-2%'],
          answer: 1,
          why: '0.8 × 1.2 = 0.96, a 4% loss. Percentage changes compound, they do not add.',
        },
        {
          q: 'Roughly how long for money to double at 9% per year?',
          options: ['6 years', '8 years', '10 years', '12 years'],
          answer: 1,
          why: 'Rule of 72: 72/9 = 8 years. Know this cold, it is asked as a warm-up.',
        },
      ],
    },
    {
      id: 'fin-2',
      kind: 'concept',
      title: 'Explain a bond price falling when rates rise',
      prompt:
        'Explain to someone non-technical why an existing bond loses value when interest rates go up. Then define duration in one sentence.',
      difficulty: 'Medium',
      approach: [
        'Your bond pays a fixed coupon. If new bonds pay more, nobody buys yours at face value, so its price falls until its yield matches the new ones.',
        'Price is the present value of fixed future cash flows; raising the discount rate lowers that value.',
        'Duration is the weighted average time to receive the cash flows, and it approximates the percentage price change for a 1% move in rates.',
        'Longer maturity and lower coupon both mean higher duration and more sensitivity.',
      ],
    },
    {
      id: 'fin-3',
      kind: 'concept',
      title: 'Have one market view ready',
      prompt:
        'Name one thing happening in markets right now that you find interesting, and defend a view on it for two minutes.',
      difficulty: 'Medium',
      approach: [
        'This comes up in the fit round nearly every year and almost nobody has one prepared.',
        'Structure: what is happening, why it is happening, what you think happens next, and what would prove you wrong.',
        'That last part matters most. A view with no falsification condition reads as a headline you repeated.',
        'Depth beats breadth. One thing you genuinely followed beats five you skimmed.',
      ],
    },
    {
      id: 'fin-4',
      kind: 'aptitude',
      title: 'Valuation basics',
      prompt: 'Three quick ones on the fundamentals every finance interview assumes.',
      difficulty: 'Medium',
      questions: [
        {
          q: 'A company has a P/E of 20 and earnings of ₹50 crore. What is its market cap?',
          options: ['₹250 cr', '₹1,000 cr', '₹500 cr', '₹2,000 cr'],
          answer: 1,
          why: 'Market cap = P/E × earnings = 20 × 50 = ₹1,000 crore.',
        },
        {
          q: 'Which of these does NOT appear on the cash flow statement?',
          options: ['Depreciation', 'Accrued but unpaid revenue', 'Capital expenditure', 'Dividends paid'],
          answer: 1,
          why: 'Accrued unpaid revenue is recognised on the income statement but has produced no cash yet. It shows up as a working capital adjustment, not as a cash line of its own.',
        },
        {
          q: 'Free cash flow to firm equals EBIT(1-t) plus depreciation minus capex minus…',
          options: ['Interest', 'Change in working capital', 'Dividends', 'Taxes'],
          answer: 1,
          why: 'FCFF subtracts the increase in working capital. Interest is excluded because FCFF is pre-financing.',
        },
      ],
    },
    {
      id: 'fin-5',
      kind: 'puzzle',
      title: 'Expected value of a simple bet',
      prompt:
        'A game: roll a fair die, and you are paid the face value in rupees. What would you pay to play? Now, you may reroll once if you dislike the first roll. What now?',
      difficulty: 'Medium',
      hint: 'For the second part, work out when rerolling is the better choice.',
      approach: [
        'Straight game: E = (1+2+3+4+5+6)/6 = 3.5, so pay under ₹3.50.',
        'With a reroll, keep the first roll if it beats the expected value of rerolling, which is 3.5. So keep 4, 5 or 6; reroll 1, 2 or 3.',
        'E = P(keep)·E[roll | roll ≥ 4] + P(reroll)·3.5 = 0.5 × 5 + 0.5 × 3.5 = 4.25.',
        'The optional-stopping structure is the point, and it generalises to far harder questions.',
      ],
    },
  ],

  // ------------------------------------------------------------ AI/ML
  aiml: [
    {
      id: 'ai-1',
      kind: 'concept',
      title: 'Why does dropout work?',
      prompt:
        'Explain dropout without equations, then say what happens at inference time and why that adjustment is needed.',
      difficulty: 'Medium',
      approach: [
        'During training, randomly zeroing units stops the network relying on any specific co-adaptation of neurons, so features have to be independently useful.',
        'It approximates training an ensemble of exponentially many thinned networks that share weights.',
        'At inference, dropout is switched off and activations are scaled (or, with inverted dropout, scaling happened during training instead), so the expected activation matches what the next layer saw while training.',
        'Forgetting to disable it at eval is one of the most common real bugs; say so, interviewers like that.',
      ],
    },
    {
      id: 'ai-2',
      kind: 'concept',
      title: 'Explain attention without maths',
      prompt:
        'Explain self-attention to someone who knows programming but not deep learning. Then say what its cost is in sequence length.',
      difficulty: 'Medium',
      approach: [
        'Each token asks a question (query), every token advertises what it offers (key), and carries content (value).',
        'Match each query against every key to get relevance weights, then take a weighted sum of the values. Each token ends up rebuilt from whichever tokens were relevant to it.',
        'It is a learned, content-based lookup rather than a fixed-window one, which is why it captures long-range dependence that convolutions struggle with.',
        'Cost is O(n²) in sequence length, since every token attends to every other. That quadratic term is what all the efficient-attention work is trying to avoid.',
      ],
    },
    {
      id: 'ai-3',
      kind: 'concept',
      title: 'How would you detect data leakage?',
      prompt:
        'Your model scores 0.98 AUC in validation and 0.61 in production. Walk through how you would find the cause.',
      difficulty: 'Hard',
      hint: 'The gap is too large to be ordinary overfitting. Something in training knew the future.',
      approach: [
        'First suspect leakage, not overfitting. A gap that size usually means a feature encoded the target.',
        'Check the split: was it random when the data is a time series? Random splits let the model see the future.',
        'Check for target-derived features, IDs that correlate with label ordering, or aggregates computed over the full dataset before splitting.',
        'Rank features by importance and inspect the top few by hand. A single suspiciously dominant feature is the usual signature.',
        'Rebuild with a strict time-based split and recompute all aggregates inside the training fold only.',
      ],
    },
    {
      id: 'ai-4',
      kind: 'concept',
      title: 'Bias-variance, concretely',
      prompt:
        'Explain the bias-variance tradeoff, then say specifically what you would change if your model has high bias, and what if it has high variance.',
      difficulty: 'Easy',
      approach: [
        'High bias means underfitting: train and validation error are both high and close together.',
        'High variance means overfitting: train error is low, validation error is much higher.',
        'For high bias: a bigger model, better features, less regularisation, train longer.',
        'For high variance: more data, stronger regularisation, dropout, early stopping, a simpler model.',
        'Diagnose from the two curves before changing anything. Naming the diagnostic matters more than reciting the definition.',
      ],
    },
    {
      id: 'ai-5',
      kind: 'coding',
      title: 'Debug this training loop',
      prompt:
        'A loop trains but the loss plateaus immediately at a constant value and never moves. List what you would check, in order.',
      difficulty: 'Medium',
      approach: [
        'Is the optimiser step actually being called, and are gradients being zeroed each iteration?',
        'Is the learning rate sane? Too high diverges, too low looks flat.',
        'Are labels aligned with inputs, or shuffled independently?',
        'Is the final activation compatible with the loss (e.g. applying softmax and then a loss that also applies it)?',
        'Try to overfit a single batch deliberately. If it cannot reach near-zero loss on 8 examples, the bug is in the code, not the data.',
        'That last check is the one interviewers wait to hear, and live debugging comes up more often than people prepare for.',
      ],
    },
    {
      id: 'ai-6',
      kind: 'concept',
      title: 'Precision, recall, and picking one',
      prompt:
        'Define precision and recall, then pick which one matters more for (a) a cancer screening test and (b) a spam filter, and justify it.',
      difficulty: 'Easy',
      approach: [
        'Precision: of what I flagged, how much was right. Recall: of what was actually there, how much did I find.',
        'Cancer screening: recall. A missed case is far more costly than a false alarm that leads to a second test.',
        'Spam filter: precision. A real email in the spam folder is worse than a spam email in the inbox.',
        'Say the cost asymmetry out loud. The answer is a business judgement, not a metric definition.',
        'Mention that accuracy is useless under class imbalance, and that a threshold trades the two off continuously.',
      ],
    },
  ],

  // ---------------------------------------------------------------- Core
  core: [
    {
      id: 'core-1',
      kind: 'concept',
      title: 'Why do heat exchangers use counter-flow?',
      prompt:
        'Explain why counter-flow beats parallel-flow, and name one situation where you would still choose parallel-flow.',
      difficulty: 'Medium',
      approach: [
        'Counter-flow keeps the temperature difference roughly uniform along the exchanger, giving a higher log mean temperature difference for the same inlet conditions, so less area is needed.',
        'It also allows the cold outlet to exceed the hot outlet, which parallel-flow can never do.',
        'Parallel-flow is chosen when you want to limit the wall temperature at the inlet, for example with a temperature-sensitive fluid, because the largest ΔT sits where the coldest fluid is.',
        'Core interviews open with second and third-year course content like this. Nobody asked me a single puzzle.',
      ],
    },
    {
      id: 'core-2',
      kind: 'concept',
      title: 'Stress concentration and why holes matter',
      prompt:
        'A plate under tension has a circular hole. What happens to the stress, and how would you reduce the effect?',
      difficulty: 'Medium',
      approach: [
        'Stress concentrates at the edge of the hole, perpendicular to the load. For a small circular hole in a wide plate the factor is 3.',
        'It depends on geometry, not hole size, which surprises people; a small hole concentrates stress just as much.',
        'Reduce it by softening the geometry: elliptical holes aligned with the load, generous fillets, or reinforcing the edge.',
        'Under fatigue this matters more than under static load, since cracks start at the concentration.',
      ],
    },
    {
      id: 'core-3',
      kind: 'concept',
      title: 'Explain a project you built, at depth',
      prompt:
        'Pick one project from your resume. Explain the one decision in it you would defend hardest, and what the alternative was.',
      difficulty: 'Easy',
      approach: [
        'Core interviews go deep on one thing rather than broad across many.',
        'Structure: what the problem was, what you chose, what you rejected, and what evidence made the choice.',
        'Have numbers ready. "Reduced vibration" is nothing; "cut peak amplitude from 0.8mm to 0.2mm at the operating speed" is an answer.',
        'Being able to say what you would do differently is a strength, not an admission.',
      ],
    },
    {
      id: 'core-4',
      kind: 'concept',
      title: 'Bending moment intuition',
      prompt:
        'A simply supported beam carries a point load at mid-span. Sketch shear force and bending moment, and state where failure starts.',
      difficulty: 'Easy',
      approach: [
        'Reactions are W/2 at each end.',
        'Shear force is constant at +W/2, jumps by W at the load, then constant at -W/2.',
        'Bending moment is triangular, peaking at WL/4 at mid-span.',
        'Failure begins at the extreme fibre at mid-span, where bending stress My/I is largest.',
        'Being able to sketch it from reasoning rather than memory is the actual test.',
      ],
    },
    {
      id: 'core-5',
      kind: 'concept',
      title: 'Op-amps: the two golden rules',
      prompt:
        'State the two ideal op-amp assumptions and use them to derive the gain of an inverting amplifier. Then say when they break down.',
      difficulty: 'Medium',
      approach: [
        'No current flows into the inputs, and with negative feedback the two inputs sit at the same voltage (virtual short).',
        'Inverting amp: the inverting node is at 0V, so current through Rin is Vin/Rin, and it all flows through Rf. Vout = -Vin·(Rf/Rin).',
        'They break down at high frequency (finite gain-bandwidth product), near the supply rails, at high slew rates, and where input bias current matters with large resistors.',
        'Analog rounds go deep here. Deriving it beats reciting it.',
      ],
    },
  ],
}
