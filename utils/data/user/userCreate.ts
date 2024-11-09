"server only"

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { userCreateProps } from "@/utils/types";
import { portfolioCreate } from "@/utils/data/portfolio/portfolioCreate";

export const userCreate = async ({
  email,
  first_name,
  last_name,
  profile_image_url,
  user_id,
}: userCreateProps) => {
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
      .from("user")
      .insert([
        {
          email,
          first_name,
          last_name,
          profile_image_url,
          user_id,
        },
      ])
      .select();

    console.log("data", data);
    console.log("error", error);

    if (error?.code) return error;

    // Создаем дефолтный портфель
    const portfolioData = {
      user_id,
      name: "Default Portfolio",
      description: "Default portfolio created automatically",
      type: "SPOT" as const,
      is_active: true
    };

    const portfolioResult = await portfolioCreate(portfolioData);
    
    if (portfolioResult && 'code' in portfolioResult) {

      console.error('Error creating portfolio:', portfolioResult);
      // Возвращаем пользователя даже если создание портфеля не удалось
      return data;
    }

    if (error?.code) return error;
    return data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};
