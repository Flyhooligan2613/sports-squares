-- Weekly Reward Drop — premium loot crate system (extends mystery boxes)

alter table public.player_mystery_boxes
  add column if not exists box_type text not null default 'bronze',
  add column if not exists qualification_source text not null default 'weekly_gameplay',
  add column if not exists total_value_cents integer not null default 0,
  add column if not exists drop_metadata jsonb not null default '{}';

create index if not exists player_mystery_boxes_email_opened_idx
  on public.player_mystery_boxes (email, opened_at desc, created_at desc);

insert into public.ecosystem_admin_config (key, value)
values (
  'weekly_reward_drop',
  '{
    "minWeeklyGameplayCents": 50000,
    "enabled": true,
    "dropRates": {
      "bronze": { "common": 80, "rare": 15, "epic": 5, "legendary": 0, "mythic": 0 },
      "silver": { "common": 60, "rare": 30, "epic": 9, "legendary": 1, "mythic": 0 },
      "gold": { "common": 45, "rare": 35, "epic": 15, "legendary": 5, "mythic": 0 },
      "diamond": { "common": 35, "rare": 35, "epic": 20, "legendary": 9, "mythic": 1 },
      "legend": { "common": 25, "rare": 35, "epic": 25, "legendary": 10, "mythic": 5 },
      "immortal": { "common": 15, "rare": 30, "epic": 30, "legendary": 15, "mythic": 10 }
    },
    "tierBoxMap": {
      "rookie": "bronze",
      "contender": "bronze",
      "all-star": "silver",
      "champion": "silver",
      "elite": "gold",
      "legend": "diamond",
      "hall-of-fame": "legend",
      "immortal": "immortal"
    },
    "specialSurpriseChancePct": 0.5
  }'::jsonb
)
on conflict (key) do nothing;

comment on column public.player_mystery_boxes.box_type is 'bronze|silver|gold|diamond|legend|immortal';
comment on column public.player_mystery_boxes.qualification_source is 'weekly_gameplay|vip_promotion|referral_milestone|holiday|admin_giveaway|championship';
