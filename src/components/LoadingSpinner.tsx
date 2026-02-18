import logo from "@/assets/prime-logo-white-notext.png";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-muted animate-spin border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={logo} alt="Loading" className="w-8 h-8 object-contain" />
        </div>
      </div>
      <p className="text-sm text-muted-foreground animate-fade-in">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
