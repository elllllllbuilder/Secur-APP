import { api } from "@/lib/api";

export type Activity = { slug: string; title: string; description: string };

export async function getActivities(): Promise<Activity[]> {
  const { data } = await api.get("/public/activities");
  return data?.data ?? data;
}

export async function getActivity(slug: string): Promise<Activity> {
  const { data } = await api.get(`/public/activities/${slug}`);
  return data?.data ?? data;
}
