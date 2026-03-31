import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Info, Mail, Phone, MapPin, Copyright } from "lucide-react";

interface BasicInfoSettingsProps {
  description: string;
  address: string;
  email: string;
  phone: string;
  copyright_name: string;
  copyright_year: number;
  onUpdate: (field: string, value: string | number) => void;
}

const BasicInfoSettings = ({
  description,
  address,
  email,
  phone,
  copyright_name,
  copyright_year,
  onUpdate,
}: BasicInfoSettingsProps) => {
  return (
    <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" /> Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Footer Description</Label>
          <Textarea
            id="description"
            placeholder="A short description of your organization for the footer..."
            value={description}
            onChange={(e) => onUpdate("description", e.target.value)}
            className="min-h-[100px] bg-background/50 resize-none"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
              value={email}
              onChange={(e) => onUpdate("email", e.target.value)}
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Phone Number
            </Label>
            <Input
              id="phone"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => onUpdate("phone", e.target.value)}
              className="bg-background/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Physical Address
          </Label>
          <Input
            id="address"
            placeholder="123 Education Lane, Learning City, ED 12345"
            value={address}
            onChange={(e) => onUpdate("address", e.target.value)}
            className="bg-background/50"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="space-y-2">
            <Label htmlFor="copyright_name" className="text-sm font-medium flex items-center gap-1.5">
              <Copyright className="h-3.5 w-3.5" /> Copyright Name
            </Label>
            <Input
              id="copyright_name"
              placeholder="Prime College"
              value={copyright_name}
              onChange={(e) => onUpdate("copyright_name", e.target.value)}
              className="bg-background/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="copyright_year" className="text-sm font-medium">Copyright Year</Label>
            <Input
              id="copyright_year"
              type="number"
              placeholder="2024"
              value={copyright_year}
              onChange={(e) => onUpdate("copyright_year", parseInt(e.target.value) || new Date().getFullYear())}
              className="bg-background/50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoSettings;
