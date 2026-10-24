import { lazy, Suspense, useEffect, useState } from "react";
import type { CategoryInfo, GameMode, GameState, Locale, ResultsResponse } from "../../shared/api.ts";
import { bandFor } from "../../shared/rarity.ts";
import { buildShareText } from "../../shared/shareText.ts";
import { getUf } from "../../shared/ufs.ts";
import { Link } from "react-router-dom";
import { api } from "../lib/api.ts";
import { authClient } from "../lib/authClient.ts";
import { formatPercent } from "../lib/format.ts";
import { useLocale } from "../lib/locale.tsx";
import { Countdown } from "./Countdown.tsx";
import { ReportDialog } from "./ReportDialog.tsx";
import { ShareButtons } from "./ShareButtons.tsx";

const BrazilMap = lazy(() => import("./BrazilMap.tsx"));

type Tab = "popular" | "rare" | "all" | "wrong";

interface Props {
  puzzleId: number;
  rows: CategoryInfo[];
  cols: CategoryInfo[];
  game: GameState;
  mode: GameMode;
  locale: Locale;
}

export function ResultsPanel({ puzzleId, rows, cols, game, mode, locale }: Props) {
  const { t } = useLocale();
  const [results, setResults] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<Tab>("popular");
  const [mapCell, setMapCell] = useState(0);
  const [reporting, setReporting] = useState(false);
  const { data: session } = authClient.useSession();
  const practice = mode === "practice";
  const archive = mode === "archive";
  const catLabel = (cat: CategoryInfo) => (locale === 'en' ? cat.labelEn : locale === 'es' ? cat.labelEs : cat.label)
  const cellLabel = (cell: number) => `${catLabel(rows[Math.floor(cell / 3)])} × ${catLabel(cols[cell % 3])}`

  const TABS: [Tab, string][] = [
    ["popular", t.results.tabPopular],
    ["rare", t.results.tabRare],
    ["all", t.results.tabAll],
    ["wrong", t.results.tabWrong],
  ];

  useEffect(() => {
    api.results(puzzleId, mode).then(setResults, () => setError(true));
  }, [puzzleId, mode, game.status]);

  const cellPercents = Array.from(
    { length: 9 },
    (_, i) => game.filled.find((f) => f.cell === i)?.percent ?? null,
  );
  const shareText = buildShareText({
    puzzleNumber: puzzleId,
    cellPercents,
    score: game.rarity,
    url: `${window.location.origin}/r/${game.shareId}`,
  });

  const title = practice
    ? t.results.titlePractice
    : game.status === "completed"
      ? t.results.titleCompleted
      : game.status === "gave_up"
        ? t.results.titleGaveUp
        : t.results.titleOutOfGuesses;

  return (
    <section className="game-panel mt-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-white/70">
          {t.results.correctCount(game.correctCount)} · {t.results.scorePartial(game.rarity)}{" "}
          {archive ? (
            <>
              ·{" "}
              <Link to="/arquivo" className="underline">
                {t.results.backToArchive}
              </Link>
            </>
          ) : (
            <>
              · {t.results.nextPuzzleIn} <Countdown />
            </>
          )}
        </p>
        {practice && <p className="mt-1 text-sm text-white/70">{t.results.practiceNote}</p>}
      </div>

      {!practice && <ShareButtons text={shareText} />}

      {!practice && session?.user.isAnonymous && (
        <p className="rounded-lg bg-white p-3 text-sm text-slate-900">
          {t.results.keepHistoryPrompt}{" "}
          <Link to="/entrar" className="font-semibold text-brand-green underline">
            {t.results.loginOrCreate}
          </Link>
          {t.results.todaysGameIncluded}
        </p>
      )}

      <div>
        <h3 className="font-semibold">{t.results.answers}</h3>
        {error && <p className="text-sm text-red-200">{t.results.loadFailed}</p>}
        {!results && !error && <p className="text-sm text-white/70">{t.results.loading}</p>}
        {results && (
          <>
            <p className="text-xs text-white/70">
              {results.players} {t.results.players(results.players)}
              {mode === "normal" ? t.results.today : ""} · {t.results.tapToSeeOnMap}
            </p>
            <figure className="mt-3 flex flex-col items-center">
              <Suspense fallback={<div className="aspect-square w-full max-w-xs" />}>
                <BrazilMap
                  title={cellLabel(mapCell)}
                  valid={results.cells[mapCell].answers.map((a) => a.uf)}
                  mine={game.filled.find((f) => f.cell === mapCell)?.uf}
                />
              </Suspense>
              <figcaption className="mt-1 text-center text-xs text-white/70">{cellLabel(mapCell)}</figcaption>
            </figure>
            <div role="tablist" className="mt-2 flex flex-wrap gap-1">
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium",
                    tab === id
                      ? "bg-white text-brand-green"
                      : "bg-white/10 text-white hover:bg-white/20",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === "wrong" ? (
              <WrongList results={results} rows={rows} cols={cols} locale={locale} />
            ) : (
              <ol className="mt-3 grid gap-3 sm:grid-cols-3">
                {results.cells.map(({ cell, answers }) => {
                  const shown =
                    tab === "popular"
                      ? answers.slice(0, 3)
                      : tab === "rare"
                        ? [...answers].reverse().slice(0, 3)
                        : answers;
                  const mine = game.filled.find((f) => f.cell === cell)?.uf;
                  return (
                    <li key={cell}>
                      <button
                        type="button"
                        onClick={() => setMapCell(cell)}
                        aria-pressed={mapCell === cell}
                        className={[
                          "h-full w-full rounded-lg p-2 text-left text-xs text-slate-900",
                          mapCell === cell ? "bg-amber-50 ring-2 ring-brand-yellow" : "bg-white",
                        ].join(" ")}
                      >
                        <p className="font-semibold">{cellLabel(cell)}</p>
                        <ul className="mt-1 space-y-0.5">
                          {shown.map((a) => (
                            <li
                              key={a.uf}
                              className={a.uf === mine ? "font-bold text-brand-green" : ""}
                            >
                              {a.picks > 0 ? bandFor(a.percent).emoji : "·"} {getUf(a.uf)?.name}:{" "}
                              {a.picks > 0 ? formatPercent(a.percent) : t.results.nobodyChose}
                            </li>
                          ))}
                        </ul>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
            <p className="mt-4 text-center text-xs text-white/70">
              {t.results.foundAnError}{" "}
              <button type="button" onClick={() => setReporting(true)} className="underline">
                {t.results.reportIt}
              </button>
            </p>
            {reporting && (
              <ReportDialog
                puzzleId={puzzleId}
                rows={rows}
                cols={cols}
                cells={results.cells}
                initialCell={mapCell}
                locale={locale}
                onClose={() => setReporting(false)}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function WrongList({
  results,
  rows,
  cols,
  locale,
}: {
  results: ResultsResponse;
  rows: CategoryInfo[];
  cols: CategoryInfo[];
  locale: Locale;
}) {
  const { t } = useLocale();
  const catLabel = (cat: CategoryInfo) => (locale === 'en' ? cat.labelEn : locale === 'es' ? cat.labelEs : cat.label)
  if (!results.wrongGuesses.length)
    return <p className="mt-3 text-sm text-white/70">{t.results.noWrongGuesses}</p>;
  return (
    <ul className="mt-3 space-y-1 text-sm">
      {results.wrongGuesses.map((w, i) => {
        const failed = w.failed.map((axis) =>
          axis === "row" ? catLabel(rows[Math.floor(w.cell / 3)]) : catLabel(cols[w.cell % 3]),
        );
        return (
          <li key={i}>
            <strong>{getUf(w.uf)?.name}</strong> {t.results.doesNotMatch}: {failed.join(` ${t.results.and} `)}
          </li>
        );
      })}
    </ul>
  );
}
