import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface StaticPageProps {
  title: string;
  children: ReactNode;
}

function StaticPageLayout({ title, children }: StaticPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-4">
        {children}
      </div>
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <Link to="/" className="text-sm text-blue-600 hover:underline">Back to home</Link>
      </div>
    </div>
  );
}

export function AboutPage() {
  return (
    <StaticPageLayout title="About PhoneCompare">
      <p>
        PhoneCompare is a modern smartphone discovery and price-comparison platform built for the Indian market.
        Our mission is to help you find the right smartphone at the right price by comparing specifications,
        features, and prices across India's leading online stores.
      </p>
      <p>
        We aggregate prices from major retailers including Amazon, Flipkart, Croma, Reliance Digital, and more,
        so you can make an informed purchasing decision without visiting multiple websites.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">What We Offer</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Detailed specifications for hundreds of smartphones</li>
        <li>Real-time price comparison across multiple Indian e-commerce stores</li>
        <li>Side-by-side phone comparison tool (up to 4 phones)</li>
        <li>Price history charts to track price trends</li>
        <li>Advanced filtering by brand, price, features, and more</li>
        <li>Deals and discounts from top retailers</li>
      </ul>
      <p>
        Our database is continuously updated by our team and through automated price feeds to ensure
        you have the most accurate information available.
      </p>
    </StaticPageLayout>
  );
}

export function ContactPage() {
  return (
    <StaticPageLayout title="Contact Us">
      <p>
        We'd love to hear from you. Whether you have a question, suggestion, or found an error on our site,
        please don't hesitate to reach out.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Get in Touch</h2>
      <ul className="list-none space-y-2">
        <li><strong>Email:</strong> support@phonecompare.in</li>
        <li><strong>Business Inquiries:</strong> business@phonecompare.in</li>
        <li><strong>Report a Price Error:</strong> errors@phonecompare.in</li>
      </ul>
      <p>
        For partnership inquiries or store integration requests, please include details about your store
        and product catalog in your email.
      </p>
    </StaticPageLayout>
  );
}

export function PrivacyPage() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>
      <p>
        PhoneCompare ("we", "us", or "our") respects your privacy. This policy explains how we collect,
        use, and protect your information when you use our website.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Information We Collect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Search queries and browsing behavior on our site</li>
        <li>Favorite phones saved in your browser (local storage)</li>
        <li>Account information if you create an account (email and password)</li>
        <li>Review submissions (name, rating, and content)</li>
      </ul>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">How We Use Your Information</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>To provide and improve our services</li>
        <li>To display relevant phone recommendations</li>
        <li>To send price alerts (if you opt in)</li>
        <li>To prevent spam and fraudulent reviews</li>
      </ul>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Cookies & Local Storage</h2>
      <p>
        We use browser local storage to remember your theme preference (light/dark mode),
        favorite phones, and comparison list. No tracking cookies are used.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Third-Party Links</h2>
      <p>
        Our site links to third-party retailer websites. We are not responsible for the privacy
        practices of these external sites.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Security</h2>
      <p>
        We use Supabase for authentication and data storage, which provides enterprise-grade security
        including row-level security policies and encrypted connections.
      </p>
    </StaticPageLayout>
  );
}

export function TermsPage() {
  return (
    <StaticPageLayout title="Terms of Service">
      <p>Last updated: {new Date().toLocaleDateString('en-IN')}</p>
      <p>
        By using PhoneCompare, you agree to these terms and conditions. Please read them carefully.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Use of Our Service</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>PhoneCompare provides informational price comparison data for smartphones in India</li>
        <li>Prices shown are for comparison purposes and may not reflect the final purchase price</li>
        <li>We do not sell phones directly; all purchases are made on third-party retailer websites</li>
        <li>You are responsible for verifying prices and availability on the retailer's website before purchasing</li>
      </ul>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Accounts</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>You are responsible for maintaining the confidentiality of your account credentials</li>
        <li>You must not submit false or misleading reviews</li>
        <li>Spam or fraudulent activity will result in account termination</li>
      </ul>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Intellectual Property</h2>
      <p>
        All content on PhoneCompare, including specifications, descriptions, and design elements,
        is the property of PhoneCompare or its content contributors. Phone images and brand logos
        are trademarks of their respective owners.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Limitation of Liability</h2>
      <p>
        PhoneCompare is provided "as is" without warranties of any kind. We are not liable for any
        inaccuracies in pricing or specification data, or for any losses resulting from purchasing
        decisions based on our information.
      </p>
    </StaticPageLayout>
  );
}

export function DisclaimerPage() {
  return (
    <StaticPageLayout title="Disclaimer">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Price Disclaimer</h2>
      <p>
        Prices and availability may change frequently. Prices shown on this website are for
        informational and comparison purposes only. Please verify the final price, availability,
        delivery charges and terms on the retailer's website before purchasing.
      </p>
      <p>
        PhoneCompare does not guarantee that the prices displayed are real-time or accurate at the
        time of purchase. Price data is updated periodically and may not reflect sudden changes
        or flash sales on retailer websites.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white" id="affiliate">Affiliate Disclosure</h2>
      <p>
        PhoneCompare may contain affiliate links to retailer websites. When you purchase through
        these links, we may earn a commission at no additional cost to you. This helps us maintain
        and improve our service. The commission does not influence the prices displayed or the
        ranking of stores in our comparison tables.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Specification Accuracy</h2>
      <p>
        While we strive to provide accurate specifications, we cannot guarantee that all specifications
        are correct. Specifications may vary by region and variant. Please verify specifications
        with the manufacturer before making a purchase decision.
      </p>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trademarks</h2>
      <p>
        All brand names, product names, and trademarks mentioned on this website are the property of
        their respective owners. Mention of these brands does not imply endorsement or affiliation.
      </p>
    </StaticPageLayout>
  );
}
