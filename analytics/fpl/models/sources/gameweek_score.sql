{{ config(materialized = 'table') }}

  select
    s.entry_id,
    s.league_id,
    s.gameweek,
    s.points,
    e.entry_name,
    rank() over (partition by s.league_id, s.gameweek order by s.points desc) as rank
  from {{ source('fpl', 'mini_league_gameweek_scores') }} as s
  left join {{ source('fpl', 'mini_league_entries') }} as e
    on s.entry_id = e.entry_id
    and s.league_id = e.league_id
