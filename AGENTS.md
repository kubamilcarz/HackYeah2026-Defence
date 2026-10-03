# PLAN:0

PLAN:0 is a responsive web PWA that helps households prepare personalized
crisis-readiness plans. It supports household profiles, important contacts and
locations, readiness tracking, nearby shelters and key points, hazard-specific
scenarios, distributed-family communication and meeting plans, and a rapid
crisis mode with essential information.

Treat all guidance as preparedness decision support. During an active emergency,
official local authority instructions and emergency services take precedence.
Do not present generated guidance, map data, or readiness status as a guarantee
of safety or as a replacement for official advice.

## Workspace

- `frontend/` is the Next.js responsive PWA and its design system.
- `backend/` is reserved for the Django API; it has no implementation yet.
- Use `$plan0-product` when changing product behavior, crisis content, models,
  APIs, or planning flows.
- Use `$plan0-ui-a11y` for frontend UI, design-system, or accessibility work.

Read only the guidance relevant to the task. Explicit user requirements take
precedence over repository guidance.
