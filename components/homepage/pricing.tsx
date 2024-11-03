"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import axios from "axios"
import { loadStripe } from "@stripe/stripe-js"
import { toast } from "sonner"
import { TITLE_TAILWIND_CLASS } from "@/utils/constants"
import { useRouter } from "next/navigation"
import { ArrowUpRight } from "lucide-react"

type PricingSwitchProps = {
  onSwitch: (value: string) => void
}

type PricingCardProps = {
  user: any
  handleCheckout: any
  priceIdMonthly: any
  priceIdYearly: any
  isYearly?: boolean
  title: string
  monthlyPrice?: number | null
  yearlyPrice?: number | null
  description: string
  features: string[]
  actionLabel: string
  popular?: boolean
  exclusive?: boolean
}

const PricingHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="text-center mb-16">
    <h2 className="text-3xl font-bold mb-4">Choose the right plan for your needs</h2>
    <p className="text-white/70 max-w-2xl mx-auto">
      Choose the right plan for your needs
    </p>
  </div>
)

const PricingSwitch = ({ onSwitch }: PricingSwitchProps) => (
  <Tabs defaultValue="0" className="w-40 mx-auto" onValueChange={onSwitch}>
    <TabsList className="py-6 px-2">
      <TabsTrigger value="0" className="text-base">
        <p className="text-black dark:text-white">
          Monthly
        </p>
      </TabsTrigger>
      <TabsTrigger value="1" className="text-base">
        <p className="text-black dark:text-white">
          Yearly
        </p>
      </TabsTrigger>
    </TabsList>
  </Tabs>
)

const PricingCard = ({ user, handleCheckout, isYearly, title, priceIdMonthly, priceIdYearly, monthlyPrice, yearlyPrice, description, features, actionLabel, popular, exclusive }: PricingCardProps) => {
  const router = useRouter();
  return (
    <Card 
      className={cn(
        `bg-white/5 border-white/10`,
        {
          'ring-2 ring-blue-500': popular,
        }
      )}
    >
      <CardHeader>
        <CardTitle className="text-2xl mb-2">{title}</CardTitle>
        <CardDescription className="text-white/70 mb-4">
          {description}
        </CardDescription>
        <div className="text-3xl font-bold mb-6">
          {isYearly ? `$${yearlyPrice}` : `$${monthlyPrice}`}
          <span className="text-lg text-white/50">{isYearly ? '/year' : '/month'}</span>
        </div>
        <Button 
          onClick={() => {
            if (user?.id) {
              router.push("/trading")
            } else {
              toast("Please login or sign up to start trading", {
                description: "You must be logged in to access trading features",
                action: {
                  label: "Sign Up",
                  onClick: () => {
                    router.push("/sign-up")
                  },
                },
              })
            }
          }}
          className="h-8 sm:h-10 md:h-12 px-4 sm:px-6 md:px-8 text-xs sm:text-sm md:text-base lg:text-lg bg-gradient-to-r from-[#003366] to-[#0066CC] hover:from-[#002244] hover:to-[#004499] text-white border-none rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,102,255,0.5)] hover:brightness-110"
        >
          Start Trading
          <ArrowUpRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
        </Button>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-white/70">{feature}</span>
            </li>
          ))}
        </ul>
      </CardHeader>
    </Card>
  )
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState<boolean>(false)
  const togglePricingPeriod = (value: string) => setIsYearly(parseInt(value) === 1)
  const { user } = useUser();
  const router = useRouter();
  const [stripePromise, setStripePromise] = useState<Promise<any> | null>(null)

  useEffect(() => {
    setStripePromise(loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!))
  }, [])

  const handleCheckout = async (priceId: string, subscription: boolean) => {

    try {
      const { data } = await axios.post(`/api/payments/create-checkout-session`,
        { userId: user?.id, email: user?.emailAddresses?.[0]?.emailAddress, priceId, subscription });

      if (data.sessionId) {
        const stripe = await stripePromise;

        const response = await stripe?.redirectToCheckout({
          sessionId: data.sessionId,
        });

        return response
      } else {
        console.error('Failed to create checkout session');
        toast('Failed to create checkout session')
        return
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      toast('Error during checkout')
      return
    }
  };

  const plans = [
    {
      title: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: "Essential features you need to get started",
      features: [
        "Basic risk scoring",
        "Limited set of indicators",
        "Trading history",
        "Email support"
      ],
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      actionLabel: "Get Started",
    },
    {
      title: "Pro",
      monthlyPrice: 100,
      yearlyPrice: 1000,
      description: "Perfect for owners of small & medium businessess",
      features: [
        "Advanced risk scoring",
        "All indicators and signals",
        "Portfolio analysis",
        "Priority support"
      ],
      actionLabel: "Get Started",
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      popular: true,
    },
    {
      title: "Enterprise",
      monthlyPrice: "Custom",
      yearlyPrice: "Custom",
      description: "Dedicated support and infrastructure to fit your needs",
      features: [
        "API access",
        "Custom metrics",
        "Dedicated manager",
        "SLA guarantees"
      ],
      actionLabel: "Contact Sales",
      priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      exclusive: true,
    },
  ]

  return (
    <section className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <PricingHeader 
          title="Pricing Plans" 
          subtitle="Choose the right plan for your needs" 
        />
        <PricingSwitch onSwitch={togglePricingPeriod} />
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {plans.map((plan) => (
            <PricingCard 
              user={user}
              handleCheckout={handleCheckout}
              key={plan.title}
              isYearly={isYearly}
              title={plan.title}
              monthlyPrice={typeof plan.monthlyPrice === 'number' ? plan.monthlyPrice : 0}
              yearlyPrice={typeof plan.yearlyPrice === 'number' ? plan.yearlyPrice : 0} 
              description={plan.description}
              features={plan.features}
              actionLabel={plan.actionLabel}
              priceIdMonthly={plan.priceIdMonthly}
              priceIdYearly={plan.priceIdYearly}
              popular={plan.popular}
              exclusive={plan.exclusive}
            />
          ))}
        </div>
      </div>
    </section>
  )
}