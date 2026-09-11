import { StructuredDocument } from '../types';

export interface SampleDoc {
  id: string;
  name: string;
  category: string;
  description: string;
  pages: number;
  data: StructuredDocument;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'financial-report',
    name: 'Quarterly Financial & Performance Report.pdf',
    category: 'Business & Finance',
    description: 'Executive overview with performance metrics, multi-column tables, and strategic milestones.',
    pages: 2,
    data: {
      title: 'Global Dynamics Corp - Q3 Performance Report',
      subtitle: 'Prepared for the Board of Directors | October 2026',
      author: 'Financial Operations Team',
      metadata: {
        estimatedPages: 2,
        wordCount: 420,
        headingCount: 4,
        tableCount: 1,
        sourceFilename: 'Quarterly Financial & Performance Report.pdf',
      },
      elements: [
        {
          type: 'heading',
          level: 1,
          text: 'Executive Summary',
        },
        {
          type: 'paragraph',
          runs: [
            { text: 'During the third quarter, the enterprise registered ' },
            { text: 'record revenue growth of 24.8% YoY', bold: true },
            { text: ', outperforming consensus projections across key business units. Our digital transformation initiatives and streamlined operational workflows directly contributed to an expanded gross margin of ' },
            { text: '68.4%', bold: true, italic: true },
            { text: ', up from 62.1% in the prior year period.' },
          ],
        },
        {
          type: 'callout',
          calloutType: 'info',
          title: 'Strategic Highlight: Cloud Migration Completed',
          runs: [
            { text: 'All legacy on-premise infrastructure has successfully migrated to automated serverless pipelines ahead of schedule, reducing annual hosting overhead by $1.4M.' },
          ],
        },
        {
          type: 'heading',
          level: 2,
          text: 'Key Financial Metrics & Comparative Breakdown',
        },
        {
          type: 'table',
          caption: 'Consolidated Financial Statements (in USD Millions)',
          headers: ['Metric', 'Q3 2025', 'Q3 2026', 'Variance (%)', 'Status'],
          rows: [
            {
              isHeader: true,
              cells: [
                { text: 'Metric', bold: true },
                { text: 'Q3 2025', bold: true, align: 'right' },
                { text: 'Q3 2026', bold: true, align: 'right' },
                { text: 'Variance (%)', bold: true, align: 'right' },
                { text: 'Status', bold: true, align: 'center' },
              ],
            },
            {
              cells: [
                { text: 'Total Net Revenue', bold: true },
                { text: '$142.5M', align: 'right' },
                { text: '$177.8M', align: 'right' },
                { text: '+24.8%', bold: true, align: 'right' },
                { text: 'Exceeded', align: 'center' },
              ],
            },
            {
              cells: [
                { text: 'Cost of Goods Sold (COGS)' },
                { text: '$54.0M', align: 'right' },
                { text: '$56.2M', align: 'right' },
                { text: '+4.1%', align: 'right' },
                { text: 'Optimized', align: 'center' },
              ],
            },
            {
              cells: [
                { text: 'Operating Income' },
                { text: '$38.2M', align: 'right' },
                { text: '$52.6M', align: 'right' },
                { text: '+37.7%', bold: true, align: 'right' },
                { text: 'Exceeded', align: 'center' },
              ],
            },
            {
              cells: [
                { text: 'Free Cash Flow (FCF)' },
                { text: '$28.9M', align: 'right' },
                { text: '$41.3M', align: 'right' },
                { text: '+42.9%', bold: true, align: 'right' },
                { text: 'Target Met', align: 'center' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          level: 2,
          text: 'Q4 Strategic Action Plan',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            {
              runs: [
                { text: 'Accelerate Enterprise Tier roll-out: ', bold: true },
                { text: 'Focus on APAC expansion with regional compliance certs.' },
              ],
            },
            {
              runs: [
                { text: 'R&D Innovation Roadmap: ', bold: true },
                { text: 'Deploy native AI automated document processing models into the core product suite.' },
              ],
            },
            {
              runs: [
                { text: 'Capital Efficiency: ', bold: true },
                { text: 'Maintain minimum 40% operating margin while funding key hiring initiatives.' },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'executive-resume',
    name: 'Sarah Jenkins - Senior Solutions Architect.pdf',
    category: 'Resumes & Profiles',
    description: 'Formatted professional curriculum vitae with skill badges, education history, and career track.',
    pages: 2,
    data: {
      title: 'Sarah Jenkins',
      subtitle: 'Senior Cloud Solutions Architect | San Francisco, CA | sarah.jenkins@example.com',
      author: 'Sarah Jenkins',
      metadata: {
        estimatedPages: 2,
        wordCount: 380,
        headingCount: 5,
        tableCount: 1,
        sourceFilename: 'Sarah Jenkins - Senior Solutions Architect.pdf',
      },
      elements: [
        {
          type: 'heading',
          level: 1,
          text: 'Professional Summary',
        },
        {
          type: 'paragraph',
          runs: [
            { text: 'Principal Architect with ' },
            { text: '12+ years of experience', bold: true },
            { text: ' engineering mission-critical, high-throughput distributed systems. Specialized in hybrid-cloud orchestrations, serverless microservices, and enterprise data governance pipelines serving over 50M+ active daily queries.' },
          ],
        },
        {
          type: 'heading',
          level: 1,
          text: 'Core Competencies',
        },
        {
          type: 'table',
          headers: ['Domain', 'Primary Technologies & Toolsets'],
          rows: [
            {
              isHeader: true,
              cells: [
                { text: 'Domain', bold: true },
                { text: 'Primary Technologies & Toolsets', bold: true },
              ],
            },
            {
              cells: [
                { text: 'Cloud & Infrastructure', bold: true },
                { text: 'Google Cloud Platform, AWS, Kubernetes (EKS/GKE), Terraform, Docker' },
              ],
            },
            {
              cells: [
                { text: 'Architecture & Design', bold: true },
                { text: 'Event-Driven Architectures, Domain-Driven Design, Zero-Trust Security' },
              ],
            },
            {
              cells: [
                { text: 'Languages & Frameworks', bold: true },
                { text: 'TypeScript, Go, Python, React, Node.js, PostgreSQL, Redis' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          level: 1,
          text: 'Professional Experience',
        },
        {
          type: 'heading',
          level: 2,
          text: 'Lead Architect - CloudScale Systems (2021 – Present)',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            {
              runs: [
                { text: 'Engineered unified multi-region disaster recovery architecture, cutting failover recovery time from 45 minutes to ' },
                { text: 'under 18 seconds (99.999% SLA)', bold: true },
                { text: '.' },
              ],
            },
            {
              runs: [
                { text: 'Directed engineering team of 18 senior engineers across 3 time zones; reduced infrastructure spend by $3.2M annually.' },
              ],
            },
            {
              runs: [
                { text: 'Published company-wide technical RFCs establishing zero-trust access control protocols across 400+ microservices.' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          level: 2,
          text: 'Senior Software Engineer - DataSphere Labs (2017 – 2021)',
        },
        {
          type: 'list',
          ordered: false,
          items: [
            {
              runs: [
                { text: 'Architected real-time streaming ingestion pipeline processing 2.5GB/sec using Apache Kafka and Go.' },
              ],
            },
            {
              runs: [
                { text: 'Mentored 12 junior developers into mid/senior engineering roles through rigorous pair-programming.' },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: 'master-services-agreement',
    name: 'Master Services Agreement - Standard.pdf',
    category: 'Legal & Contracts',
    description: 'Formal contract clauses, numbered legal provisions, liability caps, and signature schedules.',
    pages: 3,
    data: {
      title: 'MASTER SERVICES AGREEMENT',
      subtitle: 'Contract Reference: MSA-2026-0911 | Confidential & Proprietary',
      author: 'Legal Counsel',
      metadata: {
        estimatedPages: 3,
        wordCount: 510,
        headingCount: 4,
        tableCount: 1,
        sourceFilename: 'Master Services Agreement - Standard.pdf',
      },
      elements: [
        {
          type: 'paragraph',
          align: 'center',
          runs: [
            { text: 'This Master Services Agreement ("Agreement") is entered into as of the Effective Date by and between the Service Provider and the Client named in the Statement of Work.' },
          ],
        },
        {
          type: 'heading',
          level: 1,
          text: '1. Services & Statements of Work',
        },
        {
          type: 'paragraph',
          runs: [
            { text: '1.1 Provision of Services. ', bold: true },
            { text: 'Provider agrees to perform the professional services, engineering deliverables, and technical support specified in each mutually executed Statement of Work ("SOW"). Each SOW shall be subject to the terms and conditions outlined herein.' },
          ],
        },
        {
          type: 'paragraph',
          runs: [
            { text: '1.2 Standard of Performance. ', bold: true },
            { text: 'Provider shall render all Services in a diligent, professional manner conforming to recognized commercial and industry standards.' },
          ],
        },
        {
          type: 'heading',
          level: 1,
          text: '2. Fees, Invoicing & Payment Terms',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            {
              runs: [
                { text: 'All undisputed invoices shall be payable within thirty (30) calendar days from receipt.' },
              ],
            },
            {
              runs: [
                { text: 'Late payments shall accrue interest at a rate of 1.0% per month or the statutory maximum, whichever is lower.' },
              ],
            },
            {
              runs: [
                { text: 'Taxes, duties, and government levies applicable to the services are the responsibility of Client.' },
              ],
            },
          ],
        },
        {
          type: 'heading',
          level: 1,
          text: '3. Limitation of Liability & Indemnification',
        },
        {
          type: 'callout',
          calloutType: 'warning',
          title: 'Section 3.1: Mutual Liability Cap',
          runs: [
            { text: 'NEITHER PARTY SHALL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES. THE TOTAL AGGREGATE LIABILITY OF EITHER PARTY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL BE STRICTLY LIMITED TO THE FEES PAID BY CLIENT UNDER THE APPLICABLE SOW IN THE PRECEDING TWELVE (12) MONTHS.' },
          ],
        },
        {
          type: 'heading',
          level: 1,
          text: '4. Signatures & Authorized Representatives',
        },
        {
          type: 'table',
          headers: ['Party', 'Authorized Representative', 'Title', 'Signature & Date'],
          rows: [
            {
              isHeader: true,
              cells: [
                { text: 'Party', bold: true },
                { text: 'Authorized Representative', bold: true },
                { text: 'Title', bold: true },
                { text: 'Signature & Date', bold: true },
              ],
            },
            {
              cells: [
                { text: 'Service Provider', bold: true },
                { text: 'Alexander Vance' },
                { text: 'Managing Director' },
                { text: '__________________ / Oct 1, 2026' },
              ],
            },
            {
              cells: [
                { text: 'Client Corp', bold: true },
                { text: 'Elena Rostova' },
                { text: 'VP of Technology' },
                { text: '__________________ / Oct 1, 2026' },
              ],
            },
          ],
        },
      ],
    },
  },
];
