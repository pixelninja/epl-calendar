export interface Team {
  id: number
  name: string
  short_name: string
  code: number
  strength: number
  strength_overall_home: number
  strength_overall_away: number
  strength_attack_home: number
  strength_attack_away: number
  strength_defence_home: number
  strength_defence_away: number
  pulse_id: number
}

export interface Fixture {
  id: number
  code: number
  event: number | null
  finished: boolean
  finished_provisional: boolean
  kickoff_time: string
  minutes: number
  provisional_start_time: boolean
  started: boolean | null
  team_a: number
  team_a_score: number | null
  team_h: number
  team_h_score: number | null
  stats: FixtureStats[]
  team_h_difficulty: number
  team_a_difficulty: number
  pulse_id: number
}

export interface FixtureStats {
  identifier: string
  a: StatValue[]
  h: StatValue[]
}

export interface StatValue {
  value: number
  element: number
}

export interface GameWeek {
  id: number
  name: string
  deadline_time: string
  deadline_time_epoch: number
  deadline_time_game_offset: number
  finished: boolean
  data_checked: boolean
  highest_scoring_entry: number | null
  is_previous: boolean
  is_current: boolean
  is_next: boolean
  cup_leagues_created: boolean
  h2h_ko_matches_created: boolean
  chip_plays: ChipPlay[]
  most_selected: number | null
  most_transferred_in: number | null
  top_element: number | null
  top_element_info: TopElementInfo | null
  transfers_made: number
  most_captained: number | null
  most_vice_captained: number | null
}

export interface ChipPlay {
  chip_name: string
  num_played: number
}

export interface TopElementInfo {
  id: number
  points: number
}

export interface BootstrapStatic {
  events: GameWeek[]
  game_settings: GameSettings
  phases: Phase[]
  teams: Team[]
  total_players: number
  elements: Player[]
  element_stats: ElementStat[]
  element_types: ElementType[]
}

export interface GameSettings {
  league_join_private_max: number
  league_join_public_max: number
  league_max_size_public_classic: number
  league_max_size_public_h2h: number
  league_max_size_private_h2h: number
  league_max_ko_rounds_private_h2h: number
  league_prefix_public: string
  league_points_h2h_win: number
  league_points_h2h_lose: number
  league_points_h2h_draw: number
  league_ko_first_instead_of_random: boolean
  cup_start_event_id: number
  cup_stop_event_id: number
  cup_qualifying_method: string
  cup_type: string
  featured_entries: number[]
  percentile_ranks: number[]
  squad_squadplay: number
  squad_squadsize: number
  squad_team_limit: number
  squad_total_spend: number
  ui_currency_multiplier: number
  ui_use_special_shirts: boolean
  ui_special_shirt_exclusions: number[]
  stats_form_days: number
  sys_vice_captain_enabled: boolean
  transfers_cap: number
  transfers_sell_on_fee: number
  max_extra_free_transfers: number
  league_h2h_tiebreak_stats: string[]
  timezone: string
}

export interface Phase {
  id: number
  name: string
  start_event: number
  stop_event: number
}

export interface Player {
  id: number
  photo: string
  web_name: string
  team_code: number
  status: string
  code: number
  first_name: string
  second_name: string
  squad_number: number | null
  news: string
  now_cost: number
  news_added: string | null
  chance_of_playing_this_round: number | null
  chance_of_playing_next_round: number | null
  value_form: string
  value_season: string
  cost_change_start: number
  cost_change_event: number
  cost_change_start_fall: number
  cost_change_event_fall: number
  in_dreamteam: boolean
  dreamteam_count: number
  selected_by_percent: string
  form: string
  transfers_out: number
  transfers_in: number
  transfers_out_event: number
  transfers_in_event: number
  loans_in: number
  loans_out: number
  loaned_in: number
  loaned_out: number
  total_points: number
  event_points: number
  points_per_game: string
  ep_this: string | null
  ep_next: string | null
  special: boolean
  minutes: number
  goals_scored: number
  assists: number
  clean_sheets: number
  goals_conceded: number
  own_goals: number
  penalties_saved: number
  penalties_missed: number
  yellow_cards: number
  red_cards: number
  saves: number
  bonus: number
  bps: number
  influence: string
  creativity: string
  threat: string
  ict_index: string
  starts: number
  expected_goals: string
  expected_assists: string
  expected_goal_involvements: string
  expected_goals_conceded: string
  influence_rank: number
  influence_rank_type: number
  creativity_rank: number
  creativity_rank_type: number
  threat_rank: number
  threat_rank_type: number
  ict_index_rank: number
  ict_index_rank_type: number
  corners_and_indirect_freekicks_order: number | null
  corners_and_indirect_freekicks_text: string
  direct_freekicks_order: number | null
  direct_freekicks_text: string
  penalties_order: number | null
  penalties_text: string
  element_type: number
  team: number
}

export interface ElementStat {
  label: string
  name: string
}

export interface ElementType {
  id: number
  plural_name: string
  plural_name_short: string
  singular_name: string
  singular_name_short: string
  squad_select: number
  squad_min_play: number
  squad_max_play: number
  ui_shirt_specific: boolean
  sub_positions_locked: number[]
  element_count: number
}

export interface FixtureWithTeams extends Fixture {
  team_a_name: string
  team_a_short_name: string
  team_h_name: string
  team_h_short_name: string
}

export interface MatchStatus {
  status: 'scheduled' | 'live' | 'finished' | 'postponed'
  minutes?: number
  period?: 'first-half' | 'half-time' | 'second-half' | 'full-time'
}

export interface ProcessedFixture extends FixtureWithTeams {
  match_status: MatchStatus
  kickoff_local: string
  matchweek: number
}