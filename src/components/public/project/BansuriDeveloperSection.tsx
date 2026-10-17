import React from 'react';
import { Building2, Layers, CheckCircle2, ShieldCheck, Briefcase } from 'lucide-react';

interface BansuriDeveloperSectionProps {
  developerInfo?: string;
  associatedProjects?: string[];
}

export const BansuriDeveloperSection: React.FC<BansuriDeveloperSectionProps> = ({
  developerInfo = 'The supplied project brochure presents Bansuri Dham under Radha Rani Residency Pvt. Ltd. / NCR Group branding.',
  associatedProjects = [
    'Sudha Enclave',
    'Shri Radha Rani Farms',
    'Dronagiri Apartments',
    'Shiv Shakti Vihar',
    'Shiv Shakti Vatika',
  ],
}) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-[11px] font-bold text-[#CCA02E] uppercase tracking-wider">
          Developer & Group Presentation
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[#103858] mt-0.5">
          Developer & Associated Projects
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Entity presentation and portfolio developments as listed in the project brochure.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-[#103858] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-[#103858]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#103858]">
              Radha Rani Residency Pvt. Ltd. / NCR Group
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              {developerInfo}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#103858]/5 text-[#103858] border border-[#103858]/10 whitespace-nowrap self-start sm:self-center">
          Brochure Disclosed
        </span>
      </div>

      {associatedProjects && associatedProjects.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-[#CCA02E]" />
            <h4 className="text-xs font-bold text-[#103858] uppercase tracking-wider">
              Associated & Previous Projects Portfolio
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {associatedProjects.map((proj, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-[#CCA02E]/60 transition-all text-center"
              >
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F3] text-[#103858] flex items-center justify-center mx-auto mb-2">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-[#103858] block leading-tight">
                  {proj}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Brochure Listed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
