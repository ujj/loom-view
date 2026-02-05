<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { App, TFile } from 'obsidian';
  import type { LoomViewSettings } from './main';

  export let app: App;
  export let settings: LoomViewSettings;
  export let saveVisibleLanes: (lanes: string[]) => Promise<void>;

  let mainContentEl: HTMLElement;

  // State for temporal resolution (now a number representing years per unit)
  let resolution: number = 10; // Default to decade

  // Parse zoom levels from settings
  $: zoomLevels = (() => {
    try {
      return settings.zoomLevels.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
    } catch {
      return [1, 10, 100]; // Fallback to defaults
    }
  })();

  // Ensure current resolution is valid when zoomLevels change
  $: if (zoomLevels.length > 0 && zoomLevels.indexOf(resolution) === -1) {
    resolution = zoomLevels[0]; // Reset to first available zoom level
  }

  // Generate label for zoom level
  function getZoomLabel(level: number): string {
    if (level === 1) return 'Year';
    if (level === 10) return 'Decade';
    if (level === 100) return 'Century';
    if (level === 1000) return 'Millennium';
    return `${level} Years`;
  }

  interface ParsedDate {
    coordinate: number;
    display: string;
  }

  interface HistoryNote {
    path: string;
    fileName: string;
    title: string;
    lanes: string[];
    yearStart: number;
    yearEnd: number;
    yearStartDisplay: string;
    yearEndDisplay: string;
    connectionValues: Map<string, string[]>;
    noteStyle: 'thematic' | 'event';
  }

  let notes: HistoryNote[] = [];
  let lanes: string[] = [];
  let yearRange = { min: 0, max: 0 };
  let hoveredConnectionValues: string[] = [];
  let hoveredNotePath: string | null = null; /* source note for Entity Glow / Thread */
  let hasScrolledInitial = false;
  let threadLines: { from: { x: number; y: number }; to: { x: number; y: number }[] } | null = null;
  let innerGridEl: HTMLElement;
  let isFictionalCalendar = false; // Track if we're using fictional dates (non-numeric strings)
  
  // Lane filter state
  let visibleLanes: Set<string> = new Set();
  let showLaneFilter: boolean = false;

  /** Region slug for CSS class (e.g. "South-Asia" -> "south-asia"). */
  function getRegionSlug(region: string): string {
    return region.toLowerCase().replace(/\s+/g, '-');
  }

  /** Neon glow colors per region (Entity Glow). */
  const regionGlowColors: Record<string, string> = {
    'americas': '#c9a227',
    'europe': '#4a9c7c',
    'africa': '#b8860b',
    'asia': '#6b8e23',
    'south-asia': '#cd853f',
    'east-asia': '#4a7c9e',
  };


  onMount(async () => {
    console.log('LoomView.svelte: onMount');

    // Helper function to check if a path matches a folder pattern (supports wildcards)
    function matchesFolder(filePath: string, pattern: string): boolean {
      // Convert wildcard pattern to regex
      // "History/*" becomes /^History\/[^\/]+/
      // "History/Ancient" becomes exact match
      if (pattern.indexOf('*') !== -1) {
        // Escape special regex characters except *
        const escapedPattern = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
        // Replace * with [^/]+ (match any characters except /)
        const regexPattern = '^' + escapedPattern.replace(/\*/g, '[^/]+');
        const regex = new RegExp(regexPattern);
        return regex.test(filePath);
      } else {
        // Exact folder match
        return filePath.startsWith(pattern + '/') || filePath.startsWith(pattern);
      }
    }

    // Helper function to check if a tag matches a pattern (Obsidian-style)
    function matchesTag(tag: string, pattern: string): boolean {
      // Obsidian behavior: searching for "inbox" matches "#inbox" AND "#inbox/to-read" AND "#inbox/processing"
      // So "History" matches "History", "History/India", "History/Ancient", etc.
      // And "History/" matches only nested children like "History/India" (not "History" itself)
      
      if (pattern.endsWith('/')) {
        // Pattern ends with / - only match nested children
        return tag.startsWith(pattern);
      } else {
        // Pattern without trailing / - match exact OR nested children
        return tag === pattern || tag.startsWith(pattern + '/');
      }
    }

    const processNotes = () => {
      console.log('LoomView.svelte: Metadata cache resolved. Processing notes...');
      const allFiles = app.vault.getMarkdownFiles();
      console.log(`LoomView.svelte: Found ${allFiles.length} markdown files.`);
      
      // Parse scope settings
      const sourceFolders = settings.sourceFolders.split(',').map(s => s.trim()).filter(Boolean);
      const requiredTags = settings.requiredTags.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);
      const scopeOperator = settings.scopeOperator;

      // Filter files based on scope settings
      const files = allFiles.filter(file => {
        // If no filters specified, include all files
        if (sourceFolders.length === 0 && requiredTags.length === 0) {
          return true;
        }

        const cache = app.metadataCache.getFileCache(file);
        
        // Check folder match with wildcard support
        const folderMatch = sourceFolders.length === 0 || sourceFolders.some(folder => 
          matchesFolder(file.path, folder)
        );

        // Check tag match with wildcard support
        let tagMatch = requiredTags.length === 0;
        if (requiredTags.length > 0 && cache) {
          const fileTags = cache.tags?.map(t => t.tag.replace(/^#/, '')) || [];
          const frontmatterTags = cache.frontmatter?.tags;
          const allTags = [...fileTags];
          if (frontmatterTags) {
            if (Array.isArray(frontmatterTags)) {
              allTags.push(...frontmatterTags.map(t => String(t).replace(/^#/, '')));
            } else {
              allTags.push(String(frontmatterTags).replace(/^#/, ''));
            }
          }
          tagMatch = requiredTags.some(reqTag => allTags.some(fileTag => matchesTag(fileTag, reqTag)));
        }

        // Apply operator logic
        if (scopeOperator === 'AND') {
          return folderMatch && tagMatch;
        } else {
          // OR logic: if both filters are specified, at least one must match
          if (sourceFolders.length > 0 && requiredTags.length > 0) {
            return folderMatch || tagMatch;
          }
          return folderMatch && tagMatch;
        }
      });

      console.log(`LoomView.svelte: After filtering, ${files.length} files match scope criteria.`);
      console.log('Filtering details:', { 
        sourceFolders, 
        requiredTags, 
        scopeOperator,
        totalFiles: allFiles.length,
        filteredFiles: files.length 
      });

      const historyNotes: HistoryNote[] = [];
      let minYear = Infinity;
      let maxYear = -Infinity;

      // Parse connection keys from settings
      const connKeys = settings.connectionKeys.split(',').map(s => s.trim()).filter(Boolean);

      for (const file of files) {
        const cache = app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;

        if (frontmatter) {
          // Parse dates using dual-track parser
          const startDateValue = frontmatter[settings.startDateKey];
          const endDateValue = frontmatter[settings.endDateKey] ?? startDateValue;
          
          const parsedStart = parseDateValue(startDateValue);
          const parsedEnd = parseDateValue(endDateValue);

          if (parsedStart && parsedEnd) {
            minYear = Math.min(minYear, parsedStart.coordinate);
            maxYear = Math.max(maxYear, parsedEnd.coordinate);

            // Get lane values from configured key
            const laneValue = frontmatter[settings.laneKey];
            const laneArray: string[] = Array.isArray(laneValue) 
              ? laneValue.map(String)
              : (laneValue ? [String(laneValue)] : []);

            // Build connection values map from all configured keys
            const connectionValues = new Map<string, string[]>();
            for (const key of connKeys) {
              const val = frontmatter[key];
              const cleaned = Array.isArray(val) 
                ? val.map(cleanFigure)
                : (val ? [cleanFigure(String(val))] : []);
              connectionValues.set(key, cleaned);
            }

            const note: HistoryNote = {
              path: file.path,
              fileName: file.basename,
              title: frontmatter.title || file.basename,
              lanes: laneArray,
              yearStart: parsedStart.coordinate,
              yearEnd: parsedEnd.coordinate,
              yearStartDisplay: parsedStart.display,
              yearEndDisplay: parsedEnd.display,
              connectionValues: connectionValues,
              noteStyle: frontmatter['note-style'] || 'event',
            };
            historyNotes.push(note);
          }
        }
      }
      
      console.log(`LoomView.svelte: Processed ${historyNotes.length} history notes.`);

      // Detect if we're using fictional calendar by checking if any note has non-numeric date strings
      isFictionalCalendar = files.some(file => {
        const cache = app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;
        if (!frontmatter) return false;
        const startVal = frontmatter[settings.startDateKey];
        return startVal && typeof startVal === 'string' && !/^-?\d+$/.test(startVal.trim());
      });

      notes = historyNotes;
      
      // Dynamic lane discovery and sorting
      const allLaneValues: string[] = [];
      notes.forEach(n => {
        n.lanes.forEach(l => {
          if (allLaneValues.indexOf(l) === -1) {
            allLaneValues.push(l);
          }
        });
      });
      const userOrder = settings.laneOrder.split(',').map(s => s.trim()).filter(Boolean);
      
      // Sort: user-ordered first, then alphabetical for discovered ones
      const orderedLanes = userOrder.filter(l => allLaneValues.indexOf(l) !== -1);
      const unorderedLanes = allLaneValues.filter(l => userOrder.indexOf(l) === -1).sort();
      
      // Build final lane list
      let finalLanes: string[] = [...orderedLanes, ...unorderedLanes];
      
      // Add "Others" lane if enabled and there are notes with lanes not in userOrder
      if (settings.showUncategorized) {
        const hasUncategorized = notes.some(n => 
          n.lanes.length > 0 && n.lanes.some(l => userOrder.indexOf(l) === -1)
        );
        if (hasUncategorized || notes.some(n => n.lanes.length === 0)) {
          finalLanes.push('Others');
        }
      }
      
      lanes = finalLanes;
      
      yearRange = { min: minYear, max: maxYear };
      console.log('LoomView.svelte: Data processing complete.', { notes, lanes, yearRange });

    };

    // Wait for the metadata cache to be resolved before processing notes
    app.metadataCache.on('resolved', processNotes);

    // Initial run
    processNotes();
  });
  
  function cleanFigure(figure: string): string {
    // [[Julius Caesar]] -> Julius Caesar
    return figure.replace(/\[\[|\]\]/g, '').trim();
  }

  /** Dual-track date parser: integers auto-format, strings preserve raw display */
  function parseDateValue(value: string | number): ParsedDate | null {
    if (value === null || value === undefined) return null;

    // TRACK A: Pure integer input (number type)
    if (typeof value === 'number') {
      const display = value < 0 ? `${Math.abs(value)} BCE` : `${value} CE`;
      return { coordinate: value, display };
    }

    const str = String(value).trim();
    if (!str) return null;

    // TRACK A: Pure numeric string (e.g., "-500", "2024")
    if (/^-?\d+$/.test(str)) {
      const num = parseInt(str, 10);
      const display = num < 0 ? `${Math.abs(num)} BCE` : `${num} CE`;
      return { coordinate: num, display };
    }

    // TRACK B: String with text - extract last integer, keep raw display
    // This handles formats like "Era 1: 450" (use 450) or "Year 2024" (use 2024)
    const matches = str.match(/-?\d+/g);
    if (!matches || matches.length === 0) return null;

    return {
      coordinate: parseInt(matches[matches.length - 1], 10), // Use LAST integer
      display: str, // Show raw string as-is in UI
    };
  }

  function formatYearLabel(year: number): string {
    // For fictional calendars, just show the coordinate number
    if (isFictionalCalendar) {
      return String(year);
    }
    // For historical dates, use BCE/CE formatting
    if (year < 0) return `${Math.abs(year)} BCE`;
    return `${year} CE`;
  }

  /** Compute 0-based time column range for a note (for interval packing). */
  function getNoteColumnRange(note: HistoryNote): { startCol: number; endCol: number } {
    const resValue = resolution;
    const start = Math.floor(note.yearStart / resValue);
    const end = Math.floor(note.yearEnd / resValue);
    const min = Math.floor(yearRange.min / resValue);
    return { startCol: start - min, endCol: end - min };
  }

  /** Two intervals [s1,e1] and [s2,e2] (inclusive) overlap iff s1 <= e2 && s2 <= e1. */
  function intervalsOverlap(
    s1: number, e1: number,
    s2: number, e2: number
  ): boolean {
    return s1 <= e2 && s2 <= e1;
  }

  /** Assign subLane (0,1,2,...) per note so overlapping notes in the same region get different lanes. */
  function assignSubLanes(
    regionNotes: { note: HistoryNote; startCol: number; endCol: number }[]
  ): { note: HistoryNote; startCol: number; endCol: number; subLane: number }[] {
    const sorted = [...regionNotes].sort(
      (a, b) => a.startCol !== b.startCol ? a.startCol - b.startCol : a.endCol - b.endCol
    );
    const lanes: { startCol: number; endCol: number }[] = [];
    const result: { note: HistoryNote; startCol: number; endCol: number; subLane: number }[] = [];
    for (const { note, startCol, endCol } of sorted) {
      let laneIndex = 0;
      while (laneIndex < lanes.length) {
        const existing = lanes[laneIndex];
        if (!intervalsOverlap(startCol, endCol, existing.startCol, existing.endCol)) break;
        laneIndex++;
      }
      if (laneIndex === lanes.length) {
        lanes.push({ startCol, endCol });
      } else {
        const ex = lanes[laneIndex];
        lanes[laneIndex] = {
          startCol: Math.min(ex.startCol, startCol),
          endCol: Math.max(ex.endCol, endCol),
        };
      }
      result.push({ note, startCol, endCol, subLane: laneIndex });
    }
    return result;
  }

  interface NotePlacement {
    note: HistoryNote;
    startCol: number;
    endCol: number;
    regionIndex: number;
    subLane: number;
  }

  // Initialize visible lanes when lanes change
  let lastSavedLanes: string[] = [];

  $: if (lanes.length > 0 && visibleLanes.size === 0) {
    // Initialize from saved settings or show all lanes
    if (settings.visibleLanes && settings.visibleLanes.length > 0) {
      const filtered = settings.visibleLanes.filter(lane => lanes.indexOf(lane) !== -1);
      // If none of the saved lanes exist in current view, show all lanes instead
      if (filtered.length > 0) {
        visibleLanes = new Set(filtered);
        lastSavedLanes = filtered;
      } else {
        visibleLanes = new Set(lanes);
        lastSavedLanes = [...lanes];
      }
    } else {
      visibleLanes = new Set(lanes);
      lastSavedLanes = [...lanes];
    }
  }

  // Save visible lanes to settings when they change
  $: if (visibleLanes.size > 0) {
    const visibleLanesArray = Array.from(visibleLanes).sort();
    const lastSaved = lastSavedLanes.slice().sort();
    if (JSON.stringify(visibleLanesArray) !== JSON.stringify(lastSaved)) {
      lastSavedLanes = visibleLanesArray;
      saveVisibleLanes(visibleLanesArray);
    }
  }

  $: filteredLanes = lanes.filter(lane => visibleLanes.has(lane));

  $: placements = (() => {
    const res = resolution; /* force Svelte to re-run when resolution changes (getNoteColumnRange uses it) */
    const list: NotePlacement[] = [];
    const regionLaneCounts: number[] = [];

    // Only process visible lanes
    for (let filteredIndex = 0; filteredIndex < filteredLanes.length; filteredIndex++) {
      const lane = filteredLanes[filteredIndex];
      const laneNotes = notes
        .filter((n) => {
          if (lane === 'Others') {
            // "Others" lane: notes with lanes not in userOrder, or no lanes
            const userOrder = settings.laneOrder.split(',').map(s => s.trim()).filter(Boolean);
            return n.lanes.length === 0 || n.lanes.some(l => userOrder.indexOf(l) === -1);
          } else {
            // Regular lane: notes with this lane value
            return n.lanes.indexOf(lane) !== -1;
          }
        })
        .map((n) => {
          const { startCol, endCol } = getNoteColumnRange(n);
          return { note: n, startCol, endCol };
        });
      const withSubLanes = assignSubLanes(laneNotes);
      const numLanes = laneNotes.length === 0 ? 1 : Math.max(...withSubLanes.map((p) => p.subLane)) + 1;
      regionLaneCounts.push(numLanes);
      for (const p of withSubLanes) {
        list.push({
          note: p.note,
          startCol: p.startCol,
          endCol: p.endCol,
          regionIndex: filteredIndex,
          subLane: p.subLane,
        });
      }
    }

    return { placements: list, regionLaneCounts };
  })();

  $: regionStartRow = (() => {
    const start: number[] = [];
    let row = 2; // row 1 = timeline
    for (let i = 0; i < filteredLanes.length; i++) {
      start.push(row);
      row += placements.regionLaneCounts[i] ?? 1;
    }
    return start;
  })();

  $: totalContentRows = placements.regionLaneCounts.reduce((a, b) => a + b, 0) || 1;

  /** Debug: log placement state when resolution or data changes (remove after debugging). */
  $: if (typeof window !== 'undefined' && notes.length > 0) {
    const resValue = resolution;
    const minCol = Math.floor(yearRange.min / resValue);
    const maxCol = Math.ceil(yearRange.max / resValue);
    console.log('[LoomView] render: resolution=', resolution, 'yearRange=', yearRange, 'timelineSpan=', timelineSpan, 'cols 0-based:', minCol, '..', maxCol);
    if (resolution === 100) {
      console.log('[LoomView] Century view active: timelineSpan=', timelineSpan, 'totalContentRows=', totalContentRows);
    }
    console.log('[LoomView] totalPlacements=', placements.placements.length, 'regionLaneCounts=', placements.regionLaneCounts, 'regionStartRow=', regionStartRow, 'totalContentRows=', totalContentRows);
    placements.placements.slice(0, 15).forEach((p, i) => {
      const yearStart = p.note.yearStart;
      const yearEnd = p.note.yearEnd;
      console.log(`[LoomView] placement ${i}: "${p.note.title}" lane=${filteredLanes[p.regionIndex]} row=${regionStartRow[p.regionIndex] + p.subLane} col=${p.startCol + 2}-${p.endCol + 3} years=${yearStart}-${yearEnd} (startCol=${p.startCol} endCol=${p.endCol} subLane=${p.subLane})`);
    });
    if (placements.placements.length > 15) {
      console.log('[LoomView] ... and', placements.placements.length - 15, 'more placements');
    }
  }

  /** One-time scroll when view opens with data (avoids reactive loop). */
  $: if (mainContentEl && notes.length > 0 && !hasScrolledInitial) {
    hasScrolledInitial = true;
    tick().then(() => {
      if (resolution >= 100) scrollToCenturyEnd();
      else scrollToDecadeOrYear();
    });
  }

  /** Scroll Decade/Year view to 80th percentile of note years. */
  function scrollToDecadeOrYear(): void {
    if (notes.length === 0 || !mainContentEl) return;
    const sortedYears = notes.map((n) => n.yearStart).sort((a, b) => a - b);
    const targetYear = sortedYears[Math.min(Math.floor(sortedYears.length * 0.8), sortedYears.length - 1)];
    const resValue = resolution;
    const min = Math.floor(yearRange.min / resValue);
    const targetColumn = Math.floor(targetYear / resValue) - min;
    const columnWidth = 80;
    const targetScrollLeft = targetColumn * columnWidth;
    tick().then(() => {
      if (mainContentEl) {
        const centered = targetScrollLeft - mainContentEl.clientWidth / 2 + columnWidth / 2;
        mainContentEl.scrollLeft = centered > 0 ? centered : 0;
      }
    });
  }

  /** Century view only: scroll to the end of the timeline so modern era (1900–2100) is visible. Called after Century grid has re-mounted. */
  function scrollToCenturyEnd(): void {
    console.log('[LoomView] scrollToCenturyEnd called, mainContentEl=', !!mainContentEl);
    if (!mainContentEl) return;
    tick().then(() => {
      if (mainContentEl) {
        const maxScroll = mainContentEl.scrollWidth - mainContentEl.clientWidth;
        console.log('[LoomView] scrollToCenturyEnd: scrollWidth=', mainContentEl.scrollWidth, 'clientWidth=', mainContentEl.clientWidth, 'setting scrollLeft=', maxScroll);
        mainContentEl.scrollLeft = maxScroll;
        console.log('[LoomView] scrollToCenturyEnd: after set, scrollLeft=', mainContentEl.scrollLeft);
      } else {
        console.log('[LoomView] scrollToCenturyEnd: mainContentEl null in tick callback');
      }
    });
  }

  function getNoteStyle(p: NotePlacement): string {
    const { startCol, endCol, regionIndex, subLane } = p;
    const gridRow = regionStartRow[regionIndex] + subLane;
    const gridColumnStart = startCol + 2; // +1 for 1-based, +1 for region column
    const gridColumnEnd = endCol + 3;    // endCol inclusive -> span endCol - startCol + 1
    return `
      grid-column: ${gridColumnStart} / ${gridColumnEnd};
      grid-row: ${gridRow};
    `;
  }
  
  function handleNoteClick(path: string) {
    app.workspace.openLinkText(path, '/', false);
  }

  function getConnectionValues(note: HistoryNote): string[] {
    const allValues: string[] = [];
    for (const values of note.connectionValues.values()) {
      allValues.push(...values);
    }
    return allValues;
  }

  function handleMouseOver(note: HistoryNote, sourcePath: string) {
    const connectionValues = getConnectionValues(note);
    console.log('[LoomView] hover', { sourcePath, connectionValues });
    hoveredConnectionValues = connectionValues;
    hoveredNotePath = sourcePath;
  }

  function handleMouseOut() {
    hoveredConnectionValues = [];
    hoveredNotePath = null;
    threadLines = null;
  }

  /** Update thread lines from hovered note to highlighted contemporaries (Entity Glow bonus). */
  /** Use data (notes + hoveredConnectionValues) to decide which notes are highlighted; find DOM by data-note-path so we don't rely on .highlight class timing. */
  $: if (hoveredConnectionValues.length > 0 && hoveredNotePath && mainContentEl) {
    const currentHoveredPath = hoveredNotePath;
    const highlightedPaths = notes.filter((n) => {
      const noteValues = getConnectionValues(n);
      return noteValues.some(v => hoveredConnectionValues.indexOf(v) !== -1);
    }).map((n) => n.path);
    const otherPaths = highlightedPaths.filter((p) => p !== currentHoveredPath);
    tick().then(() => {
      requestAnimationFrame(() => {
        if (!mainContentEl || !currentHoveredPath) return;
        const wrappers = mainContentEl.querySelectorAll('[data-note-path]');
        const getEl = (path: string) => {
          let found: HTMLElement | null = null;
          wrappers.forEach((w) => {
            if ((w as HTMLElement).getAttribute('data-note-path') === path) found = w as HTMLElement;
          });
          return found;
        };
        const sourceEl = getEl(currentHoveredPath);
        if (!sourceEl || otherPaths.length === 0) {
          threadLines = null;
          return;
        }
        const containerRect = mainContentEl.getBoundingClientRect();
        const getCenter = (el: Element) => {
          const r = el.getBoundingClientRect();
          return {
            x: r.left - containerRect.left + mainContentEl.scrollLeft + r.width / 2,
            y: r.top - containerRect.top + mainContentEl.scrollTop + r.height / 2,
          };
        };
        const from = getCenter(sourceEl);
        const to: { x: number; y: number }[] = [];
        otherPaths.forEach((path) => {
          const el = getEl(path);
          if (el) to.push(getCenter(el));
        });
        threadLines = to.length > 0 ? { from, to } : null;
      });
    });
  } else if (!hoveredConnectionValues.length) {
    threadLines = null;
  }

  /** Era-Snap: scroll so the given year is visible (smooth). */
  function scrollToYear(year: number): void {
    if (!mainContentEl) return;
    const resValue = resolution;
    const min = Math.floor(yearRange.min / resValue);
    const columnIndex = Math.floor(year / resValue) - min;
    const targetX = Math.max(0, columnIndex * columnMinWidthPx);
    mainContentEl.scrollTo({ left: targetX, behavior: 'smooth' });
  }

  // Parse era bookmarks from settings
  $: eraBookmarks = (() => {
    const bookmarks: { label: string; year: number }[] = [];
    const lines = settings.eraBookmarks.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const match = trimmed.match(/^(.+?):\s*(-?\d+)$/);
      if (match) {
        const label = match[1].trim();
        const year = parseInt(match[2], 10);
        if (!isNaN(year)) {
          bookmarks.push({ label, year });
        }
      }
    }
    return bookmarks.length > 0 ? bookmarks : [
      { label: 'Bronze', year: -3000 },
      { label: 'Iron', year: -1200 },
      { label: 'Classical', year: -500 },
      { label: 'Discovery', year: 1400 },
      { label: 'Modern', year: 1900 },
    ];
  })();
  
  function isHighlighted(note: HistoryNote): boolean {
    if (hoveredConnectionValues.length === 0) return false;
    const noteValues = getConnectionValues(note);
    return noteValues.some(v => hoveredConnectionValues.indexOf(v) !== -1);
  }
  
  $: columnMinWidthPx = resolution >= 100 ? 140 : 80; /* wider columns in Century+ so note titles are readable */

  $: timelineSpan = (() => {
    if (yearRange.max === -Infinity) return 1;
    const resValue = resolution;
    const start = Math.floor(yearRange.min / resValue);
    const end = Math.ceil(yearRange.max / resValue); // include next period so notes near boundary aren't cut off (e.g. 2099 -> show 2100)
    return end - start + 1;
  })();

  $: timelineLabels = (() => {
    if (yearRange.max === -Infinity) return [];
    const resValue = resolution;
    const start = Math.floor(yearRange.min / resValue);
    const end = Math.ceil(yearRange.max / resValue);
    const labels: { coordinate: number; display: string }[] = [];
    for (let i = start; i <= end; i++) {
        const coordinate = i * resValue;
        labels.push({ coordinate, display: formatYearLabel(coordinate) });
    }
    return labels;
  })();

</script>

<div class="loom-view">
  <div class="loom-top-bar">
    <div class="loom-controls">
      <div class="note-counter">Woven {notes.length} notes</div>
      {#each zoomLevels as zoomLevel}
        <button 
          on:click={() => { 
            resolution = zoomLevel; 
            if (zoomLevel >= 100) {
              tick().then(() => scrollToCenturyEnd());
            } else {
              scrollToDecadeOrYear();
            }
          }} 
          class:active={resolution === zoomLevel}
        >
          {getZoomLabel(zoomLevel)}
        </button>
      {/each}
    </div>
  </div>

  <div class="loom-main-content" bind:this={mainContentEl}>
    {#key resolution}
      <div
        class="loom-inner-grid"
        bind:this={innerGridEl}
        style="grid-template-columns: 150px repeat({timelineSpan}, minmax({columnMinWidthPx}px, 1fr)); grid-template-rows: auto repeat({totalContentRows}, minmax(60px, 1fr));"
      >
        <div class="timeline-corner" style="grid-column: 1; grid-row: 1;">
          <div class="lane-filter-container">
            <button 
              class="filter-btn" 
              on:click={() => {
                console.log('[LoomView] Filter button clicked, current state:', showLaneFilter);
                showLaneFilter = !showLaneFilter;
                console.log('[LoomView] Filter button new state:', showLaneFilter);
              }}
              title="Filter lanes"
            >
              Filter
            </button>
            {#if showLaneFilter}
              <div class="lane-filter-dropdown">
                {#each lanes as lane}
                  <label class="lane-filter-item">
                    <input 
                      type="checkbox" 
                      checked={visibleLanes.has(lane)} 
                      on:change={(e) => {
                        if (e.currentTarget.checked) {
                          visibleLanes = new Set([...visibleLanes, lane]);
                        } else {
                          const newSet = new Set(visibleLanes);
                          newSet.delete(lane);
                          visibleLanes = newSet;
                        }
                      }}
                    />
                    <span>{lane}</span>
                  </label>
                {/each}
              </div>
            {/if}
          </div>
        </div>
        <div class="timeline-header-row" style="grid-column: 2 / -1; grid-row: 1;">
          <div class="timeline-header" style="grid-template-columns: repeat({timelineSpan}, minmax({columnMinWidthPx}px, 1fr));">
            {#each timelineLabels as label}
              <div class="timeline-label">{label.display}</div>
            {/each}
          </div>
        </div>

        <div class="region-labels">
          {#each filteredLanes as lane, laneIndex}
            <div class="region-label" style="grid-column: 1; grid-row: {regionStartRow[laneIndex]} / span {placements.regionLaneCounts[laneIndex]};">{lane}</div>
          {/each}
        </div>

        <div class="loom-grid">
          {#each placements.placements as p}
            <div class="note-block-wrapper" style={getNoteStyle(p)} data-note-path={p.note.path}>
              <button
                class="note-block {p.note.noteStyle} region-{getRegionSlug(filteredLanes[p.regionIndex])}"
                class:highlight={isHighlighted(p.note)}
                style={isHighlighted(p.note) ? `--glow-color: ${regionGlowColors[getRegionSlug(filteredLanes[p.regionIndex])] ?? 'var(--text-accent)'}` : ''}
                on:click={() => handleNoteClick(p.note.path)}
                on:mouseenter={() => handleMouseOver(p.note, p.note.path)}
                on:mouseleave={handleMouseOut}
                on:focus={() => handleMouseOver(p.note, p.note.path)}
                on:blur={handleMouseOut}
                title="{p.note.title} ({p.note.yearStartDisplay} to {p.note.yearEndDisplay})"
              >
                <div class="note-title">{p.note.title}</div>
              </button>
            </div>
          {/each}
        </div>
        {#if threadLines && mainContentEl}
          <svg class="thread-svg" pointer-events="none" width={mainContentEl.scrollWidth} height={mainContentEl.scrollHeight}>
            {#each threadLines.to as t}
              <line x1={threadLines.from.x} y1={threadLines.from.y} x2={t.x} y2={t.y} class="thread-line" stroke="var(--text-accent)" stroke-width="2.5" stroke-opacity="0.9" />
            {/each}
          </svg>
        {/if}
      </div>
    {/key}
  </div>

  <div class="era-snap-rail">
    {#each eraBookmarks as btn}
      <button
        type="button"
        class="era-snap-btn"
        on:click={() => scrollToYear(btn.year)}
        title="Scroll to {btn.year < 0 ? Math.abs(btn.year) + ' BCE' : btn.year + ' CE'}"
      >
        [{btn.year < 0 ? btn.year : '+' + btn.year}] {btn.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .loom-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden; /* Prevent double scrollbars */
    font-family: monospace;
    position: relative;
  }

  .era-snap-rail {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
    padding: 6px 10px;
    background-color: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
    z-index: 4;
  }

  .era-snap-btn {
    padding: 4px 8px;
    font-size: 0.75em;
    border: 1px solid var(--background-modifier-border);
    background-color: var(--background-secondary);
    color: var(--text-normal);
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
  }

  .era-snap-btn:hover {
    background-color: var(--background-modifier-hover);
    border-color: var(--interactive-accent);
  }

  .loom-top-bar {
    position: sticky;
    top: 0;
    z-index: 3; /* High z-index to stay on top */
    background-color: var(--background-primary);
  }

  .loom-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
    background-color: var(--background-secondary);
    border-bottom: 1px solid var(--background-modifier-border);
    gap: 10px;
  }

  .note-counter {
    font-size: 0.85em;
    color: var(--text-muted);
    padding: 5px 10px;
    background-color: var(--background-primary-alt);
    border-radius: 4px;
    border: 1px solid var(--background-modifier-border);
  }

  .loom-controls button {
    margin: 0 5px;
    padding: 5px 10px;
    border: 1px solid var(--background-modifier-border);
    background-color: var(--background-primary);
    color: var(--text-normal);
    cursor: pointer;
  }

  .loom-controls button.active {
    background-color: var(--interactive-accent);
    color: var(--text-on-accent);
  }

  .lane-filter-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .filter-btn {
    width: 100%;
    padding: 5px 10px;
    border: 1px solid var(--background-modifier-border);
    background-color: var(--background-secondary);
    color: var(--text-normal);
    cursor: pointer;
    border-radius: 0;
    border-right: 1px solid var(--background-modifier-border);
    border-bottom: 1px solid var(--background-modifier-border);
    flex-shrink: 0;
    position: relative;
    z-index: 11;
  }

  .filter-btn:hover {
    background-color: var(--background-modifier-hover);
  }

  .lane-filter-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0;
    background-color: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-top: none;
    border-radius: 0 0 4px 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    padding: 8px;
    z-index: 200;
    width: 100%;
    max-height: 400px;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .lane-filter-item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 2px;
  }

  .lane-filter-item:hover {
    background-color: var(--background-modifier-hover);
  }

  .lane-filter-item input {
    margin-right: 8px;
    cursor: pointer;
  }

  .lane-filter-item span {
    flex: 1;
    user-select: none;
  }
  
  .loom-main-content {
    flex-grow: 1;
    overflow: auto; /* Scroll container: timeline and grid scroll together */
    min-height: 0; /* Allow flex child to shrink and scroll */
    position: relative; /* For absolute positioning of filter container */
  }

  .thread-svg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 15; /* above note blocks (z-index 10) so lines are visible */
    grid-column: 1 / -1;
    grid-row: 1 / -1; /* cover full grid so SVG scrolls with content */
  }

  .thread-line {
    stroke: var(--text-accent);
    stroke-width: 2.5;
    stroke-opacity: 0.9;
  }

  .loom-inner-grid {
    display: grid;
    min-width: fit-content;
    min-height: 100%; /* Fill viewport so region rows use full vertical space */
    position: relative; /* for thread SVG overlay */
  }

  .timeline-corner {
    background-color: var(--background-primary);
    border-right: 1px solid var(--background-modifier-border);
    border-bottom: 1px solid var(--background-modifier-border);
    position: sticky;
    left: 0;
    top: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-width: 150px; /* Ensure it has the same width as defined in grid */
  }

  .timeline-header-row {
    background-color: var(--background-primary);
    border-bottom: 1px solid var(--background-modifier-border);
    min-width: 0;
    position: sticky;
    top: 0;
    z-index: 5;
  }

  .timeline-header {
    display: grid;
    height: 100%;
    min-width: fit-content;
  }

  .timeline-label {
    padding: 5px;
    border-right: 1px solid var(--background-modifier-border-alpha);
    font-size: 0.8em;
    text-align: center;
    white-space: nowrap;
  }

  .region-labels {
    display: contents;
  }

  .region-label {
    padding: 10px;
    border-bottom: 1px solid var(--background-modifier-border);
    text-align: right;
    min-height: 50px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-weight: bold;
    border-right: 1px solid var(--background-modifier-border);
    position: sticky;
    left: 0;
    background-color: var(--background-secondary);
    z-index: 8; /* Below corner (10), above grid */
  }

  .loom-grid {
    display: contents;
  }

  .note-block-wrapper {
    position: relative;
    overflow: hidden;
    min-height: 0; /* Allow grid row to constrain height */
  }
  
  .note-block {
    width: 100%;
    height: 100%;
    padding: 5px;
    border-radius: 3px;
    cursor: pointer;
    transition: background-color 0.3s, box-shadow 0.3s, transform 0.2s, border-color 0.2s;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
  }

  /* Thematic (The Weave): diagonal stripes, dashed border, behind events */
  .note-block.thematic {
    background: repeating-linear-gradient(
      -45deg,
      var(--background-secondary),
      var(--background-secondary) 4px,
      var(--background-secondary-alt) 4px,
      var(--background-secondary-alt) 8px
    );
    border: 2px dashed var(--background-modifier-border);
    z-index: 1;
  }

  /* Event (The Knot): solid fill, solid border, glow, on top */
  .note-block.event {
    background-color: var(--background-primary-alt);
    border: 2px solid var(--background-modifier-border);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    z-index: 10;
  }

  .note-block:hover {
    background-color: var(--background-secondary-alt);
    border-color: var(--interactive-accent);
  }

  .note-block.thematic:hover {
    background: repeating-linear-gradient(
      -45deg,
      var(--background-secondary-alt),
      var(--background-secondary-alt) 4px,
      var(--background-modifier-hover) 4px,
      var(--background-modifier-hover) 8px
    );
  }

  /* Entity Glow (The Thread): neon border by region + scale */
  .note-block.highlight {
    transform: scale(1.05);
    border-color: var(--glow-color, var(--text-accent)) !important;
    box-shadow: 0 0 12px var(--glow-color, var(--text-accent));
  }

  .note-block.highlight.event {
    border-width: 2px;
    border-style: solid;
  }
  
  .note-title {
      font-size: 0.8em;
  }
</style>