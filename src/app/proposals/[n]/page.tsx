import { notFound, redirect } from "next/navigation";
import { diffPlaybooks } from "@playbook/index";
import { requireUser } from "@/lib/guards";
import { isAdmin } from "@/lib/admins";
import { getProposal } from "@/lib/proposals";
import { ProposalView } from "./ProposalView";

export const dynamic = "force-dynamic";

export default async function ProposalPage({ params }: { params: Promise<{ n: string }> }) {
  const session = await requireUser();
  if (!session) redirect("/login");

  const { n } = await params;
  const proposal = await getProposal(Number(n)).catch(() => null);
  if (!proposal || !proposal.after) notFound();

  const diff = diffPlaybooks(proposal.before, proposal.after);
  const userEmail = session.user!.email!;
  const userIsAdmin = isAdmin(userEmail);

  return (
    <ProposalView
      number={proposal.number}
      url={proposal.url}
      state={proposal.state}
      merged={proposal.merged}
      meta={proposal.meta}
      before={proposal.before}
      after={proposal.after}
      diff={diff}
      userIsAdmin={userIsAdmin}
    />
  );
}
