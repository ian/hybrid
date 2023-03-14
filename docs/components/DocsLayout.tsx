import DocsNav from "./DocsNav"

export default function DocsLayout({
	children
}: {
	children: React.ReactNode
}) {
	return (
		<section className="min-h-screen p-20">
			<div className="relative flex gap-10 mx-auto max-w-7xl">
				<div>
					<DocsNav className="w-[200px]" />
				</div>
				<main className="w-full space-y-5">{children}</main>
			</div>
		</section>
	)
}
