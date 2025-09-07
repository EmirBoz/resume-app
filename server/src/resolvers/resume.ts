import { ResumeDataModel } from '../models/ResumeData';
import { requireAuth } from '../utils/auth';
import { Context, PersonalInfoInput, WorkExperienceInput, EducationInput, ProjectInput, SocialLinkInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

const defaultResumeData = {
    personalInfo: {
        name: 'Emir Boz',
        initials: 'EB',
        location: 'İstanbul, Turkey',
        locationLink: 'https://www.google.com/maps/place/İstanbul',
        about: 'A proactive Frontend Developer with 3+ years of experience in building scalable and user-friendly web applications. Passionate about continuous learning and exploring modern technologies to deliver high-quality solutions.',
        summary: 'I specialize in creating scalable and user-friendly applications using TypeScript and Angular. While my primary focus is frontend, I continuously explore other technologies such as React, Java Spring Boot, and .NET to become a more versatile engineer. I am passionate about solving complex challenges and contributing to impactful projects.',
        avatarUrl: '/profile.jpeg',
        personalWebsiteUrl: 'null',
        email: 'emirrbozz@gmail.com',
        tel: '+90 505 411 14 80',
    },
    work: [
        {
            id: '1',
            company: 'Vodafone via Pia',
            link: 'https://vodafone.com.tr',
            badges: ['Hybrid', 'Agile', 'Angular', 'Angular Material', 'TypeScript'],
            title: 'Software Developer | Vodafone Next',
            start: '2022/03',
            end: null,
            description: 'Contributed as a Frontend Developer to Vodafone Next, a large-scale customer and sales management platform built on Dnext, a microservice-based digital interaction framework. ' +
                'The platform is used by Vodafone\'s sales representatives and customer agents to manage internet services, corporate solutions, and cloud-based products for both individual and enterprise customers.\n' +
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
                '- Contributed to the platform\'s scalability and adaptability, supporting Vodafone\'s transition to a next-generation digital customer management ecosystem.',
        },
        {
            id: '2',
            company: 'Turk Telecom',
            link: 'https://www.turktelekom.com.tr',
            badges: ['On Site', 'C/C++'],
            title: 'Intern Engineer',
            start: '2019/06',
            end: '2019/09',
            description: 'Completed an internship in the Network Management Systems department at Türk Telekom, gaining practical exposure to large-scale telecommunication infrastructure and operations.\n' +
                '\n- Assisted in monitoring and analyzing network performance metrics, learning the fundamentals of fault detection and service continuity.\n' +
                '- Worked with simulation tools such as Cisco Packet Tracer to design and configure basic network topologies.\n' +
                '- Observed real-world implementations of network management platforms, gaining insight into enterprise-scale system reliability and scalability.\n' +
                '- Collaborated with engineers to document processes and enhance understanding of telecom-grade network architectures.\n' +
                '\nImpact:\n' +
                '- Built a strong foundation in networking concepts, which later supported my transition into software development.\n' +
                '- Developed problem-solving and analytical skills through hands-on exposure to real network environments and scenarios.',
        },
    ],
    education: [
        {
            id: '1',
            school: 'Gebze Technical University',
            degree: "Bachelor's Degree in Electronics Engineering",
            start: null,
            end: null,
        },
    ],
    skills: [
        'Angular / Angular Material',
        'React / Next.js',
        'TypeScript',
        'JavaScript (ES6+)',
        'HTML5 / CSS3 / SCSS',
        'Tailwind CSS',
        'Design Systems',
        'Node.js (learning)',
        'Java Spring Boot (learning)',
        '.NET (learning)',
        'PostgreSQL',
        'MongoDB',
        'Git / GitHub / Bitbucket',
        'Jira / Agile Methodologies',
        'RESTful APIs',
        'CI/CD basics'
    ],
    projects: [
        {
            id: '1',
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
            description: 'A minimalist, print-friendly single-page CV/Resume app built with Angular 20.\n' +
                'Features include dynamic data with GraphQL, PDF export, and a custom UI component library for consistent design.',
            link: {
                label: 'GitHub Repository',
                href: 'https://github.com/EmirBoz',
            },
        },
    ],
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
};

export const resumeResolvers = {
    Query: {
        getResumeData: async (_: any, __: any, context: Context) => {
            try {
                // Public endpoint - no authentication required
                // Try to get resume data, if none exists, create default data
                let resumeData = await ResumeDataModel.findOne({});

                // If no resume data exists, create default data
                if (!resumeData) {
                    console.log('No resume data found, creating new data with about:', defaultResumeData.personalInfo.about);
                    // Create a default ObjectId for public data
                    const mongoose = require('mongoose');
                    const defaultUserId = new mongoose.Types.ObjectId();

                    resumeData = new ResumeDataModel({
                        userId: defaultUserId,
                        ...defaultResumeData,
                    });
                    await resumeData.save();
                    console.log('New resume data created successfully');
                } else {
                    console.log('Existing resume data found with about:', resumeData.personalInfo.about);
                }

                return {
                    id: (resumeData._id as any).toString(),
                    userId: (resumeData.userId as any).toString(),
                    personalInfo: resumeData.personalInfo,
                    work: resumeData.work,
                    education: resumeData.education,
                    skills: resumeData.skills,
                    projects: resumeData.projects,
                    social: resumeData.social,
                    createdAt: resumeData.createdAt.toISOString(),
                    updatedAt: resumeData.updatedAt.toISOString(),
                };
            } catch (error) {
                console.error('Error in getResumeData:', error);
                throw new Error('Failed to fetch resume data');
            }
        },
    },

    Mutation: {
        updatePersonalInfo: async (_: any, { input }: { input: PersonalInfoInput }, context: Context) => {
            const user = requireAuth(context);

            try {
                // First try to find user's resume data
                let resumeData = await ResumeDataModel.findOne({ userId: user.id });
                
                // If user doesn't have resume data, find the existing default one and assign to user
                if (!resumeData) {
                    resumeData = await ResumeDataModel.findOne({});
                    if (resumeData) {
                        // Assign the existing resume to the authenticated user
                        resumeData.userId = user.id as any;
                        console.log('Assigned existing resume data to user:', user.id);
                    } else {
                        throw new Error('No resume data found to update');
                    }
                }

                // Update personal info
                resumeData.personalInfo = { ...resumeData.personalInfo, ...input };
                await resumeData.save();

                console.log('Personal info updated successfully for user:', user.id);
                return resumeData.personalInfo;
            } catch (error) {
                console.error('Error updating personal info:', error);
                throw new Error('Failed to update personal info');
            }
        },

        updateWorkExperience: async (_: any, { input }: { input: WorkExperienceInput[] }, context: Context) => {
            const user = requireAuth(context);

            try {
                // First try to find user's resume data
                let resumeData = await ResumeDataModel.findOne({ userId: user.id });
                
                // If user doesn't have resume data, find the existing default one and assign to user
                if (!resumeData) {
                    resumeData = await ResumeDataModel.findOne({});
                    if (resumeData) {
                        resumeData.userId = user.id as any;
                        console.log('Assigned existing resume data to user for work update:', user.id);
                    } else {
                        throw new Error('No resume data found to update');
                    }
                }

                // Add IDs to new work experiences
                const workWithIds = input.map(work => ({
                    ...work,
                    id: work.id || uuidv4(),
                }));

                resumeData.work = workWithIds;
                await resumeData.save();

                return resumeData.work;
            } catch (error) {
                console.error('Error updating work experience:', error);
                throw new Error('Failed to update work experience');
            }
        },

        updateEducation: async (_: any, { input }: { input: EducationInput[] }, context: Context) => {
            const user = requireAuth(context);

            try {
                // First try to find user's resume data
                let resumeData = await ResumeDataModel.findOne({ userId: user.id });
                
                // If user doesn't have resume data, find the existing default one and assign to user
                if (!resumeData) {
                    resumeData = await ResumeDataModel.findOne({});
                    if (resumeData) {
                        resumeData.userId = user.id as any;
                        console.log('Assigned existing resume data to user for education update:', user.id);
                    } else {
                        throw new Error('No resume data found to update');
                    }
                }

                const educationWithIds = input.map(edu => ({
                    ...edu,
                    id: edu.id || uuidv4(),
                }));

                resumeData.education = educationWithIds;
                await resumeData.save();

                return resumeData.education;
            } catch (error) {
                console.error('Error updating education:', error);
                throw new Error('Failed to update education');
            }
        },

        updateSkills: async (_: any, { input }: { input: string[] }, context: Context) => {
            const user = requireAuth(context);

            try {
                // First try to find user's resume data
                let resumeData = await ResumeDataModel.findOne({ userId: user.id });
                
                // If user doesn't have resume data, find the existing default one and assign to user
                if (!resumeData) {
                    resumeData = await ResumeDataModel.findOne({});
                    if (resumeData) {
                        resumeData.userId = user.id as any;
                        console.log('Assigned existing resume data to user for skills update:', user.id);
                    } else {
                        throw new Error('No resume data found to update');
                    }
                }

                resumeData.skills = input;
                await resumeData.save();

                return resumeData.skills;
            } catch (error) {
                console.error('Error updating skills:', error);
                throw new Error('Failed to update skills');
            }
        },

        updateProjects: async (_: any, { input }: { input: ProjectInput[] }, context: Context) => {
            const user = requireAuth(context);

            try {
                // First try to find user's resume data
                let resumeData = await ResumeDataModel.findOne({ userId: user.id });
                
                // If user doesn't have resume data, find the existing default one and assign to user
                if (!resumeData) {
                    resumeData = await ResumeDataModel.findOne({});
                    if (resumeData) {
                        resumeData.userId = user.id as any;
                        console.log('Assigned existing resume data to user for projects update:', user.id);
                    } else {
                        throw new Error('No resume data found to update');
                    }
                }

                const projectsWithIds = input.map(project => ({
                    ...project,
                    id: project.id || uuidv4(),
                }));

                resumeData.projects = projectsWithIds;
                await resumeData.save();

                return resumeData.projects;
            } catch (error) {
                console.error('Error updating projects:', error);
                throw new Error('Failed to update projects');
            }
        },

        updateSocialLinks: async (_: any, { input }: { input: SocialLinkInput[] }, context: Context) => {
            const user = requireAuth(context);

            try {
                // First try to find user's resume data
                let resumeData = await ResumeDataModel.findOne({ userId: user.id });
                
                // If user doesn't have resume data, find the existing default one and assign to user
                if (!resumeData) {
                    resumeData = await ResumeDataModel.findOne({});
                    if (resumeData) {
                        resumeData.userId = user.id as any;
                        console.log('Assigned existing resume data to user for social links update:', user.id);
                    } else {
                        throw new Error('No resume data found to update');
                    }
                }

                resumeData.social = input;
                await resumeData.save();

                return resumeData.social;
            } catch (error) {
                console.error('Error updating social links:', error);
                throw new Error('Failed to update social links');
            }
        },

        exportData: async (_: any, __: any, context: Context) => {
            const user = requireAuth(context);

            try {
                // First try to find user's resume data
                let resumeData = await ResumeDataModel.findOne({ userId: user.id });
                
                // If user doesn't have resume data, find the existing default one
                if (!resumeData) {
                    resumeData = await ResumeDataModel.findOne({});
                    if (!resumeData) {
                        throw new Error('No resume data found to export');
                    }
                }

                return JSON.stringify({
                    personalInfo: resumeData.personalInfo,
                    work: resumeData.work,
                    education: resumeData.education,
                    skills: resumeData.skills,
                    projects: resumeData.projects,
                    social: resumeData.social,
                    exportedAt: new Date().toISOString(),
                }, null, 2);
            } catch (error) {
                console.error('Error exporting data:', error);
                throw new Error('Failed to export data');
            }
        },

        importData: async (_: any, { data }: { data: string }, context: Context) => {
            const user = requireAuth(context);

            try {
                const importedData = JSON.parse(data);

                let resumeData = await ResumeDataModel.findOne({ userId: user.id });
                if (!resumeData) {
                    resumeData = new ResumeDataModel({ userId: user.id });
                }

                resumeData.personalInfo = importedData.personalInfo || resumeData.personalInfo;
                resumeData.work = importedData.work || resumeData.work;
                resumeData.education = importedData.education || resumeData.education;
                resumeData.skills = importedData.skills || resumeData.skills;
                resumeData.projects = importedData.projects || resumeData.projects;
                resumeData.social = importedData.social || resumeData.social;

                await resumeData.save();

                return {
                    id: (resumeData._id as any).toString(),
                    userId: (resumeData.userId as any).toString(),
                    personalInfo: resumeData.personalInfo,
                    work: resumeData.work,
                    education: resumeData.education,
                    skills: resumeData.skills,
                    projects: resumeData.projects,
                    social: resumeData.social,
                    createdAt: resumeData.createdAt.toISOString(),
                    updatedAt: resumeData.updatedAt.toISOString(),
                };
            } catch (error) {
                throw new Error('Failed to import data');
            }
        },
    },

    Subscription: {
        resumeDataUpdated: {
            // This would be implemented with a pub/sub system like Redis
            // For now, we'll leave it as a placeholder
            subscribe: () => {
                throw new Error('Subscriptions not implemented yet');
            },
        },
    },
};
