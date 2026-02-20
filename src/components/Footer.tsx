import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Prime College</h3>
            <p className="text-sm text-primary-foreground/80">
              Leading provider of professional qualifications in Business,
              Management, and Health & Social Care in the UK.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><Link to="/" className="hover:text-primary-foreground">Home</Link></li>
              <li><Link to="/about" className="hover:text-primary-foreground">About Us</Link></li>
              <li><Link to="/qualifications" className="hover:text-primary-foreground">Qualifications</Link></li>
              <li><Link to="/recruitment" className="hover:text-primary-foreground">Recruitment</Link></li>
              <li><Link to="/contact" className="hover:text-primary-foreground">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Qualifications</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>Business Management</li>
              <li>Strategic Leadership</li>
              <li>Health & Social Care</li>
              <li>Healthcare Management</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>London, United Kingdom</li>
              <li><a href="mailto:info@theprimecollege.org.uk" className="hover:text-primary-foreground">info@theprimecollege.org.uk</a></li>
              <li><a href="tel:02081495431" className="hover:text-primary-foreground">0208 149 5431</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Prime College. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
