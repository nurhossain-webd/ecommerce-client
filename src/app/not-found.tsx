import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return <EmptyState icon="search" title="Page not found" action={<ButtonLink href="/">Return home</ButtonLink>}>The page may have moved, or the address may be incorrect.</EmptyState>;
}
