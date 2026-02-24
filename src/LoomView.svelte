<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { App } from 'obsidian';
  import type { LoomViewSettings } from './main';
  import { parse, parseISO, isValid, format, differenceInCalendarDays, addDays, differenceInWeeks, differenceInMonths, eachWeekOfInterval, eachMonthOfInterval, startOfMonth, startOfWeek, endOfWeek, startOfDay } from 'date-fns';

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

  interface LoomNote {
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

  interface LoomDateNote {
    path: string;
    fileName: string;
    title: string;
    lanes: string[];
    dateStart: Date;
    dateEnd: Date;
    connectionValues: Map<string, string[]>;
    noteStyle: 'thematic' | 'event';
  }

  let notes: LoomNote[] = [];
  let dateNotes: LoomDateNote[] = [];
  let lanes: string[] = [];
  let yearRange = { min: 0, max: 0 };
  let dateRange = { min: new Date(), max: new Date() };
  let hoveredConnectionValues: string[] = [];
  let hoveredNotePath: string | null = null; /* source note for Entity Glow / Thread */
  let hasScrolledInitial = false;
  let threadLines: { from: { x: number; y: number }; to: { x: number; y: number }[] } | null = null;
  let isFictionalCalendar = false; // Track if we're using fictional dates (non-numeric strings)
  let viewMode: 'years' | 'dates' = 'years';
  
  // --- Date Mode State ---
  type DateResolution = 'Month' | 'Week' | 'Day';
  let dateResolution: DateResolution = 'Month';
  
  // Lane filter state
  let visibleLanes: Set<string> = new Set();
  let showLaneFilter: boolean = false;

  /** Region slug for CSS class (e.g. "South-Asia" -> "south-asia"). */
  function getRegionSlug(region: string): string {
    return region.toLowerCase().replace(/\s+/g, '-');
  }

  /** Generate consistent color from lane name using hash function. */
  function getLaneColor(laneSlug: string): string {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < laneSlug.length; i++) {
      hash = laneSlug.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Generate HSL color with fixed saturation and lightness for good visibility
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 60%, 50%)`;
  }


  onMount(async () => {

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

    /**
     * Takes an array of notes (year or date based) and returns a sorted list of lanes.
     */
    function discoverLanes(notes: (LoomNote | LoomDateNote)[]): string[] {
      const allLaneValuesSet = new Set<string>();
      notes.forEach(n => {
        n.lanes.forEach(l => allLaneValuesSet.add(l));
      });
      const allLaneValues = Array.from(allLaneValuesSet);
      const userOrder = settings.laneOrder.split(',').map(s => s.trim()).filter(Boolean);
      
      const orderedLanes = userOrder.filter(l => allLaneValues.indexOf(l) !== -1);
      const unorderedLanes = allLaneValues.filter(l => userOrder.indexOf(l) === -1).sort();
      
      let finalLanes: string[] = [...orderedLanes, ...unorderedLanes];
      
      if (settings.showUncategorized) {
        const userOrderSet = new Set(userOrder);
        const hasUncategorized = notes.some(n => 
          n.lanes.length > 0 && n.lanes.some(l => !userOrderSet.has(l))
        );
        if (hasUncategorized || notes.some(n => n.lanes.length === 0)) {
          finalLanes.push('Others');
        }
      }
      return finalLanes;
    }

    const processNotes = () => {
      const allFiles = app.vault.getMarkdownFiles();
      
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
          // If only one filter type is present, it's an AND (or effectively, just that filter)
          return folderMatch && tagMatch;
        }
      });


      // --- View Mode Auto-Detection ---
      // Find the first file with a date to determine the mode
      const firstFileWithDate = files.find(file => {
        const cache = app.metadataCache.getFileCache(file);
        return cache?.frontmatter && cache.frontmatter[settings.startDateKey];
      });

      let detectedViewMode: 'years' | 'dates' = 'years';
      if (firstFileWithDate) {
        const firstValue = app.metadataCache.getFileCache(firstFileWithDate)?.frontmatter?.[settings.startDateKey];
        if (typeof firstValue === 'string') {
          const trimmed = firstValue.trim();
          // A value is a date if it is NOT a simple integer, but CAN be parsed as a valid date by our enhanced parser.
          if (!/^-?\d+$/.test(trimmed) && parseDate(trimmed)) {
            detectedViewMode = 'dates';
          }
        }
      }
      viewMode = detectedViewMode;

      if (viewMode === 'years') {
        const loomNotes: LoomNote[] = [];
        let minYear = Infinity;
        let maxYear = -Infinity;
        let detectedFictionalCalendar = false;

        // Parse connection keys from settings
        const connKeys = settings.connectionKeys.split(',').map(s => s.trim()).filter(Boolean);

        for (const file of files) {
          const cache = app.metadataCache.getFileCache(file);
          const frontmatter = cache?.frontmatter;

          if (frontmatter) {
            // Parse dates using dual-track parser
            const startDateValue = frontmatter[settings.startDateKey];
            const endDateValue = frontmatter[settings.endDateKey] ?? startDateValue;
            
            // Detect fictional calendar during main loop (check first valid date)
            if (!detectedFictionalCalendar && startDateValue && typeof startDateValue === 'string') {
              detectedFictionalCalendar = !/^-?\d+$/.test(startDateValue.trim());
            }
            
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

              const note: LoomNote = {
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
              loomNotes.push(note);
            }
          }
        }
        
        isFictionalCalendar = detectedFictionalCalendar;
        notes = loomNotes;
        lanes = discoverLanes(notes);
        yearRange = { min: minYear, max: maxYear };
      } else {
        // --- DATES MODE ---
        const loomDateNotes: LoomDateNote[] = [];
        let minDate: Date | null = null;
        let maxDate: Date | null = null;

        const connKeys = settings.connectionKeys.split(',').map(s => s.trim()).filter(Boolean);

        for (const file of files) {
          const cache = app.metadataCache.getFileCache(file);
          const frontmatter = cache?.frontmatter;

          if (frontmatter) {
            const startDateValue = frontmatter[settings.startDateKey];
            const endDateValue = frontmatter[settings.endDateKey] ?? startDateValue;

            const parsedStart = parseDate(startDateValue);
            const parsedEnd = parseDate(endDateValue);

            if (parsedStart && parsedEnd) {
              if (!minDate || parsedStart < minDate) minDate = parsedStart;
              if (!maxDate || parsedEnd > maxDate) maxDate = parsedEnd;

              const laneValue = frontmatter[settings.laneKey];
              const laneArray: string[] = Array.isArray(laneValue)
                ? laneValue.map(String)
                : (laneValue ? [String(laneValue)] : []);

              const connectionValues = new Map<string, string[]>();
              for (const key of connKeys) {
                const val = frontmatter[key];
                const cleaned = Array.isArray(val)
                  ? val.map(cleanFigure)
                  : (val ? [cleanFigure(String(val))] : []);
                connectionValues.set(key, cleaned);
              }

              const note: LoomDateNote = {
                path: file.path,
                fileName: file.basename,
                title: frontmatter.title || file.basename,
                lanes: laneArray,
                dateStart: parsedStart,
                dateEnd: parsedEnd,
                connectionValues: connectionValues,
                noteStyle: frontmatter['note-style'] || 'event',
              };
              loomDateNotes.push(note);
            }
          }
        }
        
        dateNotes = loomDateNotes;
        lanes = discoverLanes(dateNotes);
        const finalMinDate = minDate ? startOfDay(minDate) : startOfDay(new Date());
        const finalMaxDate = maxDate ? startOfDay(maxDate) : startOfDay(new Date());
        dateRange = { min: finalMinDate, max: finalMaxDate };
        // Clear year-based data
        notes = [];
        yearRange = { min: 0, max: 0 };
      }
    };

    // Wait for the metadata cache to be resolved before processing notes
    app.metadataCache.on('resolved', processNotes);

    // Initial run
    processNotes();

    // Deferred re-run: metadata cache may not be fully populated on plugin reload.
    // Running again after a tick + delay catches late resolution and fixes "all notes at Jan 1" on first load.
    tick().then(() => {
      setTimeout(processNotes, 150);
    });
  });
  
  function cleanFigure(figure: string): string {
    // [[Julius Caesar]] -> Julius Caesar
    return figure.replace(/\[\[|\]\]/g, '').trim();
  }

  /** Parses a date string or Date into a Date object, using user-defined format or common fallbacks. */
  function parseDate(value: any): Date | null {
    if (!value) return null;
    // Handle Date objects (e.g. from YAML parsing)
    if (value instanceof Date && isValid(value)) return startOfDay(value);
    const str = String(value).trim();
    if (!str) return null;

    let parsedDate: Date;

    // 1. Try user-defined format from settings
    if (settings.dateFormat && settings.dateFormat !== 'auto') {
        parsedDate = parse(str, settings.dateFormat, new Date());
        if (isValid(parsedDate)) return startOfDay(parsedDate);
    }
    
    // 2. Try ISO 8601 (yyyy-MM-dd)
    parsedDate = parseISO(str);
    if (isValid(parsedDate)) return startOfDay(parsedDate);

    // 3. Fallback to common formats (dash and slash variants)
    const formats = ['dd-MM-yyyy', 'MM-dd-yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy'];
    for (const fmt of formats) {
      parsedDate = parse(str, fmt, new Date());
      if (isValid(parsedDate)) return startOfDay(parsedDate);
    }

    return null;
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
  function getNoteColumnRange(note: LoomNote): { startCol: number; endCol: number } {
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
  function assignSubLanes<T>(regionNotes: { note: T; startCol: number; endCol: number }[]): { note: T; startCol: number; endCol: number; subLane: number }[] {
    const sorted = [...regionNotes].sort(
      (a, b) => a.startCol !== b.startCol ? a.startCol - b.startCol : a.endCol - b.endCol
    );
    const lanes: { startCol: number; endCol: number }[] = [];
    const result: { note: T; startCol: number; endCol: number; subLane: number }[] = [];
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
    note: LoomNote;
    startCol: number;
    endCol: number;
    regionIndex: number;
    subLane: number;
  }

  interface DateNotePlacement {
    note: LoomDateNote;
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

  // Memoize userOrderArray to avoid parsing on every placements recalculation
  $: userOrderArray = settings.laneOrder.split(',').map(s => s.trim()).filter(Boolean);
  $: userOrderSet = new Set(userOrderArray);

  $: placements = (() => {
    if (viewMode !== 'years') return { placements: [], regionLaneCounts: [] };
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
            return n.lanes.length === 0 || n.lanes.some(l => !userOrderSet.has(l));
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

  // --- Date Mode Computations ---

  $: datePlacements = (() => {
    if (viewMode !== 'dates') return { placements: [], regionLaneCounts: [] };
    const res = dateResolution; /* force re-run when resolution changes */
    const range = dateRange; /* force re-run when dateRange updates (e.g. after metadata cache resolves) */
    const list: DateNotePlacement[] = [];
    const regionLaneCounts: number[] = [];

    for (let filteredIndex = 0; filteredIndex < filteredLanes.length; filteredIndex++) {
      const lane = filteredLanes[filteredIndex];
      const laneNotes = dateNotes
        .filter((n) => {
          if (lane === 'Others') {
            return n.lanes.length === 0 || n.lanes.some(l => !userOrderSet.has(l));
          } else {
            return n.lanes.indexOf(lane) !== -1;
          }
        })
        .map((n) => {
          const { startCol, endCol } = getDateNoteColumnRange(n);
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

  $: dateRegionStartRow = (() => {
    const start: number[] = [];
    let row = 2; // row 1 = timeline
    for (let i = 0; i < filteredLanes.length; i++) {
      start.push(row);
      row += datePlacements.regionLaneCounts[i] ?? 1;
    }
    return start;
  })();

  $: totalDateContentRows = datePlacements.regionLaneCounts.reduce((a, b) => a + b, 0) || 1;


  $: dateTimelineSpan = (() => {
    if (viewMode !== 'dates' || !dateNotes.length) return 1;
    if (dateResolution === 'Day') {
      return differenceInCalendarDays(dateRange.max, dateRange.min) + 1;
    } else if (dateResolution === 'Week') {
      const rangeMinStart = startOfWeek(dateRange.min, { weekStartsOn: 1 });
      const rangeMaxStart = startOfWeek(dateRange.max, { weekStartsOn: 1 });
      return differenceInWeeks(rangeMaxStart, rangeMinStart) + 1;
    } else { // Month
      return differenceInMonths(dateRange.max, dateRange.min) + 1;
    }
  })();

  $: dateTimelineLabels = (() => {
    if (viewMode !== 'dates' || !dateNotes.length) return [];
    
    if (dateResolution === 'Day') {
      const labels: { date: Date, display: string }[] = [];
      let currentDate = startOfDay(dateRange.min);
      const rangeMax = startOfDay(dateRange.max);
      while (currentDate <= rangeMax) {
        labels.push({ date: currentDate, display: format(currentDate, 'MMM d') });
        currentDate = addDays(currentDate, 1);
      }
      return labels;
    } else if (dateResolution === 'Week') {
      const weeks = eachWeekOfInterval({ start: dateRange.min, end: dateRange.max }, { weekStartsOn: 1 });
      return weeks.map(week => ({ date: week, display: `${format(startOfWeek(week, { weekStartsOn: 1 }), 'MMM d')}-${format(endOfWeek(week, { weekStartsOn: 1 }), 'MMM d')}` }));
    } else { // Month
      const months = eachMonthOfInterval({ start: dateRange.min, end: dateRange.max });
      return months.map(month => ({ date: month, display: format(month, 'MMM yyyy') }));
    }
  })();

  function getDateNoteColumnRange(note: LoomDateNote): { startCol: number, endCol: number } {
    let startCol: number;
    let endCol: number;

    if (dateResolution === 'Day') {
      const rangeMin = startOfDay(dateRange.min);
      startCol = differenceInCalendarDays(startOfDay(note.dateStart), rangeMin);
      endCol = differenceInCalendarDays(startOfDay(note.dateEnd), rangeMin);
    } else if (dateResolution === 'Week') {
      const rangeMinStartOfWeek = startOfWeek(dateRange.min, { weekStartsOn: 1 });
      startCol = differenceInWeeks(startOfWeek(note.dateStart, { weekStartsOn: 1 }), rangeMinStartOfWeek);
      endCol = differenceInWeeks(startOfWeek(note.dateEnd, { weekStartsOn: 1 }), rangeMinStartOfWeek);
    } else { // Month
      // Ensure dateRange.min is the start of its month for consistent calculation
      const rangeMinStartOfMonth = startOfMonth(dateRange.min);
      startCol = differenceInMonths(note.dateStart, rangeMinStartOfMonth);
      endCol = differenceInMonths(note.dateEnd, rangeMinStartOfMonth);
    }

    return { startCol, endCol };
  }


  /** One-time scroll when view opens with data (avoids reactive loop). */
  $: if (mainContentEl && (notes.length > 0 || dateNotes.length > 0) && !hasScrolledInitial) {
    hasScrolledInitial = true;
    tick().then(() => {
      if (viewMode === 'years') {
        if (resolution >= 100) scrollToCenturyEnd();
        else scrollToDecadeOrYear();
      }
      // No initial scroll for date view for now
    });
  }

  // Memoize sorted years to avoid sorting on every scroll call
  $: sortedYears = notes.length > 0 ? notes.map((n) => n.yearStart).sort((a, b) => a - b) : [];

  /** Scroll Decade/Year view to 80th percentile of note years. */
  function scrollToDecadeOrYear(): void {
    if (notes.length === 0 || !mainContentEl || sortedYears.length === 0) return;
    const targetYear = sortedYears[Math.min(Math.floor(sortedYears.length * 0.8), sortedYears.length - 1)];
    const resValue = resolution;
    const min = Math.floor(yearRange.min / resValue);
    const targetColumn = Math.floor(targetYear / resValue) - min;
    const targetScrollLeft = targetColumn * columnMinWidthPx;
    tick().then(() => {
      if (mainContentEl) {
        const centered = targetScrollLeft - mainContentEl.clientWidth / 2 + columnMinWidthPx / 2;
        mainContentEl.scrollLeft = centered > 0 ? centered : 0;
      }
    });
  }

  /** Century view only: scroll to the end of the timeline. Called after Century grid has re-mounted. */
  function scrollToCenturyEnd(): void {
    if (!mainContentEl) return;
    tick().then(() => {
      if (mainContentEl) {
        const maxScroll = mainContentEl.scrollWidth - mainContentEl.clientWidth;
        mainContentEl.scrollLeft = maxScroll;
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

  function getDateNoteStyle(p: DateNotePlacement): string {
    const { startCol, endCol, regionIndex, subLane } = p;
    const gridRow = dateRegionStartRow[regionIndex] + subLane;
    const gridColumnStart = startCol + 2;
    const gridColumnEnd = endCol + 3;
    return `
      grid-column: ${gridColumnStart} / ${gridColumnEnd};
      grid-row: ${gridRow};
    `;
  }
  
  function handleNoteClick(path: string) {
    app.workspace.openLinkText(path, '/', false);
  }

  function getConnectionValues(note: LoomNote | LoomDateNote): string[] {
    const allValues: string[] = [];
    for (const values of note.connectionValues.values()) {
      allValues.push(...values);
    }
    return allValues;
  }

  function handleMouseOver(note: LoomNote | LoomDateNote, sourcePath: string) {
    const connectionValues = getConnectionValues(note);
    hoveredConnectionValues = connectionValues;
    hoveredNotePath = sourcePath;
  }

  function handleMouseOut() {
    hoveredConnectionValues = [];
    hoveredNotePath = null;
    threadLines = null;
  }

  // Pre-build connection values map for efficient lookup
  $: connectionValuesMap = (() => {
    const map = new Map<string, string[]>();
    const notesToProcess = viewMode === 'years' ? notes : dateNotes;
    notesToProcess.forEach(note => {
      map.set(note.path, getConnectionValues(note));
    });
    return map;
  })();

  // Build element map when placements change
  let elementMap: Map<string, HTMLElement> = new Map();
  $: if ((placements.placements.length > 0 || datePlacements.placements.length > 0) && mainContentEl) {
    tick().then(() => {
      requestAnimationFrame(() => {
        if (!mainContentEl) return;
        const wrappers = mainContentEl.querySelectorAll('[data-note-path]');
        elementMap = new Map();
        wrappers.forEach((w) => {
          const path = (w as HTMLElement).getAttribute('data-note-path');
          if (path) elementMap.set(path, w as HTMLElement);
        });
      });
    });
  }

  /** Update thread lines from hovered note to highlighted contemporaries (Entity Glow bonus). */
  /** Use data (notes + hoveredConnectionValues) to decide which notes are highlighted; find DOM by data-note-path so we don't rely on .highlight class timing. */
  $: if (hoveredConnectionValues.length > 0 && hoveredNotePath && mainContentEl) {
    const currentHoveredPath = hoveredNotePath;
    const hoveredSet = new Set(hoveredConnectionValues);
    const notesToProcess = viewMode === 'years' ? notes : dateNotes;
    const highlightedPaths = notesToProcess
      .filter((n) => {
        const noteValues = connectionValuesMap.get(n.path) || [];
        return noteValues.some(v => hoveredSet.has(v));
      })
      .map((n) => n.path);
    const otherPaths = highlightedPaths.filter((p) => p !== currentHoveredPath);
    tick().then(() => {
      requestAnimationFrame(() => {
        if (!mainContentEl || !currentHoveredPath || otherPaths.length === 0) {
          threadLines = null;
          return;
        }
        const sourceEl = elementMap.get(currentHoveredPath);
        if (!sourceEl) {
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
          const el = elementMap.get(path);
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

  /** Era-Snap (date mode): scroll so the given date is visible. */
  function scrollToDate(targetDate: Date): void {
    if (!mainContentEl || viewMode !== 'dates') return;
    let columnIndex: number;
    if (dateResolution === 'Day') {
      const rangeMin = startOfDay(dateRange.min);
      columnIndex = differenceInCalendarDays(startOfDay(targetDate), rangeMin);
    } else if (dateResolution === 'Week') {
      const rangeMinStartOfWeek = startOfWeek(dateRange.min, { weekStartsOn: 1 });
      columnIndex = differenceInWeeks(startOfWeek(targetDate, { weekStartsOn: 1 }), rangeMinStartOfWeek);
    } else {
      const rangeMinStartOfMonth = startOfMonth(dateRange.min);
      columnIndex = differenceInMonths(targetDate, rangeMinStartOfMonth);
    }
    const targetX = Math.max(0, columnIndex * columnMinWidthPx);
    const centered = targetX - mainContentEl.clientWidth / 2 + columnMinWidthPx / 2;
    mainContentEl.scrollTo({ left: Math.max(0, centered), behavior: 'smooth' });
  }

  // Parse era bookmarks: supports "Label: Year" (e.g. Bronze: -3000) and "Label: Date" (e.g. Week 1: 2026-01-01)
  type EraBookmarkYear = { type: 'year'; label: string; year: number };
  type EraBookmarkDate = { type: 'date'; label: string; date: Date };
  $: eraBookmarksParsed = (() => {
    const yearBms: EraBookmarkYear[] = [];
    const dateBms: EraBookmarkDate[] = [];
    const lines = settings.eraBookmarks.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const match = trimmed.match(/^(.+?):\s*(.+)$/);
      if (!match) continue;
      const label = match[1].trim();
      const value = match[2].trim();
      if (/^-?\d+$/.test(value)) {
        const year = parseInt(value, 10);
        if (!isNaN(year)) yearBms.push({ type: 'year', label, year });
      } else {
        const d = parseDate(value);
        if (d) dateBms.push({ type: 'date', label, date: d });
      }
    }
    return { year: yearBms, date: dateBms };
  })();
  $: eraBookmarksYear = eraBookmarksParsed.year;
  $: eraBookmarksDate = eraBookmarksParsed.date;
  
  function isHighlighted(note: LoomNote | LoomDateNote): boolean {
    if (hoveredConnectionValues.length === 0) return false;
    const noteValues = connectionValuesMap.get(note.path) || [];
    const hoveredSet = new Set(hoveredConnectionValues);
    return noteValues.some(v => hoveredSet.has(v));
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
      <div class="note-counter">Woven {viewMode === 'years' ? notes.length : dateNotes.length} notes</div>
      {#if viewMode === 'years'}
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
      {:else}
        <button on:click={() => dateResolution = 'Month'} class:active={dateResolution === 'Month'}>Month</button>
        <button on:click={() => dateResolution = 'Week'} class:active={dateResolution === 'Week'}>Week</button>
        <button on:click={() => dateResolution = 'Day'} class:active={dateResolution === 'Day'}>Day</button>
      {/if}
    </div>
  </div>

  {#if viewMode === 'years'}
    <div class="loom-main-content" bind:this={mainContentEl}>
      {#key resolution}
        <div
          class="loom-inner-grid"
          style="grid-template-columns: 150px repeat({timelineSpan}, minmax({columnMinWidthPx}px, 1fr)); grid-template-rows: auto repeat({totalContentRows}, minmax(60px, 1fr));"
        >
          <div class="timeline-corner" style="grid-column: 1; grid-row: 1;">
            <div class="lane-filter-container">
              <button 
                class="filter-btn" 
                on:click={() => {
                  showLaneFilter = !showLaneFilter;
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
                  style={isHighlighted(p.note) ? `--glow-color: ${getLaneColor(getRegionSlug(filteredLanes[p.regionIndex]))}` : ''}
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
  {:else if viewMode === 'dates'}
    <div class="loom-main-content" bind:this={mainContentEl}>
      {#key dateResolution}
        <div
          class="loom-inner-grid"
          style="grid-template-columns: 150px repeat({dateTimelineSpan}, minmax({columnMinWidthPx}px, 1fr)); grid-template-rows: auto repeat({totalDateContentRows}, minmax(60px, 1fr));"
        >
          <div class="timeline-corner" style="grid-column: 1; grid-row: 1;">
            <div class="lane-filter-container">
              <button 
                class="filter-btn" 
                on:click={() => { showLaneFilter = !showLaneFilter; }}
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
            <div class="timeline-header" style="grid-template-columns: repeat({dateTimelineSpan}, minmax({columnMinWidthPx}px, 1fr));">
              {#each dateTimelineLabels as label}
                <div class="timeline-label">{label.display}</div>
              {/each}
            </div>
          </div>

          <div class="region-labels">
            {#each filteredLanes as lane, laneIndex}
              <div class="region-label" style="grid-column: 1; grid-row: {dateRegionStartRow[laneIndex]} / span {datePlacements.regionLaneCounts[laneIndex]};">{lane}</div>
            {/each}
          </div>

          <div class="loom-grid">
            {#each datePlacements.placements as p}
              <div class="note-block-wrapper" style={getDateNoteStyle(p)} data-note-path={p.note.path}>
                <button
                  class="note-block {p.note.noteStyle} region-{getRegionSlug(filteredLanes[p.regionIndex])}"
                  class:highlight={isHighlighted(p.note)}
                  style={isHighlighted(p.note) ? `--glow-color: ${getLaneColor(getRegionSlug(filteredLanes[p.regionIndex]))}` : ''}
                  on:click={() => handleNoteClick(p.note.path)}
                  on:mouseenter={() => handleMouseOver(p.note, p.note.path)}
                  on:mouseleave={handleMouseOut}
                  on:focus={() => handleMouseOver(p.note, p.note.path)}
                  on:blur={handleMouseOut}
                  title="{p.note.title} ({format(p.note.dateStart, settings.dateFormat || 'yyyy-MM-dd')} to {format(p.note.dateEnd, settings.dateFormat || 'yyyy-MM-dd')})"
                >
                  <div class="note-title">{p.note.title}</div>
                </button>
              </div>
            {/each}
          </div>
          {#if threadLines && mainContentEl}
            <svg class="thread-svg" pointer-events="none" width={mainContentEl.scrollWidth} height={mainContentEl.scrollHeight}>
              {#each threadLines.to as t}
                <line x1={threadLines.from.x} y1={threadLines.from.y} x2={t.x} y2={t.y} class="thread-line" />
              {/each}
            </svg>
          {/if}
        </div>
      {/key}
    </div>
  {/if}

  <div class="era-snap-rail">
    {#if viewMode === 'years'}
      {#each eraBookmarksYear as btn}
        <button
          type="button"
          class="era-snap-btn"
          on:click={() => scrollToYear(btn.year)}
          title="Scroll to {btn.year < 0 ? Math.abs(btn.year) + ' BCE' : btn.year + ' CE'}"
        >
          [{btn.year < 0 ? btn.year : '+' + btn.year}] {btn.label}
        </button>
      {/each}
    {:else}
      {#each eraBookmarksDate as btn}
        <button
          type="button"
          class="era-snap-btn"
          on:click={() => scrollToDate(btn.date)}
          title="Scroll to {format(btn.date, settings.dateFormat || 'yyyy-MM-dd')}"
        >
          [{format(btn.date, settings.dateFormat || 'yyyy-MM-dd')}] {btn.label}
        </button>
      {/each}
    {/if}
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
    cursor: default;
    user-select: none;
    opacity: 0.8;
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