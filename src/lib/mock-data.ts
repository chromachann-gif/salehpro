export type CompanyStatus = "Active" | "Expired" | "Pending";
export type DocStatus = "Valid" | "Expiring" | "Expired";

export type Company = {
  id: string;
  name: string;
  license_number: string;
  phone: string;
  email: string;
  status: CompanyStatus;
  trade_license_expiry: string;
  address: string;
};

export type CompanyDocType =
  | "Trade License"
  | "Chamber Certificate"
  | "MOA"
  | "Other";
export type PersonnelDocType = "Passport" | "Visa" | "Emirates ID";

export type CompanyDocument = {
  id: string;
  company_id: string;
  type: CompanyDocType;
  number: string;
  issue_date: string;
  expiry_date: string;
  status: DocStatus;
};

export type Personnel = {
  id: string;
  full_name: string;
  nationality: string;
  flag: string;
  company_id: string;
  initials: string;
};

export type PersonnelDocument = {
  id: string;
  personnel_id: string;
  company_id: string;
  type: PersonnelDocType;
  number: string;
  expiry_date: string;
  status: DocStatus;
};

export const companies: Company[] = [
  {
    id: "c1",
    name: "Al Noor Trading LLC",
    license_number: "DED-874521",
    phone: "+971 4 555 1201",
    email: "ops@alnoor-trading.ae",
    status: "Active",
    trade_license_expiry: "2026-08-14",
    address: "Business Bay, Dubai",
  },
  {
    id: "c2",
    name: "Emirates Falcon Contracting",
    license_number: "AUH-338902",
    phone: "+971 2 445 9880",
    email: "admin@falcon-contracting.ae",
    status: "Pending",
    trade_license_expiry: "2026-02-03",
    address: "Al Reem Island, Abu Dhabi",
  },
  {
    id: "c3",
    name: "Silverline Logistics FZE",
    license_number: "JAFZA-661247",
    phone: "+971 4 883 7712",
    email: "hello@silverline-log.ae",
    status: "Expired",
    trade_license_expiry: "2025-11-19",
    address: "Jebel Ali Free Zone, Dubai",
  },
];

export const companyDocuments: CompanyDocument[] = [
  { id: "d1", company_id: "c1", type: "Trade License", number: "TL-874521", issue_date: "2024-08-15", expiry_date: "2026-08-14", status: "Valid" },
  { id: "d2", company_id: "c1", type: "Chamber Certificate", number: "CC-11928", issue_date: "2024-09-01", expiry_date: "2026-01-22", status: "Expiring" },
  { id: "d3", company_id: "c1", type: "MOA", number: "MOA-2011", issue_date: "2020-06-10", expiry_date: "2030-06-10", status: "Valid" },
  { id: "d4", company_id: "c2", type: "Trade License", number: "TL-338902", issue_date: "2024-02-04", expiry_date: "2026-02-03", status: "Expiring" },
  { id: "d5", company_id: "c2", type: "Chamber Certificate", number: "CC-44120", issue_date: "2024-03-11", expiry_date: "2026-03-11", status: "Valid" },
  { id: "d6", company_id: "c2", type: "MOA", number: "MOA-8891", issue_date: "2019-04-20", expiry_date: "2029-04-20", status: "Valid" },
  { id: "d7", company_id: "c3", type: "Trade License", number: "TL-661247", issue_date: "2023-11-20", expiry_date: "2025-11-19", status: "Expired" },
  { id: "d8", company_id: "c3", type: "Chamber Certificate", number: "CC-88213", issue_date: "2023-12-01", expiry_date: "2025-12-01", status: "Expired" },
  { id: "d9", company_id: "c3", type: "MOA", number: "MOA-3312", issue_date: "2018-05-15", expiry_date: "2028-05-15", status: "Valid" },
  { id: "d10", company_id: "c1", type: "Other", number: "TAX-1120", issue_date: "2024-01-10", expiry_date: "2027-01-10", status: "Valid" },
];

export const personnel: Personnel[] = [
  { id: "p1", full_name: "Rashid Al Marri", nationality: "UAE", flag: "🇦🇪", company_id: "c1", initials: "RA" },
  { id: "p2", full_name: "Ayesha Kapoor", nationality: "India", flag: "🇮🇳", company_id: "c1", initials: "AK" },
  { id: "p3", full_name: "Omar Haddad", nationality: "Jordan", flag: "🇯🇴", company_id: "c2", initials: "OH" },
  { id: "p4", full_name: "Marcus Cole", nationality: "UK", flag: "🇬🇧", company_id: "c2", initials: "MC" },
  { id: "p5", full_name: "Fatima Zafar", nationality: "Pakistan", flag: "🇵🇰", company_id: "c3", initials: "FZ" },
];

export const personnelDocuments: PersonnelDocument[] = [
  { id: "pd1", personnel_id: "p1", company_id: "c1", type: "Passport", number: "N4820192", expiry_date: "2028-05-10", status: "Valid" },
  { id: "pd2", personnel_id: "p1", company_id: "c1", type: "Emirates ID", number: "784-1988-1120392-1", expiry_date: "2027-01-15", status: "Valid" },
  { id: "pd3", personnel_id: "p2", company_id: "c1", type: "Passport", number: "L7712430", expiry_date: "2029-08-22", status: "Valid" },
  { id: "pd4", personnel_id: "p2", company_id: "c1", type: "Visa", number: "V-882109", expiry_date: "2026-02-08", status: "Expiring" },
  { id: "pd5", personnel_id: "p2", company_id: "c1", type: "Emirates ID", number: "784-1991-4423011-2", expiry_date: "2026-02-08", status: "Expiring" },
  { id: "pd6", personnel_id: "p3", company_id: "c2", type: "Passport", number: "J1122987", expiry_date: "2030-11-04", status: "Valid" },
  { id: "pd7", personnel_id: "p3", company_id: "c2", type: "Visa", number: "V-660128", expiry_date: "2027-04-01", status: "Valid" },
  { id: "pd8", personnel_id: "p4", company_id: "c2", type: "Passport", number: "GB889120", expiry_date: "2031-06-18", status: "Valid" },
  { id: "pd9", personnel_id: "p4", company_id: "c2", type: "Visa", number: "V-772019", expiry_date: "2025-12-30", status: "Expired" },
  { id: "pd10", personnel_id: "p5", company_id: "c3", type: "Passport", number: "AA1123098", expiry_date: "2029-09-11", status: "Valid" },
  { id: "pd11", personnel_id: "p5", company_id: "c3", type: "Emirates ID", number: "784-1993-8821004-5", expiry_date: "2026-05-20", status: "Expiring" },
];

export function companyById(id: string) {
  return companies.find((c) => c.id === id);
}
