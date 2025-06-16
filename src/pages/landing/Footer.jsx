import {
  Info,
  Shield,
  FileText,
  Mail,
  Instagram,
  Twitter,
  Facebook,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className=" text-muted mt-20 rounded-lg">
      <div className="py-8 xl:w-[1200px] mx-auto px-4 bg-transparent">
        {/* Top Section */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <a
            href="/"
            className="flex items-center mb-6 sm:mb-0 space-x-3 rtl:space-x-reverse transition-transform duration-300 hover:scale-105"
          >
            <span className="text-2xl font-bold text-primary">Learning</span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium sm:mb-0">
            <li>
              <a
                href="/about"
                className="me-6 md:me-8 flex items-center text-primary"
              >
                <Info className="w-4 h-4 mr-1 text-primary" />
                About Us
              </a>
            </li>
            <li>
              <a
                href="/privacy"
                className="me-6 md:me-8 flex items-center text-primary"
              >
                <Shield className="w-4 h-4 mr-1 text-primary" />
                Privacy
              </a>
            </li>
            <li>
              <a
                href="/terms"
                className="me-6 md:me-8 flex items-center text-primary"
              >
                <FileText className="w-4 h-4 mr-1 text-primary" />
                Terms
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="flex items-center group text-primary"
              >
                <Mail className="w-4 h-4 mr-1 text-primary group-hover:animate-pulse" />
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Grid Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connect With Us */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Connect With Us
            </h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-primary transition-transform duration-300 hover:scale-110"
              >
                <Instagram className="w-6 h-6 text-primary" />
              </a>
              <a
                href="#"
                className="text-primary transition-transform duration-300 hover:scale-110"
              >
                <Twitter className="w-6 h-6 text-primary" />
              </a>
              <a
                href="#"
                className="text-primary transition-transform duration-300 hover:scale-110"
              >
                <Facebook className="w-6 h-6 text-primary" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Services
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="cursor-pointer text-primary transition-colors duration-200">
                Skill Assessment
              </li>
              <li className="cursor-pointer text-primary transition-colors duration-200">
                Skill Prediction
              </li>
              <li className="cursor-pointer text-primary transition-colors duration-200">
                Learning Path
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="cursor-pointer text-primary transition-colors duration-200">
                Careers
              </li>
              <li className="cursor-pointer text-primary transition-colors duration-200">
                Blog
              </li>
              <li className="cursor-pointer text-primary transition-colors duration-200">
                Press
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
