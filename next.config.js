/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable lightning CSS for Windows compatibility
  experimental: {
    optimizeCss: false,
  },
  images: {
    domains: ["kmxrfddgzveqlmsvmsub.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/thumbnail**",
      },
      {
        protocol: "https",
        hostname: "temwbfnjuxnvskqddgqa.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Keep any existing patterns and add this as a fallback for placeholder images
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      // Add the missing hostname for committee member images
      {
        protocol: "https",
        hostname: "t3.ftcdn.net",
      },
      // Add Unsplash for image hosting
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
