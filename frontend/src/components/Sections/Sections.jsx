import { useState } from 'react';
import {
  CalendarDays, FileText, Brain, Pill, MessageSquare, Heart,
  Bone, Activity, Baby, MapPin, Phone, Mail, Send, CheckCircle,
  Star, Clock, Award
} from 'lucide-react';
import toast from 'react-hot-toast';


// ─── SECTION WRAPPER ──────────────────────────────────────
const Section = ({ id, className = '', children }) => (
  <section id={id} className={`py-20 ${className}`}>{children}</section>
);

const SectionHeader = ({ badge, title, subtitle }) => (
  <div className="text-center mb-14">
    {badge && (
      <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
        {badge}
      </span>
    )}
    <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
    {subtitle && <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">{subtitle}</p>}
  </div>
);

// ─── ABOUT ────────────────────────────────────────────────
export function AboutSection() {
  const points = [
    { icon: Award, label: 'NABH Accredited', desc: 'Meeting national standards for healthcare quality.' },
    { icon: Clock, label: '24/7 Emergency', desc: 'Round-the-clock emergency care for critical cases.' },
    { icon: Brain, label: 'AI Diagnostics', desc: 'Cutting-edge AI-powered diagnostic tools.' },
    { icon: Heart, label: 'Patient First', desc: 'Every decision centered around patient wellbeing.' },
  ];
  return (
    <Section id="about" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block bg-primary-50 text-primary-700 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">About Us</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              Delivering Excellence in <span className="text-primary-700">Healthcare</span> for 25+ Years
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Smart Hospital is a multi-specialty healthcare facility committed to delivering world-class medical care with compassion and innovation. Our team of 120+ expert doctors and state-of-the-art infrastructure ensures the best outcomes for every patient.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              We combine traditional medical expertise with AI-powered technology to provide faster diagnoses, personalized treatments, and seamless digital health management.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {points.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex gap-3 p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                  <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-primary-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="bg-hero-gradient rounded-3xl p-10 text-center shadow-glow">
              <div className="grid grid-cols-2 gap-6">
                {[['15K+', 'Patients'], ['120+', 'Doctors'], ['25+', 'Years'], ['18+', 'Departments']].map(([num, label]) => (
                  <div key={label} className="bg-white/10 rounded-2xl p-6">
                    <p className="font-display text-3xl font-bold text-white">{num}</p>
                    <p className="text-white/70 text-sm mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── SERVICES ─────────────────────────────────────────────
export function ServicesSection() {
  const services = [
    { icon: CalendarDays, title: 'Appointment Booking', desc: 'Book appointments with your preferred doctor in just a few clicks, anytime anywhere.', color: 'bg-blue-50 text-blue-600' },
    { icon: FileText, title: 'Digital Reports', desc: 'Access and download your medical reports and test results securely online.', color: 'bg-green-50 text-green-600' },
    { icon: Brain, title: 'AI Symptom Checker', desc: 'Describe your symptoms and get instant AI-powered preliminary diagnosis suggestions.', color: 'bg-purple-50 text-purple-600' },
    { icon: Pill, title: 'Online Prescriptions', desc: 'Receive digital prescriptions from doctors and access your medication history.', color: 'bg-orange-50 text-orange-600' },
    { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Get 24/7 answers to healthcare questions with our intelligent chatbot.', color: 'bg-teal-50 text-teal-600' },
    { icon: Heart, title: 'Health Monitoring', desc: 'Track your vitals and health trends over time with personalized insights.', color: 'bg-red-50 text-red-600' },
  ];
  return (
    <Section id="services" className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Our Services" title="Comprehensive Healthcare Services" subtitle="Everything you need for your health journey, accessible from one unified platform." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── DEPARTMENTS ──────────────────────────────────────────
export function DepartmentsSection() {
  const departments = [
    { icon: Heart, name: 'Cardiology', desc: 'Heart & cardiovascular care', patients: '3,200+', color: 'from-red-500 to-rose-600' },
    { icon: Bone, name: 'Orthopedics', desc: 'Bones, joints & spine', patients: '2,800+', color: 'from-amber-500 to-orange-600' },
    { icon: Brain, name: 'Neurology', desc: 'Brain & nervous system', patients: '1,900+', color: 'from-violet-500 to-purple-600' },
    { icon: Baby, name: 'Pediatrics', desc: 'Children\'s health care', patients: '4,100+', color: 'from-sky-500 to-blue-600' },
    { icon: Activity, name: 'General Medicine', desc: 'Primary & preventive care', patients: '5,500+', color: 'from-emerald-500 to-teal-600' },
    { icon: FileText, name: 'Radiology', desc: 'Imaging & diagnostics', patients: '2,400+', color: 'from-pink-500 to-rose-600' },
  ];
  return (
    <Section id="departments" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Departments" title="World-Class Medical Departments" subtitle="Our specialized departments are staffed by leading experts with decades of experience." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(({ icon: Icon, name, desc, patients, color }) => (
            <div key={name} className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative p-6 bg-white group-hover:bg-transparent transition-colors duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-4 shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-white text-xl mb-1 transition-colors">{name}</h3>
                <p className="text-gray-500 group-hover:text-white/80 text-sm mb-3 transition-colors">{desc}</p>
                <p className="text-xs font-semibold text-primary-600 group-hover:text-white/70 transition-colors">{patients} patients treated</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── DOCTORS ──────────────────────────────────────────────
export function DoctorsSection() {
  const doctors = [
    { name: 'Dr. Arun Sharma', spec: 'Cardiologist', exp: '18 yrs', rating: 4.9, initials: 'AS', color: 'bg-red-100 text-red-700' },
    { name: 'Dr. Priya Mehta', spec: 'Neurologist', exp: '14 yrs', rating: 4.8, initials: 'PM', color: 'bg-purple-100 text-purple-700' },
    { name: 'Dr. Rohit Patel', spec: 'Orthopedic', exp: '20 yrs', rating: 4.9, initials: 'RP', color: 'bg-amber-100 text-amber-700' },
    { name: 'Dr. Sneha Joshi', spec: 'Pediatrician', exp: '12 yrs', rating: 4.7, initials: 'SJ', color: 'bg-sky-100 text-sky-700' },
  ];
  return (
    <Section id="doctors" className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Our Doctors" title="Meet Our Expert Physicians" subtitle="Our team of highly qualified doctors brings years of experience and genuine dedication to patient care." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map(({ name, spec, exp, rating, initials, color }) => (
            <div key={name} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 text-center border border-gray-100">
              <div className={`w-20 h-20 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold font-display shadow-sm`}>
                {initials}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
              <p className="text-primary-600 text-sm font-medium mt-1">{spec}</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <span className="flex items-center gap-1 text-amber-500 text-sm">
                  <Star className="w-4 h-4" fill="currentColor" /> {rating}
                </span>
                <span className="text-gray-400 text-xs">•</span>
                <span className="text-gray-500 text-sm">{exp} exp.</span>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-primary-50 text-primary-700 text-sm font-semibold hover:bg-primary-100 transition-colors">
                Book Appointment
              </button>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── CONTACT ──────────────────────────────────────────────
export function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate sending (replace with actual API call)
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setSent(true);
    toast.success('Message sent! We\'ll contact you shortly.');
    setForm({ name: '', email: '', phone: '', message: '' });
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <Section id="contact" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="Contact Us" title="Get In Touch" subtitle="Have questions? Our team is here to help you 24/7." />
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div>
            <div className="space-y-6">
              {[
                { icon: MapPin, title: 'Address', info: '123 Health Avenue, Medical District, Mumbai - 400001, Maharashtra' },
                { icon: Phone, title: 'Emergency', info: '+91 1800-XXX-XXXX (24/7 Toll Free)' },
                { icon: Mail, title: 'Email', info: 'info@smarthospital.in' },
                { icon: Clock, title: 'OPD Hours', info: 'Mon–Sat: 8:00 AM – 8:00 PM' },
              ].map(({ icon: Icon, title, info }) => (
                <div key={title} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-11 h-11 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{title}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{info}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input type="text" required placeholder="Your name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="tel" placeholder="+91 XXXXX XXXXX"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" required placeholder="your@email.com"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea rows={4} required placeholder="How can we help you?"
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm resize-none" />
            </div>
            <button type="submit" disabled={sending}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70">
              {sent ? <><CheckCircle className="w-5 h-5" /> Sent!</> : sending ? 'Sending...' : <><Send className="w-5 h-5" /> Send Message</>}
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────
export function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="font-display font-bold text-xl mb-4">Smart<span className="text-accent">Hospital</span></h3>
            <p className="text-white/60 text-sm leading-relaxed">AI-powered healthcare management system delivering world-class medical care.</p>
          </div>
          {[
            { title: 'Quick Links', links: ['Home', 'About', 'Services', 'Contact'] },
            { title: 'Departments', links: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'] },
            { title: 'Support', links: ['FAQ', 'Privacy Policy', 'Terms of Service', 'Help Center'] },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-white/90">{title}</h4>
              <ul className="space-y-2">
                {links.map((l) => <li key={l}><span className="text-white/50 text-sm cursor-default">{l}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/40 text-sm">© {new Date().getFullYear()} Smart Hospital. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
