"server only"

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type PortfolioType = "SPOT" | "MARGIN";

interface CreatePortfolioProps {
  user_id: string;
  name: string;
  description?: string;
  type: PortfolioType;
}

export const portfolioCreate = async ({
  user_id,
  name,
  description,
  type
}: CreatePortfolioProps) => {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  try {
    const { data, error } = await supabase
      .from("user_portfolio")
      .insert([
        {
          user_id,
          name,
          description,
          type,
          is_active: true
        },
      ])
      .select();

    if (error?.code) return error;
    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}; 