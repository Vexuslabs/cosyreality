import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Award,
  Users,
  Target,
  Eye,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Button } from '../../components/ui/Button';
import { useDocumentTitle } from '../../utils/seo';

export const AboutPage: React.FC = () => {
  useDocumentTitle('About Us — 15 Years of Experience | Cosy Reality');

  const pillars = [
    {
      title: 'Residential Property',
      desc: 'High-end apartments, penthouses, and gated community villas designed for luxurious living.',
    },
    {
      title: 'Plotted Land Developments',
      desc: 'Freehold, clear-title residential and commercial plots in prime growth corridors.',
    },
    {
      title: 'Commercial Real Estate',
      desc: 'High-visibility retail hubs, office spaces, and SCO plots with high rental yield.',
    },
    {
      title: 'Construction Ecosystem',
      desc: 'Turnkey architectural planning, structural engineering, and end-to-end execution.',
    },
    {
      title: 'Property Advisory & Sales',
      desc: 'Objective investment guidance backed by 15 years of market intelligence.',
    },
    {
      title: 'Associate & Channel Network',
      desc: 'Empowering real estate professionals with transparent inventory and timely payouts.',
    },
  ];

  const milestones = [
    { year: '2011', title: 'Foundation', desc: 'Started operations with a commitment to bring transparency and professional ethics to the real estate sector.' },
    { year: '2015', title: 'Construction Ecosystem', desc: 'Expanded into direct turnkey construction, civil contracting, and plotted land development.' },
    { year: '2019', title: 'Township Expansion', desc: 'Delivered multiple flagship gated sectors with 100% clear titles and registry readiness.' },
    { year: '2026', title: '15 Years of Excellence', desc: 'Serving 1,200+ happy property owners with digital live inventory and verified real estate solutions.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] py-12 sm:py-20">
      <Container>
        {/* Header */}
        <SectionHeading
          badge="Our Heritage"
          title="15 Years of Trust, Craftsmanship & Excellence"
          subtitle="Cosy Reality was founded on a simple yet uncompromising philosophy: make property acquisition transparent, secure, and truly cosy for every homeowner and investor."
        />

        {/* Brand Story Hero Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-md mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCA02E]/15 border border-[#CCA02E]/30 text-[#103858] text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#CCA02E]" />
              <span>Reality But Make It Cosy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#103858] leading-tight">
              Transforming Real Estate From Transactional To Relational
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              With 15 years of ground experience spanning residential construction, plotted layout development, and commercial advisory, Cosy Reality is a recognized brand in North India’s real estate landscape.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              We bridge the gap between aspirational buyers and prime land by eliminating intermediaries, verifying legal titles at the root, and delivering turnkey infrastructural development with wide roads, electricity, and clean registry records.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/projects">
                <Button variant="primary" size="md">
                  Explore Developments
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="md">
                  Contact Our Leadership
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-[#FAF8F3]">
              <img
                src="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=1000&q=80"
                alt="Cosy Reality Construction and Architecture"
                referrerPolicy="no-referrer"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#103858]/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs font-bold text-[#CCA02E]">Uncompromising Quality</p>
                <p className="text-sm font-semibold">15 Years in Construction & Land Development</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Vision */}
          <div className="bg-[#103858] text-white rounded-3xl p-8 border border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#CCA02E] text-[#103858] flex items-center justify-center font-black shadow-md">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Our Vision</h3>
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                To build long-term relationships through trust, quality, and complete transparency — becoming the most trusted and customer-centric real estate and construction brand in the region.
              </p>
            </div>
            <div className="pt-6 border-t border-white/10 mt-6 text-xs text-[#CCA02E] font-semibold uppercase tracking-wider">
              Long-Term Relationships • Value Creation
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white text-slate-800 rounded-3xl p-8 border border-slate-200/80 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] text-[#103858] border border-slate-200 flex items-center justify-center font-black">
                <Target className="w-6 h-6 text-[#103858]" />
              </div>
              <h3 className="text-2xl font-bold text-[#103858]">Our Mission</h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                To simplify property acquisition for end-users and investors by providing clear-title freehold inventory, transparent price matrices, end-to-end registry facilitation, and reliable on-time construction.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-[#103858] font-bold uppercase tracking-wider">
              Transparency • Registry Readiness • Customer Care
            </div>
          </div>
        </div>

        {/* 15 Year Milestone Timeline */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm mb-16">
          <SectionHeading
            badge="Growth Journey"
            title="15 Years of Measurable Milestones"
            subtitle="A chronological journey of steady growth, infrastructure development, and enduring client partnerships."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F3] rounded-2xl p-6 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-[#CCA02E] block mb-2">{m.year}</span>
                  <h4 className="text-base font-bold text-[#103858] mb-1">{m.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Pillars Grid */}
        <div className="mb-16">
          <SectionHeading
            badge="Full Spectrum"
            title="Our Integrated Real Estate Operations"
            subtitle="We provide end-to-end expertise across the entire property lifecycle."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#103858] border border-slate-200 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-5 h-5 text-[#CCA02E]" />
                  </div>
                  <h4 className="text-base font-bold text-[#103858] mb-2">{p.title}</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
};
