import React from 'react';
import { Link } from 'react-router-dom';
import logoManus from '../assets/logo-manus.png';

// Ícones das Redes Sociais
const InstagramIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const WhatsAppIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const LocationIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
);

const PhoneIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);

const ChevronRightIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
  </svg>
);

// Ícone de fallback caso a logo não carregue
const BurgerIcon = ({ className = "w-12 h-12" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="28" width="48" height="8" rx="2" fill="#d4a853"/>
    <rect x="12" y="20" width="40" height="6" rx="2" fill="#8B4513"/>
    <rect x="10" y="38" width="44" height="6" rx="2" fill="#228B22"/>
    <path d="M8 48C8 46 10 44 12 44H52C54 44 56 46 56 48V50C56 52 54 54 52 54H12C10 54 8 52 8 50V48Z" fill="#D2691E"/>
    <path d="M10 16C10 12 14 8 32 8C50 8 54 12 54 16V18C54 20 52 22 50 22H14C12 22 10 20 10 18V16Z" fill="#D2691E"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [logoError, setLogoError] = React.useState(false);

  return (
    <footer className="bg-[#1e3a5f] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Coluna 1: Logo e Descrição */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {!logoError ? (
                <img 
                  src={logoManus} 
                  alt="Manu's Smash Burger" 
                  className="w-12 h-12 object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <BurgerIcon className="w-12 h-12" />
              )}
              <div>
                <h3 className="text-white font-bold text-lg tracking-tight">Manu's</h3>
                <p className="text-white/50 text-xs -mt-0.5">Smash Burger</p>
              </div>
            </div>
            
            <p className="mt-5 text-white/60 text-sm leading-relaxed">
              Os melhores smash burgers artesanais de Campina Grande. Ingredientes frescos e selecionados para uma experiência única.
            </p>
            
            {/* Redes Sociais */}
            <div className="mt-6">
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">
                Siga-nos
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.instagram.com/manus.smash.burger/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://www.facebook.com/manus.smash.burger/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#1877F2] flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=5583993071548"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#25D366] flex items-center justify-center transition-all hover:scale-110"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ffffff] rounded-full"></span>
              Navegação
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Cardápio', to: '/menu' },
                { label: 'Promoções', to: '/promotions' },
                { label: 'Sobre Nós', to: '/about' },
                { label: 'Trabalhe Conosco', to: '/careers' },
                { label: 'Perguntas Frequentes', to: '/faq' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-white/60 hover:text-white text-sm flex items-center gap-2 group transition-colors"
                  >
                    <ChevronRightIcon className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Legal */}
          <div>
            <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ffffff] rounded-full"></span>
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Política de Privacidade', to: '/privacy' },
                { label: 'Política de Cookies', to: '/cookies' },
                { label: 'Termos de Uso', to: '/terms' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-white/60 hover:text-white text-sm flex items-center gap-2 group transition-colors"
                  >
                    <ChevronRightIcon className="w-3 h-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Contato */}
          <div>
            <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#ffffff] rounded-full"></span>
              Contato
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://maps.google.com/?q=R.+Humberto+Batista+Lima,+122+-+Catolé,+Campina+Grande+-+PB"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-white/60 hover:text-white transition-colors group"
                >
                  <LocationIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#ffffff] group-hover:scale-110 transition-transform" />
                  <span className="text-sm leading-relaxed">
                    R. Humberto Batista Lima, 122<br />
                    Catolé, Campina Grande - PB<br />
                    CEP: 58410-530
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+5583993071548"
                  className="flex items-center gap-3 text-white/60 hover:text-white transition-colors group"
                >
                  <PhoneIcon className="w-5 h-5 flex-shrink-0 text-[#ffffff] group-hover:scale-110 transition-transform" />
                  <span className="text-sm">(83) 99307-1548</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="relative border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm text-center md:text-left">
              © {currentYear} Manu's Smash Burger. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-white/40 hover:text-white/60 text-xs transition-colors">
                Privacidade
              </Link>
              <Link to="/cookies" className="text-white/40 hover:text-white/60 text-xs transition-colors">
                Cookies
              </Link>
              <Link to="/terms" className="text-white/40 hover:text-white/60 text-xs transition-colors">
                Termos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
