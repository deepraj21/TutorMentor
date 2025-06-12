import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <Link to="/login" className="inline-flex items-center text-sm text-education-600 dark:text-education-400 mb-4 hover:text-education-800 dark:hover:text-education-300 transition-colors">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to selection
      </Link>
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold md:text-center">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information that you provide directly to us, including but not limited to your name, 
              email address, and any other information you choose to provide. We also collect information 
              about your use of our services and interactions with our platform.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to provide, maintain, and improve our services, to communicate 
              with you, and to personalize your experience. We may also use your information to send you 
              important updates and notifications about our services.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell or rent your personal information to third parties. We may share your information 
              with service providers who assist us in operating our platform, conducting our business, or 
              serving our users.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal information. You may also have 
              the right to restrict or object to certain processing of your information. To exercise these 
              rights, please contact us.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about our Privacy Policy, please contact us at 
              <Link to="mailto:tutormentor2025@gmail.com" className="underline ml-2">tutormentor2025@gmail.com</Link>
              .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

export default PrivacyPolicy