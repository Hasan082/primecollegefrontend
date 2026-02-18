interface SectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Section = ({ title, children, className = "" }: SectionProps) => {
  return (
    <section className={`py-16 px-4 ${className}`}>
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-primary mb-8 text-center">{title}</h2>
        {children}
      </div>
    </section>
  );
};

export default Section;
