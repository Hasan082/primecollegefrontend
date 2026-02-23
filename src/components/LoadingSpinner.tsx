import logo from "@/assets/prime-logo-white-notext.png";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary">
      <div className="relative w-40 h-40">
        {/* Spinning curved text */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: "6s" }}
          viewBox="0 0 160 160"
        >
          <defs>
            <path
              id="circlePath"
              d="M 80, 80 m -62, 0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"
            />
          </defs>
          <text
            fill="hsl(45, 84%, 53%)"
            fontSize="12"
            fontWeight="700"
            letterSpacing="4.5"
            textAnchor="start"
          >
            <textPath href="#circlePath">
              PRIME COLLEGE • LONDON • UK • PRIME COLLEGE • LONDON • UK •
            </textPath>
          </text>
        </svg>

        {/* Center circle with logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-2 border-secondary/40 bg-primary flex items-center justify-center">
            <img src={logo} alt="Prime College UK" className="w-16 h-16 object-contain" loading="eager" fetchPriority="high" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
