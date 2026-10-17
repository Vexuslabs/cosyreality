import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { ShieldCheck } from 'lucide-react';
import { useDocumentTitle } from '../../utils/seo';

export const PrivacyPolicyPage: React.FC = () => {
  useDocumentTitle('Privacy Policy — Cosy Reality');

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 sm:py-20">
      <Container size="md">
        <SectionHeading
          badge="Compliance & Privacy"
          title="Privacy Policy"
          subtitle="How Cosy Reality handles and protects your personal and financial information."
          align="left"
        />

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#CCA02E] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
            <span>Effective Date: January 1, 2026 | Cosy Reality (15 Years Experience)</span>
          </div>

          <h3 className="text-lg font-bold text-[#103858] pt-2">1. Information We Collect</h3>
          <p>
            When you interact with Cosy Reality through our digital platforms, site visit bookings, or enquiry forms, we may collect information including your name, contact phone number, WhatsApp number, email address, property preferences, and budget.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">2. Use of Information</h3>
          <p>
            Your information is used strictly for facilitating property consultations, arranging verified site inspections, providing price updates, and processing transaction documentation. We do not sell or lease your personal data to third-party telemarketers.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">3. Data Security & Storage</h3>
          <p>
            All lead and customer records are stored securely with encrypted database protocols. Access is restricted to authorized relationship managers and sales administrators.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">4. Communications & Opt-Out</h3>
          <p>
            You may choose to opt out of WhatsApp or SMS updates at any time by replying with STOP or contacting our corporate desk.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">5. Contact Information</h3>
          <p>
            For any queries regarding this privacy statement, please contact info@cosyreality.com or visit our corporate office.
          </p>
        </div>
      </Container>
    </div>
  );
};
