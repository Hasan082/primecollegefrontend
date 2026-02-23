import logo from "@/assets/prime-logo-white-notext.png";

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary">
      <div className="relative w-28 h-28">
        {/* Spinning curved text */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: "6s" }}
          viewBox="0 0 120 120"
        >
          <defs>
            <path
              id="circlePath"
              d="M 60, 60 m -44, 0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
            />
          </defs>
          <text
            fill="hsl(45, 84%, 53%)"
            fontSize="11.5"
            fontWeight="700"
            letterSpacing="5"
            textAnchor="start"
          >
            <textPath href="#circlePath">
              PRIME COLLEGE UK • PRIME COLLEGE UK •
            </textPath>
          </text>
        </svg>

        {/* Center circle with logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-secondary/40 bg-primary flex items-center justify-center">
            <img src={logo} alt="Prime College UK" className="w-10 h-10 object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
