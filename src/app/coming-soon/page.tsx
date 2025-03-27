import { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Coming Soon | CamboConnect',
  description: 'CamboConnect - Coming Soon',
}

export default function ComingSoon() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center  text-white p-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        {/* Logo container */}
        <div className="mb-12">
          <div className="relative w-64 h-32 mx-auto">
            <Image
              src="/images/logo.png"
              alt="CamboConnect Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold text-theme-navy">
            Something Amazing Is Coming Soon
          </h2>
          
          <p className="text-xl text-theme-navy font-body max-w-2xl mx-auto">
            We're working hard to bring you something special. Stay tuned for updates!
          </p>
        </div>

        {/* Decorative elements */}
        <div className="mt-12">
          <div className="h-1 w-20 bg-theme-gold-DEFAULT mx-auto rounded-full"></div>
        </div>

        {/* Contact info */}
        <div className="mt-12 text-theme-teal font-body">
          <p>For inquiries, please contact us at:</p>
          <a 
            href="mailto:info@camboconnect.com" 
            className="text-theme-gold-dark hover:text-theme-red-dark transition-colors"
          >
            camboconnect.co@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
} 