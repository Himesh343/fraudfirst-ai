import { EmptyState } from "../components/common/EmptyState.jsx";

export default function NotFoundPage() {
  return <EmptyState title="Page not found" message="The FraudFirst page you requested does not exist." actionLabel="Go home" to="/" />;
}
