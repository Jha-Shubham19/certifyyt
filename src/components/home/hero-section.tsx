"use client";

import { FileVideo, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
// import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Floating Background Elements */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-3xl animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-20 blur-2xl animate-float animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full opacity-15 blur-3xl animate-float"></div>
      </div> */}

      <Card className="glass-effect shadow-2xl relative overflow-hidden group transition-shadow duration-300 hover:shadow-purple-500/20 border border-white/10">
        {/* Static Gradient Background - removed heavy animations */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-pink-600/10"></div>

        {/* Card Header */}
        <CardHeader className="text-center relative z-10 pb-2 sm:pb-8">
          <div className="mb-1 sm:mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-5xl font-black tracking-tight gradient-text drop-shadow-lg text-white mb-4">
            CertifyYT
          </CardTitle>
          <CardTitle className="text-xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
            Unlock Your YouTube Certificate
          </CardTitle>
          <CardDescription className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {/* Transform any YouTube video or playlist into a certified learning experience.  */}
            Take our AI-powered quiz and earn your official Youtube learning certificate.
          </CardDescription>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="relative z-10 pt-0">
          <form
            action="/quiz"
            method="GET"
            className="space-y-2 sm:space-y-8"
          >
            {/* YouTube URL Input */}
            <div className="space-y-2 sm:space-y-4">
              <Label htmlFor="youtube-url" className="text-sm sm:text-lg font-semibold text-foreground">
                Enter YouTube Link
              </Label>
              <div className="relative group">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors duration-300 group-hover:text-purple-500" />
                <Input
                  id="youtube-url"
                  name="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  className="pl-12 h-12 text-xs sm:h-14 sm:text-lg border-2 border-muted-foreground/20 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1 sm:pt-2">
              <Button
                type="submit"
                className="w-full h-12 sm:h-16 text-sm sm:text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 transition-colors duration-200 shadow-2xl hover:shadow-purple-500/25"
              >
                <FileVideo className="mr-2 h-4 w-4" />
                Take Quiz
              </Button>
            </div>
          </form>

          {/* Features Section */}
          <div className="mt-6 sm:mt-12 pt-4 sm:pt-8 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-6">
              <div className="text-center space-y-2 sm:space-y-3">
                <div className="inline-flex items-center justify-center w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <svg className="w-4 sm:w-6 h-4 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-xs sm:text-foreground">AI-Powered</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Smart question generation from video content</p>
              </div>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-xs sm:text-foreground">Verified</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Secure certificate validation system</p>
              </div>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-xs sm:text-foreground">Instant</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Quick results and certificate generation</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
