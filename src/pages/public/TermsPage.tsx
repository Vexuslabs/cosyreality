import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { FileText } from 'lucide-react';
import { useDocumentTitle } from '../../utils/seo';

export const TermsPage: React.FC = () => {
  useDocumentTitle('Terms & Conditions — Cosy Reality');

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 sm:py-20">
      <Container size="md">
        <SectionHeading
          badge="Legal Framework"
          title="Terms & Conditions"
          subtitle="Terms governing the use of the Cosy Reality website and property advisory services."
          align="left"
        />

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#CCA02E] uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#103858]" />
            <span>Updated 2026 | Cosy Reality</span>
          </div>

          <h3 className="text-lg font-bold text-[#103858] pt-2">1. Acceptance of Terms</h3>
          <p>
            By accessing or using the website of Cosy Reality, you agree to comply with and be bound by these Terms and Conditions.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">2. Property Information & Availability</h3>
          <p>
            While every effort is made to maintain real-time accuracy in our live inventory matrix, property availability and unit rates are subject to change until formal token confirmation and signed allotment agreements are executed.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">3. Site Visit Facility</h3>
          <p>
            On-ground site visit coordination is arranged subject to scheduling slot availability and prior confirmation with our property advisory desk.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">4. Intellectual Property</h3>
          <p>
            The branding, logos, layout plans, photographic assets, and content on this portal are the intellectual property of Cosy Reality and may not be reproduced without written authorization.
          </p>
        </div>
      </Container>
    </div>
  );
};
