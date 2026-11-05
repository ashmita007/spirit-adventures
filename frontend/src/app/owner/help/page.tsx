import type { Metadata } from "next";
import Link from "next/link";
import { Mountain, Users, Image as ImageIcon, Star, ShieldCheck, Briefcase, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "How-To Guide | Owner HQ",
  robots: { index: false, follow: false },
};

const sections = [
  {
    icon: Mountain,
    title: "Add a new package (trip)",
    steps: [
      <>Open <Link href="/owner/packages" className="text-brand-ocean font-semibold underline">Day-Wise Itinerary Studio</Link> and click <b>Add package</b>.</>,
      <><b>Pricing &amp; Logistics</b> tab: set the title, destination (pick an existing one so it groups with other trips), category, difficulty, price per person, days/nights and a short summary.</>,
      <><b>Day-Wise Timeline</b> tab: add one row per day with title, description, altitude, distance, meals and stay.</>,
      <><b>Video Loop Selector</b> tab: choose the background video and paste a cover image URL (landscape, 1200px+ wide).</>,
      <><b>Inclusions &amp; Gear List</b> tab: one item per line.</>,
      <>Click <b>Save</b>. The package goes live on the website straight away and is copied to the Sales CRM package list.</>,
    ],
  },
  {
    icon: Star,
    title: "Feature a package on the homepage",
    steps: [
      <>In the packages table, click the <b>☆ Standard</b> pill to switch it to <b>★ Featured</b>. Click again to remove it.</>,
    ],
  },
  {
    icon: ImageIcon,
    title: "Add gallery photos and trip videos",
    steps: [
      <>Open <b>Photo Gallery</b> in the sidebar, pick a category, then click <b>Add photos</b> and choose one or many photos from your phone or laptop.</>,
      <>Click a photo to change its title, caption or category. The eye icon hides it from the site; the bin removes it.</>,
      <>For a trip: <b>Day-Wise Itinerary Studio</b> → <b>Edit</b> → <b>Video loop selector</b> → <b>Upload cover photo</b>, <b>Upload your own video</b> or <b>Add trip photos</b>, then save.</>,
      <>Everything is stored on Cloudinary. Photos up to 10 MB, videos up to 100 MB.</>,
    ],
  },
  {
    icon: ImageIcon,
    title: "Reviews, blog posts, FAQs, destinations",
    steps: [
      <>Open <a href="/admin/" target="_blank" rel="noopener noreferrer" className="text-brand-ocean font-semibold underline">Django Admin</a> and sign in with the same account.</>,
      <>Under <b>Spirit Adventures Core</b> pick the section (Reviews, Blog posts, FAQs, Destinations) and click <b>Add</b>.</>,
      <>Reviews only appear on the site once <b>Is approved</b> is ticked.</>,
      <>Unticking <b>Is published</b> on a trip or destination hides it without deleting it.</>,
    ],
  },
  {
    icon: Users,
    title: "Handle enquiries (leads)",
    steps: [
      <>Every website enquiry appears in <Link href="/owner/leads" className="text-brand-ocean font-semibold underline">Customer Leads &amp; CRM</Link> and is also sent to the Sales CRM, auto-assigned to the sales person with the fewest open leads.</>,
      <>Calls, payments and follow-ups are tracked in the Sales CRM. Website leads carry a blue <b>Website</b> tag there.</>,
    ],
  },
  {
    icon: Briefcase,
    title: "Sales CRM",
    steps: [
      <>The CRM is built into this website at <Link href="/crm" className="text-brand-ocean font-semibold underline">/crm</Link>. It uses the same login as this portal.</>,
      <>Every website enquiry becomes a CRM lead instantly, tagged <b>Website</b> and assigned to the sales rep with the fewest open leads. Saved packages appear in the CRM package list.</>,
      <>Sales reps only see their own leads. Managers and admins see everyone&apos;s and can manage the team.</>,
      <>If anything was missed, run <code>python manage.py sync_crm</code> in <code>backend/</code>. It never creates duplicates.</>,
    ],
  },
  {
    icon: ShieldCheck,
    title: "Owner accounts",
    steps: [
      <>Everyone signs in with their <b>email</b>. Staff (owners) get this portal and Django Admin; every approved team member gets the CRM.</>,
      <>Add sales reps from the CRM (Team tab) or in Django Admin under <b>CRM · Team</b>. Create an owner with <code>python manage.py createsuperuser</code> in <code>backend/</code>, or tick <b>Staff status</b> on a team member.</>,
      <>Use <b>Sign out</b> at the bottom of the sidebar on shared computers. Sessions expire after 12 hours.</>,
    ],
  },
];

export default function OwnerHelpPage() {
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-black text-brand-navy">How-To Guide</h1>
        <p className="mt-1 text-sm text-slate-500">Everything you need to run the website day to day.</p>
      </div>

      {sections.map(({ icon: Icon, title, steps }) => (
        <section key={title} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-brand-navy">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-light text-brand-ocean">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            {title}
          </h2>
          <ol className="mt-4 space-y-2.5 text-sm text-slate-700 list-decimal pl-5 marker:text-brand-ocean marker:font-bold [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px]">
            {steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      ))}

      <p className="flex items-center gap-2 text-xs text-slate-400">
        <Terminal className="h-3.5 w-3.5" aria-hidden /> Full setup and deploy notes are in README.md.
      </p>
    </div>
  );
}
