import LocalizedClientLink from "@modules/common/components/localized-client-link"

const steps = [
  {
    title: "Välj sten",
    text: "Granit, marmor eller kalksten i den tjocklek du behöver.",
  },
  {
    title: "Ange dina mått",
    text: "Priset räknas fram direkt utifrån skivans yta.",
  },
  {
    title: "Vi tillverkar",
    text: "Skivan skärs och slipas för hand i vår verkstad i Jämtland.",
  },
]

const Hero = () => {
  return (
    <section className="w-full bg-granite-900 text-stone-50">
      <div className="content-container flex flex-col gap-y-12 py-20 small:py-32">
        <div className="flex flex-col gap-y-6 max-w-2xl">
          <p className="txt-small-plus uppercase tracking-[0.2em] text-granite-300">
            Natursten från Jämtland
          </p>
          <h1 className="font-display text-4xl small:text-6xl font-normal leading-tight">
            Vi skräddarsyr i sten
          </h1>
          <p className="text-lg text-granite-100 max-w-xl">
            Bänkskivor och fönsterbänkar tillverkade efter dina mått. Ange
            längd och djup så ser du priset direkt.
          </p>
          <div className="flex flex-wrap gap-4">
            <LocalizedClientLink
              href="/categories/bankskivor"
              className="inline-flex h-11 items-center rounded-base bg-stone-50 px-6 txt-compact-medium-plus text-granite-900 hover:bg-stone-200 transition-colors"
            >
              Se bänkskivor
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="inline-flex h-11 items-center rounded-base border border-granite-300 px-6 txt-compact-medium-plus text-stone-50 hover:bg-granite-700 transition-colors"
            >
              Hela sortimentet
            </LocalizedClientLink>
          </div>
        </div>
        <ol className="grid grid-cols-1 small:grid-cols-3 gap-6 border-t border-granite-700 pt-10">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-x-4">
              <span className="font-display text-2xl text-granite-300">
                {i + 1}
              </span>
              <div>
                <h2 className="txt-medium-plus">{step.title}</h2>
                <p className="txt-small text-granite-300 mt-1">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Hero
