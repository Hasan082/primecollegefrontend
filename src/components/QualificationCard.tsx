import { Link } from "react-router-dom";

interface QualificationCardProps {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  description: string;
}

const QualificationCard = ({
  id,
  title,
  category,
  level,
  duration,
  price,
  description,
}: QualificationCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1 rounded uppercase">
          {category}
        </span>
        <span className="text-xs text-muted-foreground">{level}</span>
      </div>
      <Link to={`/qualifications/${id}`}>
        <h3 className="text-lg font-semibold text-foreground mb-2 leading-snug hover:text-primary transition-colors">{title}</h3>
      </Link>
      <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>
      <div className="flex items-center justify-between border-t border-border pt-4">
        <div className="text-sm text-muted-foreground">{duration}</div>
        <div className="text-lg font-bold text-primary">{price}</div>
      </div>
      <Link
        to={`/qualifications/${id}`}
        className="mt-4 block text-center bg-primary text-primary-foreground py-2 rounded text-sm font-semibold hover:opacity-90"
      >
        View Details
      </Link>
    </div>
  );
};

export default QualificationCard;
