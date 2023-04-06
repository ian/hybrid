import HomeHeader from "~/components/Header"

export default function AppLayout({ children }: { children: React.ReactNode }) {
	return (
		<section className="flex flex-col min-h-screen">
			<main className="flex-grow w-full p-5 space-y-5">{children}</main>
		</section>
	)
}
