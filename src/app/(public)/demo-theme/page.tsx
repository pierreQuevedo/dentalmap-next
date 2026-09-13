import { ThemeToggle } from '@/components/site/theme-toggle'

/** Page de vérification du theme switcher, temporaire. */
export const metadata = { title: 'Démo thème', robots: { index: false } }

export default function DemoTheme() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 p-10">
      <h1 className="text-2xl font-semibold text-fg">Theme switcher</h1>

      <div className="flex items-center gap-6 rounded-[20px] border border-line bg-bg p-6 shadow-pop">
        <ThemeToggle
          variant="circle-blur"
          size="icon"
          modes={['light', 'dark', 'system']}
          aria-label="Changer de thème"
          className="size-[42px] hover:bg-bg-soft"
          tailleReservee="size-[42px]"
        />
        <ThemeToggle
          variant="fade"
          size="sm"
          modes={['light', 'dark', 'system']}
          aria-label="Changer de thème"
          tailleReservee="size-7"
        />
        <span className="text-sm text-fg-2">circle-blur 42 px, puis fade petit format</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-bg p-4">
          <p className="text-fg">Fond principal, texte principal</p>
          <p className="mt-1 text-sm text-fg-2">Texte secondaire</p>
        </div>
        <div className="rounded-xl border border-line bg-bg-soft p-4">
          <p className="text-fg">Fond adouci</p>
          <p className="mt-1 text-sm text-fg-2">bg-soft</p>
        </div>
        <div className="rounded-xl bg-brand p-4 text-primary-foreground">Accent anthracite</div>
        <div className="rounded-xl border border-line-strong p-4 text-fg">Bordure appuyée</div>
      </div>
    </main>
  )
}
