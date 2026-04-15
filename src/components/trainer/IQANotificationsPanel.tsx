import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ShieldCheck,
  MinusCircle,
} from "lucide-react";
import {
  useGetTrainerNotificationsQuery,
  type TrainerNotification,
} from "@/redux/apis/trainer/trainerReviewApi";
import { getIqaDecisionLabel } from "@/lib/iqaStatus";

interface IQANotificationsPanelProps {
  notifications?: TrainerNotification[];
  isLoading?: boolean;
  isError?: boolean;
}

const IQANotificationsPanel = ({
  notifications: notificationsProp,
  isLoading: isLoadingProp,
  isError: isErrorProp,
}: IQANotificationsPanelProps) => {
  const queryResult = useGetTrainerNotificationsQuery(undefined, {
    skip: notificationsProp !== undefined || isLoadingProp !== undefined || isErrorProp !== undefined,
  });

  const isLoading = isLoadingProp ?? queryResult.isLoading;
  const isError = isErrorProp ?? queryResult.isError;
  const notifications = notificationsProp ?? queryResult.data?.data ?? [];

  if (isLoading) {
    return (
      <Card className="p-5 mb-6">
        <div className="text-sm text-muted-foreground">Loading IQA notifications...</div>
      </Card>
    );
  }

  if (isError || notifications.length === 0) {
    return null;
  }
  const actionRequired = notifications.filter((item) =>
    ["changes_required", "referred_back"].includes(item.iqa_decision),
  );

  const typeConfig = {
    changes_required: {
      icon: AlertTriangle,
      label: "Action Required",
      borderClass: "border-l-4 border-l-destructive",
      badgeClass: "bg-destructive text-destructive-foreground",
    },
    referred_back: {
      icon: AlertTriangle,
      label: "Action Required",
      borderClass: "border-l-4 border-l-destructive",
      badgeClass: "bg-destructive text-destructive-foreground",
    },
    approved: {
      icon: ShieldCheck,
      label: "Signed Off",
      borderClass: "border-l-4 border-l-green-500",
      badgeClass: "bg-green-600 text-white",
    },
    default: {
      icon: MinusCircle,
      label: "IQA Update",
      borderClass: "border-l-4 border-l-muted-foreground",
      badgeClass: "bg-muted text-muted-foreground",
    },
  };

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">IQA Notifications</h3>
          {actionRequired.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {actionRequired.length} Action{actionRequired.length !== 1 ? "s" : ""} Required
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {notifications.map((notification) => {
          const config =
            typeConfig[notification.iqa_decision as keyof typeof typeConfig] || typeConfig.default;
          const Icon = config.icon;

          return (
            <div
              key={notification.id}
              className={`rounded-lg border bg-card overflow-hidden ${config.borderClass}`}
            >
              <div className="flex items-start gap-3 p-3">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    ["changes_required", "referred_back"].includes(notification.iqa_decision)
                      ? "text-destructive"
                      : "text-green-600"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {notification.unit.unit_code}: {notification.unit.title}
                    </span>
                    <Badge className={`text-[10px] ${config.badgeClass}`}>
                      {getIqaDecisionLabel(notification.iqa_decision) || config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {notification.learner.name} • {notification.qualification.title} •{" "}
                    {notification.iqa_reviewed_at
                      ? new Date(notification.iqa_reviewed_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                  <div className="mt-2 rounded-lg bg-muted/50 p-3 text-sm text-foreground whitespace-pre-wrap">
                    {notification.iqa_review_notes || "No IQA notes provided."}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default IQANotificationsPanel;
