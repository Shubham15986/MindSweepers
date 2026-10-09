export default function Footer() {
  return (
    <footer className="bg-abyss text-fog py-12 px-6 md:px-12 border-t border-fog/10 relative z-10 w-full mt-auto">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="space-y-4">
          <h3 className="font-display font-bold text-xl tracking-wide text-amber">About</h3>
          <p className="text-mist text-sm">NIT Durgapur, Durgapur, West Bengal</p>
          <p className="text-mist text-sm"><strong className="text-fog font-semibold">Email:</strong> recursion.nit@gmail.com</p>
          <div className="text-mist text-sm">
            <strong className="text-fog font-semibold block mb-1">Phones:</strong>
            <p>Koustav Das: +91 82501 51205</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-bold text-xl tracking-wide text-amber">Follow us</h3>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/groups/760104427344959" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-fog text-night flex items-center justify-center hover:bg-amber transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/></svg>
            </a>
            <a href="https://www.instagram.com/recursion.nitd?" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-fog text-night flex items-center justify-center hover:bg-amber transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.linkedin.com/company/recursion-nit-durgapur-programming-community/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-fog text-night flex items-center justify-center hover:bg-amber transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-fog/10 text-center text-sm text-mist/70 max-w-[1200px] mx-auto">
        Developed & designed with ❤️ by Web Team
      </div>
    </footer>
  );
}
