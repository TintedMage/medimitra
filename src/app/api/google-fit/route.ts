import { NextResponse } from "next/server";

type DailyMetric = {
  date: string;
  steps: number;
  heartRateAvg: number;
  spo2Avg: number;
  sleepHours: number;
  caloriesBurned: number;
};

function getRecentDateISO(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

export async function GET() {
  const data: DailyMetric[] = [
    {
      date: getRecentDateISO(0),
      steps: 6840,
      heartRateAvg: 78,
      spo2Avg: 97,
      sleepHours: 6.8,
      caloriesBurned: 1860,
    },
    {
      date: getRecentDateISO(1),
      steps: 9235,
      heartRateAvg: 74,
      spo2Avg: 98,
      sleepHours: 7.3,
      caloriesBurned: 2045,
    },
    {
      date: getRecentDateISO(2),
      steps: 5122,
      heartRateAvg: 82,
      spo2Avg: 96,
      sleepHours: 5.9,
      caloriesBurned: 1710,
    },
  ];

  return NextResponse.json({
    source: "google-fit-simulator",
    timezone: "Asia/Kolkata",
    syncedAt: new Date().toISOString(),
    metrics: data,
  });
}
