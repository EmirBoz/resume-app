import { ResumeData } from '../models/resume.interface';

export const RESUME_DATA: ResumeData = {
  name: 'Emir Boz',
  initials: 'EB',
  location: 'İstanbul, Turkey',
  locationLink: 'https://www.google.com/maps/place/İstanbul',
  about: 'Detail-oriented Full Stack Engineer\ndedicated to building high-quality products.',
  summary:
    'As a passionate Frontend Developer with 3 years of experience, I specialize in building scalable, efficient, and user-friendly web applications.\n\nMy expertise lies in TypeScript, Angular, React,\nand I am also expanding my backend knowledge with Java Spring Boot,\nNodejs to become a more versatile developer.',
  avatarUrl: '/profile.jpeg',
  personalWebsiteUrl: 'null',
  contact: {
    email: 'emirrbozz@gmail.com',
    tel: '+90 505 411 14 80',
    social: [
      {
        name: 'GitHub',
        url: 'https://github.com/EmirBoz',
        icon: 'github',
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/emir-boz/',
        icon: 'linkedin',
      },
    ],
  },
  education: [
    {
      school: 'Gebze Technical University',
      degree: "Bachelor's Degree in Electronics Engineering",
      start: '',
      end: '',
    },
  ],
  work: [
    {
      company: 'Vodafone via Pia',
      link: 'https://vodafone.com.tr',
      badges: ['Hybrid', 'Angular', 'Angular Material', 'TypeScript', 'Agile'],
      title: 'Software Developer | Vodafone Next',
      start: '2022/03',
      end: null,
      description:
        'As a Frontend Developer, I contributed to Vodafone Next, a project that enables customers to manage their internet service products, ' +
        'including purchasing, cancellation, transfer, and package changes. ' +
        'These processes are orchestrated using Camunda and other workflow tools. ' +
        'I worked on multiple integrated platforms within the project:\n' +
        '- Contact Center: Customer search, personal details, product management, and service operations.\n' +
        '- Omni-Channel: Product recommendations, dynamic cart management, order review, and checkout flows.\n' +
        '- BackOffice: Order tracking and workflow management for post-sale processes.\n' +
        '- Product Catalog: Product definitions, configurations, and catalog management.\n' +
        '- Partner Portal: Order details, billing information, and customer insights with advanced filtering options.',
    },
    {
      company: 'Turk Telecom',
      link: 'https://www.turktelekom.com.tr',
      badges: ['On Site', 'C/C++'],
      title: 'Intern Engineer',
      start: '2019/06',
      end: '2019/09',
      description:
        'I completed an internship in the Network Management Systems department at Türk Telekom. During this period, ' +
        'I gained fundamental knowledge of network management and infrastructure. ' +
        'I worked with network simulation tools like Cisco Packet Tracer, gaining experience in building basic network topologies and configurations.',
    },
  ],
  skills: [
    'Angular/ Angular Material',
    'React/ Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Design Systems',
    'Node.js',
    'Git',
    'Jira',
    'Scss',
  ],
  projects: [
    {
      title: 'E-Commerce Platform',
      techStack: ['Angular', 'NestJS', 'PostgreSQL', 'Stripe', 'Docker'],
      description:
        'Full-featured e-commerce platform\nwith payment integration, inventory management,\nand admin dashboard.\nBuilt with modern technologies and best practices.',
      link: {
        label: 'ecommerce-demo.com',
        href: 'https://ecommerce-demo.com/',
      },
    },
    {
      title: 'Task Management App',
      techStack: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Tailwind CSS'],
      description:
        'Real-time collaborative task management application\nwith drag-and-drop functionality,\nteam collaboration features, and responsive design.',
      link: {
        label: 'taskmanager-app.com',
        href: 'https://taskmanager-app.com/',
      },
    },
    {
      title: 'Weather Dashboard',
      techStack: ['Vue.js', 'TypeScript', 'Chart.js', 'OpenWeather API'],
      description:
        'Interactive weather dashboard\nwith detailed forecasts, historical data visualization,\nand location-based weather tracking.',
      link: {
        label: 'weather-dashboard.dev',
        href: 'https://weather-dashboard.dev/',
      },
    },
    {
      title: 'Weather Dashboard',
      techStack: ['Vue.js', 'TypeScript', 'Chart.js', 'OpenWeather API'],
      description:
          'Interactive weather dashboard\nwith detailed forecasts, historical data visualization,\nand location-based weather tracking.',
      link: {
        label: 'weather-dashboard.dev',
        href: 'https://weather-dashboard.dev/',
      },
    },
    {
      title: 'Weather Dashboard',
      techStack: ['Vue.js', 'TypeScript', 'Chart.js', 'OpenWeather API'],
      description:
          'Interactive weather dashboard\nwith detailed forecasts, historical data visualization,\nand location-based weather tracking.',
      link: {
        label: 'weather-dashboard.dev',
        href: 'https://weather-dashboard.dev/',
      },
    },
    {
      title: 'Weather Dashboard',
      techStack: ['Vue.js', 'TypeScript', 'Chart.js', 'OpenWeather API'],
      description:
          'Interactive weather dashboard\nwith detailed forecasts, historical data visualization,\nand location-based weather tracking.',
      link: {
        label: 'weather-dashboard.dev',
        href: 'https://weather-dashboard.dev/',
      },
    },
  ],
} as const;
