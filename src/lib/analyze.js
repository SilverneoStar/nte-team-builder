// Team analysis: reactions, trios, role counts and tips, plus where a character is used in other teams.
import { ELEMENTS, PAIR_REACTIONS, TRIO_REACTIONS } from '../data/elements.js';
import { CHARACTER_BY_ID } from '../data/characters.js';

export const TEAM_SIZE = 4;

// Two elements react when they sit next to each other on the Esper Cycle.
export function areNeighbours(a, b) {
  const i = ELEMENTS.findIndex((e) => e.id === a);
  const j = ELEMENTS.findIndex((e) => e.id === b);
  if (i < 0 || j < 0 || i === j) return false;
  const gap = Math.abs(i - j);
  return gap === 1 || gap === ELEMENTS.length - 1;
}

/**
 * Looks at one team and works out what it can do.
 * Pure function: same input, same output, no React involved.
 * That makes it easy to test and reuse.
 */
export function analyzeTeam(memberIds) {
  const members = memberIds.filter(Boolean).map((id) => CHARACTER_BY_ID[id]).filter(Boolean);

  const elementCounts = {};
  for (const m of members) elementCounts[m.element] = (elementCounts[m.element] || 0) + 1;
  const present = new Set(Object.keys(elementCounts));

  const reactions = PAIR_REACTIONS.filter((r) => r.elements.every((e) => present.has(e)));
  const trios = TRIO_REACTIONS.filter((r) => r.elements.every((e) => present.has(e)));

  const roleCounts = { Damage: 0, Buff: 0, Survival: 0 };
  // A character counts towards every role they cover.
  for (const m of members) for (const r of m.roles) roleCounts[r] += 1;

  // Elements with no neighbour in the team can't take part in any reaction.
  const isolated = [...present].filter(
    (el) => ![...present].some((other) => areNeighbours(el, other)),
  );

  const notes = [];
  if (members.length === 0) {
    notes.push({ level: 'info', text: 'Pick characters from the roster to start this team.' });
  } else {
    for (const t of trios) {
      notes.push({ level: 'good', text: `Covers all three elements for ${t.name}.` });
    }
    if (members.length >= 2 && reactions.length === 0) {
      notes.push({
        level: 'warn',
        text: 'No two elements here are neighbours on the Esper Cycle, so this team triggers no reactions.',
      });
    }
    if (present.size > 1) {
      for (const el of isolated) {
        const names = members.filter((m) => m.element === el).map((m) => m.name).join(', ');
        notes.push({
          level: 'info',
          text: `${names} has no neighbouring element in this team, so they won't add a reaction.`,
        });
      }
    }
    if (members.length === TEAM_SIZE && roleCounts.Damage === 0) {
      notes.push({ level: 'warn', text: 'No Damage character. Clears may be slow.' });
    }
    if (members.length === TEAM_SIZE && roleCounts.Survival === 0) {
      notes.push({
        level: 'info',
        text: 'No Survival character. Healing and shields will have to come from other kits.',
      });
    }
    if (members.length < TEAM_SIZE) {
      notes.push({ level: 'info', text: `${TEAM_SIZE - members.length} slot(s) still open.` });
    }
  }

  return { members, elementCounts, reactions, trios, roleCounts, notes };
}

/** Which other teams use each character, e.g. { hathor: ['Team 2'] } */
export function usageInOtherTeams(teams, activeTeamId) {
  const usage = {};
  for (const team of teams) {
    if (team.id === activeTeamId) continue;
    for (const id of team.members) {
      if (!id) continue;
      (usage[id] ||= []).push(team.name);
    }
  }
  return usage;
}
