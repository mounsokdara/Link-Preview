import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LinkPreviewCardSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto animate-pulse">
        <Card className="w-full overflow-hidden shadow-xl">
            <Skeleton className="aspect-video w-full bg-muted" />
            <CardContent className="p-6 space-y-4">
                <Skeleton className="h-7 w-3/4 rounded-md" />
                <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-5/6 rounded-md" />
                </div>
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-5 w-1/3 rounded-md" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
