import { NextResponse } from "next/server";

async function getAccessToken() {
  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id:
          process.env.GOOGLE_CLIENT_ID!,
        client_secret:
          process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token:
          process.env.GOOGLE_REFRESH_TOKEN!,
        grant_type: "refresh_token",
      }),
    }
  );

  const data = await response.json();

  return data.access_token;
}

export async function GET() {
  try {
    const accessToken =
      await getAccessToken();

    const accountId =
      process.env.GBP_ACCOUNT_ID;

    const locationId =
      process.env.GBP_LOCATION_ID;

    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },

        next: {
          revalidate: 21600,
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        reviews: [],
        error: "Unable to fetch reviews",
      },
      {
        status: 500,
      }
    );
  }
}