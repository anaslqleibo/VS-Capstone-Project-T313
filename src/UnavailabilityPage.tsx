import { injectModalOverlay, PageProps } from "./App";

export default function UnavailabilityPage({modalContainer, rootRef}: PageProps) {
    return (
    <div className="relative flex-[1] bg-[#f4f4f4] overflow-hidden">
        {injectModalOverlay(modalContainer)}
        <h1>Unavailability Page</h1>
    </div>
    );
}