import { useNavigate } from 'react-router-dom';
import { CalendarDays, Stethoscope, Shield, Clock, Users } from 'lucide-react';

const stats = [
  { icon: Users, label: 'Happy Patients', value: '15,000+' },
  { icon: Stethoscope, label: 'Expert Doctors', value: '120+' },
  { icon: Clock, label: 'Years of Care', value: '25+' },
  { icon: Shield, label: 'Departments', value: '18+' },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-hero-gradient overflow-hidden flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5" />
        {/* Floating dots */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="absolute w-2 h-2 rounded-full bg-accent/40 animate-pulse-slow"
            style={{ top: `${15 + i * 15}%`, left: `${10 + i * 12}%`, animationDelay: `${i * 0.5}s` }} />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6 animate-fade-up opacity-0">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-white/90 text-sm font-medium">AI Powered Healthcare System</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-up opacity-0 delay-100">
              Smart Hospital
              <span className="block text-accent">Management</span>
              <span className="block text-white/80 text-3xl sm:text-4xl lg:text-5xl">System</span>
            </h1>

            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl animate-fade-up opacity-0 delay-200">
              Experience next-generation healthcare with AI-powered diagnostics, seamless appointment booking, and digital health records — all in one platform.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up opacity-0 delay-300">
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-7 py-3.5 bg-accent hover:bg-accent-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                <CalendarDays className="w-5 h-5" />
                Book Appointment
              </button>
              <button onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-sm transition-all duration-200">
                <Stethoscope className="w-5 h-5" />
                AI Symptom Checker
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mt-8 animate-fade-up opacity-0 delay-400">
              {['NABH Accredited', 'ISO 9001:2015', '24/7 Emergency'].map((badge) => (
                <div key={badge} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-white/70 text-xs font-medium">{badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — illustration placeholder + floating cards */}
          <div className="hidden lg:flex items-center justify-center relative animate-fade-in opacity-0 delay-300">
            {/* Main circle */}
            <div className="w-80 h-80 rounded-full bg-white/5 border border-white/10 flex items-center justify-center animate-float">
              <div className="w-64 h-64 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center">
                  <Stethoscope className="w-24 h-24 text-white/60" />
                </div>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute top-4 -left-4 bg-white rounded-2xl p-3 shadow-card flex items-center gap-3 animate-fade-up opacity-0 delay-500">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary-700" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Next Appointment</p>
                <p className="text-sm font-semibold text-gray-800">Today, 3:00 PM</p>
              </div>
            </div>

            <div className="absolute bottom-8 -right-4 bg-white rounded-2xl p-3 shadow-card flex items-center gap-3 animate-fade-up opacity-0 delay-600">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Patients Served</p>
                <p className="text-sm font-semibold text-gray-800">15,000+ Lives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up opacity-0 delay-500">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/8 backdrop-blur-sm border border-white/10 rounded-2xl p-5 text-center">
              <Icon className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-white font-display">{value}</p>
              <p className="text-white/60 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
