import type { CompanyMetaMap } from './types'

/**
 * Company context for Blue Book entries A through L (case-insensitively,
 * ignoring a leading bracket). See ./types.ts for the shape and the rules.
 *
 * Peer file `m-z.ts` covers the rest of the alphabet — do not add entries
 * here that belong there.
 */
export const META_A_L: CompanyMetaMap = {
  'APT Portfolio (Quant)': {
    domain: 'aptportfolio.com',
    about:
      'Delhi-founded high-frequency trading firm (the name stands for Algorithms, Profit, Trust) that trades its own capital across equities, derivatives and other markets. Quant hires research and build the statistical models and execution logic behind its strategies.',
    sector: 'Prop trading',
    links: [
      { label: 'Careers', url: 'https://www.aptportfolio.com/career/index.html' },
      { label: 'Open roles', url: 'https://job-boards.greenhouse.io/aptportfolio' },
    ],
  },
  'APT Portfolio (Hardware)': {
    domain: 'aptportfolio.com',
    about:
      'Delhi-founded high-frequency trading firm trading its own capital across markets. The hardware track builds and verifies the low-latency FPGA/digital-design infrastructure that its trading strategies run on.',
    sector: 'Prop trading',
    links: [
      { label: 'Careers', url: 'https://www.aptportfolio.com/career/index.html' },
      { label: 'Open roles', url: 'https://job-boards.greenhouse.io/aptportfolio' },
    ],
  },
  'Accenture (Advanced Application Engineering)': {
    domain: 'accenture.com',
    about:
      'Global IT-services and consulting firm that builds and runs technology systems for large enterprises. This track is software-engineering-heavy: building and modernizing applications rather than advising on strategy.',
    sector: 'Consulting',
    links: [{ label: 'Careers (India)', url: 'https://www.accenture.com/in-en/careers' }],
  },
  'Accenture (Strategy & Consulting)': {
    domain: 'accenture.com',
    about:
      'Global IT-services and consulting firm. The Strategy & Consulting arm advises clients on business strategy, digital transformation and operating-model change, ahead of the technology delivery work.',
    sector: 'Consulting',
    links: [{ label: 'Careers (India)', url: 'https://www.accenture.com/in-en/careers' }],
  },
  'Accenture Strategy & Consulting': {
    domain: 'accenture.com',
    about:
      'Global IT-services and consulting firm. The Strategy & Consulting arm advises clients on business strategy, digital transformation and operating-model change, ahead of the technology delivery work.',
    sector: 'Consulting',
    links: [{ label: 'Careers (India)', url: 'https://www.accenture.com/in-en/careers' }],
  },
  Adobe: {
    domain: 'adobe.com',
    about:
      'Makes the software behind most creative and document work — Photoshop, Illustrator, Acrobat/PDF — plus the Experience Cloud suite that companies use to run marketing and analytics.',
    sector: 'Software',
    links: [{ label: 'Careers', url: 'https://careers.adobe.com/' }],
  },
  'Adobe (Media and Data Science Research)': {
    domain: 'adobe.com',
    about:
      'Adobe’s research arm working on media (image/video/audio generation and editing) and data-science problems that later show up in products like Photoshop, Premiere and Firefly.',
    sector: 'Software',
    links: [{ label: 'Adobe Research', url: 'https://research.adobe.com/' }],
  },
  'Adobe (Product)': {
    domain: 'adobe.com',
    about:
      'Product engineering at Adobe: building features into flagship apps like Photoshop, Acrobat and the Experience Cloud platform used by marketing and creative teams.',
    sector: 'Software',
    links: [{ label: 'Careers', url: 'https://careers.adobe.com/' }],
  },
  'Adobe (Research)': {
    domain: 'adobe.com',
    about:
      'Adobe’s research division, publishing and prototyping in computer vision, graphics, NLP and ML, much of which feeds into later Creative Cloud and Experience Cloud releases.',
    sector: 'Software',
    links: [{ label: 'Adobe Research', url: 'https://research.adobe.com/' }],
  },
  'Algoquant Fintech Limited': {
    domain: 'algoquantfin.com',
    about:
      'Ahmedabad-headquartered, publicly listed fintech firm (renamed from Hindustan Everest Tools in 2022) offering stock, commodity and currency broking plus algorithmic and high-frequency trading; the internship is on the algo-trading/backtesting side, building strategies and infrastructure for equities, commodities and crypto.',
    sector: 'Prop trading',
    links: [{ label: 'About', url: 'https://algoquantfin.com/' }],
  },
  'AlphaGrep Securities': {
    domain: 'alpha-grep.com',
    about:
      'Mumbai-based quantitative trading and market-making firm that trades equities, derivatives and crypto with its own capital; a sister entity, AlphaGrep Investment Management, separately runs PMS/AIF products for outside investors.',
    sector: 'Prop trading',
    links: [
      { label: 'Company info', url: 'https://www.alpha-grep.com/company-information/' },
      { label: 'About', url: 'https://www.alpha-grep.com/' },
    ],
  },
  'AlphaGrep Securities Pvt Ltd': {
    domain: 'alpha-grep.com',
    about:
      'Mumbai-based quantitative trading and market-making firm that trades equities, derivatives and crypto with its own capital; a sister entity, AlphaGrep Investment Management, separately runs PMS/AIF products for outside investors.',
    sector: 'Prop trading',
    links: [
      { label: 'Company info', url: 'https://www.alpha-grep.com/company-information/' },
      { label: 'About', url: 'https://www.alpha-grep.com/' },
    ],
  },
  Amazon: {
    domain: 'amazon.com',
    about:
      'Runs the world’s largest e-commerce marketplace and, through AWS, the largest cloud-computing platform; also builds devices (Kindle, Alexa), logistics and ads businesses.',
    sector: 'Big Tech',
    links: [{ label: 'Careers', url: 'https://www.amazon.jobs/' }],
  },
  'American Express': {
    domain: 'americanexpress.com',
    about:
      'Global payments and financial-services company issuing charge and credit cards and running its own merchant network, distinct from Visa/Mastercard in that it operates both sides of the transaction.',
    sector: 'Financial services',
    links: [{ label: 'About', url: 'https://about.americanexpress.com/who-we-are' }],
  },
  Appian: {
    domain: 'appian.com',
    about:
      'Makes a low-code automation platform that lets businesses design and run workflow/process applications (case management, approvals, orchestration) without writing everything from scratch.',
    sector: 'SaaS',
    links: [{ label: 'Careers', url: 'https://www.appian.com/careers/' }],
  },
  'Applied Materials': {
    domain: 'appliedmaterials.com',
    about:
      'Makes the fabrication equipment (deposition, etch, and other process tools) that semiconductor manufacturers use to actually build chips — it sells to chipmakers rather than making chips itself.',
    sector: 'Semiconductors',
    links: [{ label: 'Careers', url: 'https://www.appliedmaterials.com/us/en/careers.html' }],
  },
  Atlassian: {
    domain: 'atlassian.com',
    about:
      'Makes team collaboration and software-development tools — Jira, Confluence, Trello, Bitbucket — used by engineering and product teams to plan and track work.',
    sector: 'SaaS',
    links: [
      { label: 'Careers', url: 'https://www.atlassian.com/company/careers' },
      { label: 'Engineering blog', url: 'https://www.atlassian.com/engineering' },
    ],
  },
  Auxia: {
    domain: 'auxia.io',
    about:
      'Palo Alto seed-stage B2B SaaS startup, founded by ex-Google/Meta/Lyft engineers, building an AI-native marketing platform that uses causal ML on a company’s first-party data to personalize customer journeys at scale.',
    sector: 'SaaS',
    links: [{ label: 'About', url: 'https://www.auxia.io/about-us' }],
  },
  'Axtria India Pvt Ltd': {
    domain: 'axtria.com',
    about:
      'US-headquartered (with a large India base) provider of cloud software and data analytics built specifically for pharma and life-sciences commercial teams — sales, market access and patient-level analytics.',
    sector: 'Analytics consulting',
    links: [{ label: 'Careers', url: 'https://www.axtria.com/careers' }],
  },
  BCG: {
    domain: 'bcg.com',
    about:
      'Global management-consulting firm advising companies and governments on strategy, digital transformation and organizational change.',
    sector: 'Consulting',
    links: [{ label: 'Careers', url: 'https://www.bcg.com/careers' }],
  },
  'Bain & Company': {
    domain: 'bain.com',
    about:
      'Global management-consulting firm, particularly known for private-equity due-diligence work alongside broader corporate-strategy consulting.',
    sector: 'Consulting',
    links: [{ label: 'Careers', url: 'https://www.bain.com/careers/' }],
  },
  Bajaj: {
    domain: 'bajajauto.com',
    about:
      'Bajaj Auto, one of India’s largest two- and three-wheeler manufacturers. This internship is a Graduate Trainee Engineer role across R&D — vehicle integration, EV electronics, powertrain systems and connected-vehicle tech.',
    sector: 'Automotive',
    links: [{ label: 'About', url: 'https://www.bajajauto.com/' }],
  },
  Barclays: {
    domain: 'barclays.com',
    about:
      'UK-headquartered global bank running both corporate/investment banking (markets, advisory) and consumer/retail banking businesses.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://home.barclays/careers/' }],
  },
  'Bosch Global Software Technologies': {
    domain: 'bosch-softwaretechnologies.com',
    about:
      'Bosch’s Bengaluru-headquartered software engineering arm (formerly RBEI), building the software — computer vision, embedded control, cloud, IoT — behind Bosch’s mobility, industrial and consumer-technology products.',
    sector: 'Core engineering',
    links: [
      { label: 'Careers', url: 'https://www.bosch-softwaretechnologies.com/en/careers/' },
      {
        label: 'Students & graduates',
        url: 'https://www.bosch-softwaretechnologies.com/en/careers/students-and-graduates/',
      },
    ],
  },
  'Boston Consulting Group (India) Pvt. Ltd.': {
    domain: 'bcg.com',
    about:
      'Global management-consulting firm advising companies and governments on strategy, digital transformation and organizational change.',
    sector: 'Consulting',
    links: [{ label: 'Careers', url: 'https://www.bcg.com/careers' }],
  },
  'Cisco (ASIC)': {
    domain: 'cisco.com',
    about:
      'Makes the networking hardware and software (routers, switches, and increasingly security and collaboration tools) that run the internet’s backbone. The ASIC track is hardware/digital-design work on the custom silicon behind Cisco’s routing and switching products.',
    sector: 'Semiconductors',
    links: [{ label: 'Careers', url: 'https://jobs.cisco.com/' }],
  },
  'Cisco (Software)': {
    domain: 'cisco.com',
    about:
      'Makes the networking hardware and software (routers, switches, and increasingly security and collaboration tools) that run the internet’s backbone. This track is software engineering on Cisco’s networking, routing and switching product lines.',
    sector: 'Core engineering',
    links: [{ label: 'Careers', url: 'https://jobs.cisco.com/' }],
  },
  'Celebal Technologies': {
    domain: 'celebaltech.com',
    about:
      'Jaipur/Houston-based data-and-AI consulting company and major Databricks/Microsoft Azure partner, building big-data, cloud-analytics and generative-AI solutions for enterprise clients.',
    sector: 'Analytics consulting',
    links: [{ label: 'Careers', url: 'https://celebaltech.com/careers/' }],
  },
  'D. E. Shaw': {
    domain: 'deshaw.com',
    about:
      'New York-founded quantitative investment firm running systematic and discretionary trading strategies across global markets, alongside a broad computational-research and software-engineering practice.',
    sector: 'Quant hedge fund',
    links: [{ label: 'Careers', url: 'https://www.deshaw.com/careers' }],
  },
  'D. E. Shaw India': {
    domain: 'deshaw.com',
    about:
      'The Hyderabad technology and quantitative-research arm of D. E. Shaw, the New York quant investment firm; builds the trading, risk and computational infrastructure the firm’s strategies run on.',
    sector: 'Quant hedge fund',
    links: [{ label: 'Careers (India)', url: 'https://www.deshaw.com/careers/india' }],
  },
  'Databricks (Domestic)': {
    domain: 'databricks.com',
    about:
      'Makes the "lakehouse" data platform (built on Apache Spark, by Spark’s original creators) used for large-scale data engineering, analytics and machine learning.',
    sector: 'SaaS',
    links: [{ label: 'Careers', url: 'https://www.databricks.com/company/careers' }],
  },
  'Databricks (International)': {
    domain: 'databricks.com',
    about:
      'Makes the "lakehouse" data platform (built on Apache Spark, by Spark’s original creators) used for large-scale data engineering, analytics and machine learning.',
    sector: 'SaaS',
    links: [{ label: 'Careers', url: 'https://www.databricks.com/company/careers' }],
  },
  'Deutsche India Private Limited': {
    domain: 'db.com',
    about:
      'Deutsche Bank’s largest technology centre outside Germany (Bengaluru and Pune), building the banking platforms, cloud migration and risk/tech systems used across the bank’s global businesses.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://careers.db.com/' }],
  },
  "Dr Reddy's Laboratories (Digital and Analytics)": {
    domain: 'drreddys.com',
    about:
      'Major Indian multinational pharmaceutical company making generic drugs, active pharmaceutical ingredients and biosimilars. This track applies data science and digital tools to R&D, manufacturing and commercial functions.',
    sector: 'Pharma',
    links: [{ label: 'Careers', url: 'https://careers.drreddys.com/' }],
  },
  "Dr Reddy's Laboratories (Technical Trainee)": {
    domain: 'drreddys.com',
    about:
      'Major Indian multinational pharmaceutical company making generic drugs, active pharmaceutical ingredients and biosimilars. The Technical Trainee track sits in core manufacturing/process engineering functions.',
    sector: 'Pharma',
    links: [{ label: 'Careers', url: 'https://careers.drreddys.com/' }],
  },
  'EY GDS': {
    domain: 'ey.com',
    about:
      'EY’s Global Delivery Services network — EY’s own in-house delivery centres (India is one of the largest) that provide data-science, analytics and technology work to EY member firms worldwide.',
    sector: 'Consulting',
    links: [
      {
        label: 'Careers (India, GDS)',
        url: 'https://www.ey.com/en_in/careers/global-delivery-services',
      },
    ],
  },
  'Ebullient Securities (Tradewalk Broking Pvt Ltd)': {
    domain: 'ebullientsecurities.com',
    about:
      'Gurugram-based quantitative proprietary options-trading firm (founded 2015), trading its own capital across futures, options, cash and commodities, and expanding into crypto.',
    sector: 'Prop trading',
    links: [{ label: 'About', url: 'https://www.ebullientsecurities.com/' }],
  },
  'ExxonMobil Services and Technology Pvt Ltd': {
    domain: 'exxonmobil.com',
    about:
      'ExxonMobil’s global engineering and technology services arm; the Bengaluru centre does upstream and downstream engineering, R&D and digital-technology work for ExxonMobil’s worldwide operations.',
    sector: 'Energy',
    links: [{ label: 'Careers', url: 'https://corporate.exxonmobil.com/careers' }],
  },
  'FN MathLogic Consulting Services Private Limited': {
    domain: 'fnmathlogic.com',
    about:
      'Gurugram analytics-consulting boutique applying machine learning, deep learning and reinforcement learning to client problems in fraud mitigation, risk/collections, and marketing and customer analytics.',
    sector: 'Analytics consulting',
    links: [{ label: 'About', url: 'https://fnmathlogic.com/' }],
  },
  'Fidelity Investments': {
    domain: 'fidelity.com',
    about:
      'US financial-services company offering brokerage, retirement accounts and asset management; runs large technology and investment-operations centres in India.',
    sector: 'Asset management',
    links: [{ label: 'Careers', url: 'https://www.fidelitycareers.com/' }],
  },
  Finmechanics: {
    domain: 'finmechanics.com',
    about:
      'Singapore-founded fintech (with a Mumbai office) building treasury, capital-markets and risk software for banks — pricing, trading/order management, VaR and asset-liability management — sold to financial institutions rather than run as a trading desk itself.',
    sector: 'Fintech',
    links: [{ label: 'About', url: 'https://www.finmechanics.com/' }],
  },
  Flipkart: {
    domain: 'flipkart.com',
    about:
      "India's largest homegrown e-commerce marketplace (majority-owned by Walmart), selling everything from electronics to groceries and running its own logistics network.",
    sector: 'E-commerce',
    links: [{ label: 'Careers', url: 'https://www.flipkartcareers.com/' }],
  },
  'Fractal Analytics': {
    domain: 'fractal.ai',
    about:
      'Mumbai-founded AI and analytics consulting company building decision-science tools and, more recently, generative-AI products for Fortune 500 clients across industries.',
    sector: 'Analytics consulting',
    links: [{ label: 'Careers', url: 'https://fractal.ai/careers/' }],
  },
  Glean: {
    domain: 'glean.com',
    about:
      'US enterprise-search startup, founded by former Google and Facebook engineers, building an AI-powered, permissions-aware system that lets employees find knowledge scattered across a company’s internal tools.',
    sector: 'SaaS',
    links: [{ label: 'Careers', url: 'https://www.glean.com/careers' }],
  },
  'Glean Search Technologies': {
    domain: 'glean.com',
    about:
      'US enterprise-search startup, founded by former Google and Facebook engineers, building an AI-powered, permissions-aware system that lets employees find knowledge scattered across a company’s internal tools.',
    sector: 'SaaS',
    links: [{ label: 'Careers', url: 'https://www.glean.com/careers' }],
  },
  'Goedel Machines': {
    domain: 'goedelmachines.com',
    about:
      'Bootstrapped Hyderabad deep-tech startup working across the AI stack — foundation models, voice systems and agentic/reinforcement-learning architectures — with interns pitching and defending their own research proposal.',
    sector: 'AI research',
    links: [{ label: 'About', url: 'https://goedelmachines.com/' }],
  },
  'Goedel Machines Pvt Ltd': {
    domain: 'goedelmachines.com',
    about:
      'Bootstrapped Hyderabad deep-tech startup working across the AI stack — foundation models, voice systems and agentic/reinforcement-learning architectures — with interns pitching and defending their own research proposal.',
    sector: 'AI research',
    links: [{ label: 'About', url: 'https://goedelmachines.com/' }],
  },
  'Goldman Sachs': {
    domain: 'goldmansachs.com',
    about:
      'Global investment bank and financial-services firm spanning investment banking (advisory, underwriting), global markets (sales & trading) and asset & wealth management.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://www.goldmansachs.com/careers/' }],
  },
  'Goldman Sachs (Quant)': {
    domain: 'goldmansachs.com',
    about:
      'Global investment bank’s quantitative side — building the pricing models, trading algorithms and risk systems that sit behind its markets and asset-management businesses.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://www.goldmansachs.com/careers/' }],
  },
  Google: {
    domain: 'google.com',
    about:
      'Runs Search, Ads, Android, Chrome, YouTube and Google Cloud — one of the largest consumer-tech and cloud-computing companies in the world.',
    sector: 'Big Tech',
    links: [{ label: 'Careers', url: 'https://careers.google.com/' }],
  },
  'Google India': {
    domain: 'google.com',
    about:
      'Google’s India engineering and product organization, working on the same Search, Ads, Android and Cloud products as the rest of Google.',
    sector: 'Big Tech',
    links: [{ label: 'Careers', url: 'https://careers.google.com/' }],
  },
  'Graviton Research Capital': {
    domain: 'gravitontrading.com',
    about:
      'Gurugram-founded (2014) quantitative and high-frequency trading firm trading its own capital across global markets using low-latency systematic strategies.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://www.gravitontrading.com/careers' }],
  },
  'Guna Solar Private Limited': {
    domain: 'gunasolar.com',
    about:
      'Chennai-based solar EPC company that designs and installs rooftop and ground-mounted solar plants; the Blue Book internships build AI tools (computer-vision dust detection, physics-informed forecasting) around its solar-cleaning and sizing operations.',
    sector: 'Renewable energy',
    links: [{ label: 'About', url: 'https://www.gunasolar.com/' }],
  },
  'Hindustan Unilever': {
    domain: 'hul.co.in',
    about:
      "India's largest FMCG company (a Unilever subsidiary), selling home-care, personal-care, food and refreshment brands like Surf Excel, Dove and Lipton across the country.",
    sector: 'FMCG',
    links: [{ label: 'About', url: 'https://www.hul.co.in/' }],
  },
  'IMC Trading': {
    domain: 'imc.com',
    about:
      'Dutch proprietary trading firm that makes markets in options, ETFs and other instruments using its own capital — it has no external clients, unlike a bank or broker.',
    sector: 'Prop trading',
    links: [{ label: 'Careers', url: 'https://www.imc.com/us/careers' }],
  },
  ITC: {
    domain: 'itcportal.com',
    about:
      'Indian diversified conglomerate spanning FMCG (foods, personal care, cigarettes), hotels, paperboards and packaging, agribusiness, and IT services (ITC Infotech).',
    sector: 'FMCG',
    links: [{ label: 'Careers', url: 'https://www.itcportal.com/careers/' }],
  },
  'ITC Limited': {
    domain: 'itcportal.com',
    about:
      'Indian diversified conglomerate spanning FMCG (foods, personal care, cigarettes), hotels, paperboards and packaging, agribusiness, and IT services (ITC Infotech).',
    sector: 'FMCG',
    links: [{ label: 'Careers', url: 'https://www.itcportal.com/careers/' }],
  },
  'JP Morgan (CIB Research & Analytics – Markets)': {
    domain: 'jpmorganchase.com',
    about:
      'JPMorgan’s Corporate & Investment Bank markets research and analytics function — supporting sales & trading desks with data, models and research rather than trading a book directly.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://careers.jpmorgan.com/global/en/students/programs' }],
  },
  'JP Morgan (Quantitative Researcher)': {
    domain: 'jpmorganchase.com',
    about:
      'JPMorgan’s quant-research function, building the pricing, risk and trading models used across the bank’s markets businesses.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://careers.jpmorgan.com/global/en/students/programs' }],
  },
  JPMorganChase: {
    domain: 'jpmorganchase.com',
    about:
      'The largest US bank by assets, spanning consumer banking, commercial banking, and a corporate & investment bank (JPMorgan) covering advisory, markets and asset management.',
    sector: 'Investment bank',
    links: [{ label: 'Careers', url: 'https://careers.jpmorgan.com/global/en/students/programs' }],
  },
  'Jaguar Land Rover TBSI': {
    domain: 'jaguarlandrover.com',
    about:
      'Jaguar Land Rover’s Technology and Business Services India centre (Bengaluru), working on EV systems, embedded software, power electronics and battery-management systems, plus infotainment, for Jaguar and Land Rover vehicles.',
    sector: 'Core engineering',
    links: [{ label: 'Careers', url: 'https://careers.jaguarlandrover.com/' }],
  },
  'Jane Street (Quantitative Trader)': {
    domain: 'janestreet.com',
    about:
      'New York-founded proprietary trading firm that trades its own capital in ETFs, equities, bonds and derivatives globally; well known for its research-driven, functional-programming (OCaml) engineering culture.',
    sector: 'Prop trading',
    links: [{ label: 'Join Jane Street', url: 'https://www.janestreet.com/join-jane-street/' }],
  },
  'Jane Street (Software)': {
    domain: 'janestreet.com',
    about:
      'New York-founded proprietary trading firm trading its own capital globally. The software track builds the trading systems, tools and infrastructure the firm’s traders and researchers rely on, largely in OCaml.',
    sector: 'Prop trading',
    links: [{ label: 'Join Jane Street', url: 'https://www.janestreet.com/join-jane-street/' }],
  },
  'KLA-Tencor Software India Pvt Ltd': {
    domain: 'kla.com',
    about:
      'Makes process-control and yield-management equipment and software that semiconductor fabs use to inspect and measure chips during manufacturing, catching defects before they become failures.',
    sector: 'Semiconductors',
    links: [{ label: 'Careers', url: 'https://www.kla.com/careers' }],
  },
  LinkedIn: {
    domain: 'linkedin.com',
    about:
      'Microsoft-owned professional-networking platform used for job search, recruiting, and professional content — effectively the default resume/network layer of the working world.',
    sector: 'Big Tech',
    links: [{ label: 'Careers', url: 'https://careers.linkedin.com/' }],
  },
}
