import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} AI Game Master | <a href="#" className="footer-link">Documentation</a> | <a href="#" className="footer-link">About</a></p>
      </div>
    </footer>
  );
};

export default Footer;
