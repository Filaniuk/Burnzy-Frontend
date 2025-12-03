import { Suspense } from "react";

export default function AnalyzeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div />}>
            {children}
        </Suspense>
    );
}
