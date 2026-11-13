import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // sensible defaults for every page and file
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      {
        // The resume has a phone number on it. People can still download it from the site, but search engines are asked
        // not to list the file. Delete this block if you want the PDF to show up in search results.
        source: "/Sachin_Kumar_Resume.pdf",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

export default config;
