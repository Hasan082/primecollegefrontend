import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, ArrowLeft, Mail, MailOpen } from "lucide-react";
import { Link } from "react-router-dom";
import TablePagination from "@/components/admin/TablePagination";
import { useDebounce } from "@/hooks/use-debounce";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetContactFormsQuery, ContactForm } from "@/redux/apis/contactApi";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 10;

const ContactMessages = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactForm | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isFetching } = useGetContactFormsQuery({
    page: currentPage,
    search: debouncedSearch?.trim() || undefined,
  });

  const messages = data?.data?.results || [];
  const totalItems = data?.data?.count || 0;

  const handleViewMessage = (msg: ContactForm) => {
    setSelectedMessage(msg);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-sm text-muted-foreground">
            View messages submitted via the contact form
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Subject</TableHead>

                <TableHead className="w-[60px]">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading || isFetching ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    Loading messages...
                  </TableCell>
                </TableRow>
              ) : messages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-muted-foreground"
                  >
                    No messages found.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => (
                  <TableRow
                    key={msg.id}
                    className={`cursor-pointer hover:bg-muted/50 ${!msg.is_read ? 'font-semibold' : ''}`}
                    onClick={() => handleViewMessage(msg)}
                  >
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(msg.created_at), "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell>{msg.full_name}</TableCell>
                    <TableCell>{msg.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{msg.subject}</TableCell>

                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMessage(msg);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <TablePagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Received on {selectedMessage ? format(new Date(selectedMessage.created_at), "dd MMM yyyy 'at' HH:mm") : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted p-4 rounded-md">
                <div>
                  <span className="font-semibold block mb-1">From</span>
                  <span>{selectedMessage.full_name}</span>
                </div>
                <div>
                  <span className="font-semibold block mb-1">Email</span>
                  <a href={`mailto:${selectedMessage.email}`} className="text-primary hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold block mb-1">Subject</span>
                  <span>{selectedMessage.subject}</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-sm">Message</span>
                <div className="bg-background border border-border rounded-md p-4 whitespace-pre-wrap text-sm leading-relaxed max-h-[300px] overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessages;
