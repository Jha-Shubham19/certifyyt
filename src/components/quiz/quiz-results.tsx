import type { MCQ } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, RefreshCw, XCircle } from "lucide-react";
import { Button } from "../ui/button";
import { CertificateDisplay } from "../certificate/certificate-display";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type QuizResultsProps = {
  mcqs: MCQ[];
  userAnswers: { [key: number]: string };
  videoTitle: string;
  onRetry: () => void;
};

const PASS_THRESHOLD = 76;

export function QuizResults({ mcqs, userAnswers, videoTitle, onRetry }: QuizResultsProps) {
  const { user } = useAuth();
  const [serverResult, setServerResult] = useState<{ passed: boolean; score: number; certificateId?: string; videoTitle?: string; message?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showAlreadyCert, setShowAlreadyCert] = useState(false);

  const submitToServer = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const idToken = await (await import("firebase/auth")).getAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not authenticated");
      
      // Get the YouTube URL from the current page URL
      const urlParams = new URLSearchParams(window.location.search);
      const youtubeUrl = urlParams.get('url');
      
      if (!youtubeUrl) {
        throw new Error("YouTube URL not found");
      }
      
      const res = await fetch("/api/quiz/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        // Send displayName now so the server writes the final certificate
        // videoTitle is now extracted server-side from quiz cache for security
        body: JSON.stringify({ youtubeUrl, userAnswers, displayName: user?.displayName || "User" }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setServerResult(data);
      if (data?.passed && typeof data?.message === "string" && data.message.toLowerCase().includes("already have a certificate")) {
        setShowAlreadyCert(true);
      }
    } catch (e) {
      console.error(e);
      setServerResult({ passed: false, score: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  if (!serverResult) {
    // Trigger server validation when entering results view
    submitToServer();
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Validating your submission...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Badge>Checking answers securely</Badge>
        </CardContent>
      </Card>
    );
  }

  if (serverResult.passed) {
    const extraProps: any = serverResult.certificateId ? { certificateId: serverResult.certificateId } : {};
    // Use videoTitle from server response for security (extracted from quiz cache)
    const displayVideoTitle = serverResult.videoTitle || videoTitle;
    return (
      <>
        <AlertDialog open={showAlreadyCert} onOpenChange={setShowAlreadyCert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Certificate already exists</AlertDialogTitle>
              <AlertDialogDescription>
                You already have a certificate for this video/playlist. <br />
                You can update the name if you want.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowAlreadyCert(false)}>Okay</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="container px-3 sm:px-0 py-8 sm:py-12">
          <CertificateDisplay videoTitle={displayVideoTitle} score={serverResult.score} {...extraProps} />
        </div>
      </>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center gap-4">
            <Info className="h-12 w-12 text-yellow-500" />
            <CardTitle className="text-2xl sm:text-3xl">Test Results</CardTitle>
        </div>
        <CardDescription>
          You scored {serverResult.score}%. A score of {PASS_THRESHOLD}% is required to pass.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
          <div className="p-4 bg-secondary rounded-lg">
            <p className="text-sm text-muted-foreground">Your Score</p>
            <p className={cn("text-3xl sm:text-4xl font-bold", serverResult.passed ? "text-green-600" : "text-destructive")}>{serverResult.score}%</p>
          </div>
        </div>

        {/* Client no longer reveals correct answers. Optionally show user's selections only. */}
        <Accordion type="single" collapsible className="w-full select-none">
            <AccordionItem value="review">
                <AccordionTrigger>Review Your Selections</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4">
                        {mcqs.map((mcq, index) => (
                            <div key={index} className="p-4 border rounded-md">
                                <p className="font-semibold">{index + 1}. {mcq.question}</p>
                                <div className="mt-2 space-y-1 text-sm">
                                    <p>Your answer: <span className="font-medium">{userAnswers[index] || "Not answered"}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>

      </CardContent>
      <CardFooter className="flex justify-center">
         <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Test
        </Button>
      </CardFooter>
    </Card>
  );
}
