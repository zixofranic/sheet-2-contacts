import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sheet to Contacts - Convert Spreadsheets to Phone Contacts",
  description: "Instantly convert Excel, CSV, and Google Sheets to phone contacts. Perfect for real estate agents and salespeople who need to bulk import leads.",
  keywords: ["excel to contacts", "csv to vcf", "spreadsheet contacts", "bulk contact import", "vcf generator"],
  openGraph: {
    title: "Sheet to Contacts",
    description: "Convert spreadsheets to phone contacts in seconds",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
