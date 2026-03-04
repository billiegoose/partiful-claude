# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Partiful clone built as a portfolio piece. Partiful is a social event planning app — users create events, invite guests, guests RSVP, and there's a social feed around events.

## Stack

_To be determined as the project is scaffolded. Update this section once the tech stack is chosen._

## Commands

_Add build, dev, test, and lint commands here once the project is initialized._

Example structure to fill in:
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run test` — run all tests
- `npm run test <path>` — run a single test file
- `npm run lint` — lint and typecheck

## Architecture

_Update this section as the codebase grows. Key things to document:_
- How auth works (session vs JWT, provider)
- Data model for events, guests, RSVPs
- Real-time updates strategy (polling, websockets, SSE)
- File/image upload approach
- Email/SMS notification system

## Key Features to Build

- Event creation with rich details (title, date, location, cover image, description)
- Guest invite system (by link or direct invite)
- RSVP flow (yes/no/maybe + headcount)
- Event activity feed / comments
- Host controls (edit event, manage guest list, send updates)
- User profiles
