import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://reborninteractive.com";
  const lastModified = new Date();

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/en", changeFrequency: "weekly", priority: 1.0 },
    { path: "/en/games", changeFrequency: "weekly", priority: 0.9 },
    {
      path: "/en/games/through-her-eyes",
      changeFrequency: "weekly",
      priority: 0.9,
    },
    { path: "/en/games/project-neo", changeFrequency: "monthly", priority: 0.7 },
    { path: "/en/games/zero-gravity", changeFrequency: "monthly", priority: 0.7 },
    {
      path: "/en/games/protocol-crimson",
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { path: "/en/about", changeFrequency: "monthly", priority: 0.8 },
    { path: "/en/creators", changeFrequency: "monthly", priority: 0.8 },
    { path: "/en/news", changeFrequency: "weekly", priority: 0.8 },
    { path: "/en/store", changeFrequency: "weekly", priority: 0.7 },
    { path: "/en/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/en/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/en/cookies", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
