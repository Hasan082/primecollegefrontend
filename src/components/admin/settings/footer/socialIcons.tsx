import { 
  FaXTwitter, 
  FaFacebook, 
  FaLinkedin, 
  FaInstagram, 
  FaYoutube, 
  FaTiktok, 
  FaSnapchat, 
  FaSpotify, 
  FaThreads, 
  FaPinterest, 
  FaDiscord, 
  FaTelegram 
} from "react-icons/fa6";

export const socialIcons: Record<string, React.ReactNode> = {
  x: <FaXTwitter />,
  twitter: <FaXTwitter />,
  facebook: <FaFacebook />,
  linkedin: <FaLinkedin />,
  instagram: <FaInstagram />,
  youtube: <FaYoutube />,
  tiktok: <FaTiktok />,
  snapchat: <FaSnapchat />,
  spotify: <FaSpotify />,
  thread: <FaThreads />,
  threads: <FaThreads />,
  pinterest: <FaPinterest />,
  discord: <FaDiscord />,
  telegram: <FaTelegram />,
};

export type SocialPlatform = keyof typeof socialIcons;
