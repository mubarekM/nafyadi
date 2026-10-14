export default function manifest() {
  return {
    name: "English with Nafyad",
    short_name: "Nafyad",
    description: "Live English classes with Teacher Nafyad WJ.",
    start_url: "/student",
    display: "standalone",
    background_color: "#f5f7f6",
    theme_color: "#0b4a38",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
