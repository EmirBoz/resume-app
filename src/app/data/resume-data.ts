import { ResumeData } from '../models/resume.interface';

export const RESUME_DATA: ResumeData = {
  name: 'Emir Boz',
  initials: 'EB',
  location: 'İstanbul, Turkey',
  locationLink: 'https://www.google.com/maps/place/İstanbul',
  about: 'A proactive Frontend Developer with 3+ years of experience in building scalable and user-friendly web applications. Passionate about continuous learning and exploring modern technologies to deliver high-quality solutions.',
  summary:
    'I specialize in creating scalable and user-friendly applications using TypeScript and Angular. While my primary focus is frontend, I continuously explore other technologies such as React, Java Spring Boot, and .NET to become a more versatile engineer. I am passionate about solving complex challenges and contributing to impactful projects.',
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
      badges: ['Hybrid', 'Agile', 'Angular', 'Angular Material', 'TypeScript'],
      title: 'Software Developer | Vodafone Next',
      start: '2022/03',
      end: null,
      description:
        'Contributed as a Frontend Developer to Vodafone Next, a large-scale customer and sales management platform built on Dnext, a microservice-based digital interaction framework. ' +
        'The platform is used by Vodafone’s sales representatives and customer agents to manage internet services, corporate solutions, and cloud-based products for both individual and enterprise customers.\n' +
        '\n- Worked across multiple integrated modules including CRM, OmniChannel, BackOffice, Product Catalog, Partner Portal, and Common libraries, contributing to both new feature development and production defect resolution.' +
        '\n- Developed and optimized customer lifecycle management flows (creation, search, updates, transfers, cancellations, package migrations, and add-on products) in the CRM module.' +
        '\n- Enhanced the OmniChannel checkout and order orchestration system, implementing dynamic rendering of product characteristics, conditional validations, and step-based workflows integrated with Camunda BPM.' +
        '\n- Contributed to the Product Catalog by building configuration rule management, package change workflows, and document validation rules, enabling flexible and scalable product definitions.' +
        '\n- Delivered improvements in the BackOffice module, including dashboards and job management features for order tracking and workflow visibility.' +
        '\n- Implemented role-based access control using Keycloak, ensuring secure and compliant user authorization across the platform.' +
        '\n- Collaborated with senior developers in an Agile environment, initially supporting the Defect Team to gain cross-platform knowledge, later transitioning into feature delivery teams to implement end-to-end solutions.\n' +
        '\nTechnologies: Angular, TypeScript, Angular Material, RxJS, Keycloak, Camunda, REST APIs, Microservice architecture\n' +
        '\nImpact:\n' +
        '- Improved customer service efficiency by enhancing order tracking and product operation flows.\n' +
        '- Reduced operational errors by implementing dynamic validation and condition-based rendering for product configurations.\n' +
        '- Contributed to the platform’s scalability and adaptability, supporting Vodafone’s transition to a next-generation digital customer management ecosystem.',
    },
    {
      company: 'Turk Telecom',
      link: 'https://www.turktelekom.com.tr',
      badges: ['On Site', 'C/C++'],
      title: 'Intern Engineer',
      start: '2019/06',
      end: '2019/09',
      description:
        'Completed an internship in the Network Management Systems department at Türk Telekom, gaining practical exposure to large-scale telecommunication infrastructure and operations.\n' +
        '\n- Assisted in monitoring and analyzing network performance metrics, learning the fundamentals of fault detection and service continuity.\n' +
        '- Worked with simulation tools such as Cisco Packet Tracer to design and configure basic network topologies.\n' +
        '- Observed real-world implementations of network management platforms, gaining insight into enterprise-scale system reliability and scalability.\n' +
        '- Collaborated with engineers to document processes and enhance understanding of telecom-grade network architectures.\n' +
        '\nImpact:\n' +
        '- Built a strong foundation in networking concepts, which later supported my transition into software development.\n' +
        '- Developed problem-solving and analytical skills through hands-on exposure to real network environments and scenarios.',

    },
  ],
  skills: [
    // Frontend
    'Angular / Angular Material',
    'React / Next.js',
    'TypeScript',
    'JavaScript (ES6+)',
    'HTML5 / CSS3 / SCSS',
    'Tailwind CSS',
    'Design Systems',

    // Backend & Databases
    'Node.js (learning)',
    'Java Spring Boot (learning)',
    '.NET (learning)',
    'PostgreSQL',
    'MongoDB',

    // Tools & Practices
    'Git / GitHub / Bitbucket',
    'Jira / Agile Methodologies',
    'RESTful APIs',
    'CI/CD basics'
  ],

  projects: [
    {
      title: 'CV/Resume Web Application',
      techStack: [
        'Angular 20',
        'Tailwind CSS',
        'SCSS',
        'Angular Signals',
        'GraphQL (Apollo Client)',
        'jsPDF',
        'html2canvas'
      ],
      description:
        'A minimalist, print-friendly single-page CV/Resume app built with Angular 20. Features include dynamic data with GraphQL, PDF export, a custom UI component library for consistent design, and a comprehensive admin panel for real-time content management. The application provides secure authentication for administrators to update personal information, work experience, education, skills, and projects without requiring code changes.',
      link: {
        label: 'GitHub Repository',
        href: 'https://github.com/EmirBoz/resume-app'
      }
    },
    {
      title: 'LiftTracker - Fitness Tracking Mobile Application',
      techStack: [
        'React Native',
        'TypeScript',
        'Redux Toolkit',
        'React Navigation v7',
        'React Native Paper (Material Design 3)',
        'ASP.NET Core 9',
        'PostgreSQL',
        'Entity Framework Core',
        'JWT Authentication',
        'BCrypt',
        'React Native Chart Kit',
        'i18next',
        'Linear Gradients'
      ],
      description:
          'A cross-platform mobile fitness application built with React Native and ASP.NET Core. ' +
          'Features multi-day workout program creation, real-time exercise tracking with set/rep logging, and comprehensive performance analytics including personal record tracking and trend analysis. ' +
          'The application includes secure JWT authentication, PostgreSQL database with complex relational design, and modern Material Design 3 UI with dark theme support and multi-language localization.',
      link: {
        label: 'GitHub Repository',
        href: 'https://github.com/EmirBoz/LiftTracker-app'
      }
    }
  ],
} as const;
