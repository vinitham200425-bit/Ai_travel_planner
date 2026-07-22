import Link from "next/link";
import {
  Heart,
  Mail,
  MapPin,
  Plane,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Plane size={23} />
            </span>

            <span className="text-xl font-bold text-white">
              AI Travel Planner
            </span>
          </Link>

          <p className="mt-5 max-w-sm leading-7 text-gray-400">
            Create personalized itineraries using your destination,
            dates, budget and travel preferences.
          </p>
        </div>

        <FooterColumn title="Explore">
          <FooterLink href="/#home">Home</FooterLink>
          <FooterLink href="/#features">Features</FooterLink>
          <FooterLink href="/#pricing">Pricing</FooterLink>
          <FooterLink href="/#contact">Contact</FooterLink>
        </FooterColumn>

        <FooterColumn title="Account">
          <FooterLink href="/login">Login</FooterLink>
          <FooterLink href="/signup">Create Account</FooterLink>
          <FooterLink href="/dashboard">Dashboard</FooterLink>
          <FooterLink href="/my-trips">My Trips</FooterLink>
        </FooterColumn>

        <div>
          <h3 className="font-bold text-white">Contact</h3>

          <div className="mt-5 space-y-4 text-sm text-gray-400">
            <p className="flex items-start gap-3">
              <Mail
                size={18}
                className="mt-0.5 shrink-0 text-blue-400"
              />
              support@aitravelplanner.com
            </p>

            <p className="flex items-start gap-3">
              <MapPin
                size={18}
                className="mt-0.5 shrink-0 text-blue-400"
              />
              Chennai, Tamil Nadu, India
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-center text-sm text-gray-500 sm:flex-row lg:px-8">
          <p>© 2026 AI Travel Planner. All rights reserved.</p>

          <p className="inline-flex items-center gap-1.5">
            Made with
            <Heart
              size={15}
              className="text-red-500"
              fill="currentColor"
            />
            for travellers
          </p>
        </div>
      </div>
    </footer>
  );
}

type FooterColumnProps = {
  title: string;
  children: React.ReactNode;
};

function FooterColumn({
  title,
  children,
}: FooterColumnProps) {
  return (
    <div>
      <h3 className="font-bold text-white">{title}</h3>

      <div className="mt-5 flex flex-col gap-3 text-sm">
        {children}
      </div>
    </div>
  );
}

type FooterLinkProps = {
  href: string;
  children: React.ReactNode;
};

function FooterLink({
  href,
  children,
}: FooterLinkProps) {
  return (
    <Link
      href={href}
      className="w-fit text-gray-400 transition hover:text-blue-400"
    >
      {children}
    </Link>
  );
}