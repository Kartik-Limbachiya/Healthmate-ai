import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Activity } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="border-t bg-secondary text-white">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold">HealthMate</h3>
            </div>
            <p className="text-sm text-gray-400">
              Your all-in-one health partner for tracking workouts, nutrition, and progress.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-primary">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/workouts" className="text-gray-400 hover:text-primary">
                  Workout Library
                </Link>
              </li>
              <li>
                <Link href="/nutrition" className="text-gray-400 hover:text-primary">
                  Nutrition Planning
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-primary">
                  Progress Tracking
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  Community Support
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  Health Guides
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  Nutrition Tips
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} HealthMate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

