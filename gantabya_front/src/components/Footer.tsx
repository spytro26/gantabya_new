import { Link } from 'react-router-dom';
import { FaEnvelope, FaFileContract } from 'react-icons/fa';
import { APP_NAME } from '../config';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <a
            href="https://mail.google.com/mail/?view=cm&to=contact@gogantabya.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:text-white transition-colors"
          >
            <FaEnvelope />
            <span>Contact Us</span>
          </a>
          <Link
            to="/terms-and-conditions"
            className="flex items-center gap-2 text-sm hover:text-white transition-colors"
          >
            <FaFileContract />
            <span>Terms &amp; Conditions</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
