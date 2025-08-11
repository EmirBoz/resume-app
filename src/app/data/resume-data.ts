import { ResumeData } from '../models/resume.interface';

export const RESUME_DATA: ResumeData = {
  name: 'Emir Boz',
  initials: 'EB',
  location: 'İstanbul, Turkey, GMT+3',
  locationLink: 'https://www.google.com/maps/place/İstanbul',
  about: 'Full Stack Developer passionate about creating innovative solutions.',
  summary: 'Experienced Full Stack Developer specializing in modern web technologies, scalable applications, and user-centered design. Passionate about clean code, performance optimization, and continuous learning.',
  avatarUrl: '/profile.jpeg',
  personalWebsiteUrl: 'https://emirboz.dev',
  contact: {
    email: 'emir@example.com',
    tel: '+90555123456',
    social: [
      {
        name: 'GitHub',
        url: 'https://github.com/emirboz',
        icon: 'github',
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/emirboz/',
        icon: 'linkedin',
      },
      {
        name: 'X',
        url: 'https://x.com/emirboz',
        icon: 'x',
      },
    ],
  },
  education: [
    {
      school: 'İstanbul Technical University',
      degree: 'Bachelor\'s Degree in Computer Engineering',
      start: '2018',
      end: '2022',
    },
  ],
  work: [
    {
      company: 'Tech Startup',
      link: 'https://techstartup.com/',
      badges: ['Remote', 'Angular', 'Node.js', 'TypeScript', 'MongoDB'],
      title: 'Senior Full Stack Developer',
      start: '2023',
      end: null,
      description: 'Leading development of modern web applications using Angular and Node.js. Responsible for architecture decisions, code reviews, and mentoring junior developers.',
    },
    {
      company: 'Digital Agency',
      link: 'https://digitalagency.com',
      badges: ['Hybrid', 'React', 'Next.js', 'TypeScript', 'PostgreSQL'],
      title: 'Full Stack Developer',
      start: '2022',
      end: '2023',
      description: 'Developed and maintained multiple client projects using React and Next.js. Implemented responsive designs, optimized performance, and integrated third-party APIs.',
    },
    {
      company: 'Software Company',
      link: 'https://softwarecompany.com',
      badges: ['On Site', 'Vue.js', 'Laravel', 'PHP', 'MySQL'],
      title: 'Frontend Developer',
      start: '2021',
      end: '2022',
      description: 'Built interactive user interfaces using Vue.js and collaborated with backend team for API integration. Focused on user experience and performance optimization.',
    },
  ],
  skills: [
    'Angular',
    'React',
    'Vue.js',
    'TypeScript',
    'JavaScript',
    'Node.js',
    'Express.js',
    'NestJS',
    'MongoDB',
    'PostgreSQL',
    'Tailwind CSS',
    'SCSS',
    'Git',
    'Docker',
    'AWS',
  ],
  projects: [
    {
      title: 'E-Commerce Platform',
      techStack: ['Angular', 'NestJS', 'PostgreSQL', 'Stripe', 'Docker'],
      description: 'Full-featured e-commerce platform with payment integration, inventory management, and admin dashboard. Built with modern technologies and best practices.',
      link: {
        label: 'ecommerce-demo.com',
        href: 'https://ecommerce-demo.com/',
      },
    },
    {
      title: 'Task Management App',
      techStack: ['React', 'Node.js', 'MongoDB', 'Socket.io', 'Tailwind CSS'],
      description: 'Real-time collaborative task management application with drag-and-drop functionality, team collaboration features, and responsive design.',
      link: {
        label: 'taskmanager-app.com',
        href: 'https://taskmanager-app.com/',
      },
    },
    {
      title: 'Weather Dashboard',
      techStack: ['Vue.js', 'TypeScript', 'Chart.js', 'OpenWeather API'],
      description: 'Interactive weather dashboard with detailed forecasts, historical data visualization, and location-based weather tracking.',
      link: {
        label: 'weather-dashboard.dev',
        href: 'https://weather-dashboard.dev/',
      },
    },
  ],
} as const;