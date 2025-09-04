"use client";

import { useEffect, useState } from 'react';
import type { Certificate } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { fetchMyCertificates } from '@/lib/certificates-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Download, Eye, Loader2, Share2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

export function MyCertificates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchMyCertificates()
        .then(setCertificates)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleShare = (certificateId: string) => {
    const url = `${window.location.origin}/certificates/${certificateId}`;
    navigator.clipboard.writeText(url);
    toast({
        title: "Link Copied!",
        description: "Certificate verification link copied to clipboard.",
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded-lg"></div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="h-10 bg-muted rounded w-24"></div>
              <div className="h-10 bg-muted rounded w-24"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
        <Card className="text-center py-12">
            <CardHeader>
                <Award className="mx-auto h-12 w-12 text-muted-foreground" />
                <CardTitle>No Certificates Yet</CardTitle>
                <CardDescription>
                Start a test from the homepage to earn your first certificate!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Link href="/" passHref>
                    <Button>Start a New Test</Button>
                </Link>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     {certificates
        .slice() // create a shallow copy to avoid mutating original state
        .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()) // ✅ Sort by issueDate (latest first)
        .map(cert => (
        <Card key={cert.id} className="flex flex-col">
          {/* <CardHeader>
            <Image
                data-ai-hint="certificate award"
                src={`https://picsum.photos/seed/${cert.id}/600/400`}
                alt={cert.videoTitle}
                width={600}
                height={400}
                className="rounded-t-lg aspect-video object-cover"
            />
          </CardHeader> */}
          <CardContent className="flex-grow pb-0 pt-3">
             <CardTitle className="text-lg leading-tight my-2">{cert.videoTitle}</CardTitle>
            <CardDescription>
              Issued on: {new Date(cert.issueDate).toLocaleDateString()}
            </CardDescription>
          </CardContent>
          <CardFooter className="flex-row justify-between gap-2 p-3">
            <Link href={`/certificates/${cert.id}`} passHref>
                <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" /> View</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => handleShare(cert.id)}><Share2 className="mr-2 h-4 w-4" /> Share</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
