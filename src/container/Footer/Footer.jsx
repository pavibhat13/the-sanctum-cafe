import React from 'react';
import { FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import { FaEnvelope, FaGlobe } from 'react-icons/fa';
import { FooterOverlay, Newsletter } from '../../components';
import { images } from '../../constants';
import './Footer.css';

const Footer = () => {
  const mailtoLink = 'mailto:paakscafe@gmail.com';
  return (
    <div className="app__footer section__padding" id="login">
      <FooterOverlay />
      {/* <Newsletter /> */}

      <div className="app__footer-links">
        <div className="app__footer-links_contact">
          <h1 className="app__footer-headtext">Contact Us</h1>
          <p className="p__opensans">Paaks Cafe, 12th Cross, RP Road,<br /> Nanjangud-571301</p>
          <p className="p__opensans">+91 866-028-5367</p>
        </div>

        <div className="app__footer-links_logo">
          <img src={images.gericht} alt="footer_logo" />
          <p className="p__opensans">&quot;The best way to find yourself is to lose yourself in the service of others.&quot;</p>
          <img src={images.spoon} className="spoon__img" style={{ marginTop: 15 }} />
          <div className="app__footer-links_icons">
            <a href={mailtoLink}>
              <FaEnvelope />
            </a>
            <a href="https://www.instagram.com/the_sanctum_cafe?igsh=MXZ3ZXJwYmtlbWpudw=="> <FiInstagram /></a>
            <a href="https://quicksell.co/s/paakscafe/menu/h9y"> <FaGlobe /></a>
          </div>
        </div>

        <div className="app__footer-links_work">
          <h1 className="app__footer-headtext">Working Hours</h1>
          <p className="p__opensans">Monday-Friday:</p>
          <p className="p__opensans">06:30 pm - 10:30 pm</p>
          <p className="p__opensans">Saturday-Sunday:</p>
          <p className="p__opensans">06:15 pm - 10:00 pm</p>
        </div>
      </div>

      <div className="footer__copyright">
        <p className="p__opensans">2024 The Sanctum Cafe. All Rights reserved.</p>
      </div>

    </div>
  );
}

export default Footer;
