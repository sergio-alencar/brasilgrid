export function Placeholder({ title }: { title: string }) {
  return (
    <section>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-500">Em construção.</p>
    </section>
  )
}
