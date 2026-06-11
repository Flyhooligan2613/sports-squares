export interface EspnCompetitorRaw {
  homeAway?: string;
  score?: string;
  team?: { displayName?: string; abbreviation?: string };
  linescores?: { value?: number }[];
}

export interface EspnCompetitionRaw {
  competitors?: EspnCompetitorRaw[];
  status?: {
    period?: number;
    displayClock?: string;
    type?: {
      completed?: boolean;
      name?: string;
      detail?: string;
      shortDetail?: string;
    };
  };
}

export interface EspnSummaryResponse {
  header?: { competitions?: EspnCompetitionRaw[] };
}

export interface EspnScoreboardEventRaw {
  id: string;
  name?: string;
  competitions?: EspnCompetitionRaw[];
}

export interface EspnScoreboardResponse {
  events?: EspnScoreboardEventRaw[];
}
