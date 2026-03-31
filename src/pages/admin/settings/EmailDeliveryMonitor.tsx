import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCcw, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  useGetEmailLogsQuery,
  useResendEmailLogMutation,
} from "@/redux/apis/emailLogsApi";
import type { EmailLog, EmailLogStatus } from "@/redux/apis/emailLogsApi";

type TemplateFilterValue =
  | "all"
  | "account_setup"
  | "password_reset"
  | "password_changed"
  | "order_received";

const statusOptions: { label: string; value: EmailLogStatus }[] = [
  { label: "Failed", value: "failed" },
  { label: "Queued", value: "queued" },
  { label: "Sent", value: "sent" },
];

const templateOptions: { label: string; value: TemplateFilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Account Setup", value: "account_setup" },
  { label: "Password Reset", value: "password_reset" },
  { label: "Password Changed", value: "password_changed" },
  { label: "Order Received", value: "order_received" },
];

const formatDateTime = (value: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
};

const getStatusBadgeVariant = (status: EmailLogStatus): "default" | "secondary" | "destructive" => {
  if (status === "failed") return "destructive";
  if (status === "sent") return "default";
  return "secondary";
};

const extractErrorMessage = (error: any, fallback: string) => {
  if (typeof error?.data?.detail === "string") return error.data.detail;
  if (typeof error?.data?.message === "string") return error.data.message;
  if (typeof error?.error === "string") return error.error;
  return fallback;
};

const EmailDeliveryMonitor = () => {
  const { toast } = useToast();

  const [status, setStatus] = useState<EmailLogStatus>("failed");
  const [templateKey, setTemplateKey] = useState<TemplateFilterValue>("all");
  const [emailSearch, setEmailSearch] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);

  const queryParams = useMemo(() => {
    const params: {
      status: EmailLogStatus;
      limit: number;
      template_key?: string;
      email?: string;
    } = {
      status,
      limit: 100,
    };

    if (templateKey !== "all") {
      params.template_key = templateKey;
    }

    const trimmedEmail = emailSearch.trim();
    if (trimmedEmail) {
      params.email = trimmedEmail;
    }

    return params;
  }, [status, templateKey, emailSearch]);

  const {
    data: emailLogsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetEmailLogsQuery(queryParams);

  const [resendEmailLog] = useResendEmailLogMutation();

  const logs = emailLogsResponse?.data ?? [];

  const handleResend = async (log: EmailLog) => {
    try {
      setResendingId(log.id);
      const response = await resendEmailLog(log.id).unwrap();

      toast({
        title: response?.detail || "Email resend has been queued.",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Failed to queue email resend",
        description: extractErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" /> Email Delivery Monitor
          </h1>
          <p className="text-sm text-muted-foreground">Track failed outbound emails and retry delivery.</p>
        </div>
      </div>

      <Card className="shadow-sm border-muted/20">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Select value={status} onValueChange={(value) => setStatus(value as EmailLogStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={templateKey} onValueChange={(value) => setTemplateKey(value as TemplateFilterValue)}>
              <SelectTrigger>
                <SelectValue placeholder="Template" />
              </SelectTrigger>
              <SelectContent>
                {templateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search recipient email"
                value={emailSearch}
                onChange={(event) => setEmailSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-muted/20">
        <CardHeader>
          <CardTitle className="text-base">Email Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((row) => (
                <Skeleton key={row} className="h-10 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <p className="text-sm text-muted-foreground">Failed to load email logs.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">No failed emails found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient Email</TableHead>
                  <TableHead>Template Key</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error Message</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.recipient_email}</TableCell>
                    <TableCell>{log.template_key}</TableCell>
                    <TableCell className="max-w-[260px] truncate" title={log.subject}>{log.subject}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(log.status)}>{log.status}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      {log.error_message ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-block max-w-[240px] truncate text-sm text-muted-foreground cursor-help">
                              {log.error_message}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[380px] break-words">
                            {log.error_message}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
                    <TableCell>{formatDateTime(log.sent_at)}</TableCell>
                    <TableCell className="text-right">
                      {log.status === "failed" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={resendingId === log.id}
                          onClick={() => handleResend(log)}
                        >
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          {resendingId === log.id ? "Resending..." : "Resend"}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDeliveryMonitor;
