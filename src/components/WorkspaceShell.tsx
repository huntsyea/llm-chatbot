"use client";

import { PanelLeft, RefreshCw } from "lucide-react";
import type { ReactElement } from "react";
import { useExplorationWorkspace } from "../hooks/useExplorationWorkspace";
import { CommandBar } from "./CommandBar";
import { ExplorationCanvas } from "./canvas/ExplorationCanvas";
import { InspectorPanel } from "./InspectorPanel";
import { SessionTrail } from "./SessionTrail";

export function WorkspaceShell(): ReactElement {
  const workspace = useExplorationWorkspace();

  return (
    <main className="grid h-screen-safe min-h-screen grid-rows-[auto_minmax(0,1fr)_auto] bg-background text-foreground">
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PanelLeft className="h-4 w-4 text-primary" />
            <h1 className="truncate text-base font-semibold">Wabbit</h1>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            AI exploration workspace
          </p>
        </div>
        <button
          type="button"
          onClick={workspace.newSession}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-foreground transition hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          New
        </button>
      </header>
      <section className="grid min-h-0 grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)_360px]">
        <SessionTrail
          session={workspace.session}
          onSelectNode={workspace.selectNode}
        />
        <div className="min-h-0 overflow-hidden p-4">
          <ExplorationCanvas
            session={workspace.session}
            onSelectNode={workspace.selectNode}
          />
        </div>
        <InspectorPanel
          node={workspace.selectedNode}
          isRunning={workspace.isRunning}
          onFollowHeading={workspace.followHeading}
          onPromoteSuggestion={workspace.promoteSuggestion}
        />
      </section>
      <footer className="border-t border-border bg-card p-3">
        <CommandBar
          routes={workspace.routes}
          routeId={workspace.routeId}
          isRunning={workspace.isRunning}
          onRouteChange={workspace.setRouteId}
          onSubmit={workspace.submitPrompt}
        />
        {workspace.lastError ? (
          <p className="mt-2 text-sm text-destructive">{workspace.lastError}</p>
        ) : null}
      </footer>
    </main>
  );
}

export default WorkspaceShell;
