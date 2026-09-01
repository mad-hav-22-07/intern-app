import type { CompanyMetaMap } from './types'

/**
 * Company context for Blue Book entries M through Z (plus digit/bracket-led
 * names). Keyed by the exact `name` string used in `data/bluebook/*`.
 *
 * Every domain and link below was checked with curl before being added. A
 * few large corporate sites (mckinsey.com, rubrik.com, oracle.com, uber.com,
 * unilever.com, meesho.com, nestle.in, mastercard.com) sit behind bot
 * protection that returns 403/406 to curl even with a browser user agent —
 * they are real, correct, working domains, just not curl-friendly. Where a
 * specific sub-page couldn't be confirmed, the entry links to the bare
 * domain or omits that link rather than guess.
 */
export const META_M_Z: CompanyMetaMap = {
  '(Western Digital) WD Storage Technologies India Private Limited': {
    domain: 'westerndigital.com',
    about:
      'American manufacturer of hard drives, SSDs, and flash storage — the physical disks and chips that sit inside laptops, servers, and data centers. This is its India engineering arm, doing firmware and hardware design work rather than selling to consumers directly.',
    sector: 'Storage hardware',
    links: [{ label: 'Careers', url: 'https://www.westerndigital.com/careers' }],
  },
  'Mastercard India Services Pvt Limited': {
    domain: 'mastercard.com',
    about:
      'Runs the payment network that moves a transaction from your card to your bank and back in seconds. It does not issue cards or lend money itself — banks do that — Mastercard just owns and operates the rails and takes a cut per swipe.',
    sector: 'Payments',
    links: [{ label: 'Careers', url: 'https://careers.mastercard.com/us/en' }],
  },
  'McKinsey & Company': {
    domain: 'mckinsey.com',
    about:
      'Management consulting firm — teams of generalists are dropped into a client company for a few months to fix a specific problem (strategy, cost, operations) and then leave. No product, the work product is analysis and recommendations.',
    sector: 'Consulting',
    links: [{ label: 'Careers for students', url: 'https://www.mckinsey.com/careers/students' }],
  },
  'Media.net': {
    domain: 'media.net',
    about:
      'Ad-tech company that runs a contextual and programmatic advertising exchange — it plugs into websites and apps and decides which ad to show a visitor and how much to charge for it, monetizing publisher traffic on the back end.',
    sector: 'Ad tech',
    links: [
      { label: 'About', url: 'https://www.media.net/aboutus/' },
      { label: 'Careers', url: 'https://www.media.net/careers' },
    ],
  },
  Meesho: {
    domain: 'meesho.com',
    about:
      'Indian e-commerce marketplace built around zero-commission listings and reseller-driven social selling, aimed at price-sensitive tier-2/3 shoppers rather than the Amazon/Flipkart urban customer.',
    sector: 'E-commerce',
    links: [{ label: 'Careers', url: 'https://www.meesho.io/' }],
  },
  Microsoft: {
    domain: 'microsoft.com',
    about:
      'Builds Windows, Office/365, Azure cloud infrastructure, and a portfolio of enterprise and consumer software (GitHub, LinkedIn, Xbox, Teams). Most campus hires land in one specific product or cloud org rather than "Microsoft" broadly.',
    sector: 'Big tech',
    links: [{ label: 'Careers', url: 'https://careers.microsoft.com/' }],
  },
  'Microsoft (ML)': {
    domain: 'microsoft.com',
    about:
      'Machine-learning-focused hiring track at Microsoft — applied ML/AI roles across Azure AI, Copilot, and product teams rather than core Windows/Office engineering.',
    sector: 'Big tech',
    links: [{ label: 'Careers', url: 'https://careers.microsoft.com/' }],
  },
  'Microsoft (Software)': {
    domain: 'microsoft.com',
    about:
      'Standard software engineering track at Microsoft — building features across Windows, Office, Azure, or one of its many product teams.',
    sector: 'Big tech',
    links: [{ label: 'Careers', url: 'https://careers.microsoft.com/' }],
  },
  'Microsoft (Technical Program Manager)': {
    domain: 'microsoft.com',
    about:
      'TPM track at Microsoft — not a coding role day to day, it coordinates engineering, design, and business teams to actually ship a product on schedule.',
    sector: 'Big tech',
    links: [{ label: 'Careers', url: 'https://careers.microsoft.com/' }],
  },
  'Millennium Consulting (India)': {
    domain: 'mlp.com',
    about:
      'Indian entity of Millennium Management, a ~$85B+ multi-strategy hedge fund (multiple independent trading teams, each running its own book). "Consulting" is the legal-entity name in India, not the job — hires here work on technology and quant research supporting the fund\'s trading pods.',
    sector: 'Hedge fund',
    links: [{ label: 'Careers', url: 'https://www.mlp.com/careers/' }],
  },
  'Millennium Consulting (India) Private Limited': {
    domain: 'mlp.com',
    about:
      'Indian entity of Millennium Management, a ~$85B+ multi-strategy hedge fund (multiple independent trading teams, each running its own book). "Consulting" is the legal-entity name in India, not the job — hires here work on technology and quant research supporting the fund\'s trading pods.',
    sector: 'Hedge fund',
    links: [{ label: 'Careers', url: 'https://www.mlp.com/careers/' }],
  },
  "Moody's": {
    domain: 'moodys.com',
    about:
      'Credit rating agency — assesses how likely a government or company is to repay its debt and publishes that as a letter-grade rating, which investors use to price bonds. Also runs a large data/analytics business (Moody\'s Analytics) on top of that.',
    sector: 'Credit ratings & financial data',
    links: [{ label: 'Careers', url: 'https://www.moodys.com/careers' }],
  },
  'Morgan Stanley': {
    domain: 'morganstanley.com',
    about:
      'Global investment bank and wealth manager — advises companies on M&A and raising capital, trades securities for institutional clients, and runs a large wealth-management arm for individuals.',
    sector: 'Investment bank',
    links: [{ label: 'Campus recruiting', url: 'https://www.morganstanley.com/campus' }],
  },
  'NK Securities (Quant)': {
    domain: 'nksecurities.com',
    about:
      'Gurugram-based high-frequency trading firm founded in 2011. Trades its own capital using low-latency, C++-heavy systems; the quant track builds the statistical/probabilistic models the strategies run on. Pays some of the highest fresher packages among Indian prop shops.',
    sector: 'Prop trading',
    links: [{ label: 'Campus recruitment', url: 'https://www.nksecurities.com/campus-recruitment/' }],
  },
  'NK Securities (Software)': {
    domain: 'nksecurities.com',
    about:
      'Gurugram-based high-frequency trading firm founded in 2011. Trades its own capital using low-latency, C++-heavy systems; the software track builds and maintains that trading infrastructure rather than the trading models themselves.',
    sector: 'Prop trading',
    links: [{ label: 'Campus recruitment', url: 'https://www.nksecurities.com/campus-recruitment/' }],
  },
  'NK Securities Research': {
    domain: 'nksecurities.com',
    about:
      'Gurugram-based high-frequency trading firm founded in 2011, trading its own capital with in-house low-latency infrastructure. Screens hard for raw algorithmic/probabilistic reasoning; no finance background is assumed going in.',
    sector: 'Prop trading',
    links: [{ label: 'Campus recruitment', url: 'https://www.nksecurities.com/campus-recruitment/' }],
  },
  'NVIDIA Graphics Pvt Ltd': {
    domain: 'nvidia.com',
    about:
      'Designs the GPUs that run most AI model training and inference today, alongside its original gaming-graphics business; increasingly sells full data-center systems and software (CUDA) rather than just chips.',
    sector: 'Semiconductors',
    links: [{ label: 'Careers', url: 'https://www.nvidia.com/en-us/about-nvidia/careers/' }],
  },
  'NatWest Group': {
    domain: 'natwestgroup.com',
    about:
      'UK high-street and commercial bank (formerly Royal Bank of Scotland Group) — retail banking, business banking, and a markets arm. Its India offices are captive centers doing technology, risk, and analytics work for the group.',
    sector: 'Bank',
    links: [{ label: 'Early careers', url: 'https://jobs.natwestgroup.com/pages/early-talent' }],
  },
  'Nestle India Limited': {
    domain: 'nestle.in',
    about:
      'Indian subsidiary of the Swiss FMCG giant — makes and sells packaged food and beverage brands (Maggi, Nescafe, KitKat) through a large India-specific supply chain and sales network.',
    sector: 'FMCG',
  },
  'NoBroker (Product)': {
    domain: 'nobroker.in',
    about:
      'Indian proptech platform that lets landlords and tenants (or buyers/sellers) connect directly for rent or sale, cutting out the traditional broker and their commission; also sells rent-payment, packers-and-movers, and legal add-on services.',
    sector: 'Proptech',
    links: [{ label: 'Careers', url: 'https://nobroker.in/careers' }],
  },
  'NoBroker (Software)': {
    domain: 'nobroker.in',
    about:
      'Indian proptech platform that lets landlords and tenants (or buyers/sellers) connect directly for rent or sale, cutting out the traditional broker and their commission; also sells rent-payment, packers-and-movers, and legal add-on services.',
    sector: 'Proptech',
    links: [{ label: 'Careers', url: 'https://nobroker.in/careers' }],
  },
  'Nomura (Global Markets Analyst)': {
    domain: 'nomura.com',
    about:
      'Japanese investment bank; the Global Markets desk trades and sells fixed income, equities, and derivatives to institutional clients — an analyst here sits close to live trading and sales, not back-office research.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://www.nomura.com/careers/' }],
  },
  'Nomura (Wholesale Strategy)': {
    domain: 'nomura.com',
    about:
      'Japanese investment bank; the Wholesale Strategy track works on cross-business strategy and planning for Nomura\'s institutional (wholesale) banking arm rather than trading a desk directly.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://www.nomura.com/careers/' }],
  },
  Nutanix: {
    domain: 'nutanix.com',
    about:
      'Sells hyperconverged infrastructure software — lets companies run their own private cloud on standard servers instead of specialized storage hardware, pitched as an alternative to running everything on AWS/Azure or on legacy SAN storage.',
    sector: 'Cloud infrastructure',
    links: [{ label: 'Careers', url: 'https://www.nutanix.com/company/careers' }],
  },
  Optiver: {
    domain: 'optiver.com',
    about:
      'Dutch proprietary trading firm and market maker — quotes buy/sell prices on options, ETFs, and futures using its own capital, so it has no external clients. Profits from the bid-ask spread and managing that risk at speed.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://www.optiver.com/careers' }],
  },
  'Optiver (Quantitative Trading)': {
    domain: 'optiver.com',
    about:
      'Dutch prop trading firm and market maker. The trading track sits on the desk making live pricing and risk decisions on options/futures/ETFs, working closely with the firm\'s own capital and quant models.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://www.optiver.com/careers' }],
  },
  'Optiver (SDE)': {
    domain: 'optiver.com',
    about:
      'Dutch prop trading firm and market maker. The SDE track builds the low-latency trading systems and internal tools traders and quants rely on — infrastructure, not trading decisions.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://www.optiver.com/careers' }],
  },
  Oracle: {
    domain: 'oracle.com',
    about:
      'Originally the dominant relational-database vendor; now also sells enterprise applications (ERP/HR/CRM via NetSuite and Fusion) and its own cloud (OCI) competing with AWS/Azure/GCP.',
    sector: 'Enterprise software',
    links: [{ label: 'Careers', url: 'https://www.oracle.com/careers/' }],
  },
  'Piramal Capital and Housing Finance': {
    domain: 'piramalfinance.com',
    about:
      'Non-bank lender (NBFC/HFC) under the Piramal Group — gives home loans and business/retail financing across India, distinct from the group\'s pharma business.',
    sector: 'NBFC / Housing finance',
    links: [{ label: 'Careers', url: 'https://www.piramalfinance.com/careers' }],
  },
  'Piramal Pharma': {
    domain: 'piramalpharma.com',
    about:
      'Pharmaceuticals arm of the Piramal Group — contract development/manufacturing (CDMO) for global drugmakers plus its own generics, hospital generics, and consumer healthcare products.',
    sector: 'Pharma',
    links: [{ label: 'Careers', url: 'https://www.piramalpharma.com/careers' }],
  },
  'Piramal Pharma Limited': {
    domain: 'piramalpharma.com',
    about:
      'Pharmaceuticals arm of the Piramal Group — contract development/manufacturing (CDMO) for global drugmakers plus its own generics, hospital generics, and consumer healthcare products.',
    sector: 'Pharma',
    links: [{ label: 'Careers', url: 'https://www.piramalpharma.com/careers' }],
  },
  Plivo: {
    domain: 'plivo.com',
    about:
      'Cloud communications platform (CPaaS) — gives other companies an API to add voice calls and SMS into their own apps, competing with Twilio. Handles over a billion API requests a month.',
    sector: 'CPaaS / Cloud communications',
    links: [{ label: 'Jobs', url: 'https://www.plivo.com/jobs/' }],
  },
  Posha: {
    domain: 'posha.com',
    about:
      'Consumer-robotics startup (formerly Nymble) building a countertop cooking robot that uses computer vision and AI to dispense ingredients and cook a recipe with minimal human input. Small team, hardware + embedded + computer-vision stack.',
    sector: 'Consumer robotics',
    links: [{ label: 'Careers', url: 'https://www.posha.com/careers' }],
  },
  'Procter & Gamble': {
    domain: 'pg.com',
    about:
      'FMCG conglomerate behind brands like Gillette, Pampers, Ariel, and Pantene — sells household and personal-care products at massive scale; hires are usually funneled straight into a specific brand/category team.',
    sector: 'FMCG',
    links: [{ label: 'Careers', url: 'https://www.pgcareers.com/' }],
  },
  PwC: {
    domain: 'pwc.com',
    about:
      'One of the "Big Four" professional services firms — audit, tax, and advisory/consulting work for large clients. Audit and assurance is its historical core; consulting is the faster-growing arm.',
    sector: 'Professional services',
    links: [{ label: 'Careers', url: 'https://www.pwc.com/gx/en/careers.html' }],
  },
  Quadeye: {
    domain: 'quadeye.com',
    about:
      'Gurugram-based quantitative proprietary trading firm — builds automated strategies that trade the firm\'s own capital across asset classes globally, similar in shape to NK Securities and Tower Research.',
    sector: 'Prop trading',
    links: [
      { label: 'About', url: 'https://www.quadeye.com/about-us/' },
      { label: 'Careers', url: 'https://www.quadeye.com/careers/' },
    ],
  },
  'Quantbox Research (Core Engineering Analyst – SDE)': {
    domain: 'quantboxresearch.com',
    about:
      'HFT/prop trading firm founded in 2020, already among the top handful of high-frequency shops in India with offices in India, Hong Kong, Amsterdam, and Dubai. The SDE track builds the low-latency infrastructure the trading strategies run on.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://www.quantboxresearch.com/careers' }],
  },
  'Quantbox Research (Research and Trading Analyst)': {
    domain: 'quantboxresearch.com',
    about:
      'HFT/prop trading firm founded in 2020, already among the top handful of high-frequency shops in India with offices in India, Hong Kong, Amsterdam, and Dubai. This track works on the alpha research and electronic market-making strategies themselves.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://www.quantboxresearch.com/careers' }],
  },
  'Quantitative Brokers': {
    domain: 'quantitativebrokers.com',
    about:
      'New York-based agency broker (not a prop shop — takes no market risk of its own) that builds execution algorithms for futures, US Treasuries, and options, used by asset managers, hedge funds, and banks to trade at lower cost. Has an engineering team in Chennai.',
    sector: 'Trading technology',
    links: [{ label: 'Careers', url: 'https://www.quantitativebrokers.com/careers' }],
  },
  'Qube Research & Technologies India LLP': {
    domain: 'qube-rt.com',
    about:
      'London-headquartered quant hedge fund (spun out of Credit Suisse\'s systematic trading unit in 2018) managing around $38B, trading systematically across every major asset class. The India LLP is an engineering/research office.',
    sector: 'Quant hedge fund',
    links: [{ label: 'Careers', url: 'https://job-boards.greenhouse.io/quberesearchandtechnologies' }],
  },
  'Qube Research and Technologies': {
    domain: 'qube-rt.com',
    about:
      'London-headquartered quant hedge fund (spun out of Credit Suisse\'s systematic trading unit in 2018) managing around $38B, trading systematically across every major asset class.',
    sector: 'Quant hedge fund',
    links: [{ label: 'Careers', url: 'https://job-boards.greenhouse.io/quberesearchandtechnologies' }],
  },
  Rubrik: {
    domain: 'rubrik.com',
    about:
      'Data security / backup company — protects enterprise data from ransomware and disaster by backing it up and letting companies restore quickly, now positioned heavily around ransomware recovery. Listed on NYSE.',
    sector: 'Cybersecurity',
  },
  Salesforce: {
    domain: 'salesforce.com',
    about:
      'Pioneered SaaS CRM — the software sales, marketing, and support teams use to track customers and deals, delivered entirely over the browser rather than installed. Now a broad enterprise-cloud portfolio (Slack, Tableau, MuleSoft) on top of that core.',
    sector: 'SaaS',
    links: [{ label: 'Careers', url: 'https://www.salesforce.com/company/careers/' }],
  },
  Samsung: {
    domain: 'samsung.com',
    about:
      'South Korean conglomerate best known for phones (Galaxy) and consumer electronics, but its largest profit engine is actually memory chips (DRAM/NAND) sold to other tech companies.',
    sector: 'Consumer electronics',
  },
  'Samsung Research Bangalore': {
    domain: 'research.samsung.com',
    about:
      'Samsung\'s largest R&D center outside South Korea — works on modem, multimedia, AI, and IoT technology for Samsung\'s global flagship devices, plus India-specific product features.',
    sector: 'Core engineering',
    links: [{ label: 'SRI-B overview', url: 'https://research.samsung.com/sri-b' }],
  },
  'Samsung Research Institute India Delhi': {
    domain: 'research.samsung.com',
    about:
      'One of Samsung\'s three Indian R&D centers (alongside Bangalore and Noida); runs its own internship pipeline (the "Shishya" program) feeding into device software and AI work.',
    sector: 'Core engineering',
    links: [{ label: 'SRI-Delhi overview', url: 'https://research.samsung.com/sri-d' }],
  },
  'Schneider Electric': {
    domain: 'se.com',
    about:
      'French industrial company focused on energy management and automation — building electrical distribution equipment, industrial control systems, and data-center power/cooling products rather than consumer goods.',
    sector: 'Industrial / Energy management',
  },
  'Skan.ai': {
    domain: 'skan.ai',
    about:
      'Enterprise SaaS company selling "process intelligence" — uses computer vision to observe how employees actually work across their screens, then surfaces where a business process is slow or ripe for automation.',
    sector: 'Enterprise SaaS',
    links: [{ label: 'Product overview', url: 'https://www.skan.ai/process-intelligence' }],
  },
  Stripe: {
    domain: 'stripe.com',
    about:
      'Payments infrastructure company — gives other businesses the API to accept online payments, handle billing/subscriptions, and move money, rather than being a consumer-facing brand itself.',
    sector: 'Fintech / Payments infra',
    links: [{ label: 'Jobs', url: 'https://stripe.com/jobs' }],
  },
  'Tech Mahindra': {
    domain: 'techmahindra.com',
    about:
      'Indian IT services and consulting company (part of the Mahindra Group) — builds and maintains software for large enterprise clients, historically strong in telecom, across outsourced project and staffing engagements.',
    sector: 'IT services',
    links: [{ label: 'Careers', url: 'https://careers.techmahindra.com/' }],
  },
  'Tower Research Capital': {
    domain: 'tower-research.com',
    about:
      'New York-founded high-frequency trading firm — one of the older and larger quant prop shops, trading its own capital algorithmically across global markets with a large Gurugram engineering office.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://tower-research.com/careers/' }],
  },
  Trexquant: {
    domain: 'trexquant.com',
    about:
      'Systematic hedge fund running statistical-arbitrage strategies — thousands of small, market-neutral statistical signals combined to trade equities and futures, rather than a handful of big directional bets.',
    sector: 'Quant hedge fund',
    links: [{ label: 'Careers', url: 'https://trexquant.com/careers' }],
  },
  'Trexquant Investment LP': {
    domain: 'trexquant.com',
    about:
      'Systematic hedge fund running statistical-arbitrage strategies — thousands of small, market-neutral statistical signals combined to trade equities and futures, rather than a handful of big directional bets.',
    sector: 'Quant hedge fund',
    links: [{ label: 'Careers', url: 'https://trexquant.com/careers' }],
  },
  Uber: {
    domain: 'uber.com',
    about:
      'Runs the two-sided marketplace matching riders with drivers (and, via Uber Eats, diners with restaurants/couriers) in real time — its hard engineering problems are matching, pricing, and maps/routing at global scale.',
    sector: 'Marketplace / Mobility',
  },
  Unilever: {
    domain: 'unilever.com',
    about:
      'One of the largest FMCG companies in the world — owns hundreds of household and personal-care brands (Dove, Surf Excel, Lipton) sold through an enormous distribution network, especially strong in India via Hindustan Unilever.',
    sector: 'FMCG',
  },
  'Warner Bros. Discovery': {
    domain: 'wbd.com',
    about:
      'Media and entertainment conglomerate formed from the 2022 merger of WarnerMedia and Discovery — owns HBO/Max, CNN, Warner Bros. film/TV studios, and a large cable network portfolio.',
    sector: 'Media & entertainment',
    links: [{ label: 'Careers', url: 'https://www.wbd.com/careers' }],
  },
  'Wells Fargo': {
    domain: 'wellsfargo.com',
    about:
      'One of the largest US retail and commercial banks — consumer banking, mortgages, commercial lending, and wealth management; its India centers do technology and analytics work for the group.',
    sector: 'Bank',
    links: [{ label: 'Careers', url: 'https://www.wellsfargo.com/about/careers/' }],
  },
  'WestBridge Capital': {
    domain: 'westbridgecap.com',
    about:
      'India-focused growth-stage investment firm (evergreen fund, no fixed exit timeline) that takes large minority stakes in promising Indian companies — its portfolio includes Meesho, Rapido, and Postman.',
    sector: 'Venture capital / Growth equity',
    links: [{ label: 'Portfolio', url: 'https://westbridgecap.com/portfolio' }],
  },
  'WinZO Games Private Limited': {
    domain: 'winzogames.com',
    about:
      "India's largest vernacular social-gaming platform — hosts casual, skill-based real-money games across 100+ titles and 12 languages, aimed at tier-2/3 mobile users rather than hardcore gamers.",
    sector: 'Gaming',
  },
  'Wipro Enterprises': {
    domain: 'wiproenterprises.com',
    about:
      'Unlisted FMCG and lighting company demerged from Wipro Limited in 2013 — makes personal care and home care products plus lighting and hydraulics/infrastructure equipment. Not the IT company despite the shared name.',
    sector: 'FMCG',
  },
  'Wipro Limited': {
    domain: 'wipro.com',
    about:
      'Large, publicly listed Indian IT services company — builds and maintains software, cloud, and consulting engagements for enterprise clients globally, similar in shape to TCS/Infosys.',
    sector: 'IT services',
  },
  WorldQuant: {
    domain: 'worldquant.com',
    about:
      'Quantitative asset manager that runs a huge, crowdsourced "alpha factory" model — thousands of researchers (including via its online BRAIN/challenge platform) each contribute small predictive trading signals that get combined into systematic strategies.',
    sector: 'Quant hedge fund',
    links: [{ label: 'Careers', url: 'https://www.worldquant.com/careers/' }],
  },
  'YMS Financial Private Limited': {
    domain: 'ymsfinancial.com',
    about:
      'Ahmedabad-based quantitative trading and infrastructure firm — trades its own capital using proprietary alpha research and low-latency execution systems, and also provides execution infrastructure to select portfolio managers.',
    sector: 'Prop trading',
  },
  'Zanskar Research LLP': {
    domain: 'zanskar.xyz',
    about:
      'Bengaluru-based fintech (founded 2022) building systematic proprietary trading and market-making algorithms; also runs Nubra, a brokerage/execution platform offering low-latency access to AMCs, PMS/AIF funds, and prop desks.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://zanskar.xyz/careers' }],
  },
}
