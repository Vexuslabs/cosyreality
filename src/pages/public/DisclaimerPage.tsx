import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { AlertCircle } from 'lucide-react';
import { useDocumentTitle } from '../../utils/seo';

export const DisclaimerPage: React.FC = () => {
  useDocumentTitle('Disclaimer & Regulatory Disclosures — Cosy Reality');

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 sm:py-20">
      <Container size="md">
        <SectionHeading
          badge="Regulatory Disclosure"
          title="Disclaimer & RERA Disclosures"
          subtitle="Statutory compliance notices and real estate disclosures."
          align="left"
        />

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Important Statutory Real Estate Notice</span>
          </div>

          <h3 className="text-lg font-bold text-[#103858] pt-2">1. General Information</h3>
          <p>
            The contents, architectural renders, floor plans, dimensions, and specifications displayed on this website are conceptual in nature and intended for informational purposes. They do not constitute an offer of sale or guarantee of any specific ROI.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">2. RERA Compliance</h3>
          <p>
            Projects listed on this portal comply with applicable Real Estate (Regulation and Development) Act (RERA) mandates. RERA registration numbers are explicitly indicated on the respective project detail pages where applicable.
          </p>

          <h3 className="text-lg font-bold text-[#103858] pt-2">3. Price Subject to Verification</h3>
          <p>
            Property rates, PLC charges, and government taxes (GST, stamp duty, registry fees) are subject to actual statutory rates prevailing at the date of execution. Prospective buyers are advised to independently verify all documentation.
          </p>
        </div>
      </Container>
    </div>
  );
};
