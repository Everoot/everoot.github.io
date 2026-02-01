import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects',
  imports: [CommonModule],
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class ProjectsComponent {
  projects = [
    {
      name: 'Agent Experience Platform',
      company: 'Comcast',
      technologies: ['Angular 16', 'Spring Boot', 'GraphQL-DGS', 'Kafka'],
      description: 'Data-intensive platform integrating billing, order, and device workflows used by 10,000+ agents, processing millions of monthly transactions.',
      impact: [
        'Improved sprint throughput by 23%',
        'Reduced rollover by 18%',
        '20% faster peak response times',
        '30-40% reduction in P1/P2 incident resolution time'
      ]
    },
    {
      name: 'Oculomics AI Platform',
      company: 'UT Southwestern / SMU',
      technologies: ['React', 'Python', 'ECharts', 'Flask'],
      description: 'Clinical AI research platform supporting ophthalmology studies with dataset visualization, experiment tracking, and real-time result inspection.',
      impact: [
        'Paper submitted to IEEE TMI',
        'Dataset visualization tools',
        'Experiment tracking system'
      ]
    },
    {
      name: 'Housing Management System',
      company: 'Beaconfire',
      technologies: ['React', 'TypeScript', 'Spring Boot', 'Spring Cloud'],
      description: 'Employee onboarding platform module with structured, data-driven workflows for housing management.',
      impact: [
        '90%+ code coverage',
        '30% reduction in QA-reported defects',
        '200+ internal users supported'
      ]
    },
    {
      name: 'Real-time Analytics Dashboard',
      company: 'Comcast',
      technologies: ['Angular', 'RxJS', 'WebSocket', 'Node.js', 'PostgreSQL'],
      description: 'Real-time monitoring dashboard for system performance metrics, providing live updates and historical trend analysis for operations team.',
      impact: [
        'Real-time data updates with <100ms latency',
        '50% reduction in incident detection time',
        'Supporting 500+ concurrent users',
        'Customizable alerting system'
      ]
    },
    {
      name: 'Microservices Orchestration Framework',
      company: 'Comcast',
      technologies: ['Spring Boot', 'Kubernetes', 'Docker', 'GraphQL', 'Redis'],
      description: 'Distributed system framework for managing microservices communication, service discovery, and load balancing across multiple data centers.',
      impact: [
        '99.9% uptime achieved',
        '40% reduction in service latency',
        'Automated failover and recovery',
        'Supporting 50+ microservices'
      ]
    },
    {
      name: 'Medical Image Analysis Pipeline',
      company: 'UT Southwestern / SMU',
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'NumPy', 'OpenCV'],
      description: 'Deep learning pipeline for automated analysis of medical imaging data, including preprocessing, feature extraction, and classification models.',
      impact: [
        '95% accuracy in image classification',
        'Processing 10,000+ images per day',
        'Research paper in preparation',
        'Integration with hospital PACS system'
      ]
    },
    {
      name: 'API Gateway & Rate Limiting Service',
      company: 'Comcast',
      technologies: ['Spring Cloud Gateway', 'Redis', 'Kafka', 'AWS'],
      description: 'Centralized API gateway with intelligent rate limiting, request routing, and authentication for internal microservices ecosystem.',
      impact: [
        'Handling 1M+ requests per day',
        '99.5% request success rate',
        'Dynamic rate limiting based on load',
        'Reduced API abuse by 60%'
      ]
    },
    {
      name: 'Data Pipeline for Customer Insights',
      company: 'Comcast',
      technologies: ['Kafka', 'Spark', 'PostgreSQL', 'Python', 'AWS S3'],
      description: 'ETL pipeline processing customer behavior data from multiple sources, enabling real-time analytics and personalized recommendations.',
      impact: [
        'Processing 100M+ records daily',
        'Real-time data availability',
        '30% improvement in recommendation accuracy',
        'Reduced data processing time by 50%'
      ]
    },
    {
      name: 'Automated Testing Framework',
      company: 'Beaconfire',
      technologies: ['Java', 'Selenium', 'JUnit', 'Jenkins', 'Docker'],
      description: 'Comprehensive testing framework with automated UI, API, and integration tests, integrated into CI/CD pipeline for continuous quality assurance.',
      impact: [
        '80% test automation coverage',
        'Reduced manual testing time by 70%',
        'Early bug detection in development cycle',
        'Zero production defects in last 6 months'
      ]
    },
    {
      name: 'Distributed Task Scheduler',
      company: 'Personal Project',
      technologies: ['Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Docker'],
      description: 'Scalable distributed task scheduling system with priority queues, retry mechanisms, and job monitoring dashboard for background job processing.',
      impact: [
        'Supporting 10,000+ scheduled tasks',
        '99.9% task execution reliability',
        'Horizontal scaling capability',
        'Open-source contribution'
      ]
    }
  ];
}
