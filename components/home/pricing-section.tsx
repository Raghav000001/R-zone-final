import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Star } from "lucide-react"

export default function PricingSection() {
  const plans = [
    {
      name: "Basic",
      price: "₹2,999",
      period: "/month",
      description: "Perfect for beginners starting their yoga journey",
      features: [
        "8 group classes per month",
        "Basic meditation sessions",
        "Access to online resources",
        "Community support",
        "Monthly progress tracking",
      ],
      popular: false,
    },
    {
      name: "Premium",
      price: "₹4,999",
      period: "/month",
      description: "Ideal for dedicated practitioners seeking growth",
      features: [
        "Unlimited group classes",
        "4 personal training sessions",
        "AI wellness plan included",
        "Nutrition guidance",
        "Priority booking",
        "Advanced workshops access",
        "Monthly health assessment",
      ],
      popular: true,
    },
    {
      name: "Elite",
      price: "₹7,999",
      period: "/month",
      description: "Complete wellness transformation package",
      features: [
        "Unlimited classes & sessions",
        "Weekly personal training",
        "Custom AI wellness plans",
        "Ayurvedic consultation",

        "Retreat discounts",
        "One-on-one coaching",
        "24/7 support access",
      ],
      popular: false,
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 fitness-text-gradient">Choose Your Fitness Journey</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Flexible membership plans designed to support your unique path to health and happiness. Start with what
            feels right for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden ${
                plan.popular ? "border-green-500 shadow-xl scale-105 dark:border-green-400" : "hover:shadow-lg"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2">
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">Most Popular</span>
                  </div>
                </div>
              )}

              <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-6"}`}>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-green-600 dark:text-green-400">{plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-300">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{plan.description}</p>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "yoga-gradient text-white hover:opacity-90"
                      : "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            All plans include a 7-day free trial. No commitment required.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>✓ Cancel anytime</span>
            <span>✓ Money-back guarantee</span>
            <span>✓ Expert support included</span>
          </div>
        </div>
      </div>
    </section>
  )
}
