import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
       <Link to="/login" className="inline-flex items-center text-sm text-education-600 dark:text-education-400 mb-4 hover:text-education-800 dark:hover:text-education-300 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to selection
        </Link>
      <Card className="border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold md:text-center">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using this platform, you agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">2. User Responsibilities</h2>
            <p className="text-muted-foreground">
              Users are responsible for maintaining the confidentiality of their account information and 
              for all activities that occur under their account. You agree to notify us immediately of 
              any unauthorized use of your account.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Content Guidelines</h2>
            <p className="text-muted-foreground">
              Users must not post or share content that is illegal, harmful, threatening, abusive, 
              harassing, defamatory, or otherwise objectionable. We reserve the right to remove any 
              content that violates these guidelines.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Privacy Policy</h2>
            <p className="text-muted-foreground">
              Your use of our services is also governed by our Privacy Policy. Please review our 
              Privacy Policy to understand our practices regarding your personal information.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Modifications to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes by posting the new Terms and Conditions on this page.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms and Conditions, please contact us at 
              <Link to="mailto:tutormentor2025@gmail.com" className="underline ml-2">tutormentor2025@gmail.com</Link>
             .
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}

export default TermsAndConditions