import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { learnerQualifications } from "@/data/learnerMockData";
import { Progress } from "@/components/ui/progress";

const MyQualifications = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground mb-1">My Qualifications</h1>
      <p className="text-muted-foreground mb-8">View and manage your enrolled qualifications</p>

      <div className="space-y-6">
        {learnerQualifications.map((q) => {
          const completed = q.units.filter((u) => u.status === "competent").length;
          const total = q.units.length;
          const pct = Math.round((completed / total) * 100);

          return (
            <div key={q.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-xl font-bold text-foreground">{q.title}</h3>
                    <span className={`${q.categoryColor} text-white text-xs font-bold px-2.5 py-0.5 rounded`}>
                      {q.category}
                    </span>
                    <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2.5 py-0.5 rounded">
                      In Progress
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">Qualification Code: {q.code}</p>
                  <p className="text-sm text-muted-foreground">Enrolled: {q.enrolledDate}</p>
                </div>
                <Link
                  to={`/learner/qualification/${q.id}`}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:opacity-80 transition-opacity flex-shrink-0"
                >
                  <Eye className="w-5 h-5 text-secondary-foreground" />
                </Link>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Overall Progress</span>
                  <span className="text-sm font-semibold text-primary">
                    {completed} of {total} Units Complete ({pct}%)
                  </span>
                </div>
                <Progress value={pct} className="h-3" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyQualifications;
