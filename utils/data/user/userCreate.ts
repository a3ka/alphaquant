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
  console.log('Starting user creation process for:', { user_id, email });
  
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

    console.log("UserCreate-data", data);
    console.log("UserCreate-error", error);

    if (error?.code) return error;

    // Создаем дефолтный портфель
    const portfolioData = {
      user_id,
      name: "Default Portfolio",
      description: "Default portfolio created automatically",
      type: "SPOT" as const,
      is_active: true
    };

    console.log('Creating default portfolio:', portfolioData);

    const portfolioResult = await portfolioCreate(portfolioData);
    console.log('Portfolio creation result:', portfolioResult);
    
    if (portfolioResult && 'code' in portfolioResult) {
      console.error('Error creating portfolio:', portfolioResult);
      // Возвращаем пользователя даже если создание портфеля не удалось
      return data;
    }

    if (error?.code) return error;
    return data;
  } catch (error: any) {
    console.error('Unexpected error in userCreate:', error);
    throw new Error(error.message);
  }
};
